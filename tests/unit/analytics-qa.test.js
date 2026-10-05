const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/consent.js','utf8');
const run=(search='',storage=new Map(),broken=false)=>{
  const window={};
  vm.runInNewContext(source,{
    window,location:{origin:'https://maxsite.com.ua',pathname:'/',search},
    localStorage:{getItem:()=>null},
    sessionStorage:{getItem:k=>{if(broken)throw Error();return storage.get(k);},setItem:(k,v)=>{if(broken)throw Error();storage.set(k,v);},removeItem:k=>{if(broken)throw Error();storage.delete(k);}},
    document:{referrer:'',addEventListener(){}},URL,URLSearchParams,Date
  });
  return window;
};

test('only deliberate QA is excluded, with tab-local navigation persistence',()=>{
  for(const query of ['?maxsite_qa=1','?utm_source=codex_qa&utm_medium=test','?utm_source=codex_qa&utm_medium=qa']){
    const storage=new Map();
    assert.equal(run(query,storage).MAX_SITE_QA,true);
    assert.equal(run('',storage)['ga-disable-G-TS8DMMKK34'],true);
    assert.equal(run('?maxsite_qa=0',storage).MAX_SITE_QA,false);
    assert.equal(run('',storage).MAX_SITE_QA,false);
  }
});

test('genuine campaigns and all supported ad identifiers override and clear QA',()=>{
  for(const query of ['utm_source=google&utm_medium=cpc','utm_source=newsletter','utm_campaign=launch',...['gclid','gbraid','wbraid','gad_source','gad_campaignid','gclsrc'].map(k=>`${k}=click`)]){
    const storage=new Map([['max_site_qa_v1','1']]);
    const window=run(`?maxsite_qa=1&${query}`,storage);
    assert.equal(window.MAX_SITE_QA,false,query);
    assert.equal(window['ga-disable-G-TS8DMMKK34'],undefined,query);
    assert.equal(storage.has('max_site_qa_v1'),false,query);
  }
  assert.equal(run('?utm_source=codex_qa&utm_medium=test&gclid=click').MAX_SITE_QA,false);
});

test('generic test labels and storage failure do not suppress genuine visits',()=>{
  for(const query of ['', '?qa=true', '?test=1', '?utm_medium=test', '?utm_source=codex_qa']){
    assert.equal(run(query).MAX_SITE_QA,false,query);
  }
  assert.equal(run('?maxsite_qa=1',new Map(),true).MAX_SITE_QA,true);
  assert.equal(run('?maxsite_qa=0&utm_source=codex_qa&utm_medium=qa',new Map(),true).MAX_SITE_QA,false);
  assert.equal(run('?utm_source=google&utm_medium=cpc',new Map(),true).MAX_SITE_QA,false);
});

test('live diagnostic intercepts collection before navigation and cannot claim transport',()=>{
  const source=fs.readFileSync('tools/verify-live-ga4.js','utf8');
  assert.ok(source.indexOf("context.route('**/*'")<source.indexOf('page.goto(PAGE'));
  assert.match(source,/intercepted:true/);
  assert.match(source,/route\.fulfill\(\{status:204/);
  assert.match(source,/report\.transportConfirmed=false/);
  assert.match(source,/return route\.abort\(\)/);
});
