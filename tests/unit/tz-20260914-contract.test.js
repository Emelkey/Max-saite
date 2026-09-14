const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { csv } = require('../../tools/top1-route-audit');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('city hub contains client language rather than implementation statuses', () => {
  const html = read('mista/index.html');
  for (const internalTerm of ['similarity/QA gates', 'Wave 2/3 review', 'залишаються noindex']) {
    assert.doesNotMatch(html, new RegExp(internalTerm, 'i'));
  }
  assert.match(html, /Додаємо їх до пошуку лише після перевірки попиту, змісту та реальної готовності обслуговувати клієнтів/);
  assert.match(read('tools/apply-wave1-cities.js'), /Наступні міста готуємо поступово/);
});

test('city readiness register preserves six open and sixteen deferred cities', () => {
  const rows = csv(read('seo/city-readiness-register.csv'));
  assert.equal(rows.length, 22);
  assert.equal(rows.filter(row => row.current_robots === 'index').length, 6);
  assert.equal(rows.filter(row => row.current_robots === 'noindex').length, 16);
  for (const row of rows) {
    const pathname = new URL(row.url).pathname;
    const html = read(path.join(pathname, 'index.html'));
    assert.equal(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), row.current_robots === 'noindex', row.url);
  }
});

test('query URL map keeps one primary commercial owner per tracked cluster', () => {
  const rows = csv(read('seo/query-url-map.csv'));
  assert.ok(rows.length >= 14);
  assert.equal(new Set(rows.map(row => row.cluster)).size, rows.length);
  assert.equal(new Set(rows.map(row => row.primary_url)).size, rows.length);
  for (const row of rows) {
    const url = new URL(row.primary_url);
    assert.equal(url.origin, 'https://maxsite.com.ua');
    assert.ok(fs.existsSync(path.join(root, url.pathname, 'index.html')), row.primary_url);
  }
});

test('content readiness register records evidence gates without invented proof', () => {
  const rows = csv(read('seo/content-readiness-register.csv'));
  assert.ok(rows.length >= 18);
  assert.ok(rows.some(row => row.decision === 'owner-approval-required-before-outreach'));
  assert.ok(rows.filter(row => row.decision.includes('no-fabrication')).length >= 5);
  assert.ok(rows.filter(row => row.decision === 'accepted-existing-content').length >= 3);
});

test('Kyiv SERP article schema matches its visible subject and cites its evidence', () => {
  const html = read('blog/analiz-google-stvorennya-sajtiv-kyiv/index.html');
  assert.match(html, /"headline":"Що показав аналіз видачі Google для створення сайтів у Києві"/);
  assert.doesNotMatch(html, /"headline":"Як підготувати каталог одягу/);
  assert.match(html, /class="article-sources"/);
  assert.match(html, /data-editorial-review="2026-09-14"/);
  assert.match(html, /"dateModified":"2026-09-14"/);
});
