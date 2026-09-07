const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { editorialBody } = require('../../tools/lib/editorial-body');

const root = path.resolve(__dirname, '../..');
const auditScript = path.join(root, 'tools/audit-site.js');
const base = 'https://maxsite.com.ua';
const tag = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST"></script>';

function auditFixture(t, content, { route = '/blog/example/', outside = '' } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'maxsite-article-audit-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const articlePath = path.join(directory, route, 'index.html');
  fs.mkdirSync(path.dirname(articlePath), { recursive: true });
  fs.mkdirSync(path.join(directory, 'assets'), { recursive: true });
  const schema = JSON.stringify({ '@type': 'Article', datePublished: '2020-01-01', dateModified: '2020-01-01', author: { name: 'Test reviewer' }, image: `${base}/image.webp`, mainEntityOfPage: `${base}${route}` });
  fs.writeFileSync(articlePath, `<html><head><title>Fixture article</title><meta name="description" content="Fixture description"><link rel="canonical" href="${base}${route}"><meta name="robots" content="index, follow"><meta property="og:url" content="${base}${route}">${tag}<script type="application/ld+json">${schema}</script></head><body><header><a class="mobile-nav-phone" href="tel:+380972692322">Phone</a><div class="floating-contact"></div></header><main><h1>Fixture article</h1>${content}</main>${outside}</body></html>`);
  fs.writeFileSync(path.join(directory, 'sitemap.xml'), `<urlset><url><loc>${base}${route}</loc><lastmod>2020-01-01</lastmod></url></urlset>`);
  fs.writeFileSync(path.join(directory, '404.html'), `<meta name="robots" content="noindex">${tag}`);
  fs.writeFileSync(path.join(directory, 'robots.txt'), `Sitemap: ${base}/sitemap.xml`);
  const events = ['click_phone', 'click_whatsapp', 'phone_click', 'messenger_click', 'consultation_click', 'portfolio_click', 'price_cta', 'brief_start', 'brief_complete', 'form_submit', 'generate_lead', 'lead_delivery_error'];
  fs.writeFileSync(path.join(directory, 'script.js'), events.map(name => `trackEvent("${name}")`).join(';') + ';telegramConfig.username || "MaxMytt"');
  fs.writeFileSync(path.join(directory, 'assets/telegram-config.js'), 'const config = { endpoint: "" };');
  const result = spawnSync(process.execPath, [auditScript, '--root', directory, '--site-url', base], { encoding: 'utf8' });
  return { status: result.status, output: result.stdout + result.stderr };
}

test('brief but structured prose is not rejected by an arbitrary word quota', t => {
  const result = auditFixture(t, '<article class="article-body"><h2>Canonical verification</h2><p>Compare the declared canonical with the URL selected by Google. A canonical signal does not replace a permanent redirect when an address has moved.</p></article>');
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /Thin article|words/);
});

test('global page copy cannot conceal a missing blog article body', t => {
  const result = auditFixture(t, '', { outside: `<footer><h2>Global text</h2><p>${'Text unrelated to the article. '.repeat(200)}</p></footer>` });
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /Article missing editorial body/);
});

test('headings, authorship, links and lead forms alone are not explanatory prose', t => {
  const result = auditFixture(t, `<article class="article-body"><h2>Editorial checks</h2><p class="article-author">${'Reviewer biography. '.repeat(200)}</p><p><a href="https://example.com/">Reference</a></p><form><p>Send a request.</p></form></article>`);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /Article missing explanatory prose/);
});

test('unsectioned prose still fails the observable structure check', t => {
  const result = auditFixture(t, '<article class="article-body"><p>Inspect the HTML canonical and compare it with the sitemap address.</p></article>');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /Article missing a descriptive section heading/);
});

test('case-study main/section layout remains supported without blog markup', t => {
  const result = auditFixture(t, '<section><h2>What we verified</h2><p>The form delivery was checked separately from the analytics event.</p></section>', { route: '/portfolio/example/' });
  assert.equal(result.status, 0, result.output);
});

test('practical examples and topic-specific next steps belong to all four reviewed article bodies', () => {
  for (const slug of ['canonical-url-prostymy-slovamy', 'redesign-saytu-bez-vtraty-seo', 'seo-first-pidhid', 'vnutrishnya-perelinkovka']) {
    const html = fs.readFileSync(path.join(root, 'blog', slug, 'index.html'), 'utf8');
    const body = editorialBody(html, `/blog/${slug}/`);
    assert.match(body, /<h2 id="example">[^<]+<\/h2><p>[^]*?<\/p><p>[^]*?<\/p>/, slug);
    assert.match(body, /<h2 id="next">Наступні кроки<\/h2><ol><li>/, slug);
    assert.doesNotMatch(body, /Визначте одну бізнес-мету та сторінки, що на неї працюють/, slug);
    assert.match(html, /База знань · оновлено 07\.09\.2026/, slug);
    assert.match(html, /data-master4-editorial[^]*?https:\/\/developers\.google\.com\/search\/docs\//, slug);
  }
});

test('all sixteen reviewed articles have no contradictory visible update dates', () => {
  let reviewed = 0;
  for (const entry of fs.readdirSync(path.join(root, 'blog'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const html = fs.readFileSync(path.join(root, 'blog', entry.name, 'index.html'), 'utf8');
    if (!html.includes('data-master4-editorial')) continue;
    reviewed++;
    const updateLabels = [...html.matchAll(/оновлено\s+(\d{2}\.\d{2}\.\d{4})/gi)];
    for (const label of updateLabels) assert.equal(label[1], '07.09.2026', entry.name);
    for (const match of html.matchAll(/<time\b[^>]*datetime="([^"]+)"[^>]*>Оновлено[^<]*<\/time>/g)) {
      assert.equal(match[1], '2026-09-07', entry.name);
    }
  }
  assert.equal(reviewed, 16);
});
