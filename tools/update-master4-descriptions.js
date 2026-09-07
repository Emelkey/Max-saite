#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const descriptions = {
  "/blog/canonical-url-prostymy-slovamy/": "Що таке canonical URL, коли потрібен self-canonical, як дублікати впливають на Google і як перевірити канонічні сторінки без технічних помилок.",
  "/blog/chomu-sajt-bez-seo-ne-daye-rezultatu/": "Чому красивого дизайну недостатньо: пояснюємо, як SEO-структура, технічна база, корисний контент і вимірювання допомагають сайту працювати в Google.",
  "/blog/ga4-konversiyi-dlya-sajtu/": "Які події GA4 налаштувати для форм, телефону, месенджерів, цін і портфоліо, як уникнути дублів та не передавати персональні дані користувачів.",
  "/blog/google-ads-dlya-biznesu/": "Коли бізнесу варто запускати Google Ads, що підготувати до старту, як вимірювати заявки, чистити пошукові запити й контролювати рекламний бюджет.",
  "/blog/google-analytics-search-console/": "Як Google Analytics 4 і Search Console допомагають контролювати трафік, заявки, індексацію та помилки сайту. Практичний список перевірок MAX SITE.",
  "/blog/landing-dlya-google-ads/": "Як підготувати лендінг для Google Ads: відповідність запиту, структура пропозиції, швидкість, докази, мобільні CTA та коректне вимірювання заявок.",
  "/blog/nextjs-chy-wordpress/": "Порівнюємо Next.js і WordPress за бюджетом, швидкістю, SEO, безпекою, редагуванням та інтеграціями, щоб обрати технологію під задачі бізнесу.",
  "/blog/pidtrymka-saytu-pislya-zapusku/": "Що перевіряти після запуску сайту щотижня й щомісяця: форми, аналітику, резервні копії, безпеку, швидкість, індексацію та актуальність контенту.",
  "/blog/redesign-saytu-bez-vtraty-seo/": "Як оновити дизайн і структуру сайту без втрати SEO: інвентаризація URL, 301, canonical, контент, аналітика, тестування та контроль після релізу.",
  "/blog/sajt-dlya-kliningovoyi-kompaniyi/": "Що має бути на сайті клінінгової компанії: сторінки послуг, ціни, власні фото, докази, FAQ, мобільні заявки, локальне SEO та Google Ads.",
  "/blog/seo-first-pidhid/": "SEO-first підхід MAX SITE: як розподілити наміри між URL, спроєктувати структуру, закласти аналітику й підготувати сайт до Google ще до дизайну.",
  "/blog/struktura-sajtu-dlya-seo/": "Як створити SEO-структуру сайту: карта запитів і URL, сторінки послуг, кластери, перелінковка та перевірка канібалізації перед публікацією.",
  "/blog/tehnichne-seo-cheklist/": "Технічний SEO-чекліст MAX SITE: canonical, sitemap, robots, schema, 404, редиректи, швидкість, мобільна версія та перевірка перед production.",
  "/blog/vnutrishnya-perelinkovka/": "Як пов’язати послуги, ніші, міста, кейси та статті без спаму ключовими словами: логіка анкорів, пріоритетні сторінки й перевірка сиріт.",
  "/blog/yak-pidgotuvaty-biznes-do-zapusku-sajtu/": "Що бізнесу підготувати до створення сайту: послуги, аудиторію, тексти, власні фото, кейси, ціни, FAQ, інтеграції та критерії готовності.",
  "/blog/yak-pidgotuvaty-bryf-na-sajt/": "Як підготувати бриф на сайт: питання про бізнес-цілі, аудиторію, послуги, докази, функції, інтеграції, контент, бюджет і відповідальних.",
  "/blog/yak-sajt-dopomagaye-otrymuvaty-zayavky/": "Як сайт перетворює трафік із Google, реклами, соцмереж і рекомендацій у заявки: структура пропозиції, довіра, CTA, швидкість та аналітика.",
  "/blog/yakyj-sajt-potriben-lokalnomu-biznesu/": "Який сайт потрібен локальному бізнесу: вибір формату, сторінки послуг, чесна географія, контакти, відгуки, локальне SEO та підготовка до реклами.",
  "/nishi/sajt-dlya-avtoservisu/": "Створення сайтів для автосервісів: ремонт, діагностика, прайс, запис, фото робіт, локальна SEO-структура, аналітика та підготовка Google Ads.",
  "/nishi/sajt-dlya-eksperta/": "Створення сайтів для експертів, консультантів і фахівців: послуги, програми, кейси, авторська довіра, заявки, аналітика та SEO-структура.",
  "/nishi/sajt-dlya-kursiv/": "Створення сайтів для курсів: програма, спікери, тарифи, оплати, заявки, аналітика й SEO. Підбираємо структуру під формат навчального продукту.",
  "/nishi/sajt-dlya-magazynu/": "Створення сайтів для магазинів: каталог, категорії, фільтри, оплата, доставка, аналітика, SEO-структура та зручний шлях покупця на мобільному.",
  "/nishi/sajt-dlya-medychnyh-poslug/": "Створення сайтів для медичних центрів, лікарів і клінік: послуги, фахівці, онлайн-запис, докази, FAQ, аналітика й коректна SEO-структура.",
  "/nishi/sajt-dlya-remontnyh-poslug/": "Створення сайтів для ремонтних послуг: напрямки робіт, кошторис, приклади, ціни, заявки, локальна SEO-структура та аналітика звернень.",
  "/nishi/sajt-dlya-salonu-krasy/": "Створення сайтів для салонів краси: послуги, майстри, ціни, портфоліо, онлайн-запис, мобільні CTA, локальне SEO та підготовка реклами.",
  "/pidtrymka-saytiv/": "Підтримка сайтів MAX SITE: оновлення, виправлення, резервні копії, контроль форм, аналітики, індексації, безпеки та швидкості після запуску.",
  "/polityka-konfidentsijnosti/": "Політика конфіденційності MAX SITE: які контактні й технічні дані обробляються у формах, для чого вони потрібні, як зберігаються та видаляються.",
  "/qa-checklist/": "Публічний QA-чекліст MAX SITE: SEO, мобільна версія, форми, аналітика, доступність, безпека, швидкість і production-перевірка перед запуском.",
  "/redesign-saytu/": "Редизайн сайту зі збереженням важливих URL, контенту, аналітики та SEO-сигналів. План міграції, мобільний UX, перевірка й контроль після запуску.",
  "/sajty-dlya-poslug/": "Створення сайтів для бізнес-послуг: окремі сторінки напрямів, докази, ціни, FAQ, мобільні форми, SEO-структура та аналітика заявок.",
  "/sayt-vizytka/": "Створення компактного сайту-візитки: чітка пропозиція, послуги, контакти, мобільна версія, базове SEO, аналітика та зручний спосіб звернення.",
  "/seo-first/": "SEO-first розробка MAX SITE: структура запитів і URL, контент, технічні вимоги, аналітика та перевірки закладаються ще до початку дизайну.",
  "/stvorennya-internet-mahazynu/": "Створення інтернет-магазинів: каталог, фільтри, кошик, оплата, доставка, аналітика, адаптивний інтерфейс і SEO-структура для категорій товарів.",
  "/tehnichne-seo/": "Технічне SEO MAX SITE: аудит індексації, canonical, sitemap, robots, schema, швидкості, дублів, 404 та внутрішніх посилань із планом виправлень.",
  "/zasnovnyk/": "Засновник MAX SITE координує структуру, комунікацію, SEO-підготовку, QA та запуск. Дізнайтеся про принципи роботи й особисту відповідальність.",
};

function fileForRoute(route) {
  return route === "/" ? path.join(root, "index.html") : path.join(root, route.replace(/^\//, ""), "index.html");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let updatedFiles = 0;
for (const [route, description] of Object.entries(descriptions)) {
  if (description.length < 110 || description.length > 170) {
    throw new Error(`${route}: description length ${description.length} outside 110–170`);
  }
  const file = fileForRoute(route);
  if (!fs.existsSync(file)) throw new Error(`${route}: file missing`);
  const html = fs.readFileSync(file, "utf8");
  const old = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1];
  if (!old) throw new Error(`${route}: meta description missing`);
  const updated = html.replace(new RegExp(escapeRegExp(old), "g"), description);
  if (updated === html) throw new Error(`${route}: description was not changed`);
  fs.writeFileSync(file, updated);
  updatedFiles += 1;
}

console.log(`Updated ${updatedFiles} short descriptions.`);
