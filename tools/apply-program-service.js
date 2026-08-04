#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const programPage = path.join(root, 'stvorennya-program', 'index.html');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'release') return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function writeIfChanged(file, content) {
  const before = fs.readFileSync(file, 'utf8');
  if (before === content) return false;
  fs.writeFileSync(file, content);
  return true;
}

const htmlFiles = walk(root).filter((file) => file.endsWith('.html') && file !== programPage);
let changed = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('href="') || html.includes('stvorennya-program/">Створення програм</a>')) continue;

  html = html.replace(
    /<a href="([^"]*?)stvorennya-saytiv\/">Створення сайтів під ключ<\/a>/g,
    (match, prefix) => `${match}<a href="${prefix}stvorennya-program/">Створення програм</a>`
  );

  if (writeIfChanged(file, html)) changed += 1;
}

const homePath = path.join(root, 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
const homeNeedle = '<article class="type-card reveal"><img class="service-photo" src="assets/service-seo.webp" alt="Темний SEO dashboard із графіком росту" loading="lazy" /><h3>SEO-сайт під Google</h3><p>Повноцінна структура сайту під просування в пошукових системах.</p></article>';
const homeCard = '<article class="type-card reveal"><img class="service-photo" src="assets/service-program-development.webp" alt="Розробка програми для бізнесу: автоматизація, дашборд і мобільний інтерфейс" width="1672" height="941" loading="lazy" /><h3>Програма для бізнесу</h3><p>CRM, кабінет, вебзастосунок, MVP або автоматизація під ваші процеси.</p><a class="text-link" href="stvorennya-program/">Створення програм під ключ</a></article>';
if (!home.includes('Створення програм під ключ') && home.includes(homeNeedle)) {
  home = home.replace(homeNeedle, `${homeNeedle}${homeCard}`);
  if (writeIfChanged(homePath, home)) changed += 1;
}

const servicesPath = path.join(root, 'poslugy', 'index.html');
let services = fs.readFileSync(servicesPath, 'utf8');
services = services
  .replaceAll('Послуги створення сайтів для бізнесу | MAX SITE', 'Розробка сайтів і програм для бізнесу | MAX SITE')
  .replaceAll('Усі послуги MAX SITE: створення сайтів під ключ, лендінгів, корпоративних сайтів, SEO-сайтів, інтернет-магазинів, Google Ads та аналітики.', 'Послуги MAX SITE: створення сайтів і програм під ключ, лендінгів, CRM, вебзастосунків, SEO-сайтів, магазинів, Google Ads та аналітики.')
  .replace('<h1>Послуги створення сайтів</h1><p>Повна структура послуг для бізнесу: від швидкого лендінгу до SEO-сайту, реклами Google Ads і аналітики заявок.</p>', '<h1>Розробка сайтів і програм для бізнесу</h1><p>Створюємо сайти, програми та вебзастосунки, підключаємо рекламу й аналітику — від першого прототипу до запуску.</p>')
  .replace('<h2>Кому підходить послуги створення сайтів</h2>', '<h2>Кому підходять послуги MAX SITE</h2>');
const serviceSectionEnd = '<article class="seo-mini-card"><h3>SEO-сайт</h3><p>Для бізнесу, який планує системне просування.</p></article></div></section>';
const programServiceCard = '<article class="seo-mini-card"><h3>Програма для бізнесу</h3><p>CRM, кабінет, вебзастосунок, MVP або автоматизація під ваші процеси.</p><a href="/stvorennya-program/">Детальніше про розробку програм</a></article>';
if (!services.includes('Детальніше про розробку програм') && services.includes(serviceSectionEnd)) {
  services = services.replace(serviceSectionEnd, `<article class="seo-mini-card"><h3>SEO-сайт</h3><p>Для бізнесу, який планує системне просування.</p></article>${programServiceCard}</div></section>`);
}
if (writeIfChanged(servicesPath, services)) changed += 1;

const cityFiles = walk(path.join(root, 'mista')).filter((file) => file.endsWith('index.html') && path.dirname(file) !== path.join(root, 'mista'));
const cityProgramCard = '<article class="seo-mini-card"><h3>Програми для бізнесу</h3><p>CRM, кабінети, вебзастосунки та автоматизація для компаній по всій Україні.</p><a href="/stvorennya-program/">Створення програм</a></article>';

for (const file of cityFiles) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(cityProgramCard)) continue;

  const serviceSection = /(<section class="seo-band"><h2>Які сайти робимо<\/h2><div class="seo-columns">)([\s\S]*?)(<\/div><\/section>)/;
  if (serviceSection.test(html)) {
    html = html.replace(serviceSection, (match, start, cards, end) => `${start}${cards}${cityProgramCard}${end}`);
  }

  const slug = path.basename(path.dirname(file));
  const cityBlocks = {
    'stvorennya-sajtiv-cherkasy': '<section class="seo-band reveal"><span class="eyebrow">Цифровізація процесів</span><h2>Програми для бізнесу в Черкасах</h2><p>Для компаній із Черкас та області можемо дистанційно спроєктувати CRM, кабінет клієнта, внутрішню систему або вебзастосунок. Географія не змінює підхід: спочатку описуємо реальний процес, ролі користувачів і результат, після чого визначаємо склад першої версії.</p><p><a class="btn btn-ghost" href="/stvorennya-program/">Детальніше про створення програм</a></p></section>',
    'stvorennya-sajtiv-kyiv': '<section class="seo-band reveal"><span class="eyebrow">Програмні рішення</span><h2>Розробка програм для бізнесу в Києві</h2><p>Компаніям із Києва допомагаємо перевести ручні операції у власну CRM, кабінет, дашборд або вебзастосунок. Рішення про функції приймаємо на основі бізнес-процесу, інтеграцій та пріоритетів MVP, а не за шаблонним набором модулів.</p><p><a class="btn btn-ghost" href="/stvorennya-program/">Переглянути послугу</a></p></section>',
    'stvorennya-sajtiv-ukrayina': '<section class="seo-band reveal"><span class="eyebrow">Custom software</span><h2>Створення програм для бізнесу по Україні</h2><p>Розробляємо програми дистанційно для компаній з усієї України: CRM, особисті кабінети, внутрішні системи, MVP, аналітичні панелі та інтеграції. Одна національна сторінка послуги з корисним змістом сильніша за десятки однакових міських копій.</p><p><a class="btn btn-ghost" href="/stvorennya-program/">Створення програм під ключ</a></p></section>'
  };

  if (cityBlocks[slug] && !html.includes('href="/stvorennya-program/"')) {
    html = html.replace('  <section class="seo-band faq-list reveal">', `  ${cityBlocks[slug]}\n\n  <section class="seo-band faq-list reveal">`);
  } else if (cityBlocks[slug] && !html.includes(cityBlocks[slug])) {
    html = html.replace('  <section class="seo-band faq-list reveal">', `  ${cityBlocks[slug]}\n\n  <section class="seo-band faq-list reveal">`);
  }

  if (writeIfChanged(file, html)) changed += 1;
}

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapEntry = '  <url><loc>https://maxsite.com.ua/stvorennya-program/</loc><lastmod>2026-08-03</lastmod><priority>0.9</priority></url>\n';
if (!sitemap.includes('https://maxsite.com.ua/stvorennya-program/')) {
  sitemap = sitemap.replace('</urlset>', `${sitemapEntry}</urlset>`);
  if (writeIfChanged(sitemapPath, sitemap)) changed += 1;
}

console.log(`Updated ${changed} files.`);
