#!/usr/bin/env node
// HTTP GET only: this does not execute analytics, contact APIs or submit leads.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const RELEASE_MARKER = '.well-known/max-site-release.json';
const pageFiles = [
  'index.html', 'stvorennya-saytiv/index.html', 'stvorennya-saytu-dlya-biznesu/index.html',
  'stvorennya-program/index.html', 'stvorennya-landing-page/index.html',
  'stvorennya-korporatyvnoho-saytu/index.html', 'stvorennya-internet-mahazynu/index.html',
  'seo-prosuvannya/index.html', 'seo-sajt-pid-google/index.html', 'kalkulyator-vartosti-saytu/index.html',
  'mista/stvorennya-sajtiv-kyiv/index.html', 'mista/stvorennya-sajtiv-cherkasy/index.html',
  'mista/stvorennya-sajtiv-lviv/index.html', 'mista/stvorennya-sajtiv-odesa/index.html',
  'mista/stvorennya-sajtiv-dnipro/index.html', 'mista/stvorennya-sajtiv-kharkiv/index.html',
  'blog/yak-pidhotuvaty-kataloh-odyahu-dlya-internet-mahazynu/index.html',
  'blog/analiz-google-stvorennya-sajtiv-kyiv/index.html', 'qa-checklist/index.html',
];
const SITEMAPS = ['sitemap-services.xml', 'sitemap-cities.xml', 'sitemap-niches.xml', 'sitemap-cases.xml', 'sitemap-blog.xml'];
const RELEASE_FILES = [
  ...pageFiles.map(file => ({ file, route: '/' + file.replace(/index\.html$/, ''), page: true })),
  ...['robots.txt', 'sitemap.xml', ...SITEMAPS, 'styles.css', 'script.js',
    'assets/consent.js', 'assets/analytics-config.js', 'assets/telegram-config.js',
    'assets/site-cost-calculator.js', 'assets/logo-full-dark.svg',
    'assets/downloads/top1/ecommerce-checkout-qa.md',
    'assets/downloads/top1/service-lead-acceptance.md',
    'assets/downloads/top1/seo-intent-owner-template.md',
    'assets/downloads/top1/city-page-evidence-gate.md',
    'assets/downloads/top1/seo-release-observation-log.md',
    'assets/downloads/top1/kyiv-organic-serp-2026-09-12.json',
    'assets/responsive/founder-max-site-v2-480.avif',
    'assets/responsive/service-program-development-480.webp'].map(file => ({ file, route: '/' + file, page: false })),
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), match[2]]));
const tags = (html, name) => [...html.matchAll(new RegExp('<' + name + '\\b[^>]*>', 'gi'))].map(match => attributes(match[0]));
const locations = xml => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => match[1].trim());

function validateManifest(marker, { expectedRevision, site }) {
  if (marker.schemaVersion !== 1 || marker.mode !== 'production') throw Error('Receipt is not a production release');
  if (marker.revision !== expectedRevision) throw Error(`Stale release: expected ${expectedRevision}, served ${marker.revision}`);
  if (marker.site !== site) throw Error('Release receipt site does not match production');
  if (!Number.isInteger(marker.sitemapUrlCount) || marker.sitemapUrlCount < 1) throw Error('Invalid sitemap count in receipt');
  for (const { route } of RELEASE_FILES) {
    if (!/^[a-f0-9]{64}$/.test(marker.files?.[route]?.sha256 || '')) throw Error(`Missing release hash: ${route}`);
  }
}

async function verifyProductionRelease({ baseUrl, expectedRevision, request = fetch, attempt = 1 }) {
  const base = new URL(baseUrl);
  if (base.pathname !== '/' || base.search || base.hash) throw Error('Production base URL must be an origin');
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname))) throw Error('HTTPS is required');
  if (!/^[a-f0-9]{40}$/i.test(expectedRevision || '')) throw Error('Expected revision must be a full Git SHA');
  const site = base.origin;
  const rows = [];
  const get = async route => {
    // Paths come exclusively from our allowlist, never from the remote receipt.
    const url = new URL(route, site);
    url.searchParams.set('release_check', `${expectedRevision}-${attempt}`);
    const response = await request(url.href, {
      method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(15000),
      headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'MAX-SITE-Release-Smoke/4.0' },
    });
    if (response.status !== 200) { await response.body?.cancel(); throw Error(`${route}: HTTP ${response.status}; canonical routes must return 200 directly`); }
    if (/noindex/i.test(response.headers.get('x-robots-tag') || '')) throw Error(`${route}: X-Robots-Tag noindex`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw Error(`${route}: empty response`);
    rows.push({ route, status: response.status, bytes: bytes.length, sha256: sha256(bytes) });
    return { bytes, text: bytes.toString('utf8') };
  };
  const marker = JSON.parse((await get('/' + RELEASE_MARKER)).text);
  validateManifest(marker, { expectedRevision: expectedRevision.toLowerCase(), site });
  const contents = new Map();
  const queue = [...RELEASE_FILES];
  const failures = [];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        const { bytes, text } = await get(item.route);
        if (sha256(bytes) !== marker.files[item.route].sha256) throw Error(`${item.route}: served bytes differ from the release receipt`);
        contents.set(item.route, text);
        if (item.page) {
          const canonicals = tags(text, 'link').filter(tag => tag.rel?.toLowerCase() === 'canonical');
          if (canonicals.length !== 1 || canonicals[0].href !== site + item.route) throw Error(`${item.route}: canonical mismatch`);
          if (tags(text, 'meta').some(tag => /^(robots|googlebot)$/i.test(tag.name || '') && /noindex/i.test(tag.content || ''))) throw Error(`${item.route}: noindex in production HTML`);
          if ((text.match(/<h1\b/gi) || []).length !== 1) throw Error(`${item.route}: expected one H1`);
        }
      } catch (error) { failures.push(error.message); }
    }
  }));
  if (failures.length) throw Error(failures.join('\n'));
  const sitemapIndex = locations(contents.get('/sitemap.xml'));
  for (const file of SITEMAPS) if (!sitemapIndex.includes(site + '/' + file)) throw Error(`Sitemap index missing ${file}`);
  const urls = SITEMAPS.flatMap(file => locations(contents.get('/' + file)));
  if (new Set(urls).size !== urls.length || urls.length !== marker.sitemapUrlCount) throw Error('Sitemap URL count or uniqueness differs from release');
  if (urls.some(url => { const parsed = new URL(url); return parsed.origin !== site || parsed.search || parsed.hash || /\/index\.html$/.test(parsed.pathname); })) throw Error('Sitemap contains a noncanonical URL');
  for (const { route, page } of RELEASE_FILES) if (page && !urls.includes(site + route)) throw Error(`Sitemap missing ${route}`);
  const robots = contents.get('/robots.txt');
  if (/^\s*Disallow\s*:\s*\/\s*$/im.test(robots) || !robots.includes('Sitemap: ' + site + '/sitemap.xml')) throw Error('Production robots.txt blocks crawling or omits sitemap');
  if (!contents.get('/kalkulyator-vartosti-saytu/').includes('assets/site-cost-calculator.js')) throw Error('Calculator JS is not linked');
  return { revision: marker.revision, site, sitemapUrlCount: urls.length, checkedAt: new Date().toISOString(), method: 'Read-only HTTP GET; no JavaScript, analytics or lead submission', rows };
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name, fallback) => { const index = args.indexOf(name); return index === -1 ? fallback : args[index + 1]; };
  const expectedRevision = option('--expected-revision', process.env.GITHUB_SHA);
  const baseUrl = option('--base-url', 'https://maxsite.com.ua');
  const attempts = Number(option('--attempts', '8'));
  const delayMs = Number(option('--delay-ms', '15000'));
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 20 || !Number.isFinite(delayMs) || delayMs < 0 || delayMs > 60000) throw Error('Invalid retry options');
  const output = path.resolve(option('--output', 'artifacts/seo/production-release-smoke.json'));
  const observations = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await verifyProductionRelease({ baseUrl, expectedRevision, attempt });
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, JSON.stringify({ ok: true, observations, ...result }, null, 2) + '\n');
      console.log(`Verified production ${result.revision}: ${result.rows.length} HTTP resources, ${result.sitemapUrlCount} sitemap URLs. Report: ${output}`);
      return;
    } catch (error) {
      observations.push({ attempt, at: new Date().toISOString(), error: error.message });
      console.error(`Release check ${attempt}/${attempts}: ${error.message}`);
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ ok: false, expectedRevision, baseUrl, observations }, null, 2) + '\n');
  throw Error(`Production release verification failed. Inspect ${output}; do not report deployment as verified.`);
}

module.exports = { RELEASE_FILES, RELEASE_MARKER, SITEMAPS, sha256, validateManifest, verifyProductionRelease };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
