import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from '@notionhq/client';

function loadEnvFile(envPath) {
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const i = line.indexOf('=');
    if (i === -1) continue;

    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function queryAllRows(notion, dataSourceId) {
  const rows = [];
  let cursor = undefined;

  while (true) {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });

    rows.push(...res.results);
    if (!res.has_more || !res.next_cursor) break;
    cursor = res.next_cursor;
  }

  return rows;
}

function hasValue(prop) {
  if (!prop) return false;

  switch (prop.type) {
    case 'title':
      return Boolean(prop.title?.[0]?.plain_text?.trim());
    case 'rich_text':
      return Boolean(prop.rich_text?.[0]?.plain_text?.trim());
    case 'url':
      return Boolean(prop.url?.trim());
    case 'email':
      return Boolean(prop.email?.trim());
    case 'select':
      return Boolean(prop.select?.name?.trim());
    case 'status':
      return Boolean(prop.status?.name?.trim());
    case 'date':
      return Boolean(prop.date?.start);
    case 'files':
      return Array.isArray(prop.files) && prop.files.length > 0;
    default:
      return true;
  }
}

function typeOfSchemaProperty(p) {
  return p?.type ?? 'unknown';
}

function schemaMap(dataSource) {
  const map = {};
  const props = dataSource?.properties ?? {};
  for (const [name, cfg] of Object.entries(props)) {
    map[name] = typeOfSchemaProperty(cfg);
  }
  return map;
}

function normalizeId(id) {
  return String(id || '').replace(/-/g, '');
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function auditOne(config, env) {
  const secret = env[config.secretKey];
  const dsId = env[config.dataSourceKey];
  const dbId = env[config.databaseKey];

  printSection(config.name);

  if (!secret || !dsId || !dbId) {
    console.log('FAIL: Missing one or more env keys');
    console.log(`  ${config.secretKey}: ${secret ? 'OK' : 'MISSING'}`);
    console.log(`  ${config.databaseKey}: ${dbId ? 'OK' : 'MISSING'}`);
    console.log(`  ${config.dataSourceKey}: ${dsId ? 'OK' : 'MISSING'}`);
    return { ok: false };
  }

  const notion = new Client({ auth: secret });

  let database;
  let dataSource;
  let rows = [];

  try {
    database = await notion.databases.retrieve({ database_id: dbId });
    dataSource = await notion.dataSources.retrieve({ data_source_id: dsId });
    rows = await queryAllRows(notion, dsId);
  } catch (e) {
    console.log('FAIL: Notion API access failed');
    console.log(`  Reason: ${e?.message ?? String(e)}`);
    return { ok: false };
  }

  const linkedDs = Array.isArray(database.data_sources) ? database.data_sources : [];
  const linkedIds = linkedDs.map((d) => normalizeId(d.id));
  const dsMatchesDb = linkedIds.includes(normalizeId(dsId));

  console.log(`Database reachable: YES (${database.id})`);
  console.log(`Data source reachable: YES (${dataSource.id})`);
  console.log(`Data source linked to DB: ${dsMatchesDb ? 'YES' : 'NO'}`);
  console.log(`Rows in data source: ${rows.length}`);

  const schema = schemaMap(dataSource);
  let schemaOk = true;

  for (const rule of config.requiredSchema) {
    const foundType = schema[rule.name];
    const ok = foundType === rule.type;
    if (!ok) schemaOk = false;
    console.log(`Schema ${rule.name}: ${ok ? 'OK' : 'MISMATCH'} (expected ${rule.type}, found ${foundType ?? 'missing'})`);
  }

  const issues = [];

  if (config.name === 'Job Form') {
    const missingByField = {
      Name: 0,
      Email: 0,
      Role: 0,
      'Total Work Experience': 0,
      LinkedIn: 0,
      'Upload CV': 0,
    };

    for (const row of rows) {
      for (const key of Object.keys(missingByField)) {
        if (!hasValue(row.properties?.[key])) missingByField[key] += 1;
      }
    }

    for (const [field, count] of Object.entries(missingByField)) {
      if (count > 0) {
        issues.push(`${count} row(s) missing ${field}`);
      }
    }

    const roleOptions = dataSource.properties?.Role?.select?.options ?? [];
    const expOptions = dataSource.properties?.['Total Work Experience']?.select?.options ?? [];
    console.log(`Role options configured: ${roleOptions.length}`);
    console.log(`Total Work Ex options configured: ${expOptions.length}`);
    if (roleOptions.length === 0) issues.push('Role select has no options');
    if (expOptions.length === 0) issues.push('Total Work Experience select has no options');
  }

  if (config.name === 'Blog') {
    let publishedCount = 0;
    let journalCount = 0;
    let pressCount = 0;

    for (const row of rows) {
      const status = row.properties?.Status?.status?.name || '';
      const category = row.properties?.Category?.select?.name || '';
      const isPublished = status === 'Published';

      if (isPublished) {
        publishedCount += 1;
        if (category === 'Journal') journalCount += 1;
        if (category === 'Press') pressCount += 1;

        if (!hasValue(row.properties?.Name)) issues.push(`Published row ${row.id} missing Name`);
        if (!hasValue(row.properties?.['Published Date'])) issues.push(`Published row ${row.id} missing Published Date`);
        if (!hasValue(row.properties?.Category)) issues.push(`Published row ${row.id} missing Category`);

        const hasSlug = hasValue(row.properties?.Slug);
        const hasExternal = hasValue(row.properties?.['External Link']);
        if (!hasSlug && !hasExternal) {
          issues.push(`Published row ${row.id} needs either Slug or External Link`);
        }
      }
    }

    console.log(`Published posts: ${publishedCount}`);
    console.log(`Published Journal: ${journalCount}`);
    console.log(`Published Press: ${pressCount}`);
  }

  if (config.name === 'Careers') {
    let openCount = 0;

    for (const row of rows) {
      const status = row.properties?.Status?.status?.name || '';
      if (status === 'Open') {
        openCount += 1;
        if (!hasValue(row.properties?.Name)) issues.push(`Open role ${row.id} missing Name`);
        if (!hasValue(row.properties?.Summary)) issues.push(`Open role ${row.id} missing Summary`);
        if (!hasValue(row.properties?.Slug)) issues.push(`Open role ${row.id} missing Slug`);
      }
    }

    console.log(`Open roles: ${openCount}`);
  }

  if (issues.length === 0) {
    console.log('Content checks: OK');
  } else {
    console.log('Content checks: NEEDS ATTENTION');
    for (const issue of issues.slice(0, 30)) {
      console.log(`- ${issue}`);
    }
    if (issues.length > 30) {
      console.log(`- ... and ${issues.length - 30} more issue(s)`);
    }
  }

  return { ok: schemaOk && issues.length === 0 && dsMatchesDb };
}

async function main() {
  const root = process.cwd();
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('No .env found at project root');
    process.exit(1);
  }

  const env = loadEnvFile(envPath);

  const targets = [
    {
      name: 'Job Form',
      secretKey: 'NOTION_SECRET',
      databaseKey: 'NOTION_DATABASE_ID',
      dataSourceKey: 'NOTION_DATA_SOURCE_ID',
      requiredSchema: [
        { name: 'Name', type: 'title' },
        { name: 'Email', type: 'email' },
        { name: 'Role', type: 'select' },
        { name: 'Total Work Experience', type: 'select' },
        { name: 'LinkedIn', type: 'url' },
        { name: 'Upload CV', type: 'files' },
      ],
    },
    {
      name: 'Blog',
      secretKey: 'NOTION_BLOG_SECRET',
      databaseKey: 'NOTION_BLOG_DB_ID',
      dataSourceKey: 'NOTION_BLOG_DATA_SOURCE_ID',
      requiredSchema: [
        { name: 'Name', type: 'title' },
        { name: 'Status', type: 'status' },
        { name: 'Published Date', type: 'date' },
        { name: 'Category', type: 'select' },
        { name: 'Slug', type: 'rich_text' },
        { name: 'External Link', type: 'email' },
        { name: 'Excerpt', type: 'rich_text' },
      ],
    },
    {
      name: 'Careers',
      secretKey: 'NOTION_CAREERS_DB_SECRET',
      databaseKey: 'NOTION_CAREERS_DB_ID',
      dataSourceKey: 'NOTION_CAREERS_DATA_SOURCE_ID',
      requiredSchema: [
        { name: 'Name', type: 'title' },
        { name: 'Status', type: 'status' },
        { name: 'Summary', type: 'rich_text' },
        { name: 'Slug', type: 'rich_text' },
      ],
    },
  ];

  const results = [];
  for (const target of targets) {
    results.push(await auditOne(target, env));
  }

  const allOk = results.every((r) => r.ok);
  printSection('Overall');
  console.log(allOk ? 'PASS: Everything looks configured correctly.' : 'WARN: Some configuration/content issues were found.');
}

main().catch((e) => {
  console.error('Unexpected error:', e?.message ?? String(e));
  process.exit(1);
});
