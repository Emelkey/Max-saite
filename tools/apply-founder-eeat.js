#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'zasnovnyk', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const marker = '<section class="seo-lead reveal" id="lead">';
const trust = `<section class="seo-band"><span class="eyebrow">Роль у проєкті</span><h2>Зони відповідальності</h2><ul class="seo-list-clean"><li>Перетворення бізнес-задачі на структуру сторінок і сценарії звернення</li><li>Погодження пріоритетів, етапів і меж робіт</li><li>Контроль адаптивності, форм, аналітики й технічної SEO-основи</li><li>Production-перевірка та передача погоджених доступів</li></ul></section><section class="seo-columns"><article class="seo-mini-card"><h2>Доступи</h2><p>Домен, код, GA4, Search Console і рекламні акаунти мають контролюватися клієнтом. Доступ надається за роллю та може бути відкликаний власником.</p></article><article class="seo-mini-card"><h2>Комунікація</h2><p>Рішення, матеріали та зміни погоджуються в узгодженому каналі. Значущі зміни обсягу або бюджету фіксуються до виконання.</p></article><article class="seo-mini-card"><h2>Відповідальність</h2><p>Період технічних виправлень, подальша підтримка й умови оплати визначаються у пропозиції або договорі конкретного проєкту.</p></article></section><section class="seo-band"><span class="eyebrow">Доказовість</span><h2>Що ми не підміняємо маркетингом</h2><p>Не публікуємо вигадані роки досвіду, сертифікати, команду, офіси, відгуки, позиції або кількість заявок. Повне публічне ім’я засновника й юридичні реквізити будуть додані лише після письмового підтвердження; цей пропуск зафіксовано у внутрішньому реєстрі доказів.</p><p><a href="/portfolio/">Перевірити реалізовані кейси</a> · <a href="/qa-checklist/">Переглянути контроль якості</a></p></section>`;

if (!html.includes('Роль у проєкті')) {
  html = html.replace(marker, `${trust}${marker}`);
}

fs.writeFileSync(file, html);
console.log('Founder E-E-A-T blocks updated.');
