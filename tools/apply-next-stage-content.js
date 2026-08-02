const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const base = "https://maxsite.com.ua";

const organization = {
  "@type": "Organization",
  "@id": `${base}/#organization`,
  name: "MAX SITE",
  url: `${base}/`,
  telephone: "+380972692322",
  sameAs: ["https://t.me/MaxMytt", "https://www.instagram.com/maxlab.ai/"],
};

const esc = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const faqMarkup = (items) => `
  <section class="seo-band faq-list reveal">
    <span class="eyebrow">FAQ</span>
    <h2>Поширені питання</h2>
    ${items
      .map(
        ([question, answer]) =>
          `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`
      )
      .join("")}
  </section>`;

const leadMarkup = (heading, text) => `
  <section class="seo-lead reveal" id="lead">
    <div><span class="eyebrow">Консультація</span><h2>${heading}</h2><p>${text}</p><p><a href="tel:+380972692322">0972692322</a> · <a href="https://t.me/MaxMytt">Telegram</a></p></div>
    <form class="compact-form" action="#" method="post">
      <input name="name" aria-label="Ім’я" autocomplete="name" placeholder="Ім’я" required>
      <input name="phone" aria-label="Телефон" autocomplete="tel" inputmode="tel" placeholder="Телефон" required>
      <input name="business" aria-label="Ніша бізнесу" placeholder="Ніша бізнесу">
      <textarea name="comment" aria-label="Коротко про задачу" rows="4" placeholder="Коротко про задачу"></textarea>
      <button class="btn" type="submit">Отримати консультацію</button>
    </form>
  </section>`;

const breadcrumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, url], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: url,
  })),
});

const faqSchema = (items) => ({
  "@type": "FAQPage",
  mainEntity: items.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

const updatePage = ({ file, title, description, schema, main }) => {
  const fullPath = path.join(root, file);
  let html = fs.readFileSync(fullPath, "utf8");

  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?\s*>/,
      `<meta name="description" content="${esc(description)}" />`
    )
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?\s*>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/?\s*>/,
      `<meta property="og:description" content="${esc(description)}" />`
    )
    .replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@graph": schema,
      })}</script>`
    )
    .replace(/<main\b[\s\S]*?<\/main>/, main.trim());

  fs.writeFileSync(fullPath, html.replace(/[ \t]+$/gm, ""));
};

const cleaningFaq = [
  ["Які сторінки потрібні клінінговій компанії?", "На старті потрібні головна, окремі сторінки ключових послуг, ціни або принцип розрахунку, приклади робіт, FAQ та контакти. Для SEO послуги краще не змішувати в одну коротку сторінку."],
  ["Чи можна додати калькулятор вартості прибирання?", "Так. Спочатку визначаємо, які параметри реально впливають на розрахунок: площа, тип прибирання, кількість вікон, терміновість та додаткові роботи."],
  ["Чи підійде такий сайт для Google Ads?", "Так, якщо рекламні оголошення ведуть на релевантні сторінки послуг, а форми й дзвінки налаштовані як конверсії. Рекламний бюджет і ведення Google Ads оплачуються окремо."],
  ["Скільки коштує сайт для клінінгу?", "Лендінг стартує від 10 500 грн, сайт для бізнесу — від 19 700 грн, SEO Pro — від 29 000 грн. Точна ціна залежить від кількості послуг, сторінок і потрібних інтеграцій."],
];

updatePage({
  file: "nishi/sajt-dlya-kliningovoyi-kompaniyi/index.html",
  title: "Сайт для клінінгової компанії під ключ | MAX SITE",
  description: "Створюємо сайти для клінінгових компаній: окремі сторінки послуг, заявки, фото робіт, ціни, SEO-структура та підготовка до Google Ads.",
  schema: [
    organization,
    breadcrumbs([["Головна", `${base}/`], ["Ніші", `${base}/nishi/`], ["Сайт для клінінгової компанії", `${base}/nishi/sajt-dlya-kliningovoyi-kompaniyi/`]]),
    { "@type": "Service", name: "Створення сайту для клінінгової компанії", serviceType: "Розробка сайту для клінінгового бізнесу", provider: { "@id": `${base}/#organization` }, url: `${base}/nishi/sajt-dlya-kliningovoyi-kompaniyi/`, offers: { "@type": "AggregateOffer", priceCurrency: "UAH", lowPrice: "10500" } },
    faqSchema(cleaningFaq),
  ],
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/nishi/">Ніші</a></span><span>Клінінг</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Сайт для клінінгу</span><h1>Сайт для клінінгової компанії</h1><p>Будуємо зрозумілий шлях від пошуку конкретної послуги до дзвінка або заявки: окремі посадкові сторінки, приклади робіт, прозорий розрахунок і зручна мобільна версія.</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити сайт</a><a class="btn btn-ghost" href="/portfolio/#formula-chystoty">Подивитися кейс</a></div></div><aside class="seo-hero-card"><strong>від 10 500 грн</strong><p>Лендінг для однієї послуги. Для кількох напрямів і органічного пошуку рекомендуємо багатосторінкову структуру.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Логіка заявки</span><h2>Що має пояснити сайт до першого дзвінка</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Яке прибирання</h3><p>Квартири, офіси, після ремонту, вікна або хімчистка мають вести на релевантний опис, а не на загальний список.</p></article><article class="seo-mini-card"><h3>Як формується ціна</h3><p>Показуємо стартову вартість або чинники розрахунку без обіцянок ціни, яку неможливо підтвердити без деталей.</p></article><article class="seo-mini-card"><h3>Чому можна довіряти</h3><p>Реальні фото, процес роботи, умови, відповіді на заперечення та помітні контакти зменшують невизначеність.</p></article></div></section>
    <section class="seo-band reveal"><span class="eyebrow">Структура</span><h2>Сторінки під послуги, які шукають окремо</h2><ul class="seo-list-clean"><li>генеральне прибирання квартир і будинків</li><li>прибирання офісів та комерційних приміщень</li><li>прибирання після ремонту</li><li>миття вікон і фасадів</li><li>хімчистка меблів та килимів</li><li>регулярне підтримувальне прибирання</li></ul><p>Перелік узгоджується з фактичними послугами компанії. Не створюємо сторінки під роботи, яких бізнес не виконує.</p></section>
    <section class="seo-band reveal"><span class="eyebrow">Реальний приклад</span><h2>Кейс «Формула Чистоти»</h2><p>У портфоліо MAX SITE є приклад сайту клінінгової компанії з послугами, прикладами робіт, формами й контактами. Це не універсальний шаблон: для нового проєкту структура формується під географію, перелік послуг і процес розрахунку конкретного бізнесу.</p><p><a class="btn btn-ghost" href="/portfolio/#formula-chystoty">Переглянути опис кейсу</a></p></section>
    <section class="seo-band reveal"><span class="eyebrow">SEO та реклама</span><h2>Одна база для органічного пошуку й Google Ads</h2><p>Закладаємо один H1, коректні title і description, сторінки послуг, FAQ, внутрішні посилання та зрозумілі URL. Для реклами окремо перевіряємо відповідність оголошення сторінці та готуємо події для форм, дзвінків і месенджерів. Це створює технічну основу, але не гарантує позиції або кількість заявок без трафіку й подальшої роботи.</p></section>
    ${faqMarkup(cleaningFaq)}
    <section class="seo-links reveal"><h2>Пов’язані послуги</h2><div class="link-grid"><a href="/sajty-dlya-poslug/">Сайти для послуг</a><a href="/seo-sajt-pid-google/">SEO-сайт під Google</a><a href="/google-ads/">Google Ads</a><a href="/portfolio/">Портфоліо</a></div></section>
    ${leadMarkup("Потрібен сайт для клінінгової компанії?", "Розкажіть, які послуги ви надаєте, у яких містах працюєте і звідки плануєте отримувати заявки. Запропонуємо структуру без зайвих сторінок.")}
  </div>
</main>`,
});

const localFaq = [
  ["Чи потрібна окрема сторінка для кожного міста?", "Не завжди. Якщо бізнес працює в одному місті, достатньо сильної локальної сторінки та сторінок послуг. Міські сторінки доречні лише для реальної окремої пропозиції або зони обслуговування."],
  ["Чи можна додати Google Maps?", "Так, якщо є підтверджена адреса або профіль компанії. Не додаємо вигадану адресу чи офіс заради локального SEO."],
  ["Що важливіше для локального сайту: дзвінок чи форма?", "Залежить від послуги. Для термінових робіт важливий дзвінок, для складного розрахунку — коротка форма. Зазвичай залишаємо обидва сценарії та месенджер."],
  ["Який бюджет на розробку?", "Лендінг коштує від 10 500 грн, сайт для бізнесу — від 19 700 грн, SEO Pro — від 29 000 грн. Після брифу фіксуємо обсяг і точну вартість."],
];

updatePage({
  file: "nishi/sajt-dlya-lokalnogo-biznesu/index.html",
  title: "Сайт для локального бізнесу під ключ | MAX SITE",
  description: "Створюємо сайти для локального бізнесу: сторінки послуг, географія роботи, дзвінки, месенджери, заявки, локальна SEO-структура й аналітика.",
  schema: [organization, breadcrumbs([["Головна", `${base}/`], ["Ніші", `${base}/nishi/`], ["Локальний бізнес", `${base}/nishi/sajt-dlya-lokalnogo-biznesu/`]]), { "@type": "Service", name: "Створення сайту для локального бізнесу", provider: { "@id": `${base}/#organization` }, areaServed: { "@type": "Country", name: "Україна" }, url: `${base}/nishi/sajt-dlya-lokalnogo-biznesu/`, offers: { "@type": "AggregateOffer", priceCurrency: "UAH", lowPrice: "10500" } }, faqSchema(localFaq)],
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/nishi/">Ніші</a></span><span>Локальний бізнес</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Локальні заявки</span><h1>Сайт для локального бізнесу</h1><p>Допомагаємо перетворити локальний пошук, рекламу й переходи із соцмереж на зрозумілі дії: дзвінок, маршрут, повідомлення або заявку на розрахунок.</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити сайт</a><a class="btn btn-ghost" href="/mista/">Сторінки міст</a></div></div><aside class="seo-hero-card"><strong>Під ваше місто</strong><p>Не вигадуємо офісів і зон роботи. Географія, адреса та контакти на сайті мають відповідати реальному бізнесу.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Конверсія</span><h2>Чотири короткі шляхи до звернення</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Подзвонити</h3><p>Телефон помітний у шапці та мобільній панелі для термінових послуг.</p></article><article class="seo-mini-card"><h3>Написати</h3><p>Telegram або Viber допомагають надіслати фото й деталі без довгої форми.</p></article><article class="seo-mini-card"><h3>Залишити заявку</h3><p>Форма збирає тільки дані, потрібні для першої відповіді й оцінки задачі.</p></article></div></section>
    <section class="seo-band reveal"><span class="eyebrow">Локальна структура</span><h2>Що допомагає сторінці відповідати на геозапит</h2><ul class="seo-list-clean"><li>фактичне місто або зона обслуговування</li><li>окремі сторінки реальних послуг</li><li>ціни або зрозумілий принцип розрахунку</li><li>реальні фото, приклади та умови роботи</li><li>узгоджені телефон, графік і контакти</li><li>FAQ з локальними умовами виїзду</li></ul><p>Назву міста недостатньо підставити в однаковий текст. Кожна географічна сторінка повинна мати окрему пропозицію, корисні деталі та внутрішні посилання.</p></section>
    <section class="seo-band reveal"><span class="eyebrow">Вимірювання</span><h2>Що відстежувати після запуску</h2><p>Готуємо події для кліків по телефону й месенджерах, відправлення форми та переходів до кейсів. Реальні GA4 або GTM і Search Console підключаються після надання власником ідентифікаторів і підтвердження доступу. Особисті дані з форми в аналітику не передаються.</p></section>
    ${faqMarkup(localFaq)}
    <section class="seo-links reveal"><h2>Пов’язані розділи</h2><div class="link-grid"><a href="/mista/">Сайти у містах</a><a href="/sajty-dlya-poslug/">Сайти для послуг</a><a href="/google-analytics-search-console/">Аналітика</a><a href="/kontakty/">Контакти</a></div></section>
    ${leadMarkup("Обговоримо локальну структуру?", "Вкажіть місто, реальну зону роботи, основні послуги та бажаний канал заявок. Підкажемо, чи потрібен лендінг, сайт послуг або SEO-структура.")}
  </div>
</main>`,
});

const constructionFaq = [
  ["Що показувати в портфоліо будівельної компанії?", "Для кожного об’єкта варто вказати тип робіт, місто або область, коротку задачу, виконані етапи й реальні фото. Не публікуємо адреси та дані замовника без дозволу."],
  ["Чи потрібні сторінки під кожен вид робіт?", "Так, якщо напрям має окремий попит і компанія реально його виконує: будівництво будинків, ремонт, фасади, покрівля або комерційні об’єкти."],
  ["Як збирати якісніші заявки?", "У форму можна додати тип об’єкта, місто, орієнтовну площу, етап і коментар. Полів має бути достатньо для оцінки, але не настільки багато, щоб людина залишила форму."],
  ["Скільки коштує розробка?", "Сайт для бізнесу стартує від 19 700 грн, SEO Pro — від 29 000 грн. Точна ціна залежить від сторінок напрямів, кількості кейсів і функцій розрахунку."],
];

updatePage({
  file: "nishi/sajt-dlya-budivelnoyi-kompaniyi/index.html",
  title: "Сайт для будівельної компанії під ключ | MAX SITE",
  description: "Розробляємо сайти для будівельних компаній: напрями робіт, портфоліо об’єктів, кваліфікація заявок, SEO-структура та підготовка до реклами.",
  schema: [organization, breadcrumbs([["Головна", `${base}/`], ["Ніші", `${base}/nishi/`], ["Будівельна компанія", `${base}/nishi/sajt-dlya-budivelnoyi-kompaniyi/`]]), { "@type": "Service", name: "Створення сайту для будівельної компанії", provider: { "@id": `${base}/#organization` }, url: `${base}/nishi/sajt-dlya-budivelnoyi-kompaniyi/`, offers: { "@type": "AggregateOffer", priceCurrency: "UAH", lowPrice: "19700" } }, faqSchema(constructionFaq)],
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/nishi/">Ніші</a></span><span>Будівництво</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Сайт для будівництва</span><h1>Сайт для будівельної компанії</h1><p>Структуруємо напрями робіт, об’єкти й умови співпраці так, щоб потенційний замовник розумів спеціалізацію компанії та залишав достатньо даних для предметної розмови.</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити проєкт</a><a class="btn btn-ghost" href="/stvorennya-sajtiv-pid-klyuch/">Що входить у розробку</a></div></div><aside class="seo-hero-card"><strong>від 19 700 грн</strong><p>Бізнес-сайт із головною та сторінками напрямів. Склад калькулятора й портфоліо оцінюємо після брифу.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Архітектура</span><h2>Розділяємо послуги, об’єкти та географію</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Напрями робіт</h3><p>Кожен ключовий напрям отримує власну відповідь: склад робіт, етапи, матеріали, обмеження й CTA.</p></article><article class="seo-mini-card"><h3>Виконані об’єкти</h3><p>Кейс показує задачу й результат через перевірені факти та реальні фото, а не через загальні обіцянки.</p></article><article class="seo-mini-card"><h3>Заявка на оцінку</h3><p>Тип об’єкта, площа, місто й етап допомагають відсіяти нерелевантні звернення ще до дзвінка.</p></article></div></section>
    <section class="seo-band reveal"><span class="eyebrow">Контент</span><h2>Матеріали, які варто підготувати до старту</h2><ul class="seo-list-clean"><li>перелік робіт і реальні зони виїзду</li><li>фото об’єктів із дозволом на публікацію</li><li>опис етапів і відповідальності сторін</li><li>приклади кошторисів без конфіденційних даних</li><li>сертифікати й гарантії, якщо вони чинні</li><li>контакти відповідального за заявки</li></ul></section>
    <section class="seo-band reveal"><span class="eyebrow">SEO</span><h2>Не створюємо сторінки лише заради ключового слова</h2><p>Посадкова під напрям або місто залишається в індексі тільки коли має реальну пропозицію, унікальні умови та корисний зміст. Технічні мета-теги й schema допомагають пошуковій системі зрозуміти сторінку, але не замінюють кейси, експертизу та зовнішні сигнали довіри.</p></section>
    ${faqMarkup(constructionFaq)}
    <section class="seo-links reveal"><h2>Пов’язані послуги</h2><div class="link-grid"><a href="/korporatyvni-sajty/">Корпоративні сайти</a><a href="/seo-sajt-pid-google/">SEO-сайт</a><a href="/google-ads/">Google Ads</a><a href="/portfolio/">Портфоліо</a></div></section>
    ${leadMarkup("Потрібен сайт для будівельної компанії?", "Опишіть напрями робіт, регіон, типові об’єкти та матеріали, які вже є. Підготуємо структуру й реалістичний обсяг першого запуску.")}
  </div>
</main>`,
});

const adsFaq = [
  ["Чи входить рекламний бюджет у вартість ведення?", "Ні. Бюджет оплачується окремо напряму в Google Ads. Вартість MAX SITE покриває налаштування, аналіз і ведення в межах погодженого обсягу."],
  ["Чи можна гарантувати кількість заявок?", "Ні. Результат залежить від попиту, конкуренції, бюджету, пропозиції та якості сайту. До старту визначаємо вимірювані цілі й пояснюємо ризики."],
  ["Що потрібно для запуску?", "Потрібні доступ до рекламного кабінету або його створення, робоча посадкова сторінка, регіон показів, перелік послуг, бюджет і підтверджені способи зв’язку."],
  ["Чим разовий запуск відрізняється від ведення?", "Разовий запуск охоплює базове налаштування кампанії. Щомісячне ведення включає аналіз пошукових запитів, мінус-слів, ставок, конверсій і подальшу оптимізацію."],
];

updatePage({
  file: "google-ads/index.html",
  title: "Google Ads для бізнесу — налаштування та ведення | MAX SITE",
  description: "Налаштування й ведення Google Ads для бізнесу: пошукові кампанії, ключові слова, конверсії, оптимізація та звіти. Від 6 800 грн на місяць.",
  schema: [organization, breadcrumbs([["Головна", `${base}/`], ["Послуги", `${base}/poslugy/`], ["Google Ads", `${base}/google-ads/`]]), { "@type": "Service", name: "Налаштування та ведення Google Ads", provider: { "@id": `${base}/#organization` }, url: `${base}/google-ads/`, offers: [{ "@type": "Offer", name: "Google Ads Старт", price: "6800", priceCurrency: "UAH", description: "Щомісячне ведення; рекламний бюджет не включено" }, { "@type": "Offer", name: "Google Ads Бізнес", price: "10200", priceCurrency: "UAH", description: "Щомісячне ведення; рекламний бюджет не включено" }, { "@type": "Offer", name: "Разовий запуск Google Ads", price: "5600", priceCurrency: "UAH" }] }, faqSchema(adsFaq)],
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/poslugy/">Послуги</a></span><span>Google Ads</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Контекстна реклама</span><h1>Google Ads для бізнесу</h1><p>Налаштовуємо пошукову рекламу, прив’язуємо її до релевантних сторінок і вимірюємо цільові дії. Працюємо з прозорим поділом: послуга ведення оплачується MAX SITE, рекламний бюджет — напряму Google.</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити рекламу</a><a class="btn btn-ghost" href="/google-analytics-search-console/">Підключити аналітику</a></div></div><aside class="seo-hero-card"><strong>від 6 800 грн / місяць</strong><p>Рекламний бюджет не входить у вартість і залежить від ніші, регіону та попиту.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Тарифи</span><h2>Формати роботи</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Google Ads Старт</h3><p><strong>від 6 800 грн / місяць</strong></p><p>Аналіз ніші, ключові слова, пошукова кампанія, оголошення, географія, мінус-слова й короткий звіт.</p></article><article class="seo-mini-card"><h3>Google Ads Бізнес</h3><p><strong>від 10 200 грн / місяць</strong></p><p>Регулярна оптимізація, контроль конверсій і ціни звернення, робота із запитами та рекомендації для посадкових.</p></article><article class="seo-mini-card"><h3>Разовий запуск</h3><p><strong>від 5 600 грн</strong></p><p>Базове створення кампанії, ключові слова, оголошення й налаштування конверсій без щомісячного супроводу.</p></article></div><p><strong>Рекламний бюджет Google не входить у вартість ведення та оплачується окремо напряму в Google Ads.</strong></p></section>
    <section class="seo-band reveal"><span class="eyebrow">Процес</span><h2>Від перевірки попиту до оптимізації</h2><ul class="seo-list-clean"><li>перевіряємо пропозицію й посадкові сторінки</li><li>узгоджуємо регіон, бюджет і цільові дії</li><li>збираємо ключові та мінус-слова</li><li>створюємо оголошення й структуру кампаній</li><li>перевіряємо передачу конверсій</li><li>аналізуємо пошукові запити та результат</li></ul></section>
    <section class="seo-band reveal"><span class="eyebrow">Межі послуги</span><h2>Що не можна визначити до збору даних</h2><p>Не обіцяємо фіксовану кількість заявок або гарантовану ціну ліда. До запуску можна оцінити попит і ризики, а робочі висновки з’являються після накопичення достатньої статистики. Якщо посадкова сторінка не пояснює пропозицію або не працює на мобільному, спочатку рекомендуємо виправити її.</p></section>
    ${faqMarkup(adsFaq)}
    <section class="seo-links reveal"><h2>Пов’язані послуги</h2><div class="link-grid"><a href="/google-analytics-search-console/">Analytics + Search Console</a><a href="/stvorennya-lendingiv/">Лендінги</a><a href="/sajty-dlya-poslug/">Сайти послуг</a><a href="/portfolio/">Кейси</a></div></section>
    ${leadMarkup("Потрібне налаштування Google Ads?", "Вкажіть послугу, регіон, адресу посадкової сторінки та орієнтовний рекламний бюджет. Перевіримо, що потрібно підготувати до запуску.")}
  </div>
</main>`,
});

const analyticsFaq = [
  ["Чим Google Analytics відрізняється від Search Console?", "Analytics показує поведінку відвідувачів і події на сайті, а Search Console — видимість у пошуку, запити, індексацію та технічні повідомлення Google."],
  ["Чи передаються в аналітику дані з форми?", "Ім’я, телефон і текст повідомлення не повинні передаватися в GA4 або GTM. Для вимірювання достатньо події успішного відправлення форми та технічних параметрів сторінки."],
  ["Чи можна підключити інструменти разово?", "Так. Разове налаштування Analytics або Search Console коштує від 2 900 грн за інструмент. Складні події та інтеграції оцінюються після перевірки сайту."],
  ["Коли потрібен щомісячний супровід?", "Коли бізнес регулярно запускає рекламу, додає сторінки, працює з SEO або хоче отримувати звіт із висновками, а не лише збирати дані."],
];

updatePage({
  file: "google-analytics-search-console/index.html",
  title: "Google Analytics і Search Console для бізнесу | MAX SITE",
  description: "Підключення та супровід Google Analytics 4 і Search Console: події, джерела звернень, індексація, помилки та звіти. Від 2 900 грн разово.",
  schema: [organization, breadcrumbs([["Головна", `${base}/`], ["Послуги", `${base}/poslugy/`], ["Google Analytics і Search Console", `${base}/google-analytics-search-console/`]]), { "@type": "Service", name: "Google Analytics і Search Console", provider: { "@id": `${base}/#organization` }, url: `${base}/google-analytics-search-console/`, offers: [{ "@type": "Offer", name: "Щомісячний супровід Analytics і Search Console", price: "4500", priceCurrency: "UAH" }, { "@type": "Offer", name: "Разове налаштування Google Analytics", price: "2900", priceCurrency: "UAH" }, { "@type": "Offer", name: "Разове налаштування Search Console", price: "2900", priceCurrency: "UAH" }] }, faqSchema(analyticsFaq)],
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/poslugy/">Послуги</a></span><span>Аналітика</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Дані без здогадок</span><h1>Google Analytics і Search Console</h1><p>Налаштовуємо збір подій, перевіряємо індексацію та формуємо зрозумілу картину: звідки приходять відвідувачі, які сторінки приводять звернення і де Google бачить технічні проблеми.</p><div class="hero-buttons"><a class="btn" href="#lead">Підключити аналітику</a><a class="btn btn-ghost" href="/google-ads/">Google Ads</a></div></div><aside class="seo-hero-card"><strong>від 2 900 грн разово</strong><p>Щомісячний супровід двох інструментів — від 4 500 грн.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Ролі інструментів</span><h2>Два джерела даних — різні відповіді</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Google Analytics 4</h3><p>Джерела трафіку, перегляди сторінок, кліки по контактах, відправлення форм і шлях користувача.</p></article><article class="seo-mini-card"><h3>Search Console</h3><p>Пошукові запити, покази, кліки, індексація, sitemap і повідомлення про проблеми сторінок.</p></article><article class="seo-mini-card"><h3>Спільний звіт</h3><p>Поєднуємо дані у висновки: що привело трафік, де сталася конверсія та що варто перевірити далі.</p></article></div></section>
    <section class="seo-band reveal"><span class="eyebrow">Вартість</span><h2>Разове налаштування або супровід</h2><ul class="seo-list-clean"><li>Google Analytics — від 2 900 грн разово</li><li>Search Console — від 2 900 грн разово</li><li>Analytics + Search Console — від 4 500 грн / місяць</li><li>повне ведення сайту — від 14 800 грн / місяць</li></ul><p>Точна вартість залежить від кількості форм, подій, доменів, рекламних кабінетів та необхідності виправляти наявне налаштування.</p></section>
    <section class="seo-band reveal"><span class="eyebrow">Приватність</span><h2>Не передаємо особисті дані як параметри подій</h2><p>В аналітику не повинні потрапляти ім’я, телефон, email або коментар заявки. Вимірюємо факт і тип взаємодії, сторінку та джерело. Ідентифікатори GA4, GTM і токен підтвердження Search Console додаються тільки після того, як власник надасть реальні значення.</p></section>
    ${faqMarkup(analyticsFaq)}
    <section class="seo-links reveal"><h2>Пов’язані розділи</h2><div class="link-grid"><a href="/google-ads/">Google Ads</a><a href="/seo-sajt-pid-google/">SEO-сайт</a><a href="/poslugy/">Усі послуги</a><a href="/kontakty/">Контакти</a></div></section>
    ${leadMarkup("Потрібно перевірити або підключити аналітику?", "Надішліть адресу сайту й коротко опишіть, які дії потрібно вимірювати. Доступи та ідентифікатори узгодимо окремо без передачі паролів у форму.")}
  </div>
</main>`,
});

const citySchema = (name, slug, faq) => [
  organization,
  breadcrumbs([["Головна", `${base}/`], ["Міста", `${base}/mista/`], [`Створення сайтів — ${name}`, `${base}/mista/${slug}/`]]),
  {
    "@type": "Service",
    name: `Створення сайтів для бізнесу — ${name}`,
    provider: { "@id": `${base}/#organization` },
    areaServed: { "@type": name === "Україна" ? "Country" : "City", name },
    url: `${base}/mista/${slug}/`,
    offers: { "@type": "AggregateOffer", priceCurrency: "UAH", lowPrice: "10500" },
  },
  faqSchema(faq),
];

const cherkasyFaq = [
  ["Чи має MAX SITE офіс у Черкасах?", "На сайті не заявляється фізичний офіс. Комунікація, погодження структури й передача матеріалів можуть відбуватися дистанційно; фактичний формат зустрічей узгоджується окремо."],
  ["Який сайт підійде локальній компанії в Черкасах?", "Для однієї рекламної пропозиції достатньо лендінгу. Для кількох послуг і пошуку за окремими запитами краще сайт із власними сторінками напрямів."],
  ["Чи можна просуватися по районах і області?", "Такі сторінки доречні лише коли компанія реально обслуговує територію й може додати унікальні умови. Масово створювати однакові сторінки з підміною географії не рекомендуємо."],
  ["Скільки коштує розробка?", "Стартовий лендінг — від 10 500 грн, сайт для бізнесу — від 19 700 грн, SEO Pro — від 29 000 грн. Обсяг фіксуємо після брифу."],
];

updatePage({
  file: "mista/stvorennya-sajtiv-cherkasy/index.html",
  title: "Створення сайтів у Черкасах для бізнесу | MAX SITE",
  description: "Створення сайтів для бізнесу в Черкасах: лендінги, сайти послуг, локальна SEO-структура, форми, аналітика й підготовка до Google Ads.",
  schema: citySchema("Черкаси", "stvorennya-sajtiv-cherkasy", cherkasyFaq),
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/mista/">Міста</a></span><span>Черкаси</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Черкаси</span><h1>Створення сайтів у Черкасах для бізнесу</h1><p>Проєктуємо лендінги й багатосторінкові сайти для компаній, що реально працюють у Черкасах та області. Географію, послуги й контакти фіксуємо за даними бізнесу — без вигаданих адрес і локальних сторінок.</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити сайт</a><a class="btn btn-ghost" href="/portfolio/">Переглянути кейси</a></div></div><aside class="seo-hero-card"><strong>від 10 500 грн</strong><p>Формат визначається кількістю послуг, джерелами трафіку та необхідністю окремих SEO-сторінок.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Локальний сценарій</span><h2>Сайт має відповідати на практичні питання клієнта</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Чи працюєте в моєму районі</h3><p>Чітко показуємо місто, область або зону виїзду, яку підтвердив власник бізнесу.</p></article><article class="seo-mini-card"><h3>Скільки це коштує</h3><p>Даємо стартову ціну, пакети або чинники розрахунку без фіктивних акцій.</p></article><article class="seo-mini-card"><h3>Як швидко звернутися</h3><p>Телефон, Telegram, Viber і коротка форма залишаються доступними на мобільному.</p></article></div></section>
    <section class="seo-band reveal"><span class="eyebrow">Приклад із регіону</span><h2>Кейс клінінгового бізнесу</h2><p>У портфоліо є сайт «Формула Чистоти» — приклад представлення послуг, робіт і контактів клінінгової компанії. Новий проєкт не копіює цей дизайн або текст: кейс допомагає побачити логіку структури для локального сервісу.</p><p><a class="btn btn-ghost" href="/portfolio/#formula-chystoty">Переглянути кейс</a></p></section>
    <section class="seo-band reveal"><span class="eyebrow">Перший запуск</span><h2>Що підготувати бізнесу з Черкас</h2><ul class="seo-list-clean"><li>фактичні послуги та територію роботи</li><li>ціни або правила розрахунку</li><li>реальні фото й приклади</li><li>телефон і відповідального за заявки</li><li>умови виїзду або прийому клієнтів</li><li>доступи до домену й аналітики, якщо вони є</li></ul></section>
    ${faqMarkup(cherkasyFaq)}
    <section class="seo-links reveal"><h2>Пов’язані сторінки</h2><div class="link-grid"><a href="/nishi/sajt-dlya-lokalnogo-biznesu/">Локальний бізнес</a><a href="/sajty-dlya-poslug/">Сайти послуг</a><a href="/google-ads/">Google Ads</a><a href="/mista/">Інші міста</a></div></section>
    ${leadMarkup("Потрібен сайт для бізнесу в Черкасах?", "Опишіть послуги, реальну зону роботи й основну ціль сайту. Підкажемо структуру та обсяг першого запуску.")}
  </div>
</main>`,
});

const kyivFaq = [
  ["Чи достатньо одного лендінгу для бізнесу в Києві?", "Для однієї пропозиції та реклами — часто так. Якщо компанія має кілька напрямів, філій або планує органічний пошук, потрібна ширша структура."],
  ["Чи треба створювати сторінки під кожен район Києва?", "Лише якщо пропозиція, адреса або умови справді відрізняються. Сторінки з однаковим текстом і підміною назви району створюють ризик doorway-контенту."],
  ["Як підготувати сайт до Google Ads?", "Розділити рекламні наміри, зробити релевантні посадкові, налаштувати мобільні CTA та конверсії. Бюджет реклами оплачується окремо."],
  ["Яка стартова вартість?", "Лендінг — від 10 500 грн, сайт для бізнесу — від 19 700 грн, SEO Pro — від 29 000 грн. Складні каталоги й інтеграції рахуються окремо."],
];

updatePage({
  file: "mista/stvorennya-sajtiv-kyiv/index.html",
  title: "Створення сайтів у Києві для бізнесу | MAX SITE",
  description: "Розробка сайтів для бізнесу в Києві: сегментація послуг, лендінги, SEO-структура, конверсії, аналітика та підготовка до Google Ads.",
  schema: citySchema("Київ", "stvorennya-sajtiv-kyiv", kyivFaq),
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/mista/">Міста</a></span><span>Київ</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Київ</span><h1>Створення сайтів у Києві для бізнесу</h1><p>Для конкурентної пропозиції недостатньо додати назву міста в заголовок. Розділяємо аудиторії, послуги й сценарії звернення, щоб кожна важлива сторінка відповідала конкретному наміру.</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити проєкт</a><a class="btn btn-ghost" href="/seo-sajt-pid-google/">SEO-структура</a></div></div><aside class="seo-hero-card"><strong>Структура до дизайну</strong><p>Спочатку визначаємо пропозиції, сегменти й цільові дії, потім формуємо прототип і візуальну систему.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Сегментація</span><h2>Одна сторінка не повинна відповідати на всі запити</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Кілька послуг</h3><p>Кожен комерційно важливий напрям отримує власний офер, докази, FAQ і форму.</p></article><article class="seo-mini-card"><h3>Кілька філій</h3><p>Адреси й зони обслуговування описуємо окремо лише за фактичної присутності.</p></article><article class="seo-mini-card"><h3>B2B і B2C</h3><p>Різні аудиторії не змішуємо в один загальний текст, якщо їхні критерії вибору відрізняються.</p></article></div></section>
    <section class="seo-band reveal"><span class="eyebrow">Конверсії</span><h2>Готуємо сайт до вимірювання, а не до здогадок</h2><p>Позначаємо відправлення форм, кліки по телефону й месенджерах, переходи до кейсів і тарифів. GA4 або GTM вмикаються тільки після отримання реального ID, а особисті дані користувачів не передаються як параметри подій.</p></section>
    <section class="seo-band reveal"><span class="eyebrow">Реклама й SEO</span><h2>Спільна архітектура, різний горизонт результату</h2><ul class="seo-list-clean"><li>Google Ads веде на сторінку конкретної пропозиції</li><li>SEO-сторінка розкриває тему повніше й перелінковується</li><li>обидва канали потребують швидкої мобільної версії</li><li>жоден канал не гарантує заявки без конкурентної пропозиції</li></ul></section>
    ${faqMarkup(kyivFaq)}
    <section class="seo-links reveal"><h2>Пов’язані послуги</h2><div class="link-grid"><a href="/stvorennya-lendingiv/">Лендінги</a><a href="/korporatyvni-sajty/">Корпоративні сайти</a><a href="/google-ads/">Google Ads</a><a href="/google-analytics-search-console/">Аналітика</a></div></section>
    ${leadMarkup("Потрібен сайт для ринку Києва?", "Вкажіть аудиторію, основні послуги, філії або зони роботи та джерела трафіку. Запропонуємо структуру без дублювання сторінок.")}
  </div>
</main>`,
});

const ukraineFaq = [
  ["Чи можна створити один сайт для всієї України?", "Так. Для національної пропозиції основою можуть бути сторінки послуг і зрозумілі умови доставки або обслуговування. Міські сторінки потрібні не кожному бізнесу."],
  ["Коли доречні окремі сторінки міст?", "Коли в місті є реальна філія, окрема зона роботи, відмінні умови або локальні матеріали. Однакові сторінки з заміною міста не створюємо."],
  ["Як працює дистанційна розробка?", "Бриф, структура, дизайн і правки погоджуються онлайн. Доступи передаються через безпечний погоджений канал, а не через публічну форму."],
  ["Чи гарантує SEO вихід у топ?", "Ні. Ми створюємо технічну й контентну основу. Позиції залежать від конкуренції, якості матеріалів, історії домену, зовнішніх сигналів і подальшої роботи."],
];

updatePage({
  file: "mista/stvorennya-sajtiv-ukrayina/index.html",
  title: "Створення сайтів для бізнесу по Україні | MAX SITE",
  description: "Створення сайтів для бізнесу по Україні: дистанційна розробка, сторінки послуг, національна й локальна SEO-архітектура, аналітика та реклама.",
  schema: citySchema("Україна", "stvorennya-sajtiv-ukrayina", ukraineFaq),
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/mista/">Географія</a></span><span>Україна</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Дистанційна розробка</span><h1>Створення сайтів для бізнесу по Україні</h1><p>Розробляємо сайти дистанційно для компаній із національною або локальною моделлю роботи. Архітектура залежить від реальної географії бізнесу, а не від бажання створити максимальну кількість URL.</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити сайт</a><a class="btn btn-ghost" href="/mista/">Географія послуг</a></div></div><aside class="seo-hero-card"><strong>Без doorway-сторінок</strong><p>Місто отримує окрему сторінку тільки за наявності відмінної пропозиції, умов або корисного локального змісту.</p></aside></section>
  <div class="seo-content">
    <section class="seo-band reveal"><span class="eyebrow">Модель бізнесу</span><h2>Національний і локальний сайт мають різну логіку</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Послуги онлайн</h3><p>Основу формують продукти, компетенції, процес і кейси; місто часто не є критерієм вибору.</p></article><article class="seo-mini-card"><h3>Виїзні послуги</h3><p>Потрібні точні зони роботи, умови виїзду та контакти для кожного реально доступного регіону.</p></article><article class="seo-mini-card"><h3>Мережа або філії</h3><p>Окремі адреси, графіки й пропозиції можна структурувати без дублювання основного контенту.</p></article></div></section>
    <section class="seo-band reveal"><span class="eyebrow">Етапи</span><h2>Як відбувається дистанційна робота</h2><ul class="seo-list-clean"><li>бриф і аналіз цілей сайту</li><li>карта сторінок та пошукових намірів</li><li>прототип і погодження контенту</li><li>дизайн у системі MAX SITE</li><li>адаптивна розробка й форми</li><li>технічна перевірка перед публікацією</li></ul></section>
    <section class="seo-band reveal"><span class="eyebrow">Контентне SEO</span><h2>Масштабуємо теми, а не копії</h2><p>Спочатку посилюємо основні сторінки послуг, потім — пріоритетні ніші й лише після цього географію з реальною цінністю. Рішення про index або noindex для слабких URL ухвалюємо після перевірки Search Console, попиту й контентного плану.</p></section>
    ${faqMarkup(ukraineFaq)}
    <section class="seo-links reveal"><h2>Пов’язані розділи</h2><div class="link-grid"><a href="/stvorennya-sajtiv-pid-klyuch/">Сайти під ключ</a><a href="/nishi/">Сайти за нішами</a><a href="/seo-sajt-pid-google/">SEO-структура</a><a href="/portfolio/">Кейси</a></div></section>
    ${leadMarkup("Потрібен сайт для роботи по Україні?", "Опишіть модель продажу, географію, послуги та плани щодо реклами або SEO. Сформуємо структуру без зайвих міських копій.")}
  </div>
</main>`,
});

const priceFaq = [
  ["Чому на сайті вказано ціну «від»?", "Тому що кількість сторінок, контент, інтеграції та складність дизайну відрізняються. Після брифу обсяг і точна ціна фіксуються до старту погоджених робіт."],
  ["Що не входить у стартову ціну?", "Окремо можуть оцінюватися великий каталог, CRM, оплати, складні калькулятори, переклад, масове наповнення та щомісячне просування. Це узгоджується до початку."],
  ["Чи входить SEO-просування у розробку?", "У розробку входить базова технічна й структурна підготовка відповідно до тарифу. Регулярне створення контенту, зовнішнє просування та робота з позиціями — окремий процес."],
  ["Коли потрібен тариф SEO Pro?", "Коли бізнес має кілька послуг або ніш і планує органічний пошук. На старті передбачено до 10 сторінок, FAQ, перелінковку, schema та підготовку блогу."],
];

updatePage({
  file: "blog/skilky-koshtuye-stvorennya-sajtu/index.html",
  title: "Скільки коштує створення сайту у 2026 році | MAX SITE",
  description: "Актуальні ціни MAX SITE у 2026 році: лендінг від 10 500 грн, бізнес-сайт від 19 700 грн, SEO Pro від 29 000 грн, магазин від 34 300 грн.",
  schema: [organization, breadcrumbs([["Головна", `${base}/`], ["Блог", `${base}/blog/`], ["Скільки коштує сайт", `${base}/blog/skilky-koshtuye-stvorennya-sajtu/`]]), { "@type": "Article", headline: "Скільки коштує створення сайту для бізнесу у 2026 році", description: "Розбір актуальних тарифів MAX SITE та чинників вартості розробки.", datePublished: "2026-07-18", dateModified: "2026-07-23", author: { "@id": `${base}/#organization` }, publisher: { "@id": `${base}/#organization` }, mainEntityOfPage: `${base}/blog/skilky-koshtuye-stvorennya-sajtu/` }, faqSchema(priceFaq)],
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/blog/">Блог</a></span><span>Вартість сайту</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Оновлено 23.07.2026</span><h1>Скільки коштує створення сайту для бізнесу</h1><p>Ціна залежить не від кількості «красивих блоків», а від задачі, структури, контенту, інтеграцій і рівня підготовки до реклами або SEO. Нижче — актуальні тарифи MAX SITE та межі комплектації.</p><div class="hero-buttons"><a class="btn" href="#prices">Переглянути ціни</a><a class="btn btn-ghost" href="#lead">Отримати розрахунок</a></div></div><aside class="seo-hero-card"><strong>від 10 500 грн</strong><p>Стартова ціна лендінгу. Точну суму фіксуємо після короткого брифу.</p></aside></section>
  <div class="seo-content">
    <article class="article-body reveal">
      <h2 id="prices">Актуальні тарифи MAX SITE</h2>
      <div class="seo-columns"><section class="seo-mini-card"><h3>Старт</h3><p><strong>від 10 500 грн</strong></p><p>Лендінг до 5–7 блоків для однієї пропозиції, форми, мобільна версія та базові мета-теги.</p></section><section class="seo-mini-card"><h3>Бізнес</h3><p><strong>від 19 700 грн</strong></p><p>Головна й до п’яти внутрішніх сторінок, послуги, форми, аналітична підготовка та SEO-структура.</p></section><section class="seo-mini-card"><h3>SEO Pro</h3><p><strong>від 29 000 грн</strong></p><p>До десяти сторінок на старті, FAQ, schema, перелінковка, Search Console і підготовка блогу.</p></section></div>
      <h2>Інтернет-магазин — від 34 300 грн</h2><p>Стартова комплектація передбачає головну, каталог, категорії, картки товарів, форму замовлення, адаптивність і базове SEO. Фільтри, онлайн-оплати, служби доставки, синхронізація складу та масове наповнення оцінюються після технічного брифу.</p>
      <h2>Що найбільше впливає на бюджет</h2><ul><li><strong>Карта сторінок.</strong> Одна рекламна пропозиція й сайт із десятьма пошуковими намірами мають різний обсяг.</li><li><strong>Контент.</strong> Готові перевірені тексти й фото скорочують підготовку; дослідження та написання потребують часу.</li><li><strong>Функції.</strong> Калькулятор, CRM, оплати, каталог і мультимовність оцінюються окремо.</li><li><strong>SEO-рівень.</strong> Базові мета-теги не дорівнюють повному контентному просуванню.</li><li><strong>Підтримка.</strong> Оновлення після запуску, реклама й аналітичні звіти є окремими послугами.</li></ul>
      <h2>Як отримати точну фіксовану ціну</h2><p>Потрібні п’ять відповідей: що продає бізнес, кому, скільки є послуг або товарів, звідки планується трафік і які системи треба підключити. Після цього визначаємо склад першої версії, строки й межі правок. Ціна «від» перетворюється на конкретну суму до початку погодженого обсягу.</p>
      <p><a href="/stvorennya-sajtiv-pid-klyuch/">Переглянути, що входить у створення сайту під ключ</a>.</p>
    </article>
    ${faqMarkup(priceFaq)}
    ${leadMarkup("Потрібен точний розрахунок?", "Опишіть тип сайту, кількість послуг або товарів, джерела трафіку та потрібні інтеграції. Запропонуємо комплектацію без непотрібних функцій.")}
  </div>
</main>`,
});

const choiceFaq = [
  ["Чи можна почати з лендінгу, а потім розширити сайт?", "Так, якщо заздалегідь передбачити структуру URL і компоненти. Важливо не будувати майбутній сайт навколо випадкового односторінкового шаблону."],
  ["Що краще для Google Ads?", "Для однієї чіткої пропозиції часто достатньо лендінгу. Для різних груп оголошень потрібні окремі релевантні посадкові сторінки."],
  ["Що краще для SEO?", "Корпоративний або сервісний багатосторінковий сайт дає більше простору для окремих намірів. Але кількість сторінок не допомагає, якщо вони дублюються й не мають цінності."],
  ["Яка різниця у вартості?", "Лендінг стартує від 10 500 грн, бізнес-сайт — від 19 700 грн. Точна різниця залежить від контенту, кількості послуг та інтеграцій."],
];

updatePage({
  file: "blog/lending-abo-korporatyvnyj-sajt/index.html",
  title: "Лендінг чи корпоративний сайт: що обрати бізнесу | MAX SITE",
  description: "Практичне порівняння лендінгу й корпоративного сайту: задачі, реклама, SEO, масштабування, строки та актуальні ціни MAX SITE.",
  schema: [organization, breadcrumbs([["Головна", `${base}/`], ["Блог", `${base}/blog/`], ["Лендінг чи корпоративний сайт", `${base}/blog/lending-abo-korporatyvnyj-sajt/`]]), { "@type": "Article", headline: "Лендінг чи корпоративний сайт: що обрати бізнесу", description: "Практичне порівняння двох форматів сайту для реклами, SEO та розвитку бізнесу.", datePublished: "2026-07-18", dateModified: "2026-07-23", author: { "@id": `${base}/#organization` }, publisher: { "@id": `${base}/#organization` }, mainEntityOfPage: `${base}/blog/lending-abo-korporatyvnyj-sajt/` }, faqSchema(choiceFaq)],
  main: `
<main class="section seo-page">
  <nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/blog/">Блог</a></span><span>Лендінг чи корпоративний сайт</span></nav>
  <section class="seo-hero reveal"><div><span class="eyebrow">Вибір формату</span><h1>Лендінг чи корпоративний сайт: що обрати</h1><p>Рішення залежить від кількості пропозицій, джерел трафіку й плану розвитку. Лендінг концентрує увагу на одній дії, багатосторінковий сайт розділяє послуги та пошукові наміри.</p><div class="hero-buttons"><a class="btn" href="#comparison">Порівняти</a><a class="btn btn-ghost" href="#lead">Підібрати формат</a></div></div><aside class="seo-hero-card"><strong>Головне питання</strong><p>Ви продаєте одну конкретну пропозицію чи кілька різних послуг для різних аудиторій?</p></aside></section>
  <div class="seo-content">
    <article class="article-body reveal" id="comparison">
      <h2>Коли обирати лендінг</h2><p>Лендінг доречний для запуску однієї послуги, рекламної кампанії, події або перевірки гіпотези. Всі блоки ведуть до одного основного кроку: заявки, дзвінка або покупки. Стартова ціна MAX SITE — від 10 500 грн.</p>
      <h3>Сильні сторони</h3><ul><li>коротший шлях до запуску;</li><li>сфокусований офер для конкретної аудиторії;</li><li>зручно тестувати рекламу й повідомлення;</li><li>простішe вимірювати одну основну конверсію.</li></ul>
      <h3>Обмеження</h3><p>Одна сторінка погано розділяє кілька різних послуг і пошукових намірів. Якщо бізнес росте, навігація й контент швидко стають перевантаженими.</p>
      <h2>Коли обирати корпоративний або бізнес-сайт</h2><p>Багатосторінковий формат потрібен, коли є кілька напрямів, команда, кейси, різні аудиторії або план системного SEO. Стартова ціна тарифу «Бізнес» — від 19 700 грн.</p>
      <h3>Сильні сторони</h3><ul><li>кожна послуга має власну посадкову;</li><li>легше пояснити компанію, процес і докази;</li><li>структуру можна розвивати нішами, кейсами й блогом;</li><li>різні рекламні кампанії ведуть на релевантні сторінки.</li></ul>
      <h2>Швидке дерево вибору</h2><div class="seo-columns"><section class="seo-mini-card"><h3>Одна пропозиція + реклама</h3><p>Почніть із лендінгу, але закладіть можливість майбутнього розширення.</p></section><section class="seo-mini-card"><h3>Кілька послуг</h3><p>Обирайте бізнес-сайт із окремими сторінками та зрозумілим меню.</p></section><section class="seo-mini-card"><h3>Ставка на органічний пошук</h3><p>Потрібна SEO-архітектура, унікальний контент і регулярний розвиток, а не просто більше URL.</p></section></div>
      <h2>Компромісний варіант</h2><p>Можна запустити сильну головну й 2–3 пріоритетні сторінки, а потім розширювати структуру за даними реклами й Search Console. Це безпечніше, ніж одразу публікувати десятки слабких шаблонів.</p>
      <p><a href="/stvorennya-lendingiv/">Детальніше про лендінги</a> · <a href="/korporatyvni-sajty/">Детальніше про корпоративні сайти</a></p>
    </article>
    ${faqMarkup(choiceFaq)}
    ${leadMarkup("Не впевнені у форматі?", "Розкажіть про послуги, аудиторії та джерела трафіку. Порадимо мінімальну структуру, яку не доведеться переробляти одразу після запуску.")}
  </div>
</main>`,
});

console.log("Updated 10 priority pages.");
