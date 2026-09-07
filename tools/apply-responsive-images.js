#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const responsiveRoot = path.join(root, "assets", "responsive");
const ignored = new Set([".git", ".github", "node_modules", "release", "artifacts", "docs", "tools", "tests", "seo"]);

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(file));
    else if (entry.name.endsWith(".html")) files.push(file);
  }
  return files;
}

function assetReference(src) {
  const clean = src.replace(/[?#].*$/, "");
  const index = clean.lastIndexOf("assets/");
  if (index < 0 || !/\.(?:png|jpe?g|webp|avif)$/i.test(clean)) return null;
  const prefix = clean.slice(0, index);
  const relative = clean.slice(index + "assets/".length).replace(/\.(?:png|jpe?g|webp|avif)$/i, "");
  return { prefix, relative };
}

function candidates(relative, extension, prefix) {
  const directory = path.join(responsiveRoot, path.dirname(relative));
  const base = path.basename(relative).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .map((name) => name.match(new RegExp(`^${base}-(\\d+)\\.${extension}$`)))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .sort((a, b) => a - b)
    .map((width) => `${prefix}assets/responsive/${relative}-${width}.${extension} ${width}w`);
}

function sizesFor(tag) {
  if (/hero-agency-image|program-hero|fetchpriority=["']high/i.test(tag)) return "(max-width: 920px) 100vw, 50vw";
  if (/founder-/i.test(tag)) return "(max-width: 900px) 100vw, 46vw";
  if (/mobile-20260902|-(?:formula|fodez)-mobile/i.test(tag)) return "(max-width: 720px) 92vw, 390px";
  if (/portfolio|formula-|fodez-|case-/i.test(tag)) return "(max-width: 720px) 92vw, (max-width: 1120px) 46vw, 34vw";
  return "(max-width: 760px) 92vw, 50vw";
}

function addAttribute(tag, name, value) {
  if (new RegExp(`\\b${name}=`, "i").test(tag)) return tag;
  return tag.replace(/\s*\/?>(\s*)$/, ` ${name}="${value}" />$1`);
}

let changedFiles = 0;
let wrappedImages = 0;

for (const file of collectHtml(root)) {
  const html = fs.readFileSync(file, "utf8");
  const updated = html.replace(/<img\b[^>]*>/gi, (original) => {
    if (/\bdata-responsive=["']true/i.test(original)) return original;
    const src = original.match(/\bsrc=["']([^"']+)["']/i)?.[1] || "";
    const ref = assetReference(src);
    if (!ref) return original;
    const avif = candidates(ref.relative, "avif", ref.prefix);
    const webp = candidates(ref.relative, "webp", ref.prefix);
    if (!avif.length || !webp.length) throw new Error(`Responsive candidates missing for ${src} in ${path.relative(root, file)}`);

    const isLcp = /fetchpriority=["']high/i.test(original);
    let img = original;
    img = addAttribute(img, "srcset", webp.join(", "));
    img = addAttribute(img, "sizes", sizesFor(original));
    img = addAttribute(img, "data-responsive", "true");
    if (isLcp) {
      img = img.replace(/\sloading=["']lazy["']/i, "").replace(/\sdecoding=["']async["']/i, "");
    } else {
      img = addAttribute(img, "loading", "lazy");
      img = addAttribute(img, "decoding", "async");
    }
    wrappedImages += 1;
    return `<picture class="responsive-picture"><source type="image/avif" srcset="${avif.join(", ")}" sizes="${sizesFor(original)}" /><source type="image/webp" srcset="${webp.join(", ")}" sizes="${sizesFor(original)}" />${img}</picture>`;
  });
  if (updated !== html) {
    fs.writeFileSync(file, updated);
    changedFiles += 1;
  }
}

console.log(`Wrapped ${wrappedImages} raster images in ${changedFiles} HTML files.`);
