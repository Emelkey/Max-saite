const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../stvorennya-internet-mahazynu/index.html");
let html = fs.readFileSync(file, "utf8");

const marker = '<section class="seo-band reveal" id="shop-readiness">';
const section = '<section class="seo-band reveal" id="shop-package-comparison"><span class="eyebrow">Порівняння</span><h2>Функції за форматом інтернет-магазину</h2><div class="comparison-table-wrap"><table class="comparison-table"><thead><tr><th>Функція</th><th>Каталог-заявка</th><th>Магазин</th><th>Магазин з інтеграціями</th></tr></thead><tbody><tr><td>Категорії та картки товарів</td><td>Так</td><td>Так</td><td>Так</td></tr><tr><td>Кошик і checkout</td><td>За потреби</td><td>Так</td><td>Так</td></tr><tr><td>Онлайн-оплата й доставка</td><td>Ні</td><td>Погоджені сервіси</td><td>Погоджені сервіси</td></tr><tr><td>CRM, облік, залишки</td><td>Ні</td><td>Опційно</td><td>Після перевірки API</td></tr><tr><td>Імпорт та оновлення товарів</td><td>Базове наповнення</td><td>CSV або погоджений формат</td><td>Автоматизований сценарій</td></tr><tr><td>Ecommerce-аналітика</td><td>Заявки</td><td>Основні кроки покупки</td><td>Розширені погоджені події</td></tr></tbody></table></div><p>Точну комплектацію фіксуємо в кошторисі до старту; назва формату не означає автоматичне включення будь-якої сторонньої інтеграції.</p></section>';

if (!html.includes('id="shop-package-comparison"')) {
  if (!html.includes(marker)) throw new Error("Shop readiness marker not found");
  html = html.replace(marker, `${section}${marker}`);
  fs.writeFileSync(file, html);
}

console.log("Internet shop comparison table is present.");
