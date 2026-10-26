const {test,expect}=require('@playwright/test');
const {captureScreenshot}=require('../helpers/capture-screenshot');
test.use({serviceWorkers:'block'});
const route='/pro-nas/#animation-stories';

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

test('emerging cartoon direction and own channel remain honest and read-only',async({page,isMobile},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/poslugy/?maxsite_qa=1');
 await page.locator('[data-animation-direction] a').click();
 await expect(page).toHaveURL(/\/pro-nas\/#animation-stories$/);
 const section=page.locator('#animation-stories');
 await expect(section).toBeInViewport();
 await expect(section).toContainText('не портфоліо завершених клієнтських мультфільмів');
 const channel=section.getByRole('link',{name:'Smile Planet на YouTube (нова вкладка)',exact:true});
 await expect(channel).toHaveAttribute('href','https://www.youtube.com/@SmilePlanetCartoons');
 await expect(channel).toHaveAttribute('target','_blank');
 await expect(channel).toHaveAttribute('rel','noopener noreferrer');
 await expect(section.locator('iframe,video')).toHaveCount(0);
 await testInfo.attach('animation-direction',{body:await captureScreenshot(page),contentType:'image/png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goBack();await expect(page).toHaveURL(/\/poslugy\/\?maxsite_qa=1$/);
 expect(errors).toEqual([]);
});
