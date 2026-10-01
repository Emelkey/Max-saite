/* Read-only transport diagnostic. No form submissions, ad clicks or injected events. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('@playwright/test');
const PAGE = 'https://maxsite.com.ua/stvorennya-saytiv/';
const ID = 'G-TS8DMMKK34';
const out = path.resolve('artifacts/analytics-live');
const cleanUrl = value => { try { const u = new URL(value); return u.origin + u.pathname; } catch { return ''; } };
const report = { startedAt: new Date().toISOString(), page: PAGE, measurementId: ID, propertyId: '548154976', qa: true, leadSubmitted: false, adClicked: false, ga4ReportingConfirmed: false, collectorRequests: [], failures: [], assets: [] };
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
    const page = await context.newPage();
    page.on('response', response => { for (const row of collectorRows(response.request())) report.collectorRequests.push({...row,status:response.status(),observedAt:new Date().toISOString()}); });
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
    report.transportConfirmed=report.collectorRequests.some(r=>r.eventName==='page_view' && r.measurementId===ID && r.status>=200 && r.status<300);
    report.status=report.transportConfirmed?'TRANSPORT_CONFIRMED_REPORTING_UNVERIFIED':'TRANSPORT_NOT_CONFIRMED';
    await context.close();
  } catch(error) { report.status='DIAGNOSTIC_BLOCKED'; report.error={name:error.name,message:String(error.message).replace(/https?:\/\/\S+/g,'[URL]').slice(0,300)}; }
  finally { if(browser) await browser.close(); report.completedAt=new Date().toISOString(); fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2)); }
})();
