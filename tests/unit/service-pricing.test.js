const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ledger=require('../../seo/service-pricing.json');
const root=path.resolve(__dirname,'../..');
const format=value=>String(value).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');

test('every service amount is reduced exactly 25 percent once without rounding',()=>{
  assert.deepEqual(ledger.factor,{numerator:3,denominator:4});
  assert.equal(ledger.prices.length,10);
  for(const price of ledger.prices) {
    assert.equal(price.after*4,price.before*3,price.service);
    assert.equal(price.currency,'UAH');
    assert.ok(Number.isInteger(price.after),price.service);
  }
});

test('all inventoried current price occurrences change while every other source byte stays intact',()=>{
  const reverse=new Map();
  for(const price of ledger.prices) {
    reverse.set(String(price.after),String(price.before));
    reverse.set(format(price.after),format(price.before));
  }
  const pattern=new RegExp(`(?<!\\d)(?:${[...reverse.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')})(?!\\d)`,'g');
  for(const entry of ledger.files) {
    const current=source(entry.path);
    for(const [before,count] of Object.entries(entry.occurrences)) {
      const price=ledger.prices.find(row=>row.before===Number(before.replaceAll(' ','')));
      const after=before.includes(' ')?format(price.after):String(price.after);
      const matches=current.match(new RegExp(`(?<!\\d)${escape(after)}(?!\\d)`,'g'))||[];
      assert.equal(matches.length,count,`${entry.path}: ${before} -> ${after}`);
      assert.doesNotMatch(current,new RegExp(`(?<!\\d)${escape(before)}(?!\\d)`),`${entry.path}: stale price ${before}`);
    }
    const restored=current.replace(pattern,value=>reverse.get(value));
    assert.equal(crypto.createHash('sha256').update(restored).digest('hex'),entry.baselineSha256,`${entry.path}: only the approved price substitutions may change`);
  }
});

test('schema prices, both calculators and Google Ads offers use the reduced amounts',()=>{
  const ads=source('google-ads/index.html');
  const analytics=source('google-analytics-search-console/index.html');
  for(const [html,amounts] of [[ads,[4200,5100,7650]],[analytics,[2175,3375]]]) {
    for(const amount of amounts) assert.ok(html.includes(`"price":"${amount}"`),String(amount));
  }
  assert.match(source('assets/project-tools.js'),/landing:7875,business:14775,seo:21750,store:25725/);
  for(const amount of [7875,14775,21750,25725]) assert.ok(source('assets/site-cost-calculator.js').includes(`від ${format(amount)} грн`));
  assert.match(analytics,/від 11 100 грн \/ місяць/);
});
