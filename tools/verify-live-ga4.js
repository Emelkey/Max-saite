/* Read-only event-generation diagnostic. Collector requests are intercepted locally.
 * No production analytics delivery, form submissions, ad clicks or injected events. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('@playwright/test');
const PAGE = 'https://maxsite.com.ua/stvorennya-saytiv/';
const ID = 'G-TS8DMMKK34';
const out = path.resolve('artifacts/analytics-live');
const cleanUrl = value => { try { const u = new URL(value); return u.origin + u.pathname; } catch { return ''; } };
const report = { startedAt: new Date().toISOString(), page: PAGE, measurementId: ID, propertyId: '548154976', qa: true, leadSubmitted: false, adClicked: false, ga4ReportingConfirmed: false, productionCollectionBlocked: true, collectorRequests: [], failures: [], assets: [] };
function collectorRows(request) {
  const u = new URL(request.url());
  if (!/(^|\.)google-analytics\.com$/.test(u.hostname) || !u.pathname.endsWith('/collect')) return [];
  const bodies = (request.postData() || '').split('\n');
  return bodies.map(body => {
    const p = new URLSearchParams(u.search);
    new URLSearchParams(body).forEach((v, k) => p.set(k, v));
    return { endpoint: cleanUrl(request.url()), eventName: p.get('en'), measurementId: p.get('tid'), consent: { gcs: p.get('gcs'), gcd: p.get('gcd') } };
  });
}
(async () => {
  fs.mkdirSync(out, {recursive:true});
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({viewport:{width:1365,height:950}});
    for (const route of ['/.well-known/max-site-release.json','/assets/analytics-config.js','/assets/consent.js']) {
      const response = await context.request.get('https://maxsite.com.ua'+route, {timeout:20000});
      const bytes = await response.body();
      const asset = {path:route,status:response.status(),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
      if (route.endsWith('release.json') && response.ok()) {
        const marker=JSON.parse(bytes.toString()); report.liveRevision=marker.revision; report.releaseGeneratedAt=marker.generatedAt;
      }
      report.assets.push(asset);
    }
    // Keep the real tag code to inspect the generated request, but never let
    // QA pageviews, sessions or conversions enter the production property.
    // Block every other off-site destination, including the lead endpoint.
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const rows = collectorRows(request);
      if (rows.length) {
        report.collectorRequests.push(...rows.map(row => ({...row,intercepted:true,observedAt:new Date().toISOString()})));
        return route.fulfill({status:204,body:''});
      }
      if (url.origin === 'https://maxsite.com.ua'
        || (url.origin === 'https://www.googletagmanager.com' && url.pathname === '/gtag/js')) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    page.on('requestfailed', request => report.failures.push({url:cleanUrl(request.url()),reason:request.failure()?.errorText}));
    page.on('pageerror', error => report.failures.push({type:'pageerror',name:error.name}));
    const response = await page.goto(PAGE,{waitUntil:'domcontentloaded',timeout:30000});
    report.documentStatus=response.status(); report.finalUrl=cleanUrl(page.url());
    report.beforeConsent=await page.evaluate(()=>window.MAX_SITE_CONSENT || null);
    const analytics = page.locator('.consent-panel button[data-choice="analytics"]');
    if (await analytics.isVisible()) { await analytics.click(); report.consentChoice='analytics'; }
    else report.consentChoice='banner_not_observed';
    await page.waitForTimeout(20000);
    report.afterConsent=await page.evaluate(()=>window.MAX_SITE_CONSENT || null);
    report.loadedTagIds=await page.evaluate(()=>Array.from(document.scripts).map(s=>{try{return new URL(s.src).searchParams.get('id');}catch{return null;}}).filter(Boolean));
    report.title=await page.title();
    await page.screenshot({path:path.join(out,'landing-desktop.png')});
    report.pageviewGenerationConfirmed=report.collectorRequests.some(r=>r.eventName==='page_view' && r.measurementId===ID && r.intercepted);
    report.transportConfirmed=false;
    report.status=report.pageviewGenerationConfirmed?'GENERATION_CONFIRMED_COLLECTION_BLOCKED':'GENERATION_NOT_CONFIRMED';
    await context.close();
  } catch(error) { report.status='DIAGNOSTIC_BLOCKED'; report.error={name:error.name,message:String(error.message).replace(/https?:\/\/\S+/g,'[URL]').slice(0,300)}; }
  finally { if(browser) await browser.close(); report.completedAt=new Date().toISOString(); fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2)); }
})();
