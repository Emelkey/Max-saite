#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const targets = [
  { file: "stvorennya-program/index.html", container: "program-hero-visual" },
  { file: "portfolio/index.html", container: "portfolio-hero-visual" },
];

for (const target of targets) {
  const absolute = path.join(root, target.file);
  let html = fs.readFileSync(absolute, "utf8");
  const containerPattern = new RegExp(`(<[^>]+class=["'][^"']*${target.container}[^"']*["'][^>]*>[\\s\\S]*?<img\\b)([^>]*>)`, "i");
  if (!containerPattern.test(html)) throw new Error(`${target.file}: priority image container is missing`);
  html = html.replace(containerPattern, (_match, start, attributes) => {
    let updated = attributes
      .replace(/\sloading=["']lazy["']/i, "")
      .replace(/\sdecoding=["']async["']/i, "");
    if (!/\sfetchpriority=/i.test(updated)) updated = updated.replace(/\s*\/?>(\s*)$/, ' fetchpriority="high" />$1');
    return `${start}${updated}`;
  });
  fs.writeFileSync(absolute, html);
}

console.log(`Marked ${targets.length} above-the-fold raster images as high priority.`);
