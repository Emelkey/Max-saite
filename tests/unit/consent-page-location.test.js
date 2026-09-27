const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve(__dirname,'../../assets/consent.js'),'utf8');
const landing='https://maxsite.com.ua/stvorennya-saytiv/';
const query='?utm_source=google&utm_medium=cpc&utm_campaign=maxsite_search&gclid=qa-click-id&gbraid=qa-braid&email=private%40example.test';

const run=(choice,search=query)=>{
  const window={};
  const context={
    window,
    location:{origin:'https://maxsite.com.ua',pathname:'/stvorennya-saytiv/',search},
    localStorage:{getItem:()=>choice?JSON.stringify({choice,timestamp:Date.now()}):null},
    sessionStorage:{removeItem(){}},
    document:{referrer:'https://example.test/article/?email=private@example.test',addEventListener(){}},
    URL,URLSearchParams,Date
  };
  vm.runInNewContext(source,context);
  return window;
};

test('Google page location remains query-free before analytics consent',()=>{
  for(const choice of [null,'necessary']){
    const page=run(choice).MAX_SITE_GOOGLE_PAGE;
    assert.equal(page.page_location,landing);
    assert.equal(page.page_referrer,'https://example.test/article/');
  }
});

test('analytics consent exposes only safe campaign parameters, not click IDs or unrelated query',()=>{
  const page=run('analytics').MAX_SITE_GOOGLE_PAGE;
  assert.equal(page.page_location,`${landing}?utm_source=google&utm_medium=cpc&utm_campaign=maxsite_search`);
  assert.equal(page.page_referrer,'https://example.test/article/');
});

test('advertising consent permits allowlisted click IDs without arbitrary query or obvious PII',()=>{
  const page=run('all').MAX_SITE_GOOGLE_PAGE;
  assert.equal(page.page_location,`${landing}?utm_source=google&utm_medium=cpc&utm_campaign=maxsite_search&gclid=qa-click-id&gbraid=qa-braid`);
  const unsafe=run('all','?utm_source=private%40example.test&utm_campaign=%2B380000000000&gclid=qa-click-id&email=private%40example.test').MAX_SITE_GOOGLE_PAGE;
  assert.equal(unsafe.page_location,`${landing}?gclid=qa-click-id`);
  const phoneClick=run('all','?utm_source=google&gclid=380000000000&gbraid=qa-braid').MAX_SITE_GOOGLE_PAGE;
  assert.equal(phoneClick.page_location,`${landing}?utm_source=google&gbraid=qa-braid`);
});
