#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const cases = {
  formula: {
    file: 'portfolio/formula-chystoty/index.html',
    slug: 'formula-chystoty',
    name: 'Формула Чистоти',
    type: 'Сервісна компанія у сфері професійного клінінгу',
    live: 'https://www.formula-chistoty.ck.ua/',
    title: 'Формула Чистоти — кейс сайту клінінгу | MAX SITE',
    description: 'Кейс сайту клінінгової компанії: структура послуг, мобільні звернення, SEO-основа, аналітика та реальні скріншоти.',
    niche: '/nishi/sajt-dlya-kliningovoyi-kompaniyi/',
    nicheLabel: 'Рішення для клінінгової компанії',
    hero: '/assets/portfolio/formula-home.webp',
    heroAlt: 'Головна сторінка сайту клінінгової компанії Формула Чистоти',
    task: 'Об’єднати різні види прибирання в логічну структуру, пояснити послуги без перевантаження та дати користувачу короткий шлях до дзвінка або заявки.',
    constraints: ['Кілька груп послуг із різними сценаріями попиту', 'Локальний попит і потреба у зрозумілих посадкових сторінках', 'Велика частка мобільних користувачів', 'Публікуємо лише те, що можна перевірити на живому сайті'],
    scope: ['Інформаційна архітектура послуг', 'Адаптивний інтерфейс', 'Сценарії дзвінка та заявки', 'Галерея виконаних робіт', 'Технічна SEO-основа', 'Підготовка аналітики'],
    structure: 'Головна сторінка веде до окремих напрямів послуг, прикладів робіт і контактної дії. Це відокремлює інформаційний перегляд від комерційного сценарію та дає кожній послузі власний контекст.',
    design: 'Світлий інтерфейс із зеленими акцентами підтримує впізнаваність сервісу. Контрастні кнопки, короткі блоки й адаптивна сітка зберігають читабельність на смартфоні.',
    tech: 'Сайт має адаптивну верстку, семантичні заголовки, окремі URL ключових напрямів, контактні посилання та базові метадані. Фактичний стан можна перевірити на живій версії.',
    seo: 'Структура розділяє основні типи клінінгу, підтримує внутрішні переходи й локальні посадкові наміри. Позиції та трафік не заявляються без верифікованого доступу до джерела даних.',
    result: 'На живому сайті можна перевірити окремі блоки послуг, портфоліо робіт, адаптивне меню, форми та швидкі контакти. Бізнес-метрики й відгук клієнта не публікуємо без письмового погодження власника.',
    images: [
      ['/assets/portfolio/formula-homepage-photo.webp', 1448, 1086, 'Повна головна сторінка сайту Формула Чистоти', 'Головна сторінка'],
      ['/assets/portfolio/formula-services.webp', 1200, 760, 'Блок послуг на сайті Формула Чистоти', 'Структура послуг'],
      ['/assets/portfolio/formula-works.webp', 1200, 760, 'Галерея виконаних робіт Формула Чистоти', 'Приклади робіт'],
      ['/assets/portfolio/formula-mobile.webp', 620, 900, 'Мобільна версія сайту Формула Чистоти', 'Мобільна версія']
    ]
  },
  fodez: {
    file: 'portfolio/fo-dez/index.html',
    slug: 'fo-dez',
    name: 'FO-DEZ',
    type: 'Сервісна компанія зі спеціалізованого очищення та дезінфекції',
    live: 'https://fodez.com.ua/',
    title: 'FO-DEZ — кейс сайту спеціалізованих послуг | MAX SITE',
    description: 'Кейс FO-DEZ: адаптивний дизайн, структура спеціалізованих послуг, контактні сценарії та технічна SEO-підготовка.',
    niche: '/nishi/sajt-dlya-dezinfekciyi/',
    nicheLabel: 'Рішення для дезінфекції',
    hero: '/assets/portfolio/fodez-home.webp',
    heroAlt: 'Головна сторінка сайту спеціалізованих послуг FO-DEZ',
    task: 'Розділити спеціалізовані послуги за зрозумілими сценаріями, створити впізнаваний інтерфейс і зробити звернення помітним на кожному типі екрана.',
    constraints: ['Послуги потребують точного пояснення без медичних або гарантованих обіцянок', 'Користувачі можуть приходити з різним рівнем обізнаності', 'Контакт має залишатися доступним на мобільному', 'Комерційні показники можна публікувати лише з підтвердженим джерелом'],
    scope: ['Архітектура напрямів послуг', 'Темний адаптивний дизайн', 'Мобільне меню та CTA', 'Посадкові блоки для комерційного попиту', 'Технічні метадані', 'Підготовка до аналітики'],
    structure: 'Навігація групує напрями за задачами користувача, а сторінки послуг пояснюють контекст і ведуть до дзвінка або форми. Суміжні рішення пов’язані внутрішніми переходами.',
    design: 'Темна палітра із зеленими акцентами створює послідовний візуальний стиль. Картки, контрастні заголовки та помітні CTA допомагають сканувати зміст.',
    tech: 'Реалізовано адаптивну верстку, зрозумілу навігацію, окремі URL, контакти та базові SEO-метадані. Поточний стан реалізації доступний для незалежної перевірки.',
    seo: 'Комерційні наміри розділені між тематичними сторінками, щоб не змішувати різні послуги на одному URL. Рейтинги або кількість заявок не заявляються без доступу до погоджених даних.',
    result: 'На живій версії видно окремі напрями, адаптивний інтерфейс, контактні сценарії та структуровані блоки послуг. Відгук, дата запуску й бізнес-метрики очікують підтвердження власника.',
    images: [
      ['/assets/portfolio/fodez-homepage-photo.webp', 1672, 941, 'Повна головна сторінка сайту FO-DEZ', 'Головна сторінка'],
      ['/assets/portfolio/fodez-services.webp', 1200, 760, 'Блок спеціалізованих послуг FO-DEZ', 'Послуги'],
      ['/assets/portfolio/fodez-cta.webp', 1200, 760, 'Контактний блок сайту FO-DEZ', 'Сценарій звернення'],
      ['/assets/portfolio/fodez-mobile.webp', 620, 900, 'Мобільна версія сайту FO-DEZ', 'Мобільна версія']
    ]
  },
  maxsite: {
    file: 'portfolio/max-site/index.html',
    slug: 'max-site',
    name: 'MAX SITE',
    type: 'Власний сайт студії створення сайтів і digital-супроводу',
    live: 'https://maxsite.com.ua/',
    title: 'MAX SITE — self-case SEO-системи та сайту студії',
    description: 'Self-case MAX SITE: архітектура послуг, SEO-кластери, аналітика заявок, адаптивний дизайн і система контролю якості.',
    niche: '/stvorennya-saytiv/',
    nicheLabel: 'Створення сайтів під ключ',
    hero: '/assets/og-max-site.webp',
    heroAlt: 'Фірмовий екран MAX SITE — сайти під ключ для бізнесу',
    task: 'Побудувати власну платформу студії, яка пояснює послуги, демонструє процес, підтримує органічне зростання та фіксує ключові звернення без дублювання персональних даних в аналітиці.',
    constraints: ['Новий домен без накопиченого авторитету', 'Кілька типів послуг, ніш і географічних намірів', 'Потрібне масштабування без масових шаблонних сторінок', 'Органічні позиції не можна гарантувати або видавати за завершений результат'],
    scope: ['Карта попиту й власників запитів', 'Сторінки послуг, ніш і міст', 'Адаптивна система компонентів', 'GA4-події для дзвінків, месенджерів і форм', 'Schema.org, sitemap і canonical', 'Автоматичний SEO-QA перед деплоєм'],
    structure: 'Архітектура розділяє національні послуги, нішеві рішення, підтверджені міські хаби, кейси й освітні матеріали. Кожен кластер має визначений основний URL та контекстні переходи.',
    design: 'Єдина темна система з зеленим акцентом використовується в навігації, формах, картках і мобільних CTA. Компоненти перевіряються на різних ширинах екрана.',
    tech: 'Статичний сайт використовує семантичний HTML, адаптивний CSS, JSON-LD, GA4 та захищену передачу заявок через окремий endpoint. Перед публікацією запускаються автоматичні SEO й поведінкові перевірки.',
    seo: 'Створена карта ключових слів, контроль канібалізації, технічні правила індексації, міська модель якості й контентний хаб. Результати оцінюються за Search Console, але жодна позиція не заявляється як гарантована.',
    result: 'Це self-case: можна перевірити сам сайт, його URL-структуру, метадані, внутрішні посилання, адаптивні CTA та публічні кейси. Поточні SEO-метрики описуються у звітах окремо й не перетворюються на маркетингову обіцянку.',
    images: [
      ['/assets/og-max-site.webp', 1200, 630, 'Фірмова презентація MAX SITE', 'Бренд і позиціонування'],
      ['/assets/service-corporate.webp', 1200, 760, 'Візуальна концепція корпоративного сайту MAX SITE', 'Корпоративні сайти'],
      ['/assets/service-seo.webp', 1200, 760, 'Візуальна концепція SEO-послуги MAX SITE', 'SEO-система'],
      ['/assets/service-program-development.webp', 1200, 760, 'Візуальна концепція створення програм MAX SITE', 'Програмні рішення']
    ]
  }
};

const esc = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function schema(spec) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {'@type':'Organization','@id':'https://maxsite.com.ua/#organization',name:'MAX SITE',url:'https://maxsite.com.ua/',telephone:'+380972692322',sameAs:['https://t.me/MaxMytt','https://www.instagram.com/maxlab.ai/']},
      {'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'Головна',item:'https://maxsite.com.ua/'},
        {'@type':'ListItem',position:2,name:'Портфоліо',item:'https://maxsite.com.ua/portfolio/'},
        {'@type':'ListItem',position:3,name:spec.name,item:`https://maxsite.com.ua/portfolio/${spec.slug}/`}
      ]},
      {'@type':'CreativeWork','@id':`https://maxsite.com.ua/portfolio/${spec.slug}/#case`,name:spec.title,description:spec.description,url:`https://maxsite.com.ua/portfolio/${spec.slug}/`,datePublished:'2026-08-28',dateModified:'2026-08-28',author:{'@id':'https://maxsite.com.ua/#organization'},publisher:{'@id':'https://maxsite.com.ua/#organization'},image:spec.images.map(image => `https://maxsite.com.ua${image[0]}`),about:spec.type,mainEntityOfPage:`https://maxsite.com.ua/portfolio/${spec.slug}/`}
    ]
  });
}

function main(spec) {
  const constraints = spec.constraints.map(item => `<li>${esc(item)}</li>`).join('');
  const scope = spec.scope.map(item => `<li>${esc(item)}</li>`).join('');
  const gallery = spec.images.map(([src, width, height, alt, label]) => `<figure class="portfolio-gallery-card"><img src="${src}" width="${width}" height="${height}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(label)}</figcaption></figure>`).join('');
  return `<main class="section seo-page"><nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/portfolio/">Портфоліо</a></span><span>${esc(spec.name)}</span></nav>
  <section class="portfolio-case reveal"><figure class="case-main-media"><img src="${spec.hero}" alt="${esc(spec.heroAlt)}" width="1200" height="630" fetchpriority="high"></figure><div class="case-content"><span class="eyebrow">${spec.slug === 'max-site' ? 'Self-case' : 'Перевірний кейс'}</span><h1>${esc(spec.name)}</h1><p>${esc(spec.description)}</p><ul><li>${esc(spec.type)}</li><li>Живий сайт доступний для перевірки</li></ul><div class="case-actions"><a class="btn" href="${spec.live}" target="_blank" rel="noopener noreferrer">Переглянути живий сайт</a><a class="btn btn-ghost" href="${spec.niche}">${esc(spec.nicheLabel)}</a></div></div></section>
  <div class="seo-content">
    <section class="seo-band"><span class="eyebrow">Вихідні умови</span><h2>Задача й обмеження</h2><p>${esc(spec.task)}</p><ul class="seo-list-clean">${constraints}</ul></section>
    <section class="seo-band"><span class="eyebrow">Обсяг</span><h2>Що увійшло в реалізацію</h2><ul class="seo-list-clean">${scope}</ul></section>
    <section class="seo-columns"><article class="seo-mini-card"><h2>Структура</h2><p>${esc(spec.structure)}</p></article><article class="seo-mini-card"><h2>Дизайн</h2><p>${esc(spec.design)}</p></article><article class="seo-mini-card"><h2>Технології</h2><p>${esc(spec.tech)}</p></article></section>
    <section class="seo-band"><span class="eyebrow">SEO й аналітика</span><h2>Як підготували основу для залучення</h2><p>${esc(spec.seo)}</p></section>
    <section class="seo-band"><span class="eyebrow">Докази</span><h2>Desktop і mobile реалізація</h2><div class="case-gallery case-evidence-gallery">${gallery}</div></section>
    <section class="seo-band"><span class="eyebrow">Перевірний результат</span><h2>Що можна підтвердити зараз</h2><p>${esc(spec.result)}</p><p class="case-evidence-note"><strong>Принцип доказовості:</strong> відгуки, дата запуску, трафік, позиції, продажі або кількість заявок додаються лише після письмового погодження та з посиланням на джерело.</p></section>
    <section class="seo-band"><h2>Рішення для подібної задачі</h2><p>Перегляньте <a href="${spec.niche}">${esc(spec.nicheLabel.toLowerCase())}</a>, основну сторінку <a href="/stvorennya-saytiv/">створення сайтів під ключ</a> та <a href="/qa-checklist/">чек-лист контролю якості</a>.</p></section>
    <section class="seo-lead reveal" id="lead"><div><span class="eyebrow">Консультація</span><h2>Потрібен сайт із перевірною логікою?</h2><p>Опишіть бізнес і ціль. Підкажемо доречну структуру, ризики, черговість робіт і реалістичний обсяг без обіцянок гарантованих позицій.</p><p><a href="tel:+380972692322">0972692322</a> · <a href="https://t.me/MaxMytt">Telegram</a></p></div><form class="compact-form" action="#" method="post"><input name="name" placeholder="Ім’я" autocomplete="name" required aria-label="Ім’я"><input name="phone" placeholder="Телефон" autocomplete="tel" required aria-label="Телефон або месенджер" inputmode="tel"><textarea name="comment" rows="4" placeholder="Коротко про задачу" aria-label="Коротко про задачу"></textarea><label class="form-consent"><input type="checkbox" name="consent" aria-label="Погодження з політикою конфіденційності" required><span>Погоджуюся з <a href="/polityka-konfidentsijnosti/">політикою конфіденційності</a>.</span></label><button class="btn" type="submit">Отримати консультацію</button></form></section>
  </div></main>`;
}

function normalizeHead(html, spec) {
  const url = `https://maxsite.com.ua/portfolio/${spec.slug}/`;
  html = html.replace(/<title>[^<]+<\/title>/, `<title>${spec.title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(spec.description)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${url}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(spec.title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(spec.description)}">`);
  html = html.replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${url}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(spec.title)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(spec.description)}">`);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${schema(spec)}</script>`);
  return html;
}

const templatePath = path.join(root, cases.formula.file);
const template = fs.readFileSync(templatePath, 'utf8');

for (const spec of Object.values(cases)) {
  const target = path.join(root, spec.file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  let html = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : template;
  html = normalizeHead(html, spec);
  html = html.replace(/<main\b[\s\S]*?<\/main>/, main(spec));
  fs.writeFileSync(target, html);
}

console.log(`Updated ${Object.keys(cases).length} evidence-led case studies.`);
