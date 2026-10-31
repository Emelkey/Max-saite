const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const baseline=require('../fixtures/priority-content-protected.json');
test('priority editorial changes preserve forms, executable scripts and existing project examples',()=>{
 for(const [p,expected] of Object.entries(baseline.pages)){
  const html=read(p);
  assert.equal(hash(JSON.stringify([...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map(m=>m[0]))),expected.forms,`${p}: forms`);
  assert.equal(hash(JSON.stringify([...html.matchAll(/<script\b(?![^>]*type=["']application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi)].map(m=>m[0]))),expected.scripts,`${p}: scripts`);
  if(expected.projectExamples)assert.equal(hash(html.match(/<section\b[^>]*id="project-examples"[^>]*>[\s\S]*?<\/section>/)[0]),expected.projectExamples,`${p}: project disclosure`);
 }
});
test('unverified cities stay unchanged, noindex and outside the sitemap and city hub',()=>{
 const cities=require('../../seo/cities.json'),sitemap=read('sitemap-cities.xml'),hub=read('mista/index.html');
 assert.equal(cities.filter(c=>c.index).length,7);
 assert.equal(Object.keys(baseline.deferredCities).length,16);
 for(const [p,expected] of Object.entries(baseline.deferredCities)){
  assert.equal(hash(read(p)),expected,p);
  const route='/'+p.replace('index.html',''),city=cities.find(c=>route.includes(`-${c.slug}/`));
  assert.equal(city.index,false);assert.equal(city.state,'noindex');
  assert.doesNotMatch(sitemap,new RegExp(route));assert.ok(!hub.includes(`href="${route}"`));
 }
 for(const c of cities.filter(c=>c.index))for(const slug of c.relatedCitySlugs||[])assert.ok(cities.find(x=>x.slug===slug)?.index,`${c.slug} links only published cities`);
});
test('priority city review dates, FAQ schema and useful internal links match rendered content',()=>{
 for(const slug of ['cherkasy','dnipro']){
  const html=read(`mista/stvorennya-sajtiv-${slug}/index.html`),graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  const date=html.match(/data-editorial-review="([^"]+)"/)[1];
  assert.equal(graph.find(n=>n['@type']==='WebPage').dateModified,date);
  assert.ok(read('sitemap-cities.xml').includes(`<loc>https://maxsite.com.ua/mista/stvorennya-sajtiv-${slug}/</loc><lastmod>${date}</lastmod>`));
  assert.equal(graph.find(n=>n['@type']==='FAQPage').mainEntity.length,(html.match(/<details>/g)||[]).length);
  for(const route of ['/blog/sajt-katalog-chy-internet-magazyn/','/blog/skilky-tryvaye-rozrobka-sajtu/'])assert.ok(html.includes(`href="${route}"`));
 }
 const cherkasy=read('mista/stvorennya-sajtiv-cherkasy/index.html'),dnipro=read('mista/stvorennya-sajtiv-dnipro/index.html');
 assert.match(cherkasy,/не перелік наших місцевих клієнтів/);assert.match(cherkasy,/Сторінки додаткових послуг чи міст не входять автоматично/);
 assert.match(dnipro,/Що отримаєте до початку розробки/);assert.match(dnipro,/Не заявляємо фізичний офіс у Дніпрі/);
});
