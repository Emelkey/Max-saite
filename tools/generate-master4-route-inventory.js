#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputFile = path.join(root, "docs", "seo", "master-4-0-route-inventory.csv");
const checkOnly = process.argv.includes("--check");
const productionOrigin = "https://maxsite.com.ua";
const ignoredDirectories = new Set([".git", "artifacts", "node_modules", "release"]);

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(file));
    else if (entry.name.endsWith(".html")) files.push(file);
  }
  return files;
}

function routeFromFile(file) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

function stripHtml(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1]?.trim() || "";
}

function metaContent(html, name) {
  const tag = (html.match(/<meta\b[^>]*>/gi) || [])
    .find((candidate) => attribute(candidate, "name").toLowerCase() === name.toLowerCase());
  return tag ? attribute(tag, "content") : "";
}

function canonicalFor(html) {
  const tag = (html.match(/<link\b[^>]*>/gi) || [])
    .find((candidate) => attribute(candidate, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  return tag ? attribute(tag, "href") : "";
}

function templateType(route) {
  if (route === "/") return "home";
  if (route === "/mista/") return "city-index";
  if (route.startsWith("/mista/")) return "city";
  if (route === "/nishi/") return "niche-index";
  if (route.startsWith("/nishi/")) return "niche";
  if (route === "/portfolio/") return "portfolio-index";
  if (route.startsWith("/portfolio/")) return "case";
  if (route === "/blog/") return "blog-index";
  if (route.startsWith("/blog/")) return "article";
  if ([
    "/stvorennya-saytiv/",
    "/stvorennya-saytu-dlya-biznesu/",
    "/stvorennya-program/",
    "/stvorennya-landing-page/",
    "/stvorennya-korporatyvnoho-saytu/",
    "/stvorennya-internet-mahazynu/",
    "/seo-sajt-pid-google/",
  ].includes(route)) return "money-page";
  return "supporting-page";
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if (character === "\n" && !quoted) {
      row.push(value.replace(/\r$/, ""));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function csvEscape(value) {
  const string = String(value ?? "");
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

function loadSitemapRoutes() {
  const sitemapIndex = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const childMaps = [...sitemapIndex.matchAll(/<loc>[^<]*\/([^/<>]+\.xml)<\/loc>/g)].map((match) => match[1]);
  const documents = childMaps.length
    ? childMaps.map((name) => fs.readFileSync(path.join(root, name), "utf8"))
    : [sitemapIndex];
  return new Set(
    documents.flatMap((xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname)),
  );
}

const redirectRows = parseCsv(fs.readFileSync(path.join(root, "seo", "redirects.csv"), "utf8"));
const redirects = new Map(redirectRows.map((row) => [new URL(row.from).pathname, row.to]));
const sitemapRoutes = loadSitemapRoutes();
const records = collectHtml(root).map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromFile(file);
  const url = `${productionOrigin}${route}`;
  const robots = metaContent(html, "robots").toLowerCase();
  const canonical = canonicalFor(html);
  const indexable = route !== "/404.html" && !robots.includes("noindex");
  const expectedCanonical = url;
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  return {
    route,
    url,
    route_file: path.relative(root, file).replaceAll(path.sep, "/"),
    template_type: templateType(route),
    indexable,
    robots,
    canonical,
    canonical_relation: canonical === expectedCanonical ? "self" : canonical ? "alternate" : "missing",
    in_sitemap: sitemapRoutes.has(route),
    redirect_target: redirects.get(route) || "",
    title: stripHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ""),
    h1_count: h1Count,
    source_sha256_12: crypto.createHash("sha256").update(html).digest("hex").slice(0, 12),
  };
}).sort((left, right) => left.route.localeCompare(right.route, "uk"));

const headers = Object.keys(records[0]);
const generated = `${[
  headers.join(","),
  ...records.map((record) => headers.map((header) => csvEscape(record[header])).join(",")),
].join("\n")}\n`;

if (checkOnly) {
  if (!fs.existsSync(outputFile) || fs.readFileSync(outputFile, "utf8") !== generated) {
    console.error(`Route inventory is stale: ${path.relative(root, outputFile)}`);
    console.error("Run: node tools/generate-master4-route-inventory.js");
    process.exit(1);
  }
  console.log(`Route inventory is current: ${records.length} HTML documents`);
} else {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, generated);
  console.log(`Wrote ${records.length} routes to ${path.relative(root, outputFile)}`);
}
