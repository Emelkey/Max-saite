const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');

const root=path.resolve(__dirname,'../..');

const htmlFiles=()=>{
  const result=[];
  const excluded=new Set(['.git','artifacts','node_modules','release']);
  const walk=directory=>{
    for(const name of fs.readdirSync(directory)){
      const file=path.join(directory,name);
      const stat=fs.statSync(file);
      if(stat.isDirectory()){
        if(!excluded.has(name)) walk(file);
      }else if(file.endsWith('.html')) result.push(file);
    }
  };
  walk(root);
  return result;
};

test('all deterministic SEO checks pass',()=>{
  for (const check of ['routes','metadata','canonicals','sitemap','robots','schema','links','content-quality']) {
    const result=spawnSync(process.execPath,['tools/seo-check.js',check],{cwd:root,encoding:'utf8'});
    assert.equal(result.status,0,`${check} failed:\n${result.stdout}\n${result.stderr}`);
  }
});

test('sitemap index has five unique child maps',()=>{
  const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  const names=[...xml.matchAll(/https:\/\/maxsite\.com\.ua\/(sitemap-[^<]+\.xml)/g)].map(match=>match[1]);
  assert.deepEqual(names.sort(),['sitemap-blog.xml','sitemap-cases.xml','sitemap-cities.xml','sitemap-niches.xml','sitemap-services.xml']);
});

test('analytics event payload never includes contact PII',()=>{
  const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
  assert.doesNotMatch(script,/phone_number\s*:/);
  assert.doesNotMatch(script,/user_name\s*:/);
  for (const event of ['lead_form_success','click_phone','click_telegram','city_service_click']) assert.match(script,new RegExp(`"${event}"`));
});

test('every document has one consent bootstrap and one Google tag',()=>{
  const ids=new Set();
  for(const file of htmlFiles()){
    const html=fs.readFileSync(file,'utf8');
    assert.equal((html.match(/\/assets\/consent\.js/g)||[]).length,1,`${path.relative(root,file)} consent bootstrap count`);
    const tags=[...html.matchAll(/googletagmanager\.com\/gtag\/js\?id=([^"'&<]+)/g)];
    assert.equal(tags.length,1,`${path.relative(root,file)} Google tag count`);
    ids.add(tags[0][1]);
    assert.ok(html.indexOf('/assets/consent.js')<html.indexOf('googletagmanager.com/gtag/js'),`${path.relative(root,file)} must set consent before loading Google tag`);
  }
  assert.deepEqual([...ids],['G-TS8DMMKK34']);
});

test('Worker production config enables durable rate and delivery gates',()=>{
  const worker=fs.readFileSync(path.join(root,'telegram-worker.js'),'utf8');
  const wrangler=fs.readFileSync(path.join(root,'wrangler.toml'),'utf8');
  for(const className of ['LeadDeliveryGate','LeadRateGate']){
    assert.match(worker,new RegExp(`export class ${className}\\b`));
    assert.match(wrangler,new RegExp(`class_name = "${className}"`));
  }
  assert.match(wrangler,/new_sqlite_classes\s*=\s*\["LeadDeliveryGate", "LeadRateGate"\]/);
});

test('review schema remains disabled until evidence exists',()=>{
  const store=JSON.parse(fs.readFileSync(path.join(root,'seo','reviews.json'),'utf8'));
  assert.deepEqual(store.reviews,[]);
});
