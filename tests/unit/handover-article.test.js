const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const route='/blog/peredacha-saytu-vlasnyku-dostupy-kod-domen/';
test('handover guide is original, dated, linked and has matching schema',()=>{
 const html=fs.readFileSync('.'+route+'index.html','utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/навчальний приклад/);assert.match(html,/datetime="2026-10-26"/);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
 assert.equal(graph.find(x=>x['@type']==='Article').datePublished,'2026-10-26');
 assert.equal(graph.find(x=>x['@type']==='WebPage').url,'https://maxsite.com.ua'+route);
 assert.ok(!graph.some(x=>x['@type']==='FAQPage'));
 for(const f of ['blog/index.html','blog/shcho-vhodyt-u-sajt-pid-klyuch/index.html','sitemap-blog.xml'])assert.ok(fs.readFileSync(f,'utf8').includes(route));
 assert.match(html,/href="\/obgovoryty-proiekt\/\?format=website"/);
 assert.ok(!html.includes('Сайт-каталог чи інтернет-магазин'));
});
