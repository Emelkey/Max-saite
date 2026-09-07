#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "..", "blog", "nextjs-chy-wordpress", "index.html");
let html = fs.readFileSync(file, "utf8");
const marker = '<section class="seo-band"><h2>Застосувати до свого проєкту</h2>';
const section = `<section class="seo-band" id="platformy-dlya-magazynu"><h2>Next.js, WordPress, Shopify чи Horoshop: матриця рішення</h2><p>Це не рейтинг платформ. Спочатку фіксуємо каталог, редакторів, оплати, доставки, маркетплейси, B2B-ціни, інтеграції та допустимий щомісячний бюджет, а потім перевіряємо обмеження кожного варіанта на короткому технічному прототипі.</p><div class="comparison-scroll" role="region" aria-label="Порівняння платформ" tabindex="0"><table class="comparison-table"><thead><tr><th>Варіант</th><th>Коли перевіряти першим</th><th>Що закласти у повну вартість</th><th>Критична перевірка до договору</th></tr></thead><tbody><tr><th>Next.js + CMS</th><td>Нестандартні кабінети, інтеграції або контрольований інтерфейс</td><td>Розробка, CMS, хостинг, моніторинг, підтримка залежностей</td><td>Preview, публікація, кеш, серверні функції та передача коду</td></tr><tr><th>WordPress / WooCommerce</th><td>Контент і магазин редагує команда, потрібна гнучка екосистема</td><td>Хостинг, тема, плагіни, оновлення, резервні копії та безпека</td><td>Платіжні й логістичні модулі, навантаження, ролі та план оновлень</td></tr><tr><th>Shopify</th><td>Потрібен керований SaaS-магазин і підходять доступні канали продажу</td><td>Тариф, застосунки, тема, транзакційні умови й локальні інтеграції</td><td>Доступність оплат в Україні, доставка, валюти, експорт даних і редиректи</td></tr><tr><th>Horoshop</th><td>Український магазин із готовими оплатами, доставками й фідами</td><td>Абонплата, пакет за обсягом каталогу, дизайн та нестандартні доробки</td><td>Ліміти тарифу, API, B2B-сценарії, міграція каталогу й SEO-URL</td></tr></tbody></table></div><p><a class="btn btn-ghost" href="/assets/downloads/platform-tco-comparison.csv" download>Завантажити таблицю TCO для свого проєкту</a></p><h3>Як рахувати TCO без самообману</h3><p>Порівнюйте не лише стартову ціну. У таблиці зафіксуйте разові роботи, 12 місяців тарифів і хостингу, платні модулі, комісії, підтримку, резервування, контент, інтеграції та вартість можливої міграції. Невідоме позначайте як «потрібна пропозиція», а не нулем.</p><h3>Офіційні джерела для повторної перевірки</h3><ul><li><a href="https://nextjs.org/docs/app/getting-started/deploying" target="_blank" rel="noopener noreferrer">Next.js: варіанти розгортання</a></li><li><a href="https://woocommerce.com/documentation/woocommerce/" target="_blank" rel="noopener noreferrer">WooCommerce: офіційна документація</a></li><li><a href="https://www.shopify.com/pricing" target="_blank" rel="noopener noreferrer">Shopify: тарифи й склад планів</a></li><li><a href="https://horoshop.ua/ua/prices/" target="_blank" rel="noopener noreferrer">Horoshop: актуальні тарифи й ліміти</a></li></ul><p>Склад тарифів та доступність функцій змінюються. Джерела перевірено 06.09.2026; перед кошторисом їх потрібно відкрити повторно.</p></section>`;

if (!html.includes('id="platformy-dlya-magazynu"')) {
  if (!html.includes(marker)) throw new Error("Platform comparison insertion marker is missing");
  html = html.replace(marker, `${section}${marker}`);
  fs.writeFileSync(file, html);
  console.log("Added the MASTER 4.0 platform and TCO comparison.");
} else {
  console.log("MASTER 4.0 platform comparison already exists.");
}
