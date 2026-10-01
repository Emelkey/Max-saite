const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const endpoint='https://max-site-leads.emelkey777.workers.dev/**';

test.beforeEach(async({page})=>{
  // All QA is local: never deliver a lead or analytics event to a live service.
  await page.route('https://**/*',route=>route.request().url().includes('googletagmanager.com')
    ? route.fulfill({status:200,contentType:'application/javascript',body:''}) : route.abort());
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('paid landing keeps one accessible quote form, honest prices and SEO identity',async({page},testInfo)=>{
  await page.goto('/stvorennya-saytiv/');
  await expect(page).toHaveTitle('Замовити сайт під ключ в Україні | MAX SITE');
  await expect(page.locator('h1')).toHaveText('Створення сайтів під ключ для бізнесу в Україні');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://maxsite.com.ua/stvorennya-saytiv/');
  await expect(page.locator('form')).toHaveCount(1);
  await expect(page.locator('.cro-hero #lead form')).toHaveCount(1);
  await expect(page.locator('#lead')).not.toHaveClass(/reveal/);
  await expect(page.locator('.cro-price')).toHaveCount(1);
  await expect(page.locator('.cro-price')).toContainText('10 500 грн');
  await expect(page.locator('.cro-price')).toContainText('19 700 грн');
  const form=page.locator('#lead form');
  expect(await form.locator('[required]').evaluateAll(nodes=>nodes.map(n=>n.name))).toEqual(['name','phone','consent']);
  await expect(form.locator('[name="business"]')).toHaveAttribute('type','hidden');
  await expect(form.locator('[name="consent"]')).not.toBeChecked();
  await expect(page.locator('.cro-proof-note')).toContainText('пов’язані з власником');
  const out=path.join('artifacts/playwright/ads-landing',testInfo.project.name);
  fs.mkdirSync(out,{recursive:true});
  await page.screenshot({path:path.join(out,'first-screen.png')});
  await page.goto('/stvorennya-saytiv/#lead');
  const heading=page.locator('#quote-title');
  await expect(heading).toBeVisible();
  await expect.poll(async()=>{
    const h=await heading.boundingBox();const header=await page.locator('.site-header').boundingBox();
    return h.y-header.y-header.height;
  }).toBeGreaterThanOrEqual(0);
  await page.screenshot({path:path.join(out,'quote-form.png')});
});

for(const acknowledgement of ['matching','mismatched']) test(`hero quote ${acknowledgement} acknowledgement is handled honestly`,async({page})=>{
  const requests=[];
  let complete;
  const pending=new Promise(resolve=>{complete=resolve;});
  await page.route(endpoint,async route=>{
    const payload=route.request().postDataJSON();requests.push(payload);
    await pending;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,lead_id:acknowledgement==='matching'?payload.requestId:'wrong-id'})});
  });
  await page.goto('/stvorennya-saytiv/');
  const form=page.locator('#lead form');
  await form.locator('[name=name]').fill('QA LOCAL ONLY');
  await form.locator('[name=phone]').fill('+380000000000');
  await form.locator('[name=consent]').check();
  await form.evaluate(el=>{el.requestSubmit();el.requestSubmit();});
  await expect.poll(()=>requests.length).toBe(1);
  await expect(form.locator('button[type=submit]')).toBeDisabled();
  expect(requests[0].fields.business).toBe('Створення сайтів під ключ в Україні');
  complete();
  await expect(form.locator('.form-status')).toHaveAttribute('data-state',acknowledgement==='matching'?'success':'error');
  const events=await page.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').map(x=>Array.from(x)));
  expect(events.filter(x=>x[1]==='generate_lead')).toHaveLength(acknowledgement==='matching'?1:0);
  expect(JSON.stringify(events)).not.toMatch(/QA LOCAL ONLY|380000000000/);
  if(acknowledgement==='mismatched') await expect(form.locator('[name=phone]')).toHaveValue('+380000000000');
});
