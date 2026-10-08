const {test,expect}=require('@playwright/test');
const {captureScreenshot}=require('../helpers/capture-screenshot');
test.use({serviceWorkers:'block'});
const route='/blog/sajt-katalog-chy-internet-magazyn/';

test.beforeEach(async({page,baseURL})=>{
  const origin=new URL(baseURL).origin;
  await page.context().route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin===origin&&['GET','HEAD'].includes(req.method())){
      const response=await route.fetch({maxRedirects:0});
      if(response.status()>=300&&response.status()<400)return route.abort();
      return route.fulfill({response});
    }
    if(url.origin==='https://www.googletagmanager.com')return route.fulfill({status:200,contentType:'application/javascript',body:''});
    return route.abort();
  });
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('catalog decision guide renders and supports read-only navigation',async({page,isMobile},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(route+'?maxsite_qa=1');
  expect(response.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Сайт-каталог чи інтернет-магазин: що обрати для свого бізнесу');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://maxsite.com.ua'+route);
  await expect(page.locator('.article-body')).toContainText('Умовний приклад:');
  expect(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await testInfo.attach('catalog-article-top',{body:await captureScreenshot(page, ),contentType:'image/png'});
  await page.getByRole('link',{name:'П’ять запитань для вибору'}).click();
  await expect(page.locator('#decision')).toBeInViewport();
  for(const detail of await page.locator('#faq details').all()){
    await detail.locator('summary').click();await expect(detail.locator('p')).toBeVisible();
    await detail.locator('summary').click();await expect(detail.locator('p')).not.toBeVisible();
  }
  await page.locator('#next').scrollIntoViewIfNeeded();
  await testInfo.attach('catalog-article-next-steps',{body:await captureScreenshot(page, ),contentType:'image/png'});
  await page.locator('.article-body a[href="/kalkulyator-vartosti-saytu/"]').click();
  await expect(page).toHaveURL(/\/kalkulyator-vartosti-saytu\/$/);
  await page.goBack();await expect(page.locator('h1')).toContainText('Сайт-каталог');
  await page.locator('#cta a.btn').click();await expect(page).toHaveURL(/\/stvorennya-internet-mahazynu\/$/);
  await page.goBack();
  if(isMobile){
    const toggle=page.locator('.nav-toggle');await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');
    await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','false');
  }
  await page.locator('#cta').scrollIntoViewIfNeeded();
  await expect(page.locator('#cta input[name="name"]')).toHaveValue('');
  await expect(page.locator('#cta input[name="phone"]')).toHaveValue('');
  await expect(page.locator('#cta input[name="consent"]')).not.toBeChecked();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
