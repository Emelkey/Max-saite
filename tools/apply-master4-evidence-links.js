#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const verifiedCaseLinks = `<div class="link-grid case-direct-links" aria-label="Перевірні кейси MAX SITE"><a href="/portfolio/formula-chystoty/">Кейс сайту «Формула Чистоти»</a><a href="/portfolio/fo-dez/">Кейс сервісного сайту FO-DEZ</a><a href="/portfolio/max-site/">Self-case архітектури MAX SITE</a></div>`;

const genericPortfolioCta = '<p><a class="btn btn-ghost" href="/portfolio/">Переглянути підтверджені роботи</a></p>';
const directTargets = [
  "stvorennya-saytiv/index.html",
  "stvorennya-saytu-dlya-biznesu/index.html",
  "stvorennya-landing-page/index.html",
  "stvorennya-korporatyvnoho-saytu/index.html",
  "stvorennya-internet-mahazynu/index.html",
];

function replaceOnce(file, search, replacement, label) {
  const absolute = path.join(root, file);
  const html = fs.readFileSync(absolute, "utf8");
  if (html.includes(replacement)) return false;
  if (!html.includes(search)) throw new Error(`${file}: could not locate ${label}`);
  fs.writeFileSync(absolute, html.replace(search, replacement));
  return true;
}

let changed = 0;
for (const file of directTargets) {
  changed += Number(replaceOnce(file, genericPortfolioCta, `${genericPortfolioCta}${verifiedCaseLinks}`, "portfolio CTA"));
}

const evidenceSection = `<section class="seo-band reveal master4-evidence"><span class="eyebrow">Перевірні роботи</span><h2>Що можна перевірити до замовлення</h2><p>Посилання ведуть на окремі сторінки з живими сайтами, скріншотами та чіткими межами підтвердженого результату. Ми не приписуємо проєктам неперевірені продажі або позиції.</p>${verifiedCaseLinks}</section>`;

for (const file of ["stvorennya-program/index.html", "sajty-dlya-poslug/index.html", "seo-sajt-pid-google/index.html"]) {
  const absolute = path.join(root, file);
  let html = fs.readFileSync(absolute, "utf8");
  if (html.includes('class="seo-band reveal master4-evidence"')) continue;
  const marker = html.includes('<section class="seo-links') ? '<section class="seo-links' : '<section class="seo-band"><h2>FAQ';
  const index = html.indexOf(marker);
  if (index < 0) throw new Error(`${file}: evidence insertion marker missing`);
  html = `${html.slice(0, index)}${evidenceSection}${html.slice(index)}`;
  fs.writeFileSync(absolute, html);
  changed += 1;
}

for (const [file, liveUrl, caseUrl, label] of [
  ["index.html", "https://www.formula-chistoty.ck.ua/", "portfolio/formula-chystoty/", "Детальний кейс"],
  ["index.html", "https://fodez.com.ua/", "portfolio/fo-dez/", "Детальний кейс"],
]) {
  const absolute = path.join(root, file);
  let html = fs.readFileSync(absolute, "utf8");
  const caseLink = `<a class="btn btn-ghost" href="${caseUrl}">${label}</a>`;
  if (html.includes(caseLink)) continue;
  const liveLink = new RegExp(`(<a class="btn" href="${liveUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>Переглянути сайт<\\/a>)`);
  if (!liveLink.test(html)) throw new Error(`${file}: live case link missing for ${liveUrl}`);
  html = html.replace(liveLink, `$1${caseLink}`);
  fs.writeFileSync(absolute, html);
  changed += 1;
}

const homePortfolioCta = '<a class="btn btn-ghost" href="portfolio/">Дивитись портфоліо / кейси</a>';
const homeSelfCaseCta = '<a class="btn btn-ghost" href="portfolio/max-site/">Як побудований MAX SITE</a>';
changed += Number(replaceOnce(
  "index.html",
  homePortfolioCta,
  `${homePortfolioCta}${homeSelfCaseCta}`,
  "home portfolio CTA"
));

const caseRelations = {
  "portfolio/formula-chystoty/index.html": '<a class="btn btn-ghost" href="/mista/stvorennya-sajtiv-cherkasy/">Розробка сайтів у Черкасах</a>',
  "portfolio/fo-dez/index.html": '<a class="btn btn-ghost" href="/mista/stvorennya-sajtiv-ukrayina/">Робота з бізнесом по Україні</a>',
  "portfolio/max-site/index.html": '<a class="btn btn-ghost" href="/nishi/sajt-dlya-b2b-kompaniyi/">Сайти для B2B</a><a class="btn btn-ghost" href="/mista/stvorennya-sajtiv-ukrayina/">Розробка по Україні</a>',
};

for (const [file, links] of Object.entries(caseRelations)) {
  const absolute = path.join(root, file);
  let html = fs.readFileSync(absolute, "utf8");
  // Keep contextual recommendations beside the case CTAs. An earlier generic
  // closing-tag lookup could place these links in `.header-actions` on compact
  // one-line case templates and make the desktop header overflow.
  html = html.replaceAll(links, "");
  const actionStart = html.indexOf('<div class="case-actions">');
  if (actionStart < 0) throw new Error(`${file}: case actions missing`);
  const actionEnd = html.indexOf('</div>', actionStart);
  if (actionEnd < 0) throw new Error(`${file}: case action closing tag missing`);
  html = `${html.slice(0, actionEnd)}${links}${html.slice(actionEnd)}`;
  fs.writeFileSync(absolute, html);
  changed += 1;
}

const publicSkip = new Set([".git", ".github", "node_modules", "release", "artifacts", "docs", "tools", "tests", "seo"]);
function collect(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (publicSkip.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collect(file));
    else if (entry.name.endsWith(".html")) files.push(file);
  }
  return files;
}

for (const file of collect(root)) {
  let html = fs.readFileSync(file, "utf8");
  const updated = html.replace(/<(header|footer)\b[\s\S]*?<\/\1>/gi, (region) => region.replace(/(<a\b[^>]*href=["'][^"']*stvorennya-saytiv\/(?:[?#][^"']*)?["'][^>]*>)Створення сайтів під ключ(<\/a>)/gi, "$1Розробка сайтів$2"));
  if (updated !== html) {
    fs.writeFileSync(file, updated);
    changed += 1;
  }
}

console.log(`Applied MASTER 4.0 evidence linking updates (${changed} file operations).`);
