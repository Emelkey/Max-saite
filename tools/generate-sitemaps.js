#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const origin = 'https://maxsite.com.ua';
const today = new Date().toLocaleDateString('en-CA', {timeZone:'Europe/Kyiv'});
const groups = {services:[], cities:[], niches:[], cases:[], blog:[]};
const ignored = new Set(['.git','node_modules','release','artifacts']);

function collect(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...collect(file));
    else if (entry.name.endsWith('.html')) result.push(file);
  }
  return result;
}

function route(file) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  return `/${relative}`;
}

function groupFor(urlPath) {
  if (urlPath.startsWith('/blog/')) return 'blog';
  if (urlPath.startsWith('/mista/')) return 'cities';
  if (urlPath.startsWith('/nishi/')) return 'niches';
  if (urlPath.startsWith('/portfolio/')) return 'cases';
  return 'services';
}

for (const file of collect(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const urlPath = route(file);
  if (urlPath === '/404.html') continue;
  const robots = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*>/i)?.[0] || '';
  if (/noindex/i.test(robots)) continue;
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
  const expected = `${origin}${urlPath}`;
  if (canonical !== expected) throw new Error(`Cannot sitemap non-canonical page: ${urlPath} -> ${canonical || 'MISSING'}`);
  groups[groupFor(urlPath)].push({loc:expected,lastmod:today});
}

const urlset = rows => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.sort((a,b)=>a.loc.localeCompare(b.loc)).map(row=>`  <url><loc>${row.loc}</loc><lastmod>${row.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(groups).map(name=>`  <sitemap><loc>${origin}/sitemap-${name}.xml</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>\n`;

const expectedFiles = new Map([['sitemap.xml',index], ...Object.entries(groups).map(([name,rows])=>[`sitemap-${name}.xml`,urlset(rows)])]);
const changes = [];
for (const [name, content] of expectedFiles) {
  const file = path.join(root, name);
  if (!checkOnly) {
    fs.writeFileSync(file, content);
    continue;
  }
  if (!fs.existsSync(file)) {
    changes.push(name);
    continue;
  }
  const actual = fs.readFileSync(file,'utf8');
  const expectedUrls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]).sort();
  const actualUrls = [...actual.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]).sort();
  if (JSON.stringify(actualUrls) !== JSON.stringify(expectedUrls)) changes.push(name);
}

const count = Object.values(groups).reduce((sum,rows)=>sum+rows.length,0);
console.log(`Sitemap index: ${Object.keys(groups).length} files, ${count} canonical URLs.`);
if (checkOnly && changes.length) {
  console.error(`Generated sitemap membership is stale: ${changes.join(', ')}. Run node tools/generate-sitemaps.js.`);
  process.exit(1);
}
