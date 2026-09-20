const {test,expect}=require('@playwright/test');

test('SEO illustration is explicitly labelled and remains readable',async({page},testInfo)=>{
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    return ['127.0.0.1','localhost'].includes(url.hostname)?route.continue():route.abort();
  });
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const panel=page.getByRole('group',{name:'Ілюстрація SEO-аналітики'});
  await panel.scrollIntoViewIfNeeded();
  await expect(panel.locator('.dash-caption')).toHaveText('Умовна ілюстрація, не показники клієнтського проєкту.');
  await expect(panel.locator('.dash-caption')).toBeVisible();
  await expect(panel.locator('.chart')).toHaveAttribute('aria-hidden','true');
  expect(await panel.innerText()).not.toMatch(/[+]\s*\d+(?:[.,]\d+)?\s*%/);
  expect(await panel.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  await testInfo.attach('seo-evidence-panel',{body:await panel.screenshot(),contentType:'image/png'});
});
