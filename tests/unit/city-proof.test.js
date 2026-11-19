const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const content=require('../../seo/city-wave1-content.json');
const cities=require('../../seo/cities.json');
const baseline=require('../fixtures/city-proof-protected.json');
const read=slug=>fs.readFileSync(`mista/stvorennya-sajtiv-${slug}/index.html`,'utf8');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
test('city proof preserves all existing city index policy, canonicals and lead forms',()=>{
 for(const city of cities){
  const h=read(city.slug), old=baseline[city.slug];
  assert.equal(city.index,old.index);
  assert.equal(h.match(/<meta name="robots"[^>]+>/)[0],old.robots);
  assert.equal(h.match(/<link rel="canonical"[^>]+>/)[0],old.canonical);
  assert.equal(hash(h.match(/<form\b[\s\S]*?<\/form>/i)?.[0]||''),old.form);
 }
});
test('Cherkasy has three verifiable live steps without invented result metrics',()=>{
 const h=read('cherkasy');const section=h.match(/<section[^>]+id="cherkasy-live-service-path"[\s\S]*?<\/section>/)[0];
 for(const url of ['prybyrannya-pislya-remontu-cherkasy','prices','kontakty#contact-form']) assert.ok(section.includes(`href="https://www.formula-chistoty.ck.ua/${url}"`));
 assert.ok(section.includes('пов’язаний із власником MAX SITE'));
 assert.ok(section.includes('не доводить кількість заявок'));
 assert.ok(section.includes('href="#lead"'));
});
test('Dnipro sample stays illustrative and matches the content source',()=>{
 const h=read('dnipro');
 for(const section of content.dnipro.sections.slice(1,3)){
  assert.ok(h.includes(`<h2>${section.heading}</h2>`));
  for(const paragraph of section.paragraphs) assert.ok(h.includes(`<p>${escape(paragraph)}</p>`));
 }
 assert.ok(h.includes('Умовний приклад для обговорення, не товар у продажу й не виконаний кейс'));
 assert.ok(h.includes('а не оформлене замовлення'));
});
test('only reviewed cities have synchronized review and sitemap dates',()=>{
 const sitemap=fs.readFileSync('sitemap-cities.xml','utf8');
 for(const slug of ['cherkasy','dnipro']){
  const h=read(slug);assert.ok(h.includes('data-editorial-review="2026-11-19"'));
  const graph=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.equal(graph.find(n=>n['@type']==='WebPage').dateModified,'2026-11-19');
  assert.equal(cities.find(c=>c.slug===slug).updatedAt,'2026-11-19');
  assert.ok(sitemap.includes(`<loc>https://maxsite.com.ua/mista/stvorennya-sajtiv-${slug}/</loc><lastmod>2026-11-19</lastmod>`));
 }
});
