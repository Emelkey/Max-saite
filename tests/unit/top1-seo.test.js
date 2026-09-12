const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {apply,validate}=require('../../tools/render-contextual-links');
const {csv,route,grams,similarity}=require('../../tools/top1-route-audit');
const root=path.resolve(__dirname,'../..');
test('hosting audit permits GitHub evidence but rejects obsolete production bases',()=>{
  const {hasLegacyHostingReference:legacy}=require('../../tools/lib/legacy-hosting');
  assert.equal(legacy('<a href="https://github.com/Emelkey/Max-saite/actions/runs/34163771789">Evidence</a>'),false);
  assert.equal(legacy('<a href="/stvorennya-saytiv/">Service</a>'),false);
  for(const href of ['/Max-saite/styles.css','https://maxsite.com.ua/Max-saite/','https://emelkey.github.io/Max-saite/','https://maxsite.ua/'])assert.equal(legacy(`<a href="${href}">Old</a>`),true,href);
});
test('local and preview hosts disable production GA before automatic pageviews',()=>{
  const vm=require('node:vm'),source=fs.readFileSync(path.join(root,'assets/consent.js'),'utf8');
  for(const hostname of ['127.0.0.1','localhost','preview.example','maxsite.com.ua']){
    const window={};const context={window,location:{hostname,origin:`https://${hostname}`,pathname:'/'},localStorage:{getItem:()=>null},sessionStorage:{removeItem(){}},document:{referrer:'',addEventListener(){}},URL,Date};
    vm.runInNewContext(source,context);
    assert.equal(window['ga-disable-G-TS8DMMKK34'],hostname==='maxsite.com.ua'?undefined:true);
    assert.equal(window.MAX_SITE_CONSENT.analytics_storage,'denied');
  }
});
test('research article contains its measured SERP, not the catalogue template',()=>{
  const html=fs.readFileSync(path.join(root,'blog/analiz-google-stvorennya-sajtiv-kyiv/index.html'),'utf8');
  assert.ok(html.includes('Десять результатів за'));
  assert.ok(html.includes('/assets/downloads/top1/kyiv-organic-serp-2026-09-12.json'));
  assert.ok(!html.includes('Практичний гайд для fashion ecommerce'));
  assert.ok(!html.includes('Питання про підготовку каталогу одягу'));
  const evidence=require('../../seo/evidence/top1-20260912-organic-serp.json');
  assert.equal(evidence.queries.length,15);
  assert.equal(evidence.queries.find(q=>q.query==='створення сайтів київ').organic.length,10);
});
test('all five new practical checklists are discoverable from the QA hub',()=>{
  const html=fs.readFileSync(path.join(root,'qa-checklist/index.html'),'utf8');
  for(const file of ['ecommerce-checkout-qa.md','service-lead-acceptance.md','seo-intent-owner-template.md','city-page-evidence-gate.md','seo-release-observation-log.md']){
    assert.ok(html.includes(`/assets/downloads/top1/${file}`),file);
    assert.ok(fs.statSync(path.join(root,'assets/downloads/top1',file)).size>500);
  }
});
test('editorial date is taken from a visible review, never the build date',()=>{const {editorialDate}=require('../../tools/lib/editorial-date');assert.equal(editorialDate('<p data-editorial-review="2026-09-10">Переглянуто <time datetime="2026-09-10">10 вересня</time></p>'),'2026-09-10');assert.equal(editorialDate('<p data-editorial-review="2026-09-10">No visible timestamp</p>'),undefined);assert.equal(editorialDate('<p>Undated content</p>'),undefined);assert.equal(editorialDate('<time datetime="2026-08-02">2 серпня</time><section data-master4-editorial><time datetime="2026-09-07">7 вересня</time></section>'),'2026-09-07');});
test('TOP1 intent owners are unique and point to existing canonical pages',()=>{const map=require('../../seo/top1-intent-map.json');assert.equal(new Set(map.owners.map(o=>o.primary.toLowerCase())).size,map.owners.length);for(const owner of map.owners){const html=fs.readFileSync(path.join(root,owner.url,'index.html'),'utf8');assert.ok(html.includes(`href="https://maxsite.com.ua${owner.url}"`));assert.ok(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));}});
test('context links are valid, static and generated exactly once',()=>{const map=require('../../seo/contextual-links.json');validate(map);for(const p of map.pages){const html=fs.readFileSync(path.join(root,p.source,'index.html'),'utf8');const generated=apply(html,p);assert.equal(apply(generated,p),generated);assert.equal((generated.match(/TOP1-CONTEXT:START/g)||[]).length,1);assert.equal(html,generated,`Run renderer for ${p.source}`);}});
test('context rendering escapes markup and rejects self/duplicate sources',()=>{const p={source:'/blog/a/',heading:'<unsafe>',intro:'A & B',links:[{url:'/stvorennya-saytiv/',label:'<link>'}]};const rendered=apply('<article class="article-body"><p>Original</p></article>',p);assert.ok(rendered.includes('&lt;unsafe&gt;'));assert.ok(rendered.includes('Original'));assert.throws(()=>validate({pages:[{...p,primary:'/blog/a/',links:[{url:'/blog/a/',label:'self'}]}]}));});
test('audit parsing preserves CSV quoted commas and final-slash routes',()=>{assert.deepEqual(csv('a,b\n"one,two","say ""hi"""\n'),[{a:'one,two',b:'say "hi"'}]);assert.equal(route('index.html'),'/');assert.equal(route('blog/example/index.html'),'/blog/example/');assert.equal(similarity(grams('one two three four five six'),grams('one two three four five six')),1);});
test('GSC baseline distinguishes property totals, query suppression and CTR percent',()=>{const b=require('../../seo/evidence/top1-20260910-gsc-baseline.json');for(const d of Object.values(b.datasets)){assert.equal(d.rows.length,new Set(d.rows.map(r=>JSON.stringify(r.keys))).size);assert.ok(!d.pagination.hasMore);for(const r of d.rows)assert.ok(Math.abs(r.ctr-100*r.clicks/r.impressions)<1e-7);}const sums=d=>d.rows.reduce((a,r)=>[a[0]+r.clicks,a[1]+r.impressions],[0,0]);assert.deepEqual(sums(b.datasets.daily),[1,2057]);assert.deepEqual(sums(b.datasets.devices),sums(b.datasets.daily));assert.deepEqual(sums(b.datasets.countries),sums(b.datasets.daily));assert.notDeepEqual(sums(b.datasets.query_pages),sums(b.datasets.daily));assert.equal(b.availability.ga4.connected,false);});

test('complete intent map covers every indexable route and prevents duplicate H1',()=>{
  const result=require('../../tools/top1-route-audit').audit();
  const map=require('../../seo/full-intent-map.json');
  assert.deepEqual(new Set(map.pages.map(p=>p.url)),new Set(result.rows.filter(r=>r.indexable).map(r=>r.route)));
  assert.equal(result.summary.unmappedIntents,0);
  assert.equal(result.summary.duplicateH1,0);
  for(const p of map.pages) assert.ok(p.secondary.length||p.secondaryNotApplicable,p.url);
});
test('context architecture covers article relationships, money niches and case next steps',()=>{
 const map=require('../../seo/contextual-links.json');
 for(const p of map.pages){
  const urls=p.links.map(l=>l.url);
  const blogs=urls.filter(u=>/^\/blog\/[^/]+\/$/.test(u));
  if(p.kind==='article'){assert.ok(blogs.length>=1&&blogs.length<=2,p.source);assert.ok(urls.includes(p.primary));}
  if(p.kind==='money'){
   assert.ok(blogs.length>=3&&blogs.length<=5,p.source);
   assert.ok(urls.filter(u=>u.startsWith('/nishi/')).length>=2,p.source);
   assert.ok(urls.some(u=>u.startsWith('/mista/')),p.source);
   assert.ok(urls.some(u=>u.startsWith('/portfolio/')),p.source);
  }
  if(p.kind==='case'){assert.ok(urls.includes('/kontakty/'));assert.ok(urls.some(u=>u.startsWith('/nishi/')||u.startsWith('/mista/')));}
 }
});
test('50-source study keeps traceable evidence and all rows visible',()=>{
 const data=require('../../assets/downloads/top1/studios-pricing-2026-09-12.json');
 const html=fs.readFileSync(path.join(root,'blog/skilky-koshtuye-stvorennya-sajtu/index.html'),'utf8');
 assert.equal(data.rows.length,50);assert.equal(new Set(data.rows.map(r=>new URL(r.sourceUrl).hostname.replace(/^www\./,''))).size,50);
 for(const row of data.rows){assert.equal(row.httpStatus,200);assert.match(row.sourceSha256,/^[a-f0-9]{64}$/);assert.ok(html.includes(row.company));assert.ok(html.includes(row.publishedPrice));}
 assert.equal(Object.values(data.counts).reduce((a,b)=>a+b,0),50);
});
test('city and niche main content does not regress to near-duplicate templates',()=>{
 const result=require('../../tools/top1-route-audit').audit();
 for(const r of result.rows.filter(r=>r.indexable&&(/^\/(nishi|mista)\/[^/]+\/$/.test(r.route)))){
  assert.equal(r.highSimilarityWith.filter(x=>/^\/(nishi|mista)\//.test(x.route)).length,0,`${r.route}: shared main-copy exceeds editorial review threshold`);
 }
});
