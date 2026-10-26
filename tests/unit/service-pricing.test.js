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

test('every service amount is reduced exactly 25 percent once without rounding',()=>{
  assert.deepEqual(ledger.factor,{numerator:3,denominator:4});
  assert.equal(ledger.prices.length,10);
  for(const price of ledger.prices) {
    assert.equal(price.after*4,price.before*3,price.service);
    assert.equal(price.currency,'UAH');
    assert.ok(Number.isInteger(price.after*100),price.service);
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
    let restored=current.replace(pattern,value=>reverse.get(value));
    if(entry.path==='assets/project-tools.js') restored=restored.replace("toLocaleString('uk-UA', {minimumFractionDigits: Number.isInteger(prices[value]) ? 0 : 2, maximumFractionDigits: 2})", "toLocaleString('uk-UA')");
    // 2026-10-26: strip only exact, separately tested editorial additions.
    // All existing bytes and every price occurrence remain guarded by the original baseline.
    const editorialAdditions={
      'poslugy/index.html':'<p data-animation-direction>Новий творчий напрям: <a href="/pro-nas/#animation-stories">мультфільми та анімовані історії — підхід і власний канал Smile Planet</a>. Формат і можливості реалізації обговорюються окремо від розробки сайту.</p>',
      'blog/index.html':'<p><a href="/blog/peredacha-saytu-vlasnyku-dostupy-kod-domen/">Передача сайту власнику: як прийняти доступи, код і сервіси</a> — практичний реєстр перевірки доступів, релізу та продовження сервісів.</p>',
      'blog/shcho-vhodyt-u-sajt-pid-klyuch/index.html':'<p>Для приймання використайте <a href="/blog/peredacha-saytu-vlasnyku-dostupy-kod-domen/">реєстр передачі сайту власнику</a>: перевірте контроль над сервісами й відповідність коду опублікованій версії.</p>'
    };
    if(editorialAdditions[entry.path]) {
      assert.equal(restored.split(editorialAdditions[entry.path]).length-1,1,'exact editorial insertion present once');
      restored=restored.replace(editorialAdditions[entry.path],'');
    }
    if(entry.path==='blog/index.html') {
      const insertion=source('tests/fixtures/blog-decision-guides.txt');
      assert.equal(restored.split(insertion).length-1,1);
      restored=restored.replace(insertion,'');
    }
    assert.equal(crypto.createHash('sha256').update(restored).digest('hex'),entry.baselineSha256,`${entry.path}: only the approved price substitutions may change`);
  }
});

test('schema prices, both calculators and Google Ads offers use the reduced amounts',()=>{
  const ads=source('google-ads/index.html');
  const analytics=source('google-analytics-search-console/index.html');
  for(const [html,amounts] of [[ads,[3150,3825,5737.5]],[analytics,[1631.25,2531.25]]]) {
    for(const amount of amounts) assert.ok(html.includes(`"price":"${amount}"`),String(amount));
  }
  assert.match(source('assets/project-tools.js'),/landing:5906\.25,business:11081\.25,seo:16312\.5,store:19293\.75/);
  for(const amount of [5906.25,11081.25,16312.5,19293.75]) assert.ok(source('assets/site-cost-calculator.js').includes(`від ${format(amount)} грн`));
  assert.match(analytics,/від 8 325 грн \/ місяць/);
});
