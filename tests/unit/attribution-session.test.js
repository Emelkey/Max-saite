const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const consentSource = fs.readFileSync('assets/consent.js', 'utf8');
const siteSource = fs.readFileSync('script.js', 'utf8');
const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

// Run the actual consent and site scripts, sharing only tab-local storage across
// document navigations. All network, form UI and Google transport are absent.
function visit(pathname, search = '', {storage = new Map(), choice = 'all', blocked = false, loadSite = true} = {}) {
  const listeners = new Map();
  const created = [];
  let ready;
  let savedConsent = choice ? JSON.stringify({choice, timestamp: Date.now()}) : null;
  const element = tag => {
    const handlers = new Map();
    const result = {tag, dataset: {}, handlers, setAttribute() {}, append() {}, contains: () => false,
      addEventListener: (name, handler) => handlers.set(name, handler), focus() {},
      querySelector: () => ({focus() {}})};
    created.push(result);
    return result;
  };
  const location = {origin: 'https://maxsite.com.ua', pathname, search, href: `https://maxsite.com.ua${pathname}${search}`};
  const window = {location, MAX_SITE_ANALYTICS: {enabled: false},
    addEventListener(name, handler) { listeners.set(name, [...(listeners.get(name) || []), handler]); },
    dispatchEvent(event) { for (const handler of listeners.get(event.type) || []) handler(event); }};
  const storageAccess = fn => (...args) => {
    if (blocked) throw new Error('Storage denied');
    return fn(...args);
  };
  const context = vm.createContext({window, location, URL, URLSearchParams, Date, Event, AbortSignal, console, setTimeout,
    localStorage: {getItem: () => savedConsent, setItem: (_key, value) => { savedConsent = value; }},
    sessionStorage: {
      getItem: storageAccess(key => storage.get(key) ?? null),
      setItem: storageAccess((key, value) => storage.set(key, value)),
      removeItem: storageAccess(key => storage.delete(key)),
    },
    document: {title: 'Test page', referrer: '', scripts: [{src: 'https://www.googletagmanager.com/gtag/js?id=G-TS8DMMKK34'}],
      body: element('body'), querySelector: () => null, querySelectorAll: () => [], createElement: element,
      addEventListener(name, handler) { if (name === 'DOMContentLoaded') ready = handler; }},
    IntersectionObserver: class { observe() {} },
  });
  vm.runInContext(consentSource, context);
  if (loadSite) vm.runInContext(siteSource, context);
  ready();
  const read = () => JSON.parse(JSON.stringify(vm.runInContext('getAttribution()', context)));
  const setConsent = nextChoice => {
    created.find(item => item.className === 'consent-panel').handlers.get('click')({
      target: {closest: () => ({dataset: {choice: nextChoice}})},
    });
  };
  const restore = () => window.dispatchEvent({type: 'pageshow', persisted: true});
  const storeConsent = nextChoice => { savedConsent = nextChoice ? JSON.stringify({choice: nextChoice, timestamp: Date.now()}) : null; };
  return {storage, context, window, read, setConsent, restore, storeConsent};
}

test('consented entry path survives dedicated form navigation without changing submission context', () => {
  const first = visit('/stvorennya-saytiv/', '?utm_source=google&utm_medium=cpc&utm_campaign=web&gclid=click-a');
  const formPage = visit('/obgovoryty-proiekt/', '?format=website', {storage: first.storage});
  assert.deepEqual(formPage.read(), {landing_path: '/stvorennya-saytiv/', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'web', utm_term: '', utm_content: '', gclid: 'click-a'});
  const payload = JSON.parse(JSON.stringify(vm.runInContext('buildLeadPayload({elements:{consent:{checked:true}},dataset:{requestId:"test-request"}})', formPage.context)));
  assert.equal(payload.context.landing_path, '/stvorennya-saytiv/');
  assert.equal(payload.context.page_type, 'supporting');
  assert.equal(payload.context.service, '');
  assert.equal(payload.pageUrl, 'https://maxsite.com.ua/obgovoryty-proiekt/');
  assert.equal(visit('/stvorennya-saytiv/', '', {storage: first.storage}).read().landing_path, '/stvorennya-saytiv/');
});

test('new partial campaign replaces old campaign and click fields together and resets entry path', () => {
  const ads = visit('/stvorennya-saytiv/', '?utm_source=google&utm_medium=cpc&utm_campaign=ads-a&utm_term=websites&utm_content=first&gclid=click-a');
  const newsletter = visit('/seo-prosuvannya/', '?utm_source=newsletter&utm_campaign=october', {storage: ads.storage});
  const expected = {landing_path: '/seo-prosuvannya/', utm_source: 'newsletter', utm_medium: '', utm_campaign: 'october', utm_term: '', utm_content: '', gclid: ''};
  assert.deepEqual(newsletter.read(), expected);
  assert.deepEqual(visit('/obgovoryty-proiekt/', '', {storage: ads.storage}).read(), expected);
  for (const key of ['utm_medium', 'utm_term', 'utm_content', 'gclid']) assert.equal(ads.storage.has(`max_site_${key}`), false);
});

test('new click-only or other supported campaign marker does not inherit an older campaign', () => {
  for (const marker of ['gclid=new-click', 'gbraid=new-braid', 'wbraid=new-braid', 'gad_source=1', 'gad_campaignid=2', 'gclsrc=aw.ds', 'utm_id=new-id', 'utm_source_platform=new-platform']) {
    const first = visit('/old/', '?utm_source=google&utm_medium=cpc&gclid=old-click');
    const current = visit('/new/', `?${marker}`, {storage: first.storage}).read();
    assert.equal(current.landing_path, '/new/', marker);
    assert.equal(current.utm_source, '', marker);
    assert.equal(current.utm_medium, '', marker);
    assert.equal(current.gclid, marker.startsWith('gclid=') ? 'new-click' : '', marker);
  }
});

test('restored campaign document replaces newer tab attribution without mixing absent fields', () => {
  const oldDocument = visit('/newsletter/', '?utm_source=newsletter');
  visit('/ads/', '?utm_source=google&utm_medium=cpc&utm_term=websites&gclid=new-click', {storage: oldDocument.storage});
  // Actual pageshow, rather than manually calling getAttribution: a visitor can
  // follow the CTA immediately after Back without interacting with a form.
  oldDocument.restore();
  assert.equal(oldDocument.storage.get('max_site_landing_path'), '/newsletter/');
  assert.equal(oldDocument.storage.get('max_site_utm_source'), 'newsletter');
  assert.equal(oldDocument.storage.has('max_site_gclid'), false);
  const form = visit('/obgovoryty-proiekt/', '', {storage: oldDocument.storage});
  assert.equal(form.read().landing_path, '/newsletter/');
  assert.equal(form.read().utm_source, 'newsletter');
  assert.equal(form.read().utm_medium, '');
  assert.equal(form.read().gclid, '');
});

test('persisted pageshow applies a newer consent revocation before attribution or CTA navigation', () => {
  const oldDocument = visit('/campaign/', '?utm_source=google&gclid=click-a');
  oldDocument.storeConsent('necessary');
  oldDocument.restore();
  assert.equal(oldDocument.window.MAX_SITE_CONSENT.analytics_storage, 'denied');
  assert.equal(oldDocument.window.MAX_SITE_CONSENT.ad_storage, 'denied');
  assert.equal(oldDocument.storage.has('max_site_landing_path'), false);
  for (const key of attributionKeys) assert.equal(oldDocument.storage.has(`max_site_${key}`), false);
  assert.equal(oldDocument.window.MAX_SITE_GOOGLE_PAGE.page_location, 'https://maxsite.com.ua/campaign/');
  assert.equal(oldDocument.window.dataLayer.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 0);
});

test('persisted pageshow sends at most one first-grant view and does not duplicate an existing view', () => {
  for (const initialChoice of ['necessary', 'all']) {
    const page = visit('/campaign/', '?utm_source=google', {choice: initialChoice});
    for (const nextChoice of ['all', 'all', 'necessary', 'all']) {
      page.storeConsent(nextChoice);
      page.restore();
    }
    assert.equal(page.window.dataLayer.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, initialChoice === 'necessary' ? 1 : 0);
  }
});

test('persisted pageshow refreshes QA and the Google disable flag in both directions', () => {
  const direct = visit('/returning/');
  direct.storage.set('max_site_qa_v1', '1');
  direct.restore();
  assert.equal(direct.window.MAX_SITE_QA, true);
  assert.equal(direct.window['ga-disable-G-TS8DMMKK34'], true);
  assert.equal(direct.storage.has('max_site_landing_path'), false);
  direct.storage.delete('max_site_qa_v1');
  direct.restore();
  assert.equal(direct.window.MAX_SITE_QA, false);
  assert.equal(direct.window['ga-disable-G-TS8DMMKK34'], undefined);
  assert.equal(direct.storage.get('max_site_landing_path'), '/returning/');

  const campaign = visit('/campaign/', '?utm_source=google&gclid=real-click');
  campaign.storage.set('max_site_qa_v1', '1');
  campaign.restore();
  assert.equal(campaign.window.MAX_SITE_QA, false);
  assert.equal(campaign.storage.has('max_site_qa_v1'), false);
  assert.equal(campaign.storage.get('max_site_gclid'), 'real-click');
});

test('repeated reads and upgraded consent preserve the campaign entry across form navigation', () => {
  const landing = visit('/campaign-entry/', '?utm_source=google&gclid=click-a', {choice: 'analytics'});
  assert.equal(landing.read().gclid, '');
  landing.setConsent('all');
  assert.equal(landing.read().gclid, 'click-a');
  assert.equal(landing.read().landing_path, '/campaign-entry/');
  const form = visit('/obgovoryty-proiekt/', '?format=website', {storage: landing.storage, choice: 'analytics'});
  for (let attempt = 0; attempt < 3; attempt++) {
    form.setConsent('all');
    assert.equal(form.read().landing_path, '/campaign-entry/');
    assert.equal(form.read().utm_source, 'google');
  }
});

test('necessary-only consent keeps no attribution storage and a later grant captures that page', () => {
  const landing = visit('/campaign-entry/', '?utm_source=google&gclid=click-a', {choice: 'necessary'});
  assert.deepEqual([...landing.storage.keys()], []);
  assert.equal(landing.read().utm_source, 'google');
  assert.equal(landing.read().gclid, '');
  landing.setConsent('all');
  assert.equal(landing.read().landing_path, '/campaign-entry/');
  assert.equal(landing.read().gclid, 'click-a');
  const form = visit('/obgovoryty-proiekt/', '', {storage: landing.storage});
  form.setConsent('necessary');
  assert.equal(form.read().landing_path, '/obgovoryty-proiekt/');
  assert.equal(form.storage.has('max_site_landing_path'), false);
  for (const key of attributionKeys) assert.equal(form.storage.has(`max_site_${key}`), false);
  form.setConsent('all');
  assert.equal(form.read().landing_path, '/obgovoryty-proiekt/');
  assert.equal(form.read().utm_source, '');
});

test('consent guard alone purges saved entry and campaign data on denial or revocation', () => {
  for (const revoke of [false, true]) {
    const storage = new Map([['max_site_landing_path', '/old/'], ...attributionKeys.map(key => [`max_site_${key}`, 'old'])]);
    const page = visit('/new/', '', {storage, choice: revoke ? 'all' : 'necessary', loadSite: false});
    if (revoke) page.setConsent('necessary');
    assert.equal(storage.size, 0);
  }
});

test('blocked storage does not break current attribution or create cross-page retention', () => {
  const landing = visit('/campaign-entry/', '?utm_source=google&gclid=click-a', {blocked: true});
  assert.equal(landing.read().landing_path, '/campaign-entry/');
  assert.equal(landing.read().utm_source, 'google');
  assert.equal(landing.read().gclid, 'click-a');
  const form = visit('/obgovoryty-proiekt/', '', {storage: landing.storage, blocked: true});
  assert.equal(form.read().landing_path, '/obgovoryty-proiekt/');
  assert.equal(form.read().utm_source, '');
});

test('explicit QA clears real attribution and cannot contaminate a subsequent real campaign', () => {
  const real = visit('/real/', '?utm_source=google&utm_medium=cpc&gclid=real-click');
  const qa = visit('/qa/', '?utm_source=codex_qa&utm_medium=test', {storage: real.storage});
  assert.equal(qa.window.MAX_SITE_QA, true);
  for (const key of attributionKeys) assert.equal(qa.read()[key], '');
  const qaForm = visit('/obgovoryty-proiekt/', '', {storage: real.storage});
  assert.equal(qaForm.window.MAX_SITE_QA, true);
  assert.equal(qaForm.storage.has('max_site_landing_path'), false);
  const next = visit('/newsletter/', '?utm_source=newsletter', {storage: real.storage});
  assert.equal(next.window.MAX_SITE_QA, false);
  assert.equal(next.read().landing_path, '/newsletter/');
  assert.equal(next.read().utm_source, 'newsletter');
  assert.equal(next.read().utm_medium, '');
  assert.equal(next.read().gclid, '');
});
