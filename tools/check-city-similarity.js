const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const cityData = JSON.parse(fs.readFileSync(path.join(root, "seo/cities.json"), "utf8"));
const published = cityData.filter((city) => city.priority === 1 && city.index && city.state === "published");
const outputFile = path.join(root, "artifacts/seo/city-similarity-report.json");
const threshold = 0.55;

const removeStandardSections = (html) => html
  .replace(/<header\b[\s\S]*?<\/header>/gi, " ")
  .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<form\b[\s\S]*?<\/form>/gi, " ")
  .replace(/<section\b[^>]*class="[^"]*seo-lead[^"]*"[\s\S]*?<\/section>/gi, " ")
  .replace(/<section\b[^>]*id="wave1-[^"]+-proof"[\s\S]*?<\/section>/gi, " ")
  .replace(/<section\b[^>]*>[\s\S]*?<span class="eyebrow">(?:Процес|Вартість|Вартість і строки)<\/span>[\s\S]*?<\/section>/gi, " ");

const normalize = (html) => removeStandardSections(html)
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z0-9#]+;/gi, " ")
  .toLowerCase()
  .replace(/[^a-zа-яіїєґ0-9\s-]/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const ngrams = (text, size = 5) => {
  const words = text.split(" ").filter(Boolean);
  const result = new Set();
  for (let index = 0; index <= words.length - size; index += 1) {
    result.add(words.slice(index, index + size).join(" "));
  }
  return result;
};

const pages = Object.fromEntries(published.map((city) => {
  const file = path.join(root, `mista/stvorennya-sajtiv-${city.slug}/index.html`);
  const text = normalize(fs.readFileSync(file, "utf8"));
  return [city.slug, { words: text.split(" ").filter(Boolean).length, grams: ngrams(text) }];
}));

const pairs = [];
let failed = false;
for (let left = 0; left < published.length; left += 1) {
  for (let right = left + 1; right < published.length; right += 1) {
    const a = published[left].slug;
    const b = published[right].slug;
    const leftGrams = pages[a].grams;
    const rightGrams = pages[b].grams;
    let intersection = 0;
    for (const gram of leftGrams) if (rightGrams.has(gram)) intersection += 1;
    const union = new Set([...leftGrams, ...rightGrams]).size;
    const similarity = union ? intersection / union : 0;
    if (similarity > threshold) failed = true;
    pairs.push({ a, b, similarity: Number(similarity.toFixed(4)), intersection, union, pass: similarity <= threshold });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  method: "5-gram Jaccard after header/footer/form/standard process-pricing-proof removal",
  threshold,
  pages: Object.fromEntries(Object.entries(pages).map(([slug, data]) => [slug, { words: data.words, grams: data.grams.size }])),
  pairs,
  pass: !failed,
};
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);

for (const pair of pairs) console.log(`${pair.a} <> ${pair.b}: ${pair.similarity.toFixed(4)} ${pair.pass ? "PASS" : "FAIL"}`);
if (failed) process.exitCode = 1;
