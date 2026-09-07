const test = require('node:test');
const assert = require('node:assert/strict');
const { checkSecurityHeaders, inspectRedirect, verifyLiveContract, httpsOrigin } = require('../../tools/verify-edge-contract');

const baseUrl = new URL('https://maxsite.com.ua');
const redirect = { source: '/old/', destination: '/new/', status: 301 };
const goodHeaders = {
  'strict-transport-security': 'max-age=31536000',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'x-frame-options': 'SAMEORIGIN',
  'content-security-policy-report-only': "default-src 'self'; base-uri 'self'",
};
const html = '<link href="https://maxsite.com.ua/new/" rel="canonical"><h1>MAX SITE</h1>';
const sleep = async () => {};

function transport({ targetStatus = 200, targetHtml = html, targetHeaders = {}, sourceLocation = '/new/', headers = goodHeaders, previewHeaders = { 'X-Robots-Tag': 'noindex, nofollow' } } = {}) {
  const requests = [];
  return {
    requests,
    request: async (input, options) => {
      const url = new URL(input);
      requests.push({ url: url.href, options });
      if (url.hostname.endsWith('.pages.dev')) return new Response('preview', { headers: previewHeaders });
      if (url.pathname === '/old/') return new Response(null, { status: 301, headers: { Location: sourceLocation } });
      if (url.pathname === '/new/') return new Response(targetHtml, { status: targetStatus, headers: targetHeaders });
      return new Response('home', { headers });
    },
  };
}

test('live redirect contract requires exactly 301 then 200 and matching final canonical', async () => {
  const fake = transport();
  const row = await inspectRedirect(redirect, baseUrl, { request: fake.request, sleep });
  assert.equal(row.passed, true);
  assert.equal(row.destination.actualStatus, 200);
  assert.deepEqual(fake.requests.map(item => item.url), ['https://maxsite.com.ua/old/', 'https://maxsite.com.ua/new/']);
  for (const { options } of fake.requests) {
    assert.equal(options.redirect, 'manual');
    assert.equal(options.method, 'GET');
  }
});

test('a second redirect, wrong canonical, noindex or client redirect cannot pass', async () => {
  for (const config of [
    { targetStatus: 302, targetHeaders: { Location: '/loop/' } },
    { targetStatus: 404 },
    { targetHtml: '<link rel="canonical" href="https://wrong.example/">' },
    { targetHtml: html + '<meta name="robots" content="noindex">' },
    { targetHtml: html + '<meta name="googlebot" content="noindex">' },
    { targetHeaders: { 'X-Robots-Tag': 'noindex' } },
    { targetHtml: html + '<meta http-equiv="refresh" content="0; url=/loop/">' },
  ]) {
    const fake = transport(config);
    assert.equal((await inspectRedirect(redirect, baseUrl, { request: fake.request, sleep })).passed, false);
    assert.ok(fake.requests.every(item => !item.url.includes('/loop/')));
  }
});

test('unexpected external redirect is not followed', async () => {
  const fake = transport({ sourceLocation: 'https://unrelated.example/' });
  const row = await inspectRedirect(redirect, baseUrl, { request: fake.request, sleep });
  assert.equal(row.passed, false);
  assert.equal(fake.requests.length, 1);
});

test('security checks reject disabled/short HSTS and incomplete permissions or frame protection', () => {
  assert.ok(Object.values(checkSecurityHeaders(goodHeaders)).every(Boolean));
  for (const value of ['max-age=0', 'max-age=300', 'max-age=-1', 'max-age=invalid']) {
    assert.equal(checkSecurityHeaders({ ...goodHeaders, 'strict-transport-security': value })['strict-transport-security'], false);
  }
  for (const value of ['camera=()', 'camera=(), microphone=()', 'camera=(), microphone=(), geolocation=*']) {
    assert.equal(checkSecurityHeaders({ ...goodHeaders, 'permissions-policy': value })['permissions-policy'], false);
  }
  assert.equal(checkSecurityHeaders({ ...goodHeaders, 'x-frame-options': null })['x-frame-options'], false);
});

test('explicit preview origin checks noindex/nofollow on homepage and calculator', async () => {
  const fake = transport();
  const result = await verifyLiveContract([redirect], { baseUrl, previewOrigin: 'https://preview.max-site.pages.dev', request: fake.request, sleep });
  assert.equal(result.passed, true);
  assert.equal(result.previewCheck, 'performed');
  const rows = result.observations.filter(row => row.kind === 'preview-noindex');
  assert.equal(rows.length, 2);
  assert.ok(rows.every(row => row.passed));
  const bad = transport({ previewHeaders: {} });
  assert.equal((await verifyLiveContract([redirect], { baseUrl, previewOrigin: 'https://preview.max-site.pages.dev', request: bad.request, sleep })).passed, false);
});

test('missing optional preview is explicitly unverified, not silently declared passed', async () => {
  const fake = transport();
  const result = await verifyLiveContract([redirect], { baseUrl, request: fake.request, sleep });
  assert.equal(result.passed, true);
  assert.match(result.previewCheck, /unverified/);
  assert.equal(result.previewOrigin, null);
});

test('exhausted transport errors remain serializable failure evidence', async () => {
  const result = await verifyLiveContract([redirect], { baseUrl, previewOrigin: 'https://preview.max-site.pages.dev', sleep, request: async () => { throw Error('Simulated connection failure'); } });
  assert.equal(result.passed, false);
  assert.equal(result.observations.length, 4);
  for (const row of result.observations) {
    assert.equal(row.passed, false);
    assert.match(row.error, /Simulated connection failure/);
  }
  assert.doesNotThrow(() => JSON.stringify(result));
});

test('audited origins reject credentials and non-HTTPS URLs', () => {
  for (const value of ['http://maxsite.com.ua', 'https://maxsite.com.ua/path', 'https://user:secret@maxsite.com.ua', 'https://maxsite.com.ua?x=1']) assert.throws(() => httpsOrigin(value));
});
