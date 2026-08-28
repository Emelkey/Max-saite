const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const allCities = JSON.parse(fs.readFileSync(path.join(root, "seo/cities.json"), "utf8"));
const wave1 = allCities.filter((city) => city.priority === 1);

const content = {
  kyiv: {
    lead: "У Києві підрядника часто порівнюють за спеціалізацією, повнотою кейсів і готовністю сайту до реклами. Проєктуємо шлях від конкретного запиту до дзвінка або заявки без фейкової локальної присутності.",
    scenarios: [
      ["B2B і професійні послуги", "Розділяємо рішення за ролями клієнтів, додаємо компетенції, етапи закупівлі, кейси та короткий запит комерційної пропозиції."],
      ["Нерухомість і медицина", "Будуємо окремі сценарії для каталогу/об’єктів або напрямів і спеціалістів; довіру підтверджуємо видимими фактами, а не рейтингами без джерела."],
      ["Ecommerce і масштабування", "Плануємо категорії, фільтри, аналітику й рекламні посадкові так, щоб не дублювати сторінки під синоніми."],
    ],
    decisionTitle: "Як київській компанії обрати формат без переплати",
    decision: "Один офер і один канал реклами можна перевірити лендінгом. Кілька напрямів, контент і органічний попит потребують бізнес- або корпоративного сайту. Для особистого кабінету, CRM чи маршрутизації лідів потрібен вебзастосунок. Формат фіксуємо після карти задач, а не продаємо максимальний пакет за замовчуванням.",
    faq: [
      ["Як підготувати сайт київської B2B-компанії до тендерів і довгого циклу рішення?", "Додаємо окремі сторінки рішень, компетенції, умови співпраці, кейси, документи й коротку форму запиту. Так користувач може перевірити підрядника до контакту."],
      ["Чи потрібна окрема сторінка під кожен район Києва?", "Ні, якщо пропозиція та умови однакові. Районні сторінки без окремої користі створюють дублювання. Географію обслуговування краще чесно пояснити на міському hub."],
    ],
  },
  lviv: {
    lead: "У Львові сайт часто має одночасно працювати для локальної аудиторії, гостей міста та партнерів з ЄС. Тому мови, бронювання, мобільний вибір і правила індексації плануємо до дизайну.",
    scenarios: [
      ["Готелі, ресторани й туризм", "Скорочуємо шлях до бронювання, меню або запиту, показуємо сезонні умови й не ховаємо критичну інформацію у важких анімаціях."],
      ["Освіта, IT і креативні команди", "Структуруємо програми, викладачів, експертизу, портфоліо та англомовні матеріали як окремі зрозумілі маршрути."],
      ["Локальні бренди й медицина", "Поєднуємо візуальну подачу з каталогом/послугами, доказами, записом і коректною аналітикою мобільних звернень."],
    ],
    decisionTitle: "Коли львівському бізнесу потрібна мультимовність",
    decision: "Мову додаємо, коли є окрема аудиторія та ресурс підтримувати зміст. Кожна версія отримує власний URL, canonical і мовні зв’язки; автоматичний переклад без редактури не публікуємо. Для сезонної кампанії використовуємо посадкову, а постійні послуги залишаємо в стабільній архітектурі.",
    faq: [
      ["Чи можна поєднати бронювання і прямі заявки без складної системи?", "Так. Спочатку описуємо сценарій: зовнішній booking-сервіс, проста заявка або власний календар. Інтеграцію обираємо після перевірки комісій, доступності API та процесу підтвердження."],
      ["Як зробити українську й англійську версії без SEO-дублів?", "Створюємо окремі URL, self-canonical і мовні зв’язки, перекладаємо навігацію, metadata та основний контент. Порожні або частково перекладені версії не індексуємо."],
    ],
  },
  odesa: {
    lead: "В Одесі попит залежить від сезону, мови аудиторії та способу звернення. Розділяємо стабільні послуги, короткі рекламні пропозиції, бронювання й B2B-запити, не видаючи дистанційну роботу за місцевий офіс.",
    scenarios: [
      ["Hospitality та сезонні послуги", "Будуємо швидкий мобільний сценарій із доступністю, умовами, маршрутом звернення й можливістю змінити сезонний офер без перебудови всього сайту."],
      ["Логістика, імпорт та експорт", "Показуємо напрямки, типи вантажів/послуг, документи, географію й форму запиту розрахунку для B2B-клієнта."],
      ["Нерухомість і медицина", "Для каталогу або запису створюємо фільтри та сторінки лише там, де є унікальні дані; довіру підсилюємо перевірними профілями й умовами."],
    ],
    decisionTitle: "Як розділити сезонну рекламу й постійний пошук",
    decision: "Коротку акцію ведемо на окрему рекламну посадкову, але основні напрямки, контакти й докази зберігаємо на постійних URL. Це дозволяє змінювати офер без втрати накопичених пошукових сигналів і коректно порівнювати конверсії кампаній.",
    faq: [
      ["Чи варто створювати окремий сайт на кожен сезон?", "Зазвичай ні. Стабільний домен і структура зберігають історію, а сезонні пропозиції краще запускати окремими керованими посадковими сторінками без копіювання всього сайту."],
      ["Як вимірювати бронювання, дзвінки й B2B-запити окремо?", "Налаштовуємо різні події для форм, телефону та месенджерів, додаємо джерело/кампанію до lead payload і не передаємо ім’я чи телефон у GA4."],
    ],
  },
  dnipro: {
    lead: "У Дніпрі корпоративний сайт часто має пояснити складний технічний продукт до розмови з менеджером. Виносимо специфікації, галузеві сценарії, географію поставок і запит кошторису в керовану структуру.",
    scenarios: [
      ["Виробництво та інженерія", "Будуємо каталог рішень за задачами, додаємо специфікації, сертифікати з реальними джерелами та зручний запит технічної консультації."],
      ["Логістика й B2B", "Розділяємо маршрути, типи послуг і умови; форма запиту збирає потрібний контекст, але GA4 не отримує персональні дані."],
      ["Автомобільний сектор і медицина", "Плануємо запис, прайс/каталог та пояснення складних послуг так, щоб мобільний користувач швидко знайшов наступну дію."],
    ],
    decisionTitle: "Каталог, корпоративний сайт чи кабінет клієнта",
    decision: "Якщо характеристики можна показати у керованому каталозі, достатньо корпоративного сайту. Персональні ціни, статуси замовлень, документи або інтеграція з ERP переводять задачу у вебзастосунок. Межу фіксуємо до оцінки, щоб контентний сайт не перетворився на непередбачений software-проєкт.",
    faq: [
      ["Як показати складний технічний продукт без перевантаження сторінки?", "Розділяємо огляд, застосування, характеристики, документи й запит консультації. Таблиці та файли залишаємо доступними з клавіатури й на мобільному екрані."],
      ["Чи можна інтегрувати сайт із CRM або ERP?", "Так, якщо система має документований API або погоджений обмін даними. До кошторису окремо фіксуємо поля, напрямок синхронізації, помилки, доступи й відповідального."],
    ],
  },
  kharkiv: {
    lead: "У Харкові експертним, освітнім і виробничим командам важливо продовжувати продажі та комунікацію онлайн. Структуруємо знання, портфоліо й дистанційний процес без заяв про неіснуючий офіс.",
    scenarios: [
      ["IT та експертні послуги", "Описуємо компетенції через задачі, процес, технології й перевірні приклади; окремо ведемо користувача до консультації або оцінки."],
      ["Освіта й медицина", "Будуємо сторінки програм або напрямів, профілі відповідальних, правила запису та зрозумілу онлайн-взаємодію."],
      ["Виробництво й ecommerce", "Поєднуємо технічний каталог, документацію або картки товарів із пошуком, оплатою/запитом і вимірюванням завершених дій."],
    ],
    decisionTitle: "Сайт як точка безперервної онлайн-комунікації",
    decision: "Критичні контакти, каталог, документація й заявки мають працювати незалежно від фізичної зустрічі. Плануємо резервні канали звернення, зрозумілий ownership доступів і передачу матеріалів, щоб бізнес міг підтримувати сайт після запуску.",
    faq: [
      ["Як організувати дистанційне погодження складного експертного контенту?", "Погоджуємо карту сторінок, призначаємо відповідального за факти й рухаємося блоками: прототип, текст, дизайн, QA. Коментарі та рішення фіксуємо в одному каналі."],
      ["Чи можна передати команді редагування каталогу або програм?", "Так. До вибору технології визначаємо, які поля й сторінки команда змінюватиме сама, ролі доступу та правила публікації. Це входить у погоджений обсяг."],
    ],
  },
};

const stripTags = (value) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const escapeJson = (value) => value;
const renderCards = (items) => items.map(([title, text]) => `<article class="seo-mini-card"><h3>${title}</h3><p>${text}</p></article>`).join("");

for (const city of wave1) {
  const file = path.join(root, `mista/stvorennya-sajtiv-${city.slug}/index.html`);
  let html = fs.readFileSync(file, "utf8");
  const local = content[city.slug];
  const canonical = `https://maxsite.com.ua/mista/stvorennya-sajtiv-${city.slug}/`;

  html = html
    .replace(/<meta name="robots" content="[^"]+" \/>/, '<meta name="robots" content="index, follow" />')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${city.title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${city.description}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${city.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${city.description}" />`)
    .replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${city.h1}</h1>`)
    .replace(/в Львові/g, "у Львові")
    .replace(/у Одесі/g, "в Одесі")
    .replace(/в Дніпрі/g, "у Дніпрі")
    .replace(/в Харкові/g, "у Харкові");

  if (!html.includes(`id="wave1-${city.slug}-market"`)) {
    const proof = `<section class="seo-band reveal" id="wave1-${city.slug}-proof" data-seo-city-specific="true"><span class="eyebrow">Докази й контроль ризику</span><h2>Nationwide proof без вигаданих локальних кейсів</h2><p>MAX SITE працює дистанційно й не називає ці роботи місцевими кейсами. Перевірити видимий результат можна на сторінках <a href="/portfolio/formula-chystoty/">Formula Chystoty</a> та <a href="/portfolio/fo-dez/">FO-DEZ</a>: там описано обсяг, рішення й live URL без непідтверджених показників.</p><div class="seo-columns"><article class="seo-mini-card"><h3>До старту</h3><p>Фіксуємо сторінки, функції, матеріали, інтеграції, кошторис та відповідальних.</p></article><article class="seo-mini-card"><h3>Поетапне погодження</h3><p>Окремо приймаємо структуру, прототип, дизайн, розробку й production QA.</p></article><article class="seo-mini-card"><h3>Після запуску</h3><p>Передаємо погоджені доступи, перевіряємо заявки й визначаємо формат гарантійного виправлення дефектів у пропозиції.</p></article></div></section>`;
    const market = `<section class="seo-band reveal" id="wave1-${city.slug}-market" data-seo-city-specific="true"><span class="eyebrow">Контекст ${city.nominative}</span><h2>${local.decisionTitle}</h2><p>${local.lead}</p><div class="seo-columns">${renderCards(local.scenarios)}</div><h3>Рішення за задачею</h3><p>${local.decision}</p></section>`;
    const faqIndex = html.indexOf('<section class="seo-band faq-list reveal">');
    if (faqIndex === -1) throw new Error(`FAQ section not found: ${city.slug}`);
    html = `${html.slice(0, faqIndex)}${market}${proof}${html.slice(faqIndex)}`;
  }

  const faqStart = html.indexOf('<section class="seo-band faq-list reveal">');
  const faqEnd = html.indexOf("</section>", faqStart);
  let faqSection = html.slice(faqStart, faqEnd + 10);
  for (const [question, answer] of local.faq) {
    if (!faqSection.includes(question)) {
      faqSection = faqSection.replace("</section>", `<details><summary>${question}</summary><p>${answer}</p></details></section>`);
    }
  }
  html = `${html.slice(0, faqStart)}${faqSection}${html.slice(faqEnd + 10)}`;

  const questions = [...faqSection.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((match) => ({
    "@type": "Question",
    name: stripTags(match[1]),
    acceptedAnswer: { "@type": "Answer", text: stripTags(match[2]) },
  }));

  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, source) => {
    const data = JSON.parse(source);
    const graph = data["@graph"] || [];
    let organization = graph.find((item) => item["@type"] === "Organization") || {};
    organization = {
      ...organization,
      "@type": "Organization",
      "@id": "https://maxsite.com.ua/#organization",
      name: "MAX SITE",
      url: "https://maxsite.com.ua/",
      telephone: "+380972692322",
      areaServed: { "@type": "Country", name: "Україна" },
    };
    const website = {
      "@type": "WebSite", "@id": "https://maxsite.com.ua/#website", url: "https://maxsite.com.ua/",
      name: "MAX SITE", publisher: { "@id": "https://maxsite.com.ua/#organization" }, inLanguage: "uk-UA",
    };
    const service = {
      ...(graph.find((item) => item["@type"] === "Service") || {}),
      "@type": "Service", "@id": `${canonical}#service`, name: city.h1,
      serviceType: "Створення сайтів під ключ", provider: { "@id": "https://maxsite.com.ua/#organization" },
      areaServed: { "@type": "City", name: city.nominative, addressCountry: "UA" },
      url: canonical, description: city.description,
    };
    const webpage = {
      "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: city.title,
      description: city.description, inLanguage: "uk-UA", about: { "@id": `${canonical}#service` },
      isPartOf: { "@id": "https://maxsite.com.ua/#website" }, dateModified: city.updatedAt,
    };
    const breadcrumb = graph.find((item) => item["@type"] === "BreadcrumbList");
    const faq = { "@type": "FAQPage", mainEntity: questions };
    const next = [organization, website, webpage, breadcrumb, service, faq].filter(Boolean);
    return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": next.map(escapeJson) })}</script>`;
  });

  const relatedLinks = city.relatedCitySlugs.map((slug) => {
    const related = allCities.find((candidate) => candidate.slug === slug);
    if (!related || !related.index) throw new Error(`Related city must be indexable: ${city.slug} -> ${slug}`);
    return `<a href="/mista/stvorennya-sajtiv-${slug}/">Створення сайтів — ${related.nominative}</a>`;
  }).join("");
  const relatedBlock = `<section class="seo-links reveal" id="wave1-related-cities"><h2>Пов’язані міста</h2><div class="link-grid">${relatedLinks}</div></section>`;
  const legacyRelated = /<section class="seo-links reveal"><h2>Створення сайтів у сусідніх напрямках<\/h2>[\s\S]*?<\/section>/;
  if (legacyRelated.test(html)) html = html.replace(legacyRelated, relatedBlock);
  else if (!html.includes('id="wave1-related-cities"')) {
    const leadIndex = html.indexOf('<section class="seo-lead');
    html = `${html.slice(0, leadIndex)}${relatedBlock}${html.slice(leadIndex)}`;
  }

  fs.writeFileSync(file, html);
}

const servicePages = [
  "stvorennya-saytiv", "stvorennya-saytu-dlya-biznesu", "stvorennya-korporatyvnoho-saytu",
  "stvorennya-landing-page", "stvorennya-internet-mahazynu", "stvorennya-program",
];
const cityLinks = wave1.map((city) => `<a href="/mista/stvorennya-sajtiv-${city.slug}/">${city.h1.replace(" під ключ", "").replace(" для бізнесу", "")}</a>`).join("");
for (const slug of servicePages) {
  const file = path.join(root, slug, "index.html");
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('id="wave1-city-links"')) continue;
  const block = `<section class="seo-links reveal" id="wave1-city-links"><h2>Створення сайтів у ключових містах</h2><p>Працюємо дистанційно по Україні без заяв про неіснуючі офіси. Міські сторінки враховують різні бізнес-сценарії, а не копіюють один текст.</p><div class="link-grid">${cityLinks}<a href="/mista/">Усі міста й статуси</a></div></section>`;
  const leadIndex = html.indexOf('<section class="seo-lead');
  if (leadIndex === -1) throw new Error(`Lead section not found: ${slug}`);
  html = `${html.slice(0, leadIndex)}${block}${html.slice(leadIndex)}`;
  fs.writeFileSync(file, html);
}

const cityHubFile = path.join(root, "mista/index.html");
let cityHub = fs.readFileSync(cityHubFile, "utf8");
const publishedLinks = allCities.filter((city) => city.index).map((city) => `<a href="/mista/stvorennya-sajtiv-${city.slug}/">Створення сайтів — ${city.nominative}</a>`).join("");
const roadmap = allCities.filter((city) => !city.index).map((city) => city.nominative).join(", ");
const publishedSection = `<section class="seo-links" id="published-city-hubs"><h2>Опубліковані міські сторінки</h2><p>Індексуємо лише сторінки, що мають окремий бізнес-контекст, коректну мову та пройшли similarity/QA gates.</p><div class="link-grid">${publishedLinks}</div><p><strong>На перевірці, без SEO-посилань:</strong> ${roadmap}. Ці URL залишаються noindex до Wave 2/3 review.</p></section>`;
cityHub = cityHub.replace(/<section class="seo-links"><h2>Міста України<\/h2>[\s\S]*?<\/section>/, publishedSection);
fs.writeFileSync(cityHubFile, cityHub);

let sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const city of wave1) {
  const url = `https://maxsite.com.ua/mista/stvorennya-sajtiv-${city.slug}/`;
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`<loc>${escaped}</loc>`).test(sitemap)) {
    sitemap = sitemap.replace(new RegExp(`(<loc>${escaped}</loc><lastmod>)[^<]+`), `$1${city.updatedAt}`);
  } else {
    sitemap = sitemap.replace("</urlset>", `  <url><loc>${url}</loc><lastmod>${city.updatedAt}</lastmod><priority>0.8</priority></url>\n</urlset>`);
  }
}
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
console.log(`Updated ${wave1.length} Wave 1 city hubs and ${servicePages.length} service pages`);
