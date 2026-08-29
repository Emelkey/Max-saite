const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const docsRoot = path.join(root, "docs", "seo");
const seoRoot = path.join(root, "seo");
const artifactRoot = path.join(root, "artifacts", "seo", "baseline");
const htmlSnapshotRoot = path.join(artifactRoot, "html");
const productionOrigin = "https://maxsite.com.ua";

for (const directory of [docsRoot, seoRoot, artifactRoot, htmlSnapshotRoot]) {
  fs.mkdirSync(directory, { recursive: true });
}

const ignoredDirectories = new Set([".git", "node_modules", "release", "artifacts"]);
const collectHtml = (directory) => {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(absolute));
    else if (entry.name.endsWith(".html")) files.push(absolute);
  }
  return files;
};

const routeFromFile = (file) => {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
};

const fileFromRoute = (route) => {
  const clean = route.replace(/^https?:\/\/[^/]+/, "").replace(/[?#].*$/, "").replace(/^\/+/, "");
  if (!clean || clean.endsWith("/")) return path.join(root, clean, "index.html");
  return path.join(root, clean);
};

const stripHtml = (value) => value
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

const csvEscape = (value) => {
  const string = String(value ?? "");
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
};

const writeCsv = (file, headers, rows) => {
  const lines = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))];
  fs.writeFileSync(file, `${lines.join("\n")}\n`);
};

const getMeta = (html, name, attribute = "name") => {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  const target = tags.find((tag) => new RegExp(`${attribute}=["']${name}["']`, "i").test(tag));
  return target?.match(/content=["']([^"']*)["']/i)?.[1]?.trim() || "";
};

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapRoutes = new Set(sitemapUrls.map((url) => new URL(url).pathname));
const htmlFiles = collectHtml(root);
const routeRecords = [];
const linksByRoute = new Map();
const inlinkCounts = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromFile(file);
  const title = stripHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  const description = getMeta(html, "description");
  const robots = getMeta(html, "robots").toLowerCase();
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || "";
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1 = h1Matches.map((match) => stripHtml(match[1])).join(" | ");
  const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
  const mainText = stripHtml(mainHtml);
  const wordCount = mainText ? mainText.split(/\s+/).filter(Boolean).length : 0;
  const schemaTypes = new Set();
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      const visit = (value) => {
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value)) return value.forEach(visit);
        if (value["@type"]) {
          for (const type of Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]]) schemaTypes.add(type);
        }
        Object.values(value).forEach(visit);
      };
      visit(parsed);
    } catch {
      schemaTypes.add("INVALID_JSON_LD");
    }
  }

  const outgoing = [];
  for (const match of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:mailto:|tel:|viber:|javascript:|#)/i.test(href)) continue;
    let targetRoute = "";
    try {
      if (/^https?:/i.test(href)) {
        const parsed = new URL(href);
        if (parsed.origin !== productionOrigin) continue;
        targetRoute = parsed.pathname;
      } else if (href.startsWith("/")) {
        targetRoute = href.replace(/[?#].*$/, "");
      } else {
        const baseUrl = new URL(route, `${productionOrigin}/`);
        targetRoute = new URL(href, baseUrl).pathname;
      }
      if (targetRoute.endsWith("/index.html")) targetRoute = targetRoute.slice(0, -"index.html".length);
      if (targetRoute === "/index.html") targetRoute = "/";
      outgoing.push(targetRoute);
      inlinkCounts.set(targetRoute, (inlinkCounts.get(targetRoute) || 0) + 1);
    } catch {
      outgoing.push(`INVALID:${href}`);
    }
  }
  linksByRoute.set(route, outgoing);

  const templateType = route === "/" ? "home"
    : route.startsWith("/mista/") ? (route === "/mista/" ? "city-index" : "city")
      : route.startsWith("/nishi/") ? (route === "/nishi/" ? "niche-index" : "niche")
        : route.startsWith("/portfolio/") ? (route === "/portfolio/" ? "portfolio-index" : "case")
          : route.startsWith("/blog/") ? (route === "/blog/" ? "blog-index" : "article")
            : ["/stvorennya-saytiv/", "/stvorennya-saytu-dlya-biznesu/", "/stvorennya-program/", "/stvorennya-landing-page/", "/stvorennya-korporatyvnoho-saytu/", "/stvorennya-internet-mahazynu/", "/seo-sajt-pid-google/"].includes(route) ? "money-page"
              : "supporting-page";
  const indexable = route !== "/404.html" && !robots.includes("noindex");
  const redirectTarget = html.match(/<meta\s+http-equiv=["']refresh["'][^>]*content=["'][^;]+;\s*url=([^"']+)/i)?.[1] || "";
  routeRecords.push({
    url: `${productionOrigin}${route}`,
    route_file: path.relative(root, file).replaceAll(path.sep, "/"),
    template_type: templateType,
    indexable,
    canonical,
    title,
    description,
    h1,
    word_count_main: wordCount,
    schema_types: [...schemaTypes].sort().join("|"),
    internal_inlinks: 0,
    internal_outlinks: outgoing.length,
    sitemap: sitemapRoutes.has(route),
    status_code: redirectTarget ? 301 : 200,
    redirect_target: redirectTarget,
    notes: h1Matches.length !== 1 ? `H1_COUNT=${h1Matches.length}` : "",
  });
}

for (const record of routeRecords) {
  const route = new URL(record.url).pathname;
  record.internal_inlinks = inlinkCounts.get(route) || 0;
}

routeRecords.sort((a, b) => a.url.localeCompare(b.url, "uk"));
writeCsv(path.join(docsRoot, "route-inventory.csv"), Object.keys(routeRecords[0]), routeRecords);

const keyRoutes = [
  "/",
  "/stvorennya-saytiv/",
  "/stvorennya-saytu-dlya-biznesu/",
  "/stvorennya-program/",
  "/mista/",
  "/mista/stvorennya-sajtiv-kyiv/",
  "/mista/stvorennya-sajtiv-lviv/",
  "/mista/stvorennya-sajtiv-odesa/",
  "/mista/stvorennya-sajtiv-dnipro/",
  "/mista/stvorennya-sajtiv-kharkiv/",
  "/portfolio/formula-chystoty/",
  "/blog/skilky-koshtuye-stvorennya-sajtu/",
];

for (const route of keyRoutes) {
  const file = fileFromRoute(route);
  if (!fs.existsSync(file)) continue;
  const name = route === "/" ? "home.html" : `${route.replace(/^\/+|\/+$/g, "").replaceAll("/", "__")}.html`;
  fs.copyFileSync(file, path.join(htmlSnapshotRoot, name));
}

const metadataSnapshot = routeRecords.map(({ url, indexable, canonical, title, description, h1 }) => ({ url, indexable, canonical, title, description, h1 }));
fs.writeFileSync(path.join(artifactRoot, "metadata.json"), `${JSON.stringify(metadataSnapshot, null, 2)}\n`);
fs.writeFileSync(path.join(artifactRoot, "link-graph.json"), `${JSON.stringify(Object.fromEntries([...linksByRoute].sort()), null, 2)}\n`);
fs.writeFileSync(path.join(artifactRoot, "sitemap.xml"), sitemap);
fs.copyFileSync(path.join(root, "robots.txt"), path.join(artifactRoot, "robots.txt"));

const cityRows = routeRecords
  .filter((record) => record.template_type === "city")
  .map((record) => ({ url: record.url, indexable: record.indexable, sitemap: record.sitemap, title: record.title, h1: record.h1, word_count_main: record.word_count_main }));
writeCsv(path.join(artifactRoot, "city-pages.csv"), Object.keys(cityRows[0]), cityRows);

const summary = {
  generatedAt: new Date().toISOString(),
  framework: "Static HTML/CSS/JavaScript",
  htmlPages: routeRecords.length,
  indexablePages: routeRecords.filter((record) => record.indexable).length,
  sitemapUrls: sitemapUrls.length,
  cityPages: cityRows.length,
  indexableCityPages: cityRows.filter((record) => record.indexable).length,
  noindexPages: routeRecords.filter((record) => !record.indexable).length,
  totalInternalLinks: routeRecords.reduce((sum, record) => sum + Number(record.internal_outlinks), 0),
  zeroInlinkIndexablePages: routeRecords.filter((record) => record.indexable && record.url !== `${productionOrigin}/` && record.internal_inlinks === 0).map((record) => record.url),
};
fs.writeFileSync(path.join(artifactRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
