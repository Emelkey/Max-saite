const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const siteUrl = "https://maxsite.com.ua";
const modified = "2026-08-22";

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const write = (relative, html) => fs.writeFileSync(path.join(root, relative), html);

const replaceRequired = (html, before, after, label) => {
  if (!html.includes(before)) throw new Error(`Missing replacement target: ${label}`);
  return html.replace(before, after);
};

const insertBeforeOnce = (html, marker, fragment, id, label) => {
  if (html.includes(`id="${id}"`)) return html;
  if (!html.includes(marker)) throw new Error(`Missing insert marker: ${label}`);
  return html.replace(marker, `${fragment}${marker}`);
};

const updateMeta = (html, { title, description }) => {
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`);
  return html;
};

const updateJsonLd = (html, updater) => html.replace(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  (full, json) => {
    const data = JSON.parse(json);
    updater(data);
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  }
);

const updateSitemapLastmod = (urls) => {
  let sitemap = read("sitemap.xml");
  for (const url of urls) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(<url><loc>${escaped}<\\/loc><lastmod>)[^<]+`);
    if (!pattern.test(sitemap)) throw new Error(`Sitemap URL missing: ${url}`);
    sitemap = sitemap.replace(pattern, `$1${modified}`);
  }
  write("sitemap.xml", sitemap);
};

// 1. The homepage becomes the brand/service hub. The commercial website-build
// intent is owned by /stvorennya-saytiv/ instead of being duplicated here.
{
  const file = "index.html";
  let html = read(file);
  const title = "MAX SITE — сайти, SEO та Google Ads для бізнесу";
  const description = "MAX SITE створює сайти, налаштовує SEO, аналітику та Google Ads для бізнесу в Україні. Один відповідальний за структуру, запуск і розвиток.";
  html = updateMeta(html, { title, description });
  html = replaceRequired(
    html,
    "<h1>Створення сайтів під ключ <span>для бізнесу</span></h1>",
    "<h1>Сайти, SEO та Google Ads <span>для росту бізнесу</span></h1>",
    "homepage H1"
  );
  html = replaceRequired(
    html,
    `Розробляємо сучасні сайти по всій Україні, які допомагають бізнесу отримувати заявки з Google,
            реклами та соцмереж.`,
    `MAX SITE об’єднує веброзробку, SEO-підготовку, аналітику та Google Ads,
            щоб бізнес отримав керовану систему залучення звернень.`,
    "homepage hero copy"
  );
  html = html.replace(
    "<h2>Створення сайтів під ключ для бізнесу по всій Україні</h2>",
    "<h2>Веброзробка та просування бізнесу по всій Україні</h2>"
  );
  html = insertBeforeOnce(
    html,
    '<section class="section" id="niches">',
    `<section class="section seo-band reveal" id="service-map"><span class="eyebrow">Одна команда — різні задачі</span><h2>Оберіть точний напрям, а не загальну обіцянку</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Потрібен новий сайт</h3><p>Окрема сторінка пояснює склад розробки, етапи, ціни, строки й критерії запуску.</p><a href="/stvorennya-saytiv/">Замовити сайт під ключ</a></article><article class="seo-mini-card"><h3>Потрібні органічні переходи</h3><p>Перевіряємо технічну основу, структуру намірів, контент і план авторитетності домену.</p><a href="/seo-prosuvannya/">SEO-просування сайту</a></article><article class="seo-mini-card"><h3>Потрібні заявки зараз</h3><p>Готуємо релевантні посадкові сторінки, контрольовані ключі та вимірювання конверсій.</p><a href="/google-ads/">Google Ads для бізнесу</a></article></div></section>`,
    "service-map",
    "homepage service map"
  );
  html = updateJsonLd(html, (data) => {
    for (const item of data["@graph"] || []) {
      if (item["@type"] === "ProfessionalService") {
        item.name = "MAX SITE — сайти, SEO та Google Ads для бізнесу";
        item.description = description;
      }
    }
  });
  write(file, html);
}

const moneyPageEnhancements = [
  {
    file: "stvorennya-saytiv/index.html",
    marker: '<section class="seo-band reveal"><span class="eyebrow">FAQ</span>',
    id: "commercial-terms",
    fragment: `<section class="seo-band reveal" id="commercial-terms"><span class="eyebrow">Умови співпраці</span><h2>Що фіксуємо до старту й після запуску</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Обсяг і кошторис</h3><p>У пропозиції фіксуємо перелік сторінок, функції, матеріали, інтеграції, етапи оплати та те, що оцінюється окремо.</p></article><article class="seo-mini-card"><h3>Контрольні точки</h3><p>Структура, прототип, дизайн і production-перевірка погоджуються послідовно, щоб зміни не накопичувалися наприкінці.</p></article><article class="seo-mini-card"><h3>Після запуску</h3><p>Передаємо погоджені доступи, перевіряємо форми, аналітику та індексацію. Формат подальшої підтримки визначається окремо.</p></article></div><p>Для багатосторінкового рішення з кількома напрямами дивіться <a href="/stvorennya-saytu-dlya-biznesu/">сайт для бізнесу</a>; для однієї рекламної пропозиції — <a href="/stvorennya-landing-page/">Landing Page</a>.</p></section>`,
  },
  {
    file: "stvorennya-saytu-dlya-biznesu/index.html",
    marker: '<section class="seo-band reveal"><span class="eyebrow">FAQ</span>',
    id: "business-site-scope",
    fragment: `<section class="seo-band reveal" id="business-site-scope"><span class="eyebrow">Самостійний намір</span><h2>Коли бізнесу потрібен саме багатосторінковий сайт</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Кілька послуг</h3><p>Кожен важливий напрям отримує окрему сторінку, докази, FAQ і релевантний сценарій звернення.</p></article><article class="seo-mini-card"><h3>Довший цикл рішення</h3><p>Окремо розкриваємо компанію, процес, кейси, умови, відповідального та матеріали, які знижують ризик для замовника.</p></article><article class="seo-mini-card"><h3>SEO та масштабування</h3><p>Структуру можна розвивати статтями, кейсами й новими послугами без дублювання головної сторінки.</p></article></div><p>Лендінг доречний для однієї пропозиції. Загальна сторінка <a href="/stvorennya-saytiv/">створення сайтів під ключ</a> пояснює весь процес, а ця сторінка відповідає саме на потребу малого та середнього бізнесу в масштабованій структурі.</p></section><section class="seo-band reveal" id="client-readiness"><span class="eyebrow">Підготовка</span><h2>Що потрібно від бізнесу до початку</h2><ul class="seo-list-clean"><li>пріоритетні послуги й реальна географія роботи</li><li>ціни або правила розрахунку</li><li>фото, документи, кейси й відгуки, які дозволено публікувати</li><li>відповідальний за факти та погодження</li><li>доступи до домену, аналітики й рекламних кабінетів на потрібному етапі</li></ul><p><a href="/blog/yak-pidgotuvaty-bryf-na-sajt/">Чеклист підготовки брифу на сайт</a>.</p></section>`,
  },
  {
    file: "stvorennya-internet-mahazynu/index.html",
    marker: '<section class="seo-band reveal"><span class="eyebrow">FAQ</span>',
    id: "shop-model",
    fragment: `<section class="seo-band reveal" id="shop-model"><span class="eyebrow">Комплектація</span><h2>Функції залежать від моделі продажу</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Каталог-заявка</h3><p>Категорії, картки товарів і запит менеджеру без автоматичної оплати. Підходить для складних або індивідуальних розрахунків.</p></article><article class="seo-mini-card"><h3>Повноцінний магазин</h3><p>Кошик, checkout, способи оплати й доставки, статус замовлення та базові ecommerce-події.</p></article><article class="seo-mini-card"><h3>Магазин з інтеграціями</h3><p>Обмін із CRM або обліковою системою, імпорт товарів, залишки та інші сценарії після перевірки актуального API.</p></article></div></section><section class="seo-band reveal" id="shop-readiness"><span class="eyebrow">До старту</span><h2>Що має підготувати власник магазину</h2><ul class="seo-list-clean"><li>структуру категорій і приклади товарних даних</li><li>правила цін, знижок, наявності й варіантів товару</li><li>юридичні дані, умови оплати, доставки, повернення та гарантії</li><li>фото, характеристики й відповідального за актуальність каталогу</li><li>перелік потрібних інтеграцій та доступ до їхньої документації</li></ul></section><section class="seo-band reveal" id="shop-launch-support"><span class="eyebrow">Запуск</span><h2>Перевірка перед прийманням замовлень</h2><p>Тестуємо каталог, фільтри, кошик, checkout, листи або повідомлення, оплату в тестовому режимі, доставку, помилки та ecommerce-аналітику. Після запуску погоджуємо окремий формат оновлень, резервного контролю й розвитку магазину.</p><p>Детальніше: <a href="/blog/shcho-vhodyt-u-stvorennya-internet-magazynu-pid-klyuch/">що входить у розробку інтернет-магазину</a> та <a href="/blog/skilky-koshtuye-stvorennya-internet-magazynu/">що впливає на вартість</a>.</p></section>`,
  },
  {
    file: "stvorennya-landing-page/index.html",
    marker: '<section class="seo-band reveal"><span class="eyebrow">FAQ</span>',
    id: "landing-ad-readiness",
    fragment: `<section class="seo-band reveal" id="landing-ad-readiness"><span class="eyebrow">Реклама й конверсії</span><h2>Landing Page під конкретну рекламну обіцянку</h2><p>Оголошення, ключовий запит і перший екран мають продовжувати одну пропозицію. Перед стартом реклами перевіряємо мобільний CTA, телефон, успішну доставку форми, сторінку подяки або статус відправлення та GA4-події.</p><div class="seo-columns"><article class="seo-mini-card"><h3>Одна пропозиція</h3><p>Не змішуємо на одному екрані несумісні послуги та різні аудиторії.</p></article><article class="seo-mini-card"><h3>Докази</h3><p>Показуємо реальні роботи, умови, ціну або чинники розрахунку й відповідального за результат.</p></article><article class="seo-mini-card"><h3>Контроль заявок</h3><p><code>generate_lead</code> рахується після успішної доставки, а <code>click_phone</code> — окремо від переглядів сторінки.</p></article></div><p><a href="/blog/landing-dlya-google-ads/">Як підготувати лендінг до Google Ads</a>.</p></section>`,
  },
];

for (const item of moneyPageEnhancements) {
  let html = read(item.file);
  html = insertBeforeOnce(html, item.marker, item.fragment, item.id, item.file);
  write(item.file, html);
}

// 3. Add honest local value to the only city pages allowed in the index.
{
  const file = "mista/stvorennya-sajtiv-kyiv/index.html";
  let html = read(file);
  html = insertBeforeOnce(
    html,
    '<section class="seo-band faq-list reveal">',
    `<section class="seo-band reveal" id="kyiv-commercial-context"><span class="eyebrow">Практичний контекст</span><h2>Що важливо для конкурентного ринку Києва</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Точна спеціалізація</h3><p>Сторінка має пояснювати конкретну послугу й аудиторію, а не конкурувати загальним формулюванням з усіма digital-компаніями.</p></article><article class="seo-mini-card"><h3>Перевірні докази</h3><p>Живі сайти, змістовні кейси, відповідальний, прозорий процес і реальні умови важливіші за непідтверджені цифри.</p></article><article class="seo-mini-card"><h3>Дистанційний процес</h3><p>Бриф, прототип, дизайн, QA та звіти проводимо онлайн. Фізичний офіс у Києві не заявляємо.</p></article></div><p>Основна послуга: <a href="/stvorennya-saytiv/">створення сайтів під ключ в Україні</a>. Приклади реалізації: <a href="/portfolio/">портфоліо MAX SITE</a>.</p></section>`,
    "kyiv-commercial-context",
    file
  );
  write(file, html);
}

{
  const file = "mista/stvorennya-sajtiv-cherkasy/index.html";
  let html = read(file);
  html = insertBeforeOnce(
    html,
    '<section class="seo-band faq-list reveal">',
    `<section class="seo-band reveal" id="cherkasy-service-scope"><span class="eyebrow">Формати</span><h2>Який сайт можна замовити для бізнесу в Черкасах</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Landing Page</h3><p>Для однієї послуги, перевірки попиту або запуску контрольованої рекламної кампанії.</p><a href="/stvorennya-landing-page/">Детальніше про лендінг</a></article><article class="seo-mini-card"><h3>Сайт для бізнесу</h3><p>Для кількох напрямів, окремих сторінок послуг, кейсів, FAQ та розвитку органічної видимості.</p><a href="/stvorennya-saytu-dlya-biznesu/">Сайт для бізнесу</a></article><article class="seo-mini-card"><h3>Інтернет-магазин</h3><p>Для каталогу, кошика, оплат, доставок, аналітики й погоджених інтеграцій.</p><a href="/stvorennya-internet-mahazynu/">Інтернет-магазин під ключ</a></article></div></section><section class="seo-band reveal" id="cherkasy-process"><span class="eyebrow">Співпраця</span><h2>Строки, ціна й дистанційна робота</h2><p>Лендінг стартує від 10 500 грн, бізнес-сайт — від 19 700 грн. Фінальну вартість і календар визначаємо після структури, матеріалів та інтеграцій. Бриф, погодження, демонстрації й звіти проводимо онлайн; не заявляємо офіс або особисті зустрічі як обов’язкову умову.</p><p>Для клінінгової ніші можна перевірити <a href="/portfolio/formula-chystoty/">кейс «Формула Чистоти»</a> та <a href="/nishi/sajt-dlya-kliningovoyi-kompaniyi/">структуру сайту для клінінгової компанії</a>.</p></section><section class="seo-band reveal" id="cherkasy-launch"><span class="eyebrow">Перед запуском</span><h2>Що перевіряємо на production</h2><ul class="seo-list-clean"><li>мобільне меню, телефон, Telegram/Viber і форми</li><li>title, description, canonical, schema, robots і sitemap</li><li>події <code>click_phone</code> та успішної заявки без персональних даних</li><li>биті посилання, сторінку 404 й основні сценарії користувача</li></ul></section>`,
    "cherkasy-service-scope",
    file
  );
  write(file, html);
}

// 4. Protect the cleaning niche quick win with a more precise snippet,
// proof and direct case/article links.
{
  const file = "nishi/sajt-dlya-kliningovoyi-kompaniyi/index.html";
  let html = read(file);
  const title = "Лендінг і сайт для клінінгової компанії | MAX SITE";
  const description = "Лендінг або багатосторінковий сайт для клінінгової компанії від 10 500 грн: послуги, ціни, фото робіт, заявки, SEO та Google Ads. Дивіться реальний кейс.";
  html = updateMeta(html, { title, description });
  html = html.replace("<h1>Сайт для клінінгової компанії</h1>", "<h1>Лендінг і сайт для клінінгової компанії</h1>");
  html = html.replaceAll('/portfolio/#formula-chystoty', '/portfolio/formula-chystoty/');
  html = insertBeforeOnce(
    html,
    '<section class="seo-band faq-list reveal">',
    `<section class="seo-band reveal" id="cleaning-format"><span class="eyebrow">Вибір формату</span><h2>Лендінг чи багатосторінковий сайт для клінінгу</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Лендінг</h3><p>Підходить для однієї пріоритетної послуги або окремої рекламної кампанії. Фокус — одна пропозиція, докази й швидкий контакт.</p></article><article class="seo-mini-card"><h3>Багатосторінковий сайт</h3><p>Потрібен, коли компанія має кілька напрямів, окремий попит на послуги й план системного SEO.</p></article><article class="seo-mini-card"><h3>Підготовка до реклами</h3><p>Кожна група оголошень веде на релевантну сторінку, а дзвінки й успішні форми вимірюються окремо.</p></article></div></section><section class="seo-band reveal" id="cleaning-proof"><span class="eyebrow">Перевірний приклад</span><h2>Живий кейс із реальними скріншотами</h2><figure class="case-main-media"><img src="/assets/portfolio/formula-home.webp" alt="Головна сторінка сайту клінінгової компанії Формула Чистоти" width="1200" height="750" loading="lazy"></figure><p>У кейсі показано структуру послуг, мобільні звернення, форми, портфоліо робіт і SEO-основу без публікації непідтверджених комерційних цифр.</p><p><a class="btn btn-ghost" href="/portfolio/formula-chystoty/">Переглянути кейс «Формула Чистоти»</a> <a href="/blog/sajt-dlya-kliningovoyi-kompaniyi/">Прочитати чеклист структури</a></p></section>`,
    "cleaning-format",
    file
  );
  html = updateJsonLd(html, (data) => {
    for (const item of data["@graph"] || []) {
      if (item["@type"] === "Service") {
        item.name = "Лендінг і сайт для клінінгової компанії";
        item.serviceType = "Розробка лендінгу або багатосторінкового сайту для клінінгового бізнесу";
        item.description = description;
      }
      if (item["@type"] === "BreadcrumbList") {
        const current = item.itemListElement?.find((entry) => entry.position === 3);
        if (current) current.name = "Лендінг і сайт для клінінгової компанії";
      }
    }
  });
  write(file, html);
}

// 5. Strengthen the verified case as a contextual internal-link donor.
{
  const file = "portfolio/formula-chystoty/index.html";
  let html = read(file);
  html = insertBeforeOnce(
    html,
    '<section class="seo-lead reveal" id="lead">',
    `<section class="seo-band reveal" id="case-related"><h2>Рішення для подібної задачі</h2><p>Для однієї клінінгової послуги можна запустити <a href="/stvorennya-landing-page/">Landing Page</a>. Для кількох напрямів і SEO потрібна <a href="/nishi/sajt-dlya-kliningovoyi-kompaniyi/">структура сайту клінінгової компанії</a> з окремими сторінками послуг. Повний процес описано на сторінці <a href="/stvorennya-saytiv/">створення сайтів під ключ</a>.</p></section>`,
    "case-related",
    file
  );
  write(file, html);
}

// 6. Turn existing content into intentional contextual link donors.
const contextualLinks = [
  {
    file: "blog/sajt-dlya-kliningovoyi-kompaniyi/index.html",
    before: '<h2>Пов’язані матеріали та послуги</h2><p><a href="/stvorennya-saytiv/">Створення сайтів під ключ</a>',
    after: '<h2>Пов’язані матеріали та послуги</h2><p><a href="/nishi/sajt-dlya-kliningovoyi-kompaniyi/">Лендінг і сайт для клінінгової компанії</a>, <a href="/portfolio/formula-chystoty/">кейс «Формула Чистоти»</a>, <a href="/stvorennya-saytiv/">Створення сайтів під ключ</a>',
  },
  {
    file: "blog/skilky-koshtuye-stvorennya-internet-magazynu/index.html",
    before: '<p class="article-author">Матеріал підготовлено засновником MAX SITE.',
    after: '<p>Якщо потрібен розрахунок під каталог і інтеграції, перегляньте <a href="/stvorennya-internet-mahazynu/">створення інтернет-магазину під ключ</a> та <a href="/blog/shcho-vhodyt-u-stvorennya-internet-magazynu-pid-klyuch/">детальний склад робіт</a>.</p><p class="article-author">Матеріал підготовлено засновником MAX SITE.',
  },
  {
    file: "blog/yak-pidgotuvaty-bryf-na-sajt/index.html",
    before: '<p>Пов’язані матеріали: <a href="/seo-first/">',
    after: '<p>Після брифу можна визначити, чи потрібні <a href="/stvorennya-saytiv/">створення сайту під ключ</a>, <a href="/stvorennya-landing-page/">Landing Page</a> або <a href="/stvorennya-saytu-dlya-biznesu/">багатосторінковий сайт для бізнесу</a>.</p><p>Пов’язані матеріали: <a href="/seo-first/">',
  },
  {
    file: "blog/lending-abo-korporatyvnyj-sajt/index.html",
    before: '<p class="article-author">Матеріал підготовлено засновником MAX SITE.',
    after: '<p>Порівняйте окремі комплектації: <a href="/stvorennya-landing-page/">Landing Page під ключ</a>, <a href="/stvorennya-korporatyvnoho-saytu/">корпоративний сайт</a> і <a href="/stvorennya-saytu-dlya-biznesu/">сайт для бізнесу</a>.</p><p class="article-author">Матеріал підготовлено засновником MAX SITE.',
  },
];

for (const item of contextualLinks) {
  let html = read(item.file);
  if (!html.includes(item.after)) {
    html = replaceRequired(html, item.before, item.after, item.file);
    write(item.file, html);
  }
}

updateSitemapLastmod([
  `${siteUrl}/`,
  `${siteUrl}/stvorennya-saytiv/`,
  `${siteUrl}/stvorennya-saytu-dlya-biznesu/`,
  `${siteUrl}/stvorennya-internet-mahazynu/`,
  `${siteUrl}/stvorennya-landing-page/`,
  `${siteUrl}/mista/stvorennya-sajtiv-kyiv/`,
  `${siteUrl}/mista/stvorennya-sajtiv-cherkasy/`,
  `${siteUrl}/nishi/sajt-dlya-kliningovoyi-kompaniyi/`,
  `${siteUrl}/portfolio/formula-chystoty/`,
  `${siteUrl}/blog/sajt-dlya-kliningovoyi-kompaniyi/`,
  `${siteUrl}/blog/skilky-koshtuye-stvorennya-internet-magazynu/`,
  `${siteUrl}/blog/yak-pidgotuvaty-bryf-na-sajt/`,
  `${siteUrl}/blog/lending-abo-korporatyvnyj-sajt/`,
]);

console.log("Applied SEO growth stage to priority pages.");
