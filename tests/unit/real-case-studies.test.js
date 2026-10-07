const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cases=['formula-chystoty','fo-dez','b2b-clean-ukraine'];
for(const slug of cases){
 test(`${slug} has attributable scope, dated evidence and safe existing lead flow`,()=>{
  const html=read(`portfolio/${slug}/index.html`);
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1])['@graph'];
  const article=graph.find(n=>n['@type']==='Article');
  assert.equal(article.dateModified,'2026-10-07');
  assert.equal(article.url,`https://maxsite.com.ua/portfolio/${slug}/`);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  for(const id of ['case-task','case-solution','case-role','case-result','case-evidence','lead'])assert.ok(html.includes(`id="${id}"`),id);
  assert.match(html,/пов’язаний із власником MAX SITE/);
  assert.match(html,/не незалежний клієнтський відгук/);
  assert.match(html,/Заявки не надсилалися/);
  assert.match(html,/авторства кожної пізнішої зміни/);
  assert.match(html,/<time datetime="2026-10-07">7 жовтня 2026<\/time>/);
  assert.match(html,/class="case-intro case-study"/,'retain existing live-site analytics container');
  assert.match(html,/class="compact-form" action="#" method="post"/);
  assert.match(html,/name="consent"[^>]*required/);
  assert.match(html,/src="\/assets\/consent.js/);
  assert.match(html,/src="\/script.js/);
  assert.doesNotMatch(html,/<img[^>]*src="[^\"]*(?:formula|fodez)-(?:home|services|mobile|works|cta)\.webp"/);
  for(const other of cases.filter(x=>x!==slug))assert.ok(html.includes(`href="/portfolio/${other}/"`));
  for(const image of article.image)assert.ok(fs.existsSync(path.join(root,new URL(image).pathname)));
 });
}
test('new B2B case is discoverable and differentiates budget from business results',()=>{
 const html=read('portfolio/b2b-clean-ukraine/index.html');
 for(const route of ['https://b2bcleanukraine.com/calculator/','https://b2bcleanukraine.com/dlya-tenderiv/','https://b2bcleanukraine.com/quote/'])assert.ok(html.includes(`href="${route}"`));
 assert.match(html,/не дохід від сайту і не остаточний кошторис/);
 for(const p of ['index.html','portfolio/index.html','sitemap-cases.xml','seo/full-intent-map.json'])assert.ok(read(p).includes('portfolio/b2b-clean-ukraine/'),p);
 const article=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1])['@graph'].find(n=>n['@type']==='Article');
 assert.equal(article.datePublished,'2026-10-07');
});
test('historical Formula metric retains original date and no invented comparison',()=>{
 const html=read('portfolio/formula-chystoty/index.html');
 assert.match(html,/Мобільний лабораторний baseline 12\.09\.2026/);
 assert.match(html,/медіану LCP 1,75 с і CLS 0,7287/);
 assert.match(html,/не результат продажів і не CrUX p75/);
 assert.match(html,/Форма не завантажує фото/);
});
test('the case directory no longer labels schematic placeholder galleries as real screens',()=>{
 const html=read('portfolio/index.html');
 assert.doesNotMatch(html,/<div class="case-gallery">/);
 for(const slug of cases)assert.ok(html.includes(`href="/portfolio/${slug}/"`));
 assert.match(html,/Обкладинки «Формула Чистоти» та FO-DEZ ілюстративні/);
});
