const {test,expect}=require('@playwright/test');
const {captureScreenshot}=require('../helpers/capture-screenshot');
test.use({serviceWorkers:'block'});
const route='/blog/peredacha-saytu-vlasnyku-dostupy-kod-domen/';

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

test('handover guide has a usable register, safe CTA and back navigation',async({page,isMobile},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(route+'?maxsite_qa=1');
  expect(response.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Передача сайту власнику: як прийняти доступи, код і сервіси');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://maxsite.com.ua'+route);
  await expect(page.locator('.article-body')).toContainText('навчальний приклад');
  await expect(page.locator('table tbody tr')).toHaveCount(6);
  await page.getByRole('link',{name:'Реєстр приймання',exact:true}).click();
  await expect(page.locator('#inventory')).toBeInViewport();
  await testInfo.attach('handover-register',{body:await captureScreenshot(page),contentType:'image/png'});
  await page.locator('#cta a.btn').click();
  await expect(page).toHaveURL(/\/obgovoryty-proiekt\/\?format=website$/);
  await page.goBack();await expect(page.locator('h1')).toContainText('Передача сайту');
  if(isMobile){const toggle=page.locator('.nav-toggle');await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','false');}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
