#!/usr/bin/env node

const fs=require('fs');
const path=require('path');
const file=path.resolve(__dirname,'..','nishi','index.html');
let html=fs.readFileSync(file,'utf8');
const marker='<section class="seo-lead" id="lead">';
const faq=`<section class="seo-band faq-list reveal" id="faq"><span class="eyebrow">FAQ</span><h2>Питання про сайти для різних ніш</h2><details><summary>Скільки коштує створення сайту?</summary><p>Стартові тарифи починаються від 10 500 грн. Фінальна ціна залежить від типу сайту, кількості сторінок, дизайну, текстів і SEO-структури.</p></details><details><summary>Скільки часу займає розробка сайту?</summary><p>Лендінг можна запустити швидше, а корпоративний сайт або SEO-сайт потребує більше часу через структуру, тексти й перевірки.</p></details><details><summary>Чи буде сайт адаптований під телефон?</summary><p>Так, усі сайти адаптуються під мобільні телефони, планшети та комп’ютери.</p></details><details><summary>Чи можна просувати сайт у Google?</summary><p>Так, ми одразу закладаємо SEO-структуру, FAQ, мета-теги, швидкість і підключення Search Console.</p></details><details><summary>Чи можна підключити рекламу?</summary><p>Так, сайт можна підготувати під Google Ads, а також підключити аналітику для контролю заявок.</p></details></section>`;
if (!html.includes('Питання про сайти для різних ніш')) html=html.replace(marker,`${faq}${marker}`);
fs.writeFileSync(file,html);
console.log('Visible niche FAQ added.');
