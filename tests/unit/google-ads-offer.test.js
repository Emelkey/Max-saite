const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../../google-ads/index.html'),'utf8');

test('Google Ads hero presents existing setup and monthly management prices separately',()=>{
  const hero=html.match(/<section class="seo-hero cro-hero">([\s\S]*?)<\/section>/)[1];
  assert.match(hero,/Налаштування: від 5 600 грн разово/);
  assert.match(hero,/Ведення: від 6 800 грн\/міс\./);
  assert.match(hero,/Рекламний бюджет сплачується окремо напряму Google\./);
  assert.match(hero,/<a class="btn" href="#lead">Обговорити рекламу<\/a>/);
  assert.match(html,/<h3>Разовий запуск<\/h3><p><strong>від 5 600 грн<\/strong>/);
  assert.match(html,/<h3>Google Ads Старт<\/h3><p><strong>від 6 800 грн \/ місяць<\/strong>/);
});

test('Google Ads contact copy advertises existing phone and Telegram validation with a text keyboard',()=>{
  const field=html.match(/<input name="phone"[^>]*>/)[0];
  for(const attribute of ['aria-label="Телефон або Telegram @username"','placeholder="Телефон або Telegram @username"','type="text"','inputmode="text"','autocapitalize="none"','spellcheck="false"','required']) assert.ok(field.includes(attribute),attribute);
  assert.doesNotMatch(field,/pattern=/,'Do not add a browser constraint that rejects Telegram usernames');
});
