const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');

const root=path.resolve(__dirname,'../..');

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

test('review schema remains disabled until evidence exists',()=>{
  const store=JSON.parse(fs.readFileSync(path.join(root,'seo','reviews.json'),'utf8'));
  assert.deepEqual(store.reviews,[]);
});
