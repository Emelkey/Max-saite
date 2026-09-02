const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const cities = JSON.parse(fs.readFileSync(path.join(root, "seo/cities.json"), "utf8"));
const keywordMap = fs.readFileSync(path.join(root, "seo/keyword-map.csv"), "utf8");
const slugs = new Set();
const titles = new Set();
const h1s = new Set();
const errors = [];
const content = require('../seo/city-wave1-content.json');

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
  if (city.priority === 1) {
    const data = content[city.contentKey];
    if (!data) { errors.push(`Missing content record: ${city.slug}`); continue; }
    for (const field of ['intro','aside','marketHeading','decisionHeading','cta']) if (!data[field]?.trim()) errors.push(`Missing content.${field}: ${city.slug}`);
    if (data.segments?.length < 4 || data.segments?.length > 6) errors.push(`Need 4–6 scenario segments: ${city.slug}`);
    if (data.sections?.length < 2 || new Set(data.sections?.map(section=>section.heading)).size !== data.sections?.length) errors.push(`Need distinct city sections: ${city.slug}`);
    if (data.faq?.length < 5 || data.faq?.length > 7 || faqCount !== data.faq?.length) errors.push(`Need 5–7 rendered FAQs: ${city.slug}`);
    if (!Array.isArray(data.decisions) || data.decisions.length < 3) errors.push(`Missing decision table: ${city.slug}`);
    if ((city.relatedServiceSlugs||[]).length < 6) errors.push(`Need six related services: ${city.slug}`);
    if (city.relatedCitySlugs.length < 2 || city.relatedCitySlugs.length > 4) errors.push(`Need 2–4 related cities: ${city.slug}`);
    for (const related of city.relatedCitySlugs) if (!cities.find(item=>item.slug===related)?.index) errors.push(`Related city is noindex: ${city.slug} -> ${related}`);
    for (const slug of ['formula-chystoty','fo-dez']) if (!html.includes(`/portfolio/${slug}/`)) errors.push(`Missing proof link: ${city.slug} -> ${slug}`);
    if (!html.includes('<table class="seo-decision-table">')) errors.push(`Missing rendered decision table: ${city.slug}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${cities.length} city records; ${cities.filter((city) => city.index).length} indexable`);
