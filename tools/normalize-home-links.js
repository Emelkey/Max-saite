#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ignored = new Set([".git", ".github", "node_modules", "release", "artifacts", "docs", "tools", "tests", "seo"]);

function collect(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...collect(file));
    else if (entry.name.endsWith(".html")) result.push(file);
  }
  return result;
}

let changed = 0;
let replacements = 0;
for (const file of collect(root)) {
  const html = fs.readFileSync(file, "utf8");
  const updated = html.replace(/href=(["'])(?:\.\.\/)*index\.html((?:[?#][^"']*)?)\1/gi, (_match, quote, suffix) => {
    replacements += 1;
    return `href=${quote}/${suffix}${quote}`;
  });
  if (updated !== html) {
    fs.writeFileSync(file, updated);
    changed += 1;
  }
}

console.log(`Normalized ${replacements} home links in ${changed} HTML files.`);
