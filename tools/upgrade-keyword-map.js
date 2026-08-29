const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../seo/keyword-map.csv");
const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
const parse = (line) => {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else value += character;
  }
  values.push(value);
  return values;
};
const csv = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const header = [
  "cluster_id", "primary_query", "secondary_queries", "intent", "geo", "canonical_url",
  "current_url", "content_type", "priority", "status", "serp_overlap", "decision", "notes",
];
const geoByCluster = {
  "city-kyiv": "Kyiv", "city-lviv": "Lviv", "city-odesa": "Odesa",
  "city-dnipro": "Dnipro", "city-kharkiv": "Kharkiv", "city-cherkasy": "Cherkasy",
};
const p1 = new Set([
  "brand", "website-development", "business-website", "landing", "corporate", "ecommerce",
  "custom-software", "city-kyiv", "city-lviv", "city-odesa", "city-dnipro", "city-kharkiv",
]);
const p2 = new Set([
  "service-sites", "seo-ready-site", "seo", "technical-seo", "google-ads", "analytics", "support",
  "redesign", "city-ukraine", "city-cherkasy", "niche-cleaning", "niche-b2b", "case-cleaning", "case-dez",
]);
const overlap = new Set(["city-kyiv", "city-lviv", "city-odesa", "city-dnipro", "city-kharkiv"]);

const rows = lines.slice(1).map((line) => {
  const [cluster, primary, secondary, intent, canonical, contentType, status, notes] = parse(line);
  const decision = overlap.has(cluster) ? "keep-city-hub" : "keep-owner";
  return [
    cluster, primary, secondary, intent, geoByCluster[cluster] || "UA", canonical, canonical,
    contentType, p1.has(cluster) ? "P1" : p2.has(cluster) ? "P2" : "P3", status,
    overlap.has(cluster) ? "20" : "NA", decision, notes,
  ].map(csv).join(",");
});

fs.writeFileSync(file, `${header.join(",")}\n${rows.join("\n")}\n`);
console.log(`Upgraded ${rows.length} keyword clusters`);
