const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const skip = new Set(['.git', '.github', 'node_modules', 'artifacts', 'release', 'docs', 'tools', 'tests']);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (skip.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const source = fs.readFileSync(file, 'utf8');
    let html = source;
    if (!html.includes('/assets/consent.js')) html = html.replace(/(<head\b[^>]*>)/i, '$1\n  <script src="/assets/consent.js?v=20260902-master3"></script>');
    html = html.replace(/gtag\('config',\s*'G-TS8DMMKK34'\);/g, "gtag('config', 'G-TS8DMMKK34', window.MAX_SITE_GOOGLE_PAGE || {});");
    html = html.replace(/(styles\.css|script\.js)(?:\?v=[^"']*)?(?=["'])/g, '$1?v=20260902-master3');
    if (html !== source) fs.writeFileSync(file, html);
  }
}
walk(root);
