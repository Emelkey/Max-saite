#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const full = read('seo/full-intent-map.json');
const owners = read('seo/top1-intent-map.json').owners;
const urls = new Set(), queries = new Set();
for (const p of full.pages) {
  if (urls.has(p.url) || queries.has(p.primary.toLowerCase())) throw Error(`Duplicate intent owner: ${p.url}`);
  if (!p.primary || !p.intent || (!p.secondary.length && !p.secondaryNotApplicable)) throw Error(`Incomplete intent: ${p.url}`);
  urls.add(p.url); queries.add(p.primary.toLowerCase());
}
for (const owner of owners) {
  const page = full.pages.find(p => p.url === owner.url);
  for (const key of ['primary', 'secondary', 'intent']) {
    if (JSON.stringify(page?.[key]) !== JSON.stringify(owner[key])) throw Error(`Priority map drift: ${owner.url} ${key}`);
  }
}
const headers = ['cluster_id','primary_query','secondary_queries','intent','geo','canonical_url','current_url','content_type','priority','status','serp_overlap','decision','notes'];
const quote = s => `"${String(s).replaceAll('"', '""')}"`;
const csv = [headers, ...full.pages.map(p => [p.cluster,p.primary,p.secondary.join('; '),p.searchIntent,'UA',`https://maxsite.com.ua${p.url}`,`https://maxsite.com.ua${p.url}`,p.contentType,p.priority,'active','see dated SERP evidence','keep-owner',p.intent])].map(r => r.map(quote).join(',')).join('\n') + '\n';
const target = path.join(root, 'seo/keyword-map.csv');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== csv) throw Error('keyword-map.csv is stale; run node tools/sync-intent-map.js');
} else fs.writeFileSync(target, csv);
console.log(`Intent map: ${urls.size} explicit owners, ${owners.length} priority owners consistent.`);
