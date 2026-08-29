const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const cities = JSON.parse(fs.readFileSync(path.join(root, "seo/cities.json"), "utf8"));
const keywordMap = fs.readFileSync(path.join(root, "seo/keyword-map.csv"), "utf8");
const slugs = new Set();
const titles = new Set();
const h1s = new Set();
const errors = [];

for (const city of cities) {
  if (!city.slug || slugs.has(city.slug)) errors.push(`Duplicate/missing slug: ${city.slug}`);
  slugs.add(city.slug);
  if (!city.nominative || !city.locative || !city.preposition) errors.push(`Missing grammar fields: ${city.slug}`);
  if (!new Set(["draft", "review", "published", "noindex"]).has(city.state)) errors.push(`Invalid state: ${city.slug}`);
  if (city.index && city.state !== "published") errors.push(`Indexable city is not published: ${city.slug}`);
  if (!city.index) continue;
  for (const field of ["title", "description", "h1", "updatedAt"]) if (!city[field]) errors.push(`Missing ${field}: ${city.slug}`);
  if (titles.has(city.title)) errors.push(`Duplicate title: ${city.title}`);
  if (h1s.has(city.h1)) errors.push(`Duplicate H1: ${city.h1}`);
  titles.add(city.title);
  h1s.add(city.h1);
  if (city.relatedCitySlugs?.includes(city.slug)) errors.push(`Self related city: ${city.slug}`);
  if ((city.relatedCitySlugs || []).some((slug) => !cities.some((candidate) => candidate.slug === slug))) errors.push(`Unknown related city: ${city.slug}`);
  const url = `https://maxsite.com.ua/mista/stvorennya-sajtiv-${city.slug}/`;
  if (!keywordMap.includes(url)) errors.push(`Missing keyword-map ownership: ${city.slug}`);
  const htmlFile = path.join(root, `mista/stvorennya-sajtiv-${city.slug}/index.html`);
  const html = fs.readFileSync(htmlFile, "utf8");
  if (!html.includes(`<link rel="canonical" href="${url}"`)) errors.push(`Canonical mismatch: ${city.slug}`);
  if (!html.includes(`<title>${city.title}</title>`)) errors.push(`Rendered title mismatch: ${city.slug}`);
  if (!html.includes(`<h1>${city.h1}</h1>`)) errors.push(`Rendered H1 mismatch: ${city.slug}`);
  const faqCount = (html.match(/<details>/g) || []).length;
  const minimumFaq = city.priority === 1 ? 5 : 3;
  if (faqCount < minimumFaq) errors.push(`Too few FAQ: ${city.slug} (${faqCount})`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${cities.length} city records; ${cities.filter((city) => city.index).length} indexable`);
