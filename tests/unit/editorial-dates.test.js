const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');

test('substantively reviewed articles align visible date, schema and sitemap',()=>{
  const sitemap=fs.readFileSync(path.join(root,'sitemap-blog.xml'),'utf8');
  let reviewed=0;
  for(const entry of fs.readdirSync(path.join(root,'blog'),{withFileTypes:true})){
    if(!entry.isDirectory())continue;
    const html=fs.readFileSync(path.join(root,'blog',entry.name,'index.html'),'utf8');
    if(!html.includes('data-master4-editorial'))continue;
    reviewed++;
    const date=html.match(/data-master4-editorial[\s\S]*?<time\b[^>]*datetime="([^"]+)"/)[1];
    const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const article=graph['@graph'].find(node=>[].concat(node['@type']).includes('Article'));
    assert.equal(article.dateModified,date,entry.name);
    assert.ok(sitemap.includes(`<loc>https://maxsite.com.ua/blog/${entry.name}/</loc><lastmod>${date}</lastmod>`),entry.name);
  }
  assert.equal(reviewed,16);
});
