const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const endpoint='https://max-site-leads.emelkey777.workers.dev/**';

test.beforeEach(async({page},testInfo)=>{
  // All QA is local: never deliver a lead or analytics event to a live service.
  await page.route('https://**/*',route=>route.request().url().includes('googletagmanager.com')
    ? route.fulfill({status:200,contentType:'application/javascript',body:''}) : route.abort());
  if(!testInfo.title.startsWith('paid hero typography and first-visit')) {
    await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
  }
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

test('combined contact supports phone and Telegram text entry without mobile capitalization',async({page})=>{
  for(const url of ['/#lead','/stvorennya-saytiv/#lead']){
    await page.goto(url);
    const contact=page.locator('form [name=phone]');
    await expect(contact).toHaveAttribute('type','text');
    await expect(contact).toHaveAttribute('inputmode','text');
    await expect(contact).toHaveAttribute('autocapitalize','none');
    await expect(contact).toHaveAttribute('spellcheck','false');
    await contact.fill('@local_qa');
    await expect(contact).toHaveValue('@local_qa');
    await contact.fill('+380000000000');
    await expect(contact).toHaveValue('+380000000000');
  }
});

for (const viewport of [{width:1180,height:757},{width:1440,height:900},{width:768,height:1024},{width:390,height:844},{width:320,height:640},{width:320,height:568}]) {
  test(`paid hero typography and first-visit consent at ${viewport.width}x${viewport.height}px`,async({page},testInfo)=>{
    await page.setViewportSize(viewport);
    await page.goto('/stvorennya-saytiv/');
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>scrollY)).toBe(0);
    const panel=page.locator('.consent-panel');
    await expect(panel).toBeVisible();
    const heading=page.locator('.cro-quote-hero h1');
    const fontSize=await heading.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeLessThanOrEqual(viewport.width<=760?30:46);
    expect(fontSize).toBeGreaterThanOrEqual(24);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    if(viewport.height>=640){
      const consent=await panel.boundingBox();
      const selectors=['.cro-price','.cro-quote-hero .hero-buttons'];
      if(viewport.width>=1180) selectors.push('#lead button[type=submit]');
      for(const selector of selectors){
        const box=await page.locator(selector).boundingBox();
        expect(box.y+box.height).toBeLessThanOrEqual(viewport.height);
        const overlap=Math.min(box.x+box.width,consent.x+consent.width)>Math.max(box.x,consent.x)
          && Math.min(box.y+box.height,consent.y+consent.height)>Math.max(box.y,consent.y);
        expect(overlap,`${selector} must not be covered by consent`).toBe(false);
      }
    }
    await testInfo.attach(`paid-first-visit-${viewport.width}x${viewport.height}`,{body:await page.screenshot(),contentType:'image/png'});
    await panel.getByRole('button',{name:'Лише необхідні',exact:true}).click();
    await expect(panel).toBeHidden();
    await page.locator('.consent-settings').click();
    await expect(panel).toBeVisible();
    await expect(panel.locator('button')).toHaveCount(3);
  });
}

const legacyServiceRoutes={
  '/stvorennya-lendingiv/':'/stvorennya-landing-page/',
  '/korporatyvni-sajty/':'/stvorennya-korporatyvnoho-saytu/',
  '/internet-magazyn-pid-klyuch/':'/stvorennya-internet-mahazynu/'
};
for(const [source,target] of Object.entries(legacyServiceRoutes)){
  test(`legacy service ${source} reaches the current offer with attribution`,async({page})=>{
    const suffix='?utm_source=google&utm_medium=cpc&gclid=qa-alias-click#lead';
    await page.goto(source+suffix);
    await expect(page).toHaveURL(new RegExp(target.replaceAll('/','\\/')+'\\?utm_source=google&utm_medium=cpc&gclid=qa-alias-click#lead$'));
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://maxsite.com.ua'+target);
    await expect(page.locator('form')).toHaveCount(1);
    expect(await page.evaluate(()=>window.MAX_SITE_CONSENT.ad_storage)).toBe('denied');
    expect(await page.evaluate(()=>sessionStorage.getItem('max_site_gclid'))).toBeNull();
  });
}

test('legacy aliases remain usable without JavaScript and show no stale prices',async({browser,baseURL})=>{
  const page=await browser.newPage({javaScriptEnabled:false});
  try{
    await page.route('https://**/*',route=>route.abort());
    for(const [source,target] of Object.entries(legacyServiceRoutes)){
      await page.goto(baseURL+source);
      const link=page.locator('[data-legacy-destination]');
      await expect(link).toHaveAttribute('href',target);
      await expect(link).toBeVisible();
      await expect(page.locator('body')).not.toContainText('10 500');
      await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');
      await link.click();
      await expect(page).toHaveURL(baseURL+target);
    }
  }finally{await page.close();}
});
