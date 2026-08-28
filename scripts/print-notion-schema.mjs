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
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

const env = loadEnv();
const targets = [
  ['Job Form', 'NOTION_SECRET', 'NOTION_DATA_SOURCE_ID'],
  ['Blog', 'NOTION_BLOG_SECRET', 'NOTION_BLOG_DATA_SOURCE_ID'],
  ['Careers', 'NOTION_CAREERS_DB_SECRET', 'NOTION_CAREERS_DATA_SOURCE_ID'],
  ['Investors', 'NOTION_INVESTORS_SECRET', 'NOTION_INVESTORS_DATA_SOURCE_ID'],
];

for (const [label, secretKey, dsKey] of targets) {
  const notion = new Client({ auth: env[secretKey] });
  const ds = await notion.dataSources.retrieve({ data_source_id: env[dsKey] });

  console.log(`\n${label} properties:`);
  for (const [name, cfg] of Object.entries(ds.properties)) {
    console.log(`- ${name}: ${cfg.type}`);
  }
}
