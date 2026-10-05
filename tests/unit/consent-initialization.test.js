const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/consent.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const inline=Array.from(html.matchAll(/<script>([\s\S]*?)<\/script>/g),m=>m[1]).find(s=>s.includes("gtag('config'"));
const id='G-TS8DMMKK34';
const boot=(choice,{staticTag=true,inlineConfig=true}={})=>{
  let onReady;
  const scripts=[];
  const element=()=>({dataset:{},setAttribute(){},addEventListener(){},append(){}});
  const window={};
  const context=vm.createContext({window,
    location:{origin:'https://maxsite.com.ua',pathname:'/',search:''},
    localStorage:{getItem:()=>choice?JSON.stringify({choice,timestamp:Date.now()}):null},
    sessionStorage:{removeItem(){},getItem(){return null;}},
    document:{referrer:'',scripts,head:{appendChild:el=>scripts.push(el)},body:element(),createElement:element,querySelector:()=>null,addEventListener:(name,fn)=>{if(name==='DOMContentLoaded')onReady=fn;}},
    Date,URL,URLSearchParams
  });
  vm.runInContext(source,context);
  assert.equal(scripts.length,0,'consent cannot insert a tag ahead of the HTML parser');
  assert.equal(window.dataLayer.filter(e=>e[0]==='config').length,0);
  if(staticTag)scripts.push({src:`https://www.googletagmanager.com/gtag/js?id=${id}`});
  if(inlineConfig){context.dataLayer=window.dataLayer;vm.runInContext(inline,context);}
  onReady();
  return {window,scripts};
};
for(const choice of ['analytics','all']){
  test(`saved ${choice} consent sees exactly one parsed tag and configuration`,()=>{
    const {window,scripts}=boot(choice);
    assert.equal(scripts.length,1);
    const configs=window.dataLayer.filter(e=>e[0]==='config'&&e[1]===id);
    assert.equal(configs.length,1);
    assert.equal(configs[0][2].send_page_view,undefined);
  });
}
test('fresh and necessary consent do not queue automatic pageviews',()=>{
  for(const choice of [null,'necessary']){
    const {window,scripts}=boot(choice);
    assert.equal(scripts.length,1);
    assert.equal(window.dataLayer.find(e=>e[0]==='config')[2].send_page_view,false);
  }
});
test('missing tag recovers while reusing an existing inline configuration',()=>{
  const {window,scripts}=boot('analytics',{staticTag:false});
  assert.equal(scripts.length,1);
  assert.equal(window.dataLayer.filter(e=>e[0]==='config').length,1);
});
test('missing tag and inline configuration recover together exactly once',()=>{
  const {window,scripts}=boot('analytics',{staticTag:false,inlineConfig:false});
  assert.equal(scripts.length,1);
  assert.equal(window.dataLayer.filter(e=>e[0]==='config').length,1);
});
