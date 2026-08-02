const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const citiesRoot = path.join(root, "mista");
const indexableCitySlugs = new Set([
  "stvorennya-sajtiv-cherkasy",
  "stvorennya-sajtiv-kyiv",
  "stvorennya-sajtiv-ukrayina",
]);

let noindexed = 0;

for (const entry of fs.readdirSync(citiesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || indexableCitySlugs.has(entry.name)) continue;

  const page = path.join(citiesRoot, entry.name, "index.html");
  if (!fs.existsSync(page)) continue;

  let html = fs.readFileSync(page, "utf8");
  if (!/<meta\s+name="robots"/i.test(html)) {
    html = html.replace(
      /(<meta\s+name="viewport"[^>]*>)/i,
      '$1\n    <meta name="robots" content="noindex, follow" />'
    );
    fs.writeFileSync(page, html);
    noindexed += 1;
  }
}

const sitemapPath = path.join(root, "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");
let removedFromSitemap = 0;

sitemap = sitemap.replace(/\s*<url><loc>([^<]+\/mista\/(stvorennya-sajtiv-[^/]+)\/)<\/loc>[\s\S]*?<\/url>/g, (block, url, slug) => {
  if (indexableCitySlugs.has(slug)) return block;
  removedFromSitemap += 1;
  return "";
});

fs.writeFileSync(sitemapPath, sitemap.replace(/\n{3,}/g, "\n\n"));

console.log(`City pages marked noindex, follow: ${noindexed}`);
console.log(`City URLs removed from sitemap: ${removedFromSitemap}`);
