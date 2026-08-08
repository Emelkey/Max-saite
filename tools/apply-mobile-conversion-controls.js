#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const excluded = new Set(['hosting-package', 'release', '.git', 'node_modules']);

function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    if (excluded.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

let updated = 0;
for (const file of walk(root)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('class="main-nav"') || html.includes('class="mobile-nav-phone"')) continue;

  const navPattern = /(<nav class="main-nav"[^>]*>[\s\S]*?)(\s*<\/nav>)/;
  if (!navPattern.test(html)) throw new Error(`Main navigation could not be updated: ${file}`);

  html = html.replace(
    navPattern,
    `$1\n        <a class="mobile-nav-phone" href="tel:+380972692322" aria-label="Подзвонити MAX SITE 0972692322"><span>Подзвонити</span><strong>0972692322</strong></a>$2`
  );
  fs.writeFileSync(file, html);
  updated += 1;
}

console.log(`Added the mobile phone link to ${updated} HTML pages`);
