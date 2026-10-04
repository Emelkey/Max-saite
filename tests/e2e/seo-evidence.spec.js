const {test,expect}=require('@playwright/test');

test('portfolio and cinematic demo clearly disclose illustrative content',async({page},testInfo)=>{
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    return ['127.0.0.1','localhost'].includes(url.hostname)?route.continue():route.abort();
  });
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const disclosure=page.locator('#work .mx-disclosure');
  await disclosure.scrollIntoViewIfNeeded();
  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText('B2B CLEAN UKRAINE представлено скриншотом чинного сайту');
  await expect(disclosure).toContainText('FORMA у першій сцені залишається демонстраційним концептом');
  expect(await disclosure.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  expect(await page.locator('main').innerText()).not.toMatch(/[+]\s*\d+(?:[.,]\d+)?\s*%/);
  await testInfo.attach('portfolio-and-demo-disclosure',{body:await disclosure.screenshot(),contentType:'image/png'});
});
