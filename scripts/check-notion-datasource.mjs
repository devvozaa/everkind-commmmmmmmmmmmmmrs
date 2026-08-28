import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from '@notionhq/client';

function loadEnvFile(envPath) {
  const content = fs.readFileSync(envPath, 'utf8');
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function printUsage() {
  console.log('Usage: node scripts/check-notion-datasource.mjs <SECRET_KEY_NAME> <DATABASE_ID_KEY_NAME>');
  console.log('Example: node scripts/check-notion-datasource.mjs NOTION_BLOG_SECRET NOTION_BLOG_DB_ID');
}

async function main() {
  const [, , secretKeyName, databaseKeyName] = process.argv;

  if (!secretKeyName || !databaseKeyName) {
    printUsage();
    process.exit(1);
  }

  const root = process.cwd();
  const envPath = path.join(root, '.env');

  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env file not found at project root.');
    process.exit(1);
  }

  const env = loadEnvFile(envPath);
  const notionSecret = env[secretKeyName];
  const databaseId = env[databaseKeyName];

  if (!notionSecret) {
    console.error(`ERROR: Missing ${secretKeyName} in .env`);
    process.exit(1);
  }

  if (!databaseId) {
    console.error(`ERROR: Missing ${databaseKeyName} in .env`);
    process.exit(1);
  }

  const notion = new Client({ auth: notionSecret });

  console.log('Checking Notion connection...');
  console.log(`Using secret key: ${secretKeyName}`);
  console.log(`Using database key: ${databaseKeyName}`);

  let db;
  try {
    db = await notion.databases.retrieve({ database_id: databaseId });
    console.log('Database access: OK');
    console.log(`Database id: ${db.id}`);
  } catch (error) {
    console.error('Database access: FAILED');
    console.error(error?.message ?? String(error));
    process.exit(1);
  }

  const dataSources = Array.isArray(db.data_sources) ? db.data_sources : [];

  if (!dataSources.length) {
    console.log('No linked data_sources were returned from this database.');
    console.log('If you are using older API behavior, verify your Notion API version and integration permissions.');
    process.exit(0);
  }

  console.log(`Found ${dataSources.length} data source(s):`);

  for (const ds of dataSources) {
    const dsId = ds.id;
    const dsName = ds.name ?? '(unnamed)';

    process.stdout.write(`- ${dsName}: ${dsId} ... `);

    try {
      await notion.dataSources.retrieve({ data_source_id: dsId });
      console.log('read OK');
    } catch (error) {
      console.log('read FAILED');
      console.log(`  reason: ${error?.message ?? String(error)}`);
    }
  }

  console.log('Done. Copy the id above into your *_DATA_SOURCE_ID env key if needed.');
}

main().catch((error) => {
  console.error('Unexpected error:', error?.message ?? String(error));
  process.exit(1);
});
