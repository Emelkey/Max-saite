const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ledger=require('../../seo/service-pricing.json');
const root=path.resolve(__dirname,'../..');
const format=value=>{const [whole,fraction]=value.toFixed(Number.isInteger(value)?0:2).split('.');return whole.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(fraction?','+fraction:'');};
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');

test('service prices retain the previous reduction and round down by less than 50 UAH',()=>{
  assert.deepEqual(ledger.factor,{numerator:3,denominator:4});
  assert.equal(ledger.prices.length,10);
  for(const price of ledger.prices) {
    assert.equal(price.beforeRounding*4,price.before*3,price.service);
    assert.equal(price.after,Math.floor(price.beforeRounding/50)*50,price.service);
    assert.ok(price.beforeRounding-price.after>=0 && price.beforeRounding-price.after<50,price.service);
    assert.equal(price.currency,'UAH');
    assert.ok(Number.isInteger(price.after*100),price.service);
  }
});

test('all inventoried source content matches the reviewed rounding and conversion baseline',()=>{
  // Baselines for untouched content derive from 5b86d62 plus only exact price substitutions.
  // The three conversion files have explicit reviewed 2026-11-18 content baselines.
  assert.equal(ledger.rounding.baselineCommit,'5b86d62b2fd2c51a28589583844e9778519324be');
  for(const entry of ledger.files) {
    assert.equal(crypto.createHash('sha256').update(source(entry.path)).digest('hex'),entry.roundedContentSha256,entry.path);
  }
});

test('schema prices, both calculators and Google Ads offers use the reduced amounts',()=>{
  const ads=source('google-ads/index.html');
  const analytics=source('google-analytics-search-console/index.html');
  for(const [html,amounts] of [[ads,[3150,3800,5700]],[analytics,[1600,2500]]]) {
    for(const amount of amounts) assert.ok(html.includes(`"price":"${amount}"`),String(amount));
  }
  assert.match(source('assets/project-tools.js'),/landing:5900,business:11050,seo:16300,store:19250/);
  for(const amount of [5900,11050,16300,19250]) assert.ok(source('assets/site-cost-calculator.js').includes(`від ${format(amount)} грн`));
  assert.match(analytics,/від 8 300 грн \/ місяць/);
});
