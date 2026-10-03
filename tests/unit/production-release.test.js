const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { RELEASE_FILES, RELEASE_MARKER, SITEMAPS, sha256, validateManifest, verifyProductionRelease } = require('../../tools/verify-production-release');
const revision = 'a'.repeat(40);
const site = 'https://maxsite.com.ua';

function fixture() {
  const bodies = new Map(RELEASE_FILES.map(item => [item.route, item.page
    ? `<html><head><link href="${site}${item.route}" rel="canonical"><meta content="index, follow" name="robots"></head><body><h1>MAX SITE</h1><script src="/assets/site-cost-calculator.js"></script></body></html>`
    : 'verified asset bytes']));
  bodies.set('/robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + site + '/sitemap.xml\n');
  bodies.set('/sitemap.xml', '<sitemapindex>' + SITEMAPS.map(file => `<sitemap><loc>${site}/${file}</loc></sitemap>`).join('') + '</sitemapindex>');
  const pages = RELEASE_FILES.filter(item => item.page);
  SITEMAPS.forEach((file, index) => bodies.set('/' + file, '<urlset>' + (index === 0 ? pages : []).map(item => `<url><loc>${site}${item.route}</loc></url>`).join('') + '</urlset>'));
  const marker = { schemaVersion: 1, mode: 'production', revision, site, sitemapUrlCount: pages.length,
    files: Object.fromEntries(RELEASE_FILES.map(item => [item.route, { sha256: sha256(Buffer.from(bodies.get(item.route))) }])) };
  function syncReceipt() { bodies.set('/' + RELEASE_MARKER, JSON.stringify(marker)); }
  syncReceipt();
  const requests = [];
  const request = async (url, options) => {
    requests.push({ url, options });
    const route = new URL(url).pathname;
    return new Response(bodies.get(route), { status: bodies.has(route) ? 200 : 404 });
  };
  return { bodies, marker, syncReceipt, requests, request };
}

test('production smoke checks matching release bytes, canonical routes, assets and sitemap without writes', async () => {
  const data = fixture();
  const result = await verifyProductionRelease({ baseUrl: site, expectedRevision: revision, request: data.request });
  assert.equal(result.revision, revision);
  assert.equal(result.rows.length, RELEASE_FILES.length + 1);
  assert.equal(result.sitemapUrlCount, RELEASE_FILES.filter(item => item.page).length);
  for (const { url, options } of data.requests) {
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'manual');
    assert.equal(new URL(url).origin, site);
    assert.ok(new URL(url).searchParams.has('release_check'));
    assert.doesNotMatch(url, /workers\.dev|google-analytics|collect|submit/);
  }
});

test('release receipt rejects stale revision, staging mode, missing hashes and a different site', () => {
  const data = fixture();
  for (const patch of [{ revision: 'b'.repeat(40) }, { mode: 'staging' }, { files: {} }, { site: 'https://elsewhere.example' }]) {
    assert.throws(() => validateManifest({ ...data.marker, ...patch }, { expectedRevision: revision, site }));
  }
});

test('mixed/stale production asset bytes fail even with a fresh revision marker', async () => {
  const data = fixture();
  data.bodies.set('/styles.css', 'stale CSS');
  await assert.rejects(verifyProductionRelease({ baseUrl: site, expectedRevision: revision, request: data.request }), /styles\.css.*differ/);
});

test('noindex and canonical regressions fail even when release bytes match', async () => {
  for (const badHtml of [
    `<meta name="robots" content="noindex"><link rel="canonical" href="${site}/"><h1>MAX SITE</h1>`,
    `<link rel="canonical" href="${site}/index.html"><h1>MAX SITE</h1>`,
  ]) {
    const data = fixture();
    data.bodies.set('/', badHtml);
    data.marker.files['/'].sha256 = sha256(Buffer.from(badHtml));
    data.syncReceipt();
    await assert.rejects(verifyProductionRelease({ baseUrl: site, expectedRevision: revision, request: data.request }), /noindex|canonical mismatch/);
  }
});

test('calculator must be included in the release sitemap and link its script', async () => {
  const data = fixture();
  const oldXml = data.bodies.get('/sitemap-services.xml');
  const xml = oldXml.replace(`<url><loc>${site}/kalkulyator-vartosti-saytu/</loc></url>`, '');
  data.bodies.set('/sitemap-services.xml', xml);
  data.marker.sitemapUrlCount--;
  data.marker.files['/sitemap-services.xml'].sha256 = sha256(Buffer.from(xml));
  data.syncReceipt();
  await assert.rejects(verifyProductionRelease({ baseUrl: site, expectedRevision: revision, request: data.request }), /Sitemap missing \/kalkulyator/);
});

test('redirect responses and X-Robots-Tag noindex fail on canonical resources', async () => {
  for (const response of [new Response('', { status: 302, headers: { location: '/index.html' } }), new Response('ok', { headers: { 'X-Robots-Tag': 'noindex' } })]) {
    await assert.rejects(verifyProductionRelease({ baseUrl: site, expectedRevision: revision, request: async () => response }), /HTTP 302|noindex/);
  }
});

test('future edge configuration is excluded and deployment workflow verifies after publish', () => {
  const root = path.resolve(__dirname, '../..');
  const build = fs.readFileSync(path.join(root, 'tools/build-hosting-package.js'), 'utf8');
  assert.match(build, /excludedDirectories = new Set\([\s\S]*?"edge"/);
  assert.match(build, /transformDirectory\(outputDirectory\);[\s\S]*?releaseMarkerPath/);
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.ok(workflow.indexOf('actions/deploy-pages@v4') < workflow.indexOf('node tools/verify-production-release.js'));
  assert.match(workflow, /--expected-revision "\$GITHUB_SHA"/);
});

test('non-public prototypes are excluded from the release build and SEO route scans', () => {
  const root = path.resolve(__dirname, '../..');
  const build = fs.readFileSync(path.join(root, 'tools/build-hosting-package.js'), 'utf8');
  assert.match(build, /excludedDirectories = new Set\([\s\S]*?"prototype"/, 'build-hosting-package.js must exclude prototype/');
  const seoCheck = fs.readFileSync(path.join(root, 'tools/seo-check.js'), 'utf8');
  assert.match(seoCheck, /ignored = new Set\(\[[^\]]*'prototype'/, 'seo-check.js must ignore prototype/ when discovering routes');
  const seoContractTest = fs.readFileSync(path.join(root, 'tests/unit/seo-contract.test.js'), 'utf8');
  assert.match(seoContractTest, /excluded=new Set\(\[[^\]]*'prototype'/, 'seo-contract.test.js must ignore prototype/ when walking HTML files');
});

test('QA files are absent from the built folder and ZIP, including nested private directories', () => {
  const root = path.resolve(__dirname, '../..');
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'max-site-private-build-'));
  const skipped = new Set(['.git', '.github', '.claude', '.qa-tmp', 'artifacts', 'docs', 'node_modules', 'prototype', 'release', 'seo', 'tests']);
  try {
    fs.cpSync(root, fixtureRoot, {
      recursive: true,
      filter: (source) => {
        const relative = path.relative(root, source);
        return !relative || !skipped.has(relative.split(path.sep)[0]);
      },
    });
    for (const directory of ['.qa-tmp', '.claude', 'assets/.qa-tmp', 'assets/.private']) {
      const target = path.join(fixtureRoot, directory);
      fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(path.join(target, 'qa-private-probe.html'), '<h1>Private QA fixture</h1>');
    }
    fs.writeFileSync(path.join(fixtureRoot, 'assets/.private-probe.txt'), 'Private QA fixture');

    for (const [script, arg] of [['seo-check.js', 'routes'], ['generate-sitemaps.js', '--check']]) {
      const scan = spawnSync(process.execPath, [`tools/${script}`, arg], { cwd: fixtureRoot, encoding: 'utf8' });
      assert.equal(scan.status, 0, `${script} included a private route:\n${scan.stdout}\n${scan.stderr}`);
    }

    const build = spawnSync(process.execPath, ['tools/build-hosting-package.js', '--site-url', site], {
      cwd: fixtureRoot,
      env: { ...process.env, GITHUB_SHA: revision },
      encoding: 'utf8',
      timeout: 120000,
    });
    assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

    const releaseRoot = path.join(fixtureRoot, 'release/max-site-production');
    assert.ok(fs.existsSync(path.join(releaseRoot, 'index.html')));
    assert.ok(fs.existsSync(path.join(releaseRoot, 'assets/maxsite-2/motion.js')));
    for (const directory of ['.qa-tmp', '.claude', 'assets/.qa-tmp', 'assets/.private']) {
      assert.equal(fs.existsSync(path.join(releaseRoot, directory)), false, `${directory} leaked into release folder`);
    }
    assert.equal(fs.existsSync(path.join(releaseRoot, 'assets/.private-probe.txt')), false);

    const archive = spawnSync('unzip', ['-Z1', path.join(fixtureRoot, 'release/max-site-production.zip')], { encoding: 'utf8' });
    assert.equal(archive.status, 0, archive.stderr);
    assert.match(archive.stdout, /max-site-production\/index\.html/);
    assert.doesNotMatch(archive.stdout, /\/(?:\.qa-tmp|\.claude|\.private)(?:\/|-probe\.txt)/);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
