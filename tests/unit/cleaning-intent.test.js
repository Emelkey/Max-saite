const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'nishi/sajt-dlya-kliningovoyi-kompaniyi/index.html'), 'utf8');
const section = id => html.match(new RegExp(`<section\\b[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/section>`))?.[0];

test('cleaning scope pairs current prices with explicit deliverables and exclusions', () => {
  const scope = section('cleaning-project-scope');
  assert.ok(scope);
  const prices = require('../../seo/service-pricing.json').prices;
  for (const service of ['Landing/Старт', 'Business']) {
    const value = prices.find(item => item.service === service).after;
    const formatted = new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2 }).format(value).replace(/\s/g, ' ');
    assert.ok(scope.includes(`${formatted} грн`));
  }
  assert.match(scope, /не ціни прибирання/);
  assert.match(scope, /оцінюються окремо/);
  assert.match(scope, /Карту й кількість сторінок фіксуємо в кошторисі/);
});

test('cleaning scenarios distinguish residential requests from commercial service contracts', () => {
  const intent = section('cleaning-customer-intent');
  assert.match(intent, /Житло: разове замовлення/);
  assert.match(intent, /Бізнес: регулярне обслуговування/);
  assert.match(intent, /не видається за підтверджене бронювання/);
  assert.match(intent, /не створюємо два однакові сайти/);
  for (const addedSection of [intent, section('cleaning-project-scope')]) {
    for (const [, href] of addedSection.matchAll(/href="(\/[^"]+)"/g)) {
      assert.ok(fs.existsSync(path.join(root, href, 'index.html')), href);
    }
  }
});

test('cleaning review date aligns with schema without changing owner-project disclosure', () => {
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const reviewed = html.match(/data-editorial-review="([^"]+)"/)[1];
  assert.equal(graph.find(node => node['@type'] === 'WebPage').dateModified, reviewed);
  assert.match(html, /«Формула Чистоти», FO-DEZ та B2B CLEAN UKRAINE — пов’язані з власником MAX SITE проєкти/);
  assert.match(html, /без незалежних відгуків або непідтверджених показників продажу/);
});
