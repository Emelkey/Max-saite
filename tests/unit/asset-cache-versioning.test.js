const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { fingerprintAssetUrl, versionHtmlAssets, versionBuiltHtmlAssets } = require('../../tools/lib/version-local-assets');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'max-site-assets-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'assets'));
  fs.mkdirSync(path.join(root, 'nested'));
  fs.writeFileSync(path.join(root, 'styles.css'), 'body { color: white; }');
  fs.writeFileSync(path.join(root, 'assets/config.js'), 'window.config = { enabled: true };');
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Home</h1>');
  fs.writeFileSync(path.join(root, 'nested/index.html'), '<h1>Nested</h1>');
  return { root, pageFile: path.join(root, 'nested/index.html'), siteUrl: 'https://maxsite.com.ua', publicBasePath: '/' };
}
const hash = (root, file) => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 16);

test('relative local assets get content hashes while non-v queries and fragment survive', t => {
  const options = fixture(t);
  const actual = fingerprintAssetUrl('../styles.css?theme=dark%20mode&amp;v=20260902&amp;lang=uk#main', { ...options, kind: 'style' });
  assert.equal(actual, `../styles.css?theme=dark%20mode&amp;v=${hash(options.root, 'styles.css')}&amp;lang=uk#main`);
  assert.equal(fingerprintAssetUrl(actual, { ...options, kind: 'style' }), actual);
});

test('only real script src and stylesheet href are rewritten, not Google, links, comments or inline code', t => {
  const options = fixture(t);
  const html = `<link rel="canonical" href="https://maxsite.com.ua/nested/">
<link href="../styles.css?v=old" rel="stylesheet"><a href="../styles.css?v=old">CSS</a>
<script src="../assets/config.js?v=old"></script>
<script src="https://www.googletagmanager.com/gtag/js?id=G-123"></script>
<!-- <script src="../assets/config.js?v=comment"></script> -->
<script>const sample = '<link rel="stylesheet" href="../styles.css?v=literal">';</script>
<link rel="preload" href="../styles.css?v=old" as="style">`;
  const result = versionHtmlAssets(html, options);
  assert.equal(result.count, 2);
  assert.ok(result.html.includes(`../styles.css?v=${hash(options.root, 'styles.css')}`));
  assert.ok(result.html.includes(`../assets/config.js?v=${hash(options.root, 'assets/config.js')}`));
  for (const kept of ['<a href="../styles.css?v=old">', 'https://www.googletagmanager.com/gtag/js?id=G-123', 'v=comment', 'v=literal', 'rel="preload" href="../styles.css?v=old"', 'rel="canonical" href="https://maxsite.com.ua/nested/"']) assert.ok(result.html.includes(kept));
});

test('subpath builds map root-relative and relative assets to public-root files', t => {
  const options = { ...fixture(t), siteUrl: 'https://preview.example/subsite', publicBasePath: '/subsite/' };
  for (const url of ['/subsite/assets/config.js?v=old', '../assets/config.js?v=old', 'https://preview.example/subsite/assets/config.js?v=old']) {
    const updated = fingerprintAssetUrl(url, { ...options, kind: 'script' });
    assert.ok(updated.endsWith(`v=${hash(options.root, 'assets/config.js')}`));
  }
  assert.equal(fingerprintAssetUrl('/assets/config.js?v=old', { ...options, kind: 'script' }), '/assets/config.js?v=old');
});

test('out-of-root traversal, symlinks, missing assets and external URLs are untouched', t => {
  const options = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'max-site-assets-outside-test-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.writeFileSync(path.join(outside, 'outside.js'), 'must not be read or hashed');
  fs.symlinkSync(outside, path.join(options.root, 'escape'));
  for (const url of ['../../../../outside.js?v=old', '/escape/outside.js?v=old', '../missing.js?v=old', 'https://external.example/assets/config.js?v=old', 'data:text/javascript,alert(1)', '/%2e%2e/outside.js?v=old']) {
    assert.equal(fingerprintAssetUrl(url, { ...options, kind: 'script' }), url);
  }
});

test('hashes reflect final transformed bytes and duplicate v parameters collapse deterministically', t => {
  const options = fixture(t);
  const url = '../assets/config.js?v=one&debug=1&v=two#anchor';
  const before = fingerprintAssetUrl(url, { ...options, kind: 'script' });
  fs.writeFileSync(path.join(options.root, 'assets/config.js'), 'window.config = { enabled: false };');
  const after = fingerprintAssetUrl(url, { ...options, kind: 'script' });
  assert.notEqual(before, after);
  assert.equal((after.match(/v=/g) || []).length, 1);
  assert.ok(after.endsWith('&amp;debug=1#anchor'));
});

test('built HTML changes deterministically without touching JS/CSS bytes', t => {
  const options = fixture(t);
  const file = path.join(options.root, 'nested/index.html');
  fs.writeFileSync(file, '<link rel="stylesheet" href="../styles.css?v=old"><script src="../assets/config.js?v=old"></script>');
  const css = fs.readFileSync(path.join(options.root, 'styles.css'));
  const js = fs.readFileSync(path.join(options.root, 'assets/config.js'));
  assert.equal(versionBuiltHtmlAssets(options.root, options), 2);
  assert.equal(versionBuiltHtmlAssets(options.root, options), 0);
  assert.deepEqual(fs.readFileSync(path.join(options.root, 'styles.css')), css);
  assert.deepEqual(fs.readFileSync(path.join(options.root, 'assets/config.js')), js);
});

test('build fingerprints only after transformations and before release receipt hashing', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../../tools/build-hosting-package.js'), 'utf8');
  const transformed = source.indexOf('transformDirectory(outputDirectory);');
  const versioned = source.indexOf('const versionedAssetReferences = versionBuiltHtmlAssets(');
  const receipt = source.indexOf('const releaseMarkerPath =');
  assert.ok(transformed < versioned && versioned < receipt);
});
