const {test}=require('node:test');
const assert=require('node:assert/strict');
const {enhanceInstagramShell}=require('../../tools/lib/instagram-shell');
const fs=require('node:fs');
for(const file of ['kontakty/index.html','stvorennya-saytiv/index.html','blog/nextjs-chy-wordpress/index.html']){
  test(`Instagram shell is accessible and idempotent: ${file}`,()=>{
    const source=fs.readFileSync(file,'utf8');
    const result=enhanceInstagramShell(source);
    assert.match(result, /class="instagram-link instagram-nav"/);
    assert.match(result, /aria-label="Instagram MAX SITE @maxlab.ai \(нова вкладка\)"/);
    assert.equal(enhanceInstagramShell(result),result);
    assert.equal((result.match(/class="instagram-link instagram-nav"/g)||[]).length,1);
    assert.ok(result.includes('rel="noopener noreferrer"'));
    // No other source content is rewritten by the shared enhancement.
    assert.equal(result.replace(/<a class="instagram-link instagram-nav"[\s\S]*?<\/a>/,'').replace(/<a class="instagram-link "[\s\S]*?<\/a>/g,'<a href="https://www.instagram.com/maxlab.ai/">Instagram</a>'),source);
  });
}
test('Homepage and redirects remain unchanged by the legacy shell',()=>{
 for(const file of ['index.html','stvorennya-saytu-dlya-biznesu/index.html']){
  const source=fs.readFileSync(file,'utf8');
  if(!source.includes('class="site-header"'))assert.equal(enhanceInstagramShell(source),source);
 }
});
