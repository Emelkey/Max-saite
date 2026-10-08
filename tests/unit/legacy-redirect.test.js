const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const script=fs.readFileSync(path.join(root,'assets/legacy-redirect.js'),'utf8');
const mappings={
  '/stvorennya-lendingiv/':'/stvorennya-landing-page/',
  '/korporatyvni-sajty/':'/stvorennya-korporatyvnoho-saytu/',
  '/internet-magazyn-pid-klyuch/':'/stvorennya-internet-mahazynu/'
};
for(const [source,target] of Object.entries(mappings)) test(`legacy ${source} preserves attribution and has an honest fallback`,()=>{
  for(const pathname of [source,source+'index.html']){
    let replaced,href;
    const search='?utm_source=google&utm_medium=cpc&gclid=sample-click&wbraid=sample-braid';
    vm.runInNewContext(script,{location:{pathname,search,hash:'#lead',replace:value=>replaced=value},document:{querySelector:()=>({setAttribute:(key,value)=>href=value})}});
    assert.equal(replaced,target+search+'#lead');
    assert.equal(href,replaced);
  }
  const html=fs.readFileSync(path.join(root,source,'index.html'),'utf8');
  assert.match(html,/content="noindex, follow"/);
  assert.ok(html.includes(`rel="canonical" href="https://maxsite.com.ua${target}"`));
  assert.ok(html.includes(`href="${target}" data-legacy-destination`));
  assert.doesNotMatch(html,/10 500|googletagmanager|assets\/consent\.js/);
});
test('canonical pages and unknown paths cannot be redirected',()=>{
  for(const pathname of [...Object.values(mappings),'/unknown/']){
    let replaced=false;
    vm.runInNewContext(script,{location:{pathname,search:'?next=https://evil.example/',hash:'',replace:()=>replaced=true},document:{querySelector:()=>null}});
    assert.equal(replaced,false);
  }
});
