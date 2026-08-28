import fs from 'node:fs';
import { Client } from '@notionhq/client';

function loadEnv() {
  const txt = fs.readFileSync('.env', 'utf8');
  const env = {};
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['\"]|['\"]$/g, '');
  }
  return env;
}

const env = loadEnv();

const secrets = [
  'NOTION_SECRET',
  'NOTION_BLOG_SECRET',
  'NOTION_CAREERS_DB_SECRET',
];

const targets = [
  {
    name: 'Job Form',
    dbKey: 'NOTION_DATABASE_ID',
    properties: {
      Name: { title: [{ text: { content: `write-check-job-${Date.now()}` } }] },
      Email: { email: `write.check.${Date.now()}@example.com` },
    },
  },
  {
    name: 'Blog',
    dbKey: 'NOTION_BLOG_DB_ID',
    properties: {
      Name: { title: [{ text: { content: `write-check-blog-${Date.now()}` } }] },
      Excerpt: { rich_text: [{ text: { content: 'write check excerpt' } }] },
      Slug: { rich_text: [{ text: { content: `write-check-blog-${Date.now()}` } }] },
      'Published Date': { date: { start: new Date().toISOString().slice(0, 10) } },
    },
  },
  {
    name: 'Careers',
    dbKey: 'NOTION_CAREERS_DB_ID',
    properties: {
      Name: { title: [{ text: { content: `write-check-role-${Date.now()}` } }] },
      Summary: { rich_text: [{ text: { content: 'write check summary' } }] },
      Slug: { rich_text: [{ text: { content: `write-check-role-${Date.now()}` } }] },
    },
  },
];

for (const target of targets) {
  console.log(`\n${target.name} (${target.dbKey})`);
  for (const sk of secrets) {
    const secret = env[sk];
    const dbId = env[target.dbKey];
    const notion = new Client({ auth: secret });

    try {
      await notion.pages.create({
        parent: { database_id: dbId },
        properties: target.properties,
      });
      console.log(`- ${sk}: WRITE OK`);
    } catch (e) {
      console.log(`- ${sk}: WRITE FAIL -> ${e?.code || ''} ${e?.message || String(e)}`);
    }
  }
}
