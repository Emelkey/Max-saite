#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const buildRoot = path.join(root, 'release', 'max-site-production');
const output = path.join(root, 'docs', 'seo', 'tz-20260914-url-checks.csv');

const cityRows = fs.readFileSync(path.join(root, 'seo', 'city-readiness-register.csv'), 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => {
    const columns = line.match(/(?:"(?:[^"]|"")*"|[^,])+/g) || [];
    return { url: columns[1], expectedRobots: columns[2] };
  });

const priorityUrls = [
  'https://maxsite.com.ua/',
  'https://maxsite.com.ua/mista/',
  'https://maxsite.com.ua/blog/analiz-google-stvorennya-sajtiv-kyiv/',
  'https://maxsite.com.ua/nishi/sajt-dlya-kliningovoyi-kompaniyi/',
  'https://maxsite.com.ua/stvorennya-saytu-dlya-biznesu/',
  'https://maxsite.com.ua/stvorennya-landing-page/',
  'https://maxsite.com.ua/portfolio/formula-chystoty/',
  'https://maxsite.com.ua/portfolio/fo-dez/',
  'https://maxsite.com.ua/portfolio/',
  'https://maxsite.com.ua/stvorennya-saytiv/'
];

const expectedRobots = new Map(cityRows.map((row) => [row.url, row.expectedRobots]));
const urls = [...new Set([...priorityUrls, ...cityRows.map((row) => row.url)])];
const capture = (html, pattern) => html.match(pattern)?.[1]?.replace(/\s+/g, ' ').trim() || '';
const csv = (value) => `"${String(value).replace(/"/g, '""')}"`;

const rows = urls.map((url) => {
  const pathname = new URL(url).pathname;
  const file = pathname === '/'
    ? path.join(buildRoot, 'index.html')
    : path.join(buildRoot, pathname.slice(1), 'index.html');
  if (!fs.existsSync(file)) throw new Error(`Missing built route: ${pathname}`);
  const html = fs.readFileSync(file, 'utf8');
  const canonical = capture(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    || capture(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  const robots = capture(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || capture(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["'][^>]*>/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const jsonLdCount = (html.match(/type=["']application\/ld\+json["']/gi) || []).length;
  const internalLinks = (html.match(/href=["']\//gi) || []).length;
  const expected = expectedRobots.get(url) || 'index';
  const normalized = (value) => value.toLowerCase().replace(/\s+/g, '');
  const status = canonical === url && h1Count === 1 && jsonLdCount > 0 && normalized(robots).startsWith(normalized(expected))
    ? 'PASS'
    : 'FAIL';
  return [url, '200 (local production build)', canonical, robots, expected, h1Count, jsonLdCount, internalLinks, status];
});

const header = ['url', 'http', 'canonical', 'robots_actual', 'robots_expected', 'h1_count', 'jsonld_blocks', 'internal_links', 'status'];
const body = [header, ...rows].map((row) => row.map(csv).join(',')).join('\n');
fs.writeFileSync(output, `${body}\n`);
const failures = rows.filter((row) => row.at(-1) !== 'PASS');
console.log(`Wrote ${rows.length} URL checks to ${path.relative(root, output)}; failures: ${failures.length}`);
if (failures.length) process.exitCode = 1;
