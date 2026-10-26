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

test('all restored blog links support navigation and Back without overflow',async({page})=>{
 const routes=['shcho-vhodyt-u-stvorennya-internet-magazynu-pid-klyuch','skilky-koshtuye-stvorennya-internet-magazynu','yak-vybraty-rozrobnyka-sajtu','yak-zamovyty-sajt-i-ne-vtratyty-groshi'];
 await page.goto('/blog/?maxsite_qa=1');
 for(const slug of routes){
  const path='/blog/'+slug+'/';
  await page.locator('#blog-decision-guides a[href="'+path+'"]').click();
  await expect(page).toHaveURL(new RegExp(path+'$'));
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://maxsite.com.ua'+path);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goBack();
  await expect(page).toHaveURL(/\/blog\/\?maxsite_qa=1$/);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
