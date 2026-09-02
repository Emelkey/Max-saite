const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {randomUUID, webcrypto} = require('crypto');
const root = path.resolve(__dirname, '../..');

async function worker() {
  const source = fs.readFileSync(path.join(root, 'telegram-worker.js'), 'utf8');
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${randomUUID()}`)).default;
}
const env = {ALLOWED_ORIGINS: 'https://maxsite.com.ua', TELEGRAM_BOT_TOKEN: 'test-token', TELEGRAM_CHAT_ID: 'test-chat'};
const payload = () => ({requestId: randomUUID(), pageUrl: 'https://maxsite.com.ua/?email=private@example.test', fields: {phone: '+380000000000', name: 'Test only'}, context: {consent: true, city: 'kyiv', page_type: 'city_hub', service: 'website_development', gclid: 'forbidden-without-consent', consent_state: 'ads_denied'}});
const request = body => new Request('https://worker.test/', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'https://maxsite.com.ua', 'CF-Connecting-IP': '192.0.2.1'}, body: typeof body === 'string' ? body : JSON.stringify(body)});

test('Worker validates phone, consent, media type, actual bytes and spam', async () => {
  const api = await worker();
  for (const body of [{...payload(), fields: {phone: 'garbage'}}, {...payload(), context: {consent: false}}]) assert.equal((await api.fetch(request(body), env)).status, 400);
  assert.equal((await api.fetch(request('{'), env)).status, 400);
  assert.equal((await api.fetch(request(' '.repeat(20001)), env)).status, 413);
  assert.equal((await api.fetch(request({...payload(), website: 'spam'}), env)).status, 422);
  assert.equal((await api.fetch(new Request('https://worker.test/', {method:'POST', body:'x'}), env)).status, 415);
});

test('Worker passes allowed context, strips URL queries, and deduplicates concurrent retries', async t => {
  const api = await worker(); const body = payload(); const sent = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => { sent.push(JSON.parse(options.body)); return Response.json({ok:true}); });
  const responses = await Promise.all([api.fetch(request(body), env), api.fetch(request(body), env)]);
  assert.deepEqual(await Promise.all(responses.map(response => response.json())), [{ok:true}, {ok:true}]);
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /city: kyiv/);
  assert.doesNotMatch(sent[0].text, /private@example|forbidden-without/);
  assert.equal((await api.fetch(request({...body, fields: {phone:'+380111111111'}}), env)).status, 409);
});

test('Worker does not acknowledge a Telegram error body and permits safe retry', async t => {
  const api = await worker(); const body = payload();
  t.mock.method(globalThis, 'fetch', async () => Response.json({ok:false}));
  assert.equal((await api.fetch(request(body), env)).status, 502);
  t.mock.method(globalThis, 'fetch', async () => Response.json({ok:true}));
  assert.equal((await api.fetch(request(body), env)).status, 200);
});

test('Worker rate limit stops the sixth distinct request within its isolate', async t => {
  const api = await worker();
  t.mock.method(globalThis, 'fetch', async () => Response.json({ok:true}));
  for (let i=0;i<5;i++) assert.equal((await api.fetch(request(payload()), env)).status, 200);
  assert.equal((await api.fetch(request(payload()), env)).status, 429);
});

function browserContext() {
  const events = [];
  const location = {pathname: '/stvorennya-saytiv/', search: '?gclid=secret&utm_source=google', href: 'https://maxsite.com.ua/stvorennya-saytiv/?email=private@example.test', origin: 'https://maxsite.com.ua'};
  const context = vm.createContext({URL, URLSearchParams, AbortSignal, crypto:webcrypto, console, setTimeout,
    window: {location, MAX_SITE_ANALYTICS:{enabled:true}, gtag:(...args)=>events.push(args), addEventListener(){}},
    document: {querySelector(){return null}, querySelectorAll(){return []}, addEventListener(){}, referrer:'https://example.test/path?token=secret'},
    sessionStorage: {getItem(){throw Error('denied')}, setItem(){throw Error('denied')}, removeItem(){throw Error('denied')}},
    IntersectionObserver: class {observe(){}},
  });
  vm.runInContext(fs.readFileSync(path.join(root,'script.js'),'utf8'), context);
  return {context,events};
}
test('blocked storage cannot break attribution; gclid needs separate advertising consent', () => {
  const {context} = browserContext();
  assert.equal(vm.runInContext('getAttribution().gclid', context), '');
  assert.equal(vm.runInContext('getAttribution().utm_source', context), 'google');
  vm.runInContext('window.MAX_SITE_CONSENT={ad_storage:"granted",ad_user_data:"granted"}', context);
  assert.equal(vm.runInContext('getAttribution().gclid', context), 'secret');
});
test('analytics allowlist rejects form PII and strips destination queries', () => {
  const {context, events} = browserContext();
  vm.runInContext('trackEvent("lead_form_success",{name:"Private",phone:"123456",comment:"private",destination_path:"/page/?email=x"})', context);
  assert.equal(JSON.stringify(events).includes('Private'), false);
  assert.deepEqual(JSON.parse(JSON.stringify(events.at(-1)[2])), {page_path:'/stvorennya-saytiv/',destination_path:'/page/'});
});
test('client success requires both HTTP success and explicit ok:true', async () => {
  const {context} = browserContext();
  vm.runInContext('telegramConfig.endpoint="https://worker.test/"', context);
  for (const body of [{ok:false}, {}, null]) {
    context.fetch = async () => Response.json(body);
    await assert.rejects(vm.runInContext('sendLead({})', context), /not acknowledged/);
  }
  context.fetch = async () => Response.json({ok:true});
  assert.equal((await vm.runInContext('sendLead({})', context)).ok, true);
});
