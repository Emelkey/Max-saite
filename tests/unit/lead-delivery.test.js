const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {randomUUID, webcrypto} = require('crypto');
const root = path.resolve(__dirname, '../..');

async function workerModule() {
  const source = fs.readFileSync(path.join(root, 'telegram-worker.js'), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${randomUUID()}`);
}
async function worker() { return (await workerModule()).default; }
const env = {ALLOWED_ORIGINS: 'https://maxsite.com.ua', TELEGRAM_BOT_TOKEN: 'test-token', TELEGRAM_CHAT_ID: 'test-chat'};
const payload = () => ({requestId: randomUUID(), pageUrl: 'https://maxsite.com.ua/?email=private@example.test', fields: {phone: '+380000000000', name: 'Test only'}, context: {consent: true, city: 'kyiv', page_type: 'city_hub', service: 'website_development', gclid: 'forbidden-without-consent', consent_state: 'ads_denied'}});
const request = body => new Request('https://worker.test/', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'https://maxsite.com.ua', 'CF-Connecting-IP': '192.0.2.1'}, body: typeof body === 'string' ? body : JSON.stringify(body)});

test('Worker validates phone, consent, media type, actual bytes and spam', async () => {
  const api = await worker();
  for (const body of [
    {...payload(), fields: {phone: 'garbage'}},
    {...payload(), context: {consent: false}},
    {...payload(), requestId: ''},
    {...payload(), fields: {...payload().fields, comment: 'x'.repeat(2001)}},
  ]) assert.equal((await api.fetch(request(body), env)).status, 400);
  assert.equal((await api.fetch(request('{'), env)).status, 400);
  assert.equal((await api.fetch(request(' '.repeat(20001)), env)).status, 413);
  assert.equal((await api.fetch(request({...payload(), website: 'spam'}), env)).status, 422);
  assert.equal((await api.fetch(new Request('https://worker.test/', {method:'POST', body:'x'}), env)).status, 415);
  const response = await api.fetch(request(payload()), {...env, TELEGRAM_BOT_TOKEN: ''});
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('Worker passes allowed context, strips URL queries, and deduplicates concurrent retries', async t => {
  const api = await worker(); const body = payload(); const sent = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => { sent.push(JSON.parse(options.body)); return Response.json({ok:true}); });
  const responses = await Promise.all([api.fetch(request(body), env), api.fetch(request(body), env)]);
  assert.deepEqual(await Promise.all(responses.map(response => response.json())), [{ok:true, lead_id:body.requestId}, {ok:true, lead_id:body.requestId}]);
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, new RegExp(`lead_id: ${body.requestId}`));
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

const memoryState = () => {
  const values = new Map();
  let queue = Promise.resolve();
  return {
    storage: {
      get: async key => values.get(key),
      put: async (key, value) => values.set(key, value),
      delete: async key => values.delete(key),
    },
    blockConcurrencyWhile(fn) {
      const result = queue.then(fn);
      queue = result.catch(() => {});
      return result;
    },
  };
};

test('Durable Object gates enforce distributed rate limiting and idempotent delivery', async t => {
  const {LeadDeliveryGate, LeadRateGate} = await workerModule();
  const rateObjects = new Map();
  const deliveryEnv = {
    TELEGRAM_BOT_TOKEN: 'test-token',
    TELEGRAM_CHAT_ID: 'test-chat',
    LEAD_RATE_GATE: {
      idFromName: name => name,
      get: id => {
        if (!rateObjects.has(id)) rateObjects.set(id, new LeadRateGate(memoryState()));
        return {fetch: (...args) => rateObjects.get(id).fetch(...args)};
      },
    },
  };
  const delivery = new LeadDeliveryGate(memoryState(), deliveryEnv);
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return Response.json({ok:true});
  });
  const body = payload();
  const input = {payload:body, digest:'same-digest', clientKey:'client-hash'};
  const internal = value => new Request('https://lead-delivery.internal/deliver', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(value)});
  const results = await Promise.all([
    delivery.fetch(internal(input)),
    delivery.fetch(internal(input)),
  ]);
  assert.deepEqual(await Promise.all(results.map(result => result.json())), [
    {ok:true, lead_id:body.requestId},
    {ok:true, lead_id:body.requestId},
  ]);
  assert.equal(sent.length, 1);
  assert.equal((await delivery.fetch(internal({...input, digest:'different'}))).status, 409);

  const rate = new LeadRateGate(memoryState());
  for (let i=0;i<5;i++) assert.equal((await rate.fetch()).status, 200);
  assert.equal((await rate.fetch()).status, 429);
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
  assert.deepEqual(
    JSON.parse(JSON.stringify(await vm.runInContext('sendLead({requestId:"lead-123"})', context))),
    {ok:true, lead_id:'lead-123'}
  );
});

test('missing endpoint returns manual fallback without navigation or delivery events', async () => {
  const {context,events}=browserContext();
  const originalLocation=context.window.location.href;
  context.fetch=async()=>{throw new Error('Missing endpoint must not fetch');};
  assert.deepEqual(JSON.parse(JSON.stringify(await vm.runInContext('sendLead({requestId:"lead-123",fields:{phone:"+380000000000"}})',context))),{fallback:true});
  assert.equal(context.window.location.href,originalLocation);
  assert.equal(events.some(event=>['generate_lead','lead_form_success','lead_fallback_open'].includes(event[1])),false);
});

test('client classifies endpoint failure modes without leaking response bodies', async () => {
  const {context} = browserContext();
  vm.runInContext('telegramConfig.endpoint="https://worker.test/"', context);
  for (const [status, code] of [[400, 'endpoint_4xx'], [503, 'endpoint_5xx']]) {
    context.fetch = async () => new Response('private upstream body', {status});
    await assert.rejects(
      vm.runInContext('sendLead({requestId:"lead-123"})', context),
      error => error.code === code && !error.message.includes('private upstream body')
    );
  }
  context.fetch = async () => { const error = new Error('timeout'); error.name = 'TimeoutError'; throw error; };
  await assert.rejects(
    vm.runInContext('sendLead({requestId:"lead-123"})', context),
    error => error.code === 'endpoint_timeout'
  );
});
