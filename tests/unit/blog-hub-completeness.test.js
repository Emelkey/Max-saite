const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
test('blog hub links directly to every published sitemap article',()=>{
 const hub=fs.readFileSync(path.join(root,'blog/index.html'),'utf8');
 const sitemap=fs.readFileSync(path.join(root,'sitemap-blog.xml'),'utf8');
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname).filter(p=>p!='/blog/');
 assert.equal(urls.length,32);
 for(const url of urls)assert.ok(hub.includes(`href="${url}"`),`Missing hub link: ${url}`);
 assert.ok(hub.includes(fs.readFileSync(path.join(root,'tests/fixtures/blog-decision-guides.txt'),'utf8')));
});
