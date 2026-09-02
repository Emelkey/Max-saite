const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const content = require('../seo/niche-content.json');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
for (const [slug, data] of Object.entries(content)) {
  const file = path.join(root, 'nishi', slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const form = html.match(/<form\b[\s\S]*?<\/form>/i)?.[0];
  if (!form) throw Error(`Missing lead form: ${slug}`);
  const main = `<main class="section seo-page">
<nav class="breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="/">Головна</a> / <a href="/nishi/">Ніші</a> / <span>${esc(data.name)}</span></nav>
<section class="seo-hero"><div><span class="eyebrow">Рішення для вашого бізнесу</span><h1>${esc(data.name)}</h1><p>${esc(data.intro)}</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити вимоги</a><a class="btn btn-ghost" href="/${data.service}/">Формат і вартість</a></div></div><aside class="seo-hero-card"><strong>${esc(data.price)}</strong><p>Орієнтир для базового формату. Каталог, кабінет, інтеграції, переклади й обсяг матеріалів оцінюємо окремо. Остаточний кошторис — після брифу.</p></aside></section>
${data.sections.map(s=>`<section class="seo-band"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('\n')}
<section class="seo-band"><h2>Що підготувати до оцінки</h2><ul class="seo-list-clean">${data.checklist.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p>Якщо частини матеріалів ще немає, визначимо, хто їх готує та як це впливає на строки. Не підміняємо відсутні документи, клієнтські результати чи фотографії вигаданими доказами.</p></section>
<section class="seo-band"><h2>Як зафіксуємо обсяг і приймання</h2><p>Після брифу погоджуємо карту сторінок, перелік функцій, матеріали від замовника й тестові сценарії. Спочатку перевіряємо прототип основного шляху користувача, потім дизайн та інтеграції. Для невеликого лендінгу орієнтир — 2–4 тижні, для багатосторінкового проєкту — 4–8 тижнів за своєчасного надання контенту. Складні кабінети й синхронізація потребують окремої оцінки.</p><p>У критерії приймання включаємо не лише головну сторінку: мобільне меню, форми, помилки, контакти, пошукові метадані та безпечну аналітику. Погоджуємо відповідальних за доступи, оновлення й підтримку після запуску. Рекламний бюджет, платні ліцензії та підписки не включаються автоматично в ціну розробки.</p></section>
<section class="seo-band"><h2>Приклад реалізації та межі досвіду</h2><p><a href="/portfolio/max-site/">Self-case MAX SITE</a> показує підхід до адаптивної структури, форм і технічного SEO. Це приклад нашої системи роботи, а не твердження про завершений клієнтський проєкт саме у вашій ніші. Інші перевірні роботи — у <a href="/portfolio/">портфоліо</a>.</p></section>
<section class="seo-band faq-list"><h2>Питання до початку розробки</h2>${data.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<section class="seo-links"><h2>Суміжні завдання</h2><div class="link-grid"><a href="/${data.service}/">Основна послуга для цього формату</a><a href="/stvorennya-program/">Інтеграції та програми</a><a href="/seo-sajt-pid-google/">Технічна SEO-підготовка</a><a href="/qa-checklist/">Чек-лист приймання сайту</a><a href="/nishi/">Інші бізнес-сценарії</a></div></section>
<section class="seo-lead" id="lead"><div><span class="eyebrow">Заявка</span><h2>Почнемо з вашого процесу</h2><p>Опишіть бізнес, потрібні функції та наявні системи. Підготуємо перелік питань і доречний формат без зайвих модулів.</p><p><a href="tel:+380972692322">097 269 23 22</a> · <a href="https://t.me/MaxMytt">Telegram</a></p></div>${form}</section></main>`;
  html = html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, main);
  fs.writeFileSync(file, html);
}
console.log('Updated five existing niche pages; no new URLs.');
