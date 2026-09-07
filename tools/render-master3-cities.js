const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const cities = require('../seo/cities.json');
const content = require('../seo/city-wave1-content.json');
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const serviceNames = {'stvorennya-saytiv':'Створення сайтів під ключ', 'stvorennya-saytu-dlya-biznesu':'Сайт для бізнесу', 'stvorennya-korporatyvnoho-saytu':'Корпоративний сайт', 'stvorennya-landing-page':'Лендінг', 'stvorennya-internet-mahazynu':'Інтернет-магазин', 'stvorennya-program':'Програма для бізнесу'};
const paragraph = value => `<p>${esc(value)}</p>`;
for (const city of cities.filter(city => city.priority === 1)) {
  const data = content[city.slug];
  if (!data || !city.index || city.state !== 'published') throw Error(`Missing approved published data: ${city.slug}`);
  const file = path.join(root, `mista/stvorennya-sajtiv-${city.slug}/index.html`);
  let html = fs.readFileSync(file, 'utf8');
  const form = html.match(/<form\b[\s\S]*?<\/form>/i)?.[0];
  if (!form) throw Error(`Missing existing lead form: ${city.slug}`);
  const breadcrumbs = `<nav class="breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="/">Головна</a><span> / </span><a href="/mista/">Міста</a><span> / ${esc(city.nominative)}</span></nav>`;
  const hero = `<section class="seo-hero" data-seo-city-specific="true"><div><span class="eyebrow">${esc(city.nominative)} · онлайн-співпраця</span><h1>${esc(city.h1)}</h1>${paragraph(data.intro)}<div class="hero-buttons"><a class="btn" href="#lead">Обговорити структуру</a><a class="btn btn-ghost" href="/portfolio/">Перевірити роботи</a></div></div><aside class="seo-hero-card"><strong>Що врахуємо в брифі</strong>${paragraph(data.aside)}</aside></section>`;
  const blocks = {
    market: `<section class="seo-band" data-seo-city-specific="true"><span class="eyebrow">Практичний контекст</span><h2>${esc(data.marketHeading)}</h2><p>Нижче — приклади задач для обговорення, а не статистика ринку чи твердження про наших місцевих клієнтів. Остаточні пріоритети визначаємо за вашим бізнесом і даними попиту.</p><div class="seo-columns">${data.segments.map(([heading,copy])=>`<article class="seo-mini-card"><h3>${esc(heading)}</h3>${paragraph(copy)}</article>`).join('')}</div></section>`,
    decision: `<section class="seo-band" data-seo-city-specific="true"><h2>${esc(data.decisionHeading)}</h2><div class="seo-table-scroll" tabindex="0" role="region" aria-label="Порівняння форматів сайту"><table class="seo-decision-table"><caption>Вибір за задачею, не за найдорожчим пакетом</caption><thead><tr><th scope="col">Ваша задача</th><th scope="col">Формат</th><th scope="col">Що перевіряємо</th></tr></thead><tbody>${data.decisions.map(row=>`<tr><th scope="row">${esc(row[0])}</th><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`).join('')}</tbody></table></div></section>`,
    sections: data.sections.map(section=>`<section class="seo-band" data-seo-city-specific="true"><h2>${esc(section.heading)}</h2>${section.paragraphs.map(paragraph).join('')}</section>`).join('\n'),
    proof: `<section class="seo-band"><span class="eyebrow">Перевірні приклади</span><h2>Роботи, які можна відкрити й перевірити</h2><p>Приклади дистанційної роботи MAX SITE з інших регіонів України. Описуємо реалізовані функції без непідтверджених показників продажу; не видаємо ці роботи за місцеві кейси.</p><div class="seo-columns"><article class="seo-mini-card"><h3><a href="/portfolio/formula-chystoty/">Formula Chystoty</a></h3><p>Сайт клінінгових послуг: структура напрямів, мобільний контакт і форма. У кейсі показано обсяг участі та живий сайт.</p></article><article class="seo-mini-card"><h3><a href="/portfolio/fo-dez/">FO-DEZ</a></h3><p>Сервісний проєкт із окремими послугами та зрозумілим зверненням. Дивіться сторінки, скриншоти та межі підтвердженого результату.</p></article></div></section>`,
    pricing: `<section class="seo-band" data-seo-shared="pricing"><span class="eyebrow">Вартість і строки</span><h2>Орієнтири бюджету та межі робіт</h2><p>Лендінг — від 10 500 грн, сайт для бізнесу — від 19 700 грн, SEO Pro — від 29 000 грн, інтернет-магазин — від 34 300 грн. Це стартові орієнтири, не індивідуальна оферта. Кількість шаблонів, матеріали, мови, каталог, кабінет та інтеграції змінюють кошторис.</p><p>Для лендінгу орієнтир — 2–4 тижні, для багатосторінкового сайту чи магазину — 4–8 тижнів за своєчасного надання матеріалів. Контент, платні сервіси, рекламний бюджет і складні інтеграції погоджуємо окремо. Обсяг та критерії приймання фіксуємо до старту.</p><a href="/blog/skilky-koshtuye-stvorennya-sajtu/">З чого складається ціна сайту</a></section>`,
    process: `<section class="seo-band" data-seo-shared="process"><h2>Як працюємо дистанційно й приймаємо результат</h2><ol class="seo-list-clean"><li>Бриф: задача, аудиторія, матеріали, правила обробки звернень.</li><li>Структура та прототип: погоджуємо сторінки, навігацію й зміст.</li><li>Дизайн і розробка: показуємо мобільні та широкі екрани.</li><li>QA: перевіряємо заявки, контакти, аналітику, доступність та SEO.</li><li>Реліз: передаємо погоджені доступи й опис наступних дій.</li></ol><p>За комунікацію та контроль запуску відповідає засновник. <a href="/pro-nas/">Про MAX SITE і формат співпраці</a>.</p></section>`,
    faq: `<section class="seo-band faq-list" data-seo-city-specific="true"><h2>Питання перед замовленням</h2>${data.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary>${paragraph(a)}</details>`).join('')}</section>`
  };
  const services = `<section class="seo-links" data-seo-shared="navigation"><h2>Послуги за вашим завданням</h2><div class="link-grid">${city.relatedServiceSlugs.map(slug=>`<a href="/${slug}/">${esc(serviceNames[slug])}</a>`).join('')}</div></section>`;
  const related = `<section class="seo-links" data-seo-shared="navigation"><h2>Інші міські сторінки</h2><div class="link-grid">${city.relatedCitySlugs.map(slug=>{const target=cities.find(item=>item.slug===slug && item.index);if(!target)throw Error(`Unpublished related city ${slug}`);return `<a href="/mista/stvorennya-sajtiv-${slug}/">${esc(target.nominative)}: задачі й формати сайту</a>`;}).join('')}</div></section>`;
  const lead = `<section class="seo-lead" id="lead" data-seo-shared="cta"><div><span class="eyebrow">Перший крок</span><h2>Обговорімо ваш проєкт</h2>${paragraph(data.cta)}<p><a href="tel:+380972692322">097 269 23 22</a> · <a href="https://t.me/MaxMytt">Telegram</a></p></div>${form}</section>`;
  html = html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, `<main class="section seo-page">\n${[breadcrumbs,hero,...data.order.map(key=>blocks[key]),services,related,lead].join('\n')}\n</main>`);
  fs.writeFileSync(file, html);
  city.contentKey = city.slug;
  city.updatedAt = '2026-09-02';
  city.marketEvidence = 'editorial-scenarios-not-market-statistics';
}
fs.writeFileSync(path.join(root, 'seo/cities.json'), JSON.stringify(cities,null,2)+'\n');
console.log('Rebuilt five existing city hubs; no new URLs or indexation changes.');
