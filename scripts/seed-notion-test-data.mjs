import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from '@notionhq/client';

function loadEnvFile(envPath) {
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

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
  let cursor;

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

function selectNameOrUndefined(options, preferred) {
  if (!Array.isArray(options) || options.length === 0) return undefined;
  const preferredHit = options.find((o) => o?.name === preferred);
  return preferredHit?.name || options[0]?.name;
}

function nowToken() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function seedJobForm(env) {
  const notion = new Client({ auth: env.NOTION_SECRET });
  const dbId = env.NOTION_DATABASE_ID;
  const dsId = env.NOTION_DATA_SOURCE_ID;

  const ds = await notion.dataSources.retrieve({ data_source_id: dsId });
  const roleOptions = ds.properties?.Role?.select?.options || [];
  const expOptions = ds.properties?.['Total Work Experience']?.select?.options || [];

  const roleName = selectNameOrUndefined(roleOptions, 'Engineering');
  const expName = selectNameOrUndefined(expOptions, '3-5 Years');

  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: `Seed Candidate ${nowToken()}` } }] },
      Email: { email: `seed.job.new.${nowToken()}@example.com` },
      ...(roleName ? { Role: { select: { name: roleName } } } : {}),
      ...(expName ? { 'Total Work Experience': { select: { name: expName } } } : {}),
      LinkedIn: { url: 'https://www.linkedin.com/in/seed-candidate-new' },
      'Upload CV': {
        files: [
          {
            name: 'seed-resume.pdf',
            type: 'external',
            external: { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
          },
        ],
      },
    },
  });

  console.log('Job Form seeding: OK');
}

async function seedBlog(env) {
  const notion = new Client({ auth: env.NOTION_BLOG_SECRET });
  const dbId = env.NOTION_BLOG_DB_ID;
  const dsId = env.NOTION_BLOG_DATA_SOURCE_ID;

  const ds = await notion.dataSources.retrieve({ data_source_id: dsId });
  const categoryOptions = ds.properties?.Category?.select?.options || [];
  const statusOptions = ds.properties?.Status?.status?.options || [];

  const categoryName = selectNameOrUndefined(categoryOptions, 'Journal');
  const statusName = selectNameOrUndefined(statusOptions, 'Published');
  const slug = `seed-post-${nowToken()}`;

  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: `Seed Blog Post ${nowToken()}` } }] },
      ...(statusName ? { Status: { status: { name: statusName } } } : {}),
      'Published Date': { date: { start: new Date().toISOString().slice(0, 10) } },
      ...(categoryName ? { Category: { select: { name: categoryName } } } : {}),
      Slug: { rich_text: [{ text: { content: slug } }] },
      Excerpt: {
        rich_text: [
          { text: { content: 'Seed content for integration validation. You can safely edit or remove this row.' } },
        ],
      },
      'External Link': { email: `seed.blog.${nowToken()}@example.com` },
    },
  });

  console.log('Blog seeding: OK');
}

async function seedCareers(env) {
  const notion = new Client({ auth: env.NOTION_CAREERS_DB_SECRET });
  const dbId = env.NOTION_CAREERS_DB_ID;
  const dsId = env.NOTION_CAREERS_DATA_SOURCE_ID;

  const ds = await notion.dataSources.retrieve({ data_source_id: dsId });
  const statusOptions = ds.properties?.Status?.status?.options || [];
  const openStatus = selectNameOrUndefined(statusOptions, 'Open');

  const created = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: `Seed Role ${nowToken()}` } }] },
      ...(openStatus ? { Status: { status: { name: openStatus } } } : {}),
      Summary: {
        rich_text: [{ text: { content: 'Seed role summary used to validate opportunities and career details pages.' } }],
      },
      Slug: { rich_text: [{ text: { content: `seed-role-${nowToken()}` } }] },
    },
  });

  // Add at least one block so the role detail page has content.
  await notion.blocks.children.append({
    block_id: created.id,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'This is seeded body content for career detail rendering verification.',
              },
            },
          ],
        },
      },
    ],
  });

  console.log('Careers seeding: OK');
}

async function main() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('No .env file found in project root.');
  }

  const env = loadEnvFile(envPath);

  await seedJobForm(env);
  await seedBlog(env);
  await seedCareers(env);

  console.log('Seeding complete.');
}

main().catch((e) => {
  console.error('Seeding failed:', e?.message ?? String(e));
  process.exit(1);
});
