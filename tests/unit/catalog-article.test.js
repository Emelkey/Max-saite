const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const route='/blog/sajt-katalog-chy-internet-magazyn/';
const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
const text=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

test('catalog-versus-store article has aligned metadata, four real FAQs and discoverability',()=>{
  const canonical='https://maxsite.com.ua'+route;
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const article=graph.find(n=>n['@type']==='Article');
  const faq=graph.find(n=>n['@type']==='FAQPage');
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`));
  assert.ok(html.includes('<meta name="robots" content="index, follow"'));
  assert.equal(article.mainEntityOfPage['@id'],canonical+'#webpage');
  assert.equal(article.datePublished,'2026-10-06');
  assert.equal(article.dateModified,'2026-10-06');
  assert.equal(article.headline,text(html.match(/<h1>(.*?)<\/h1>/)[1]));
  assert.equal(faq.mainEntity.length,4);
  const visible=[...html.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)];
  assert.equal(visible.length,4);
  faq.mainEntity.forEach((q,i)=>{
    assert.equal(q.name,text(visible[i][1]));
    assert.equal(q.acceptedAnswer.text,text(visible[i][2]));
  });
  const body=html.match(/<article class="article-body[^>]*>([\s\S]*?)<\/article>/)[1].replace(/<p class="article-author"[\s\S]*?<\/p>/,'');
  const words=text(body+' '+visible.map(m=>m[1]+' '+m[2]).join(' ')).split(' ').length;
  assert.ok(words>=900&&words<=1100,`Editorial word count: ${words}`);
  assert.equal((body.match(/Умовний приклад/g)||[]).length,2);
  assert.ok(fs.readFileSync(path.join(root,'blog/index.html'),'utf8').includes(`href="${route}"`));
  assert.ok(fs.readFileSync(path.join(root,'sitemap-blog.xml'),'utf8').includes(`<loc>${canonical}</loc><lastmod>2026-10-06</lastmod>`));
});
