const {test,expect}=require('@playwright/test');
const target='https://www.instagram.com/maxlab.ai/';
test.beforeEach(async({context,page,baseURL})=>{
  await context.route('**/*',route=>{
    const url=route.request().url();
    if(url.startsWith(target)) return route.fulfill({status:200,contentType:'text/html',body:'<title>Instagram destination test</title>'});
    if(!url.startsWith(baseURL)) return route.abort();
    return route.continue();
  });
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});
for(const route of ['/','/stvorennya-saytiv/','/kontakty/','/blog/nextjs-chy-wordpress/']){
 test(`Instagram visible and outbound navigation verified: ${route}`,async({page,context},testInfo)=>{
  await page.goto(route+'?maxsite_qa=1');
  const home=route==='/';
  const toggle=page.locator(home?'.mx-menu-toggle':'.nav-toggle');
  const compact=await toggle.isVisible();
  if(compact){
   await toggle.focus();await page.keyboard.press('Enter');
   await expect(toggle).toHaveAttribute('aria-expanded','true');
  }
  const link=page.locator(home?(compact?'#mobileMenu .instagram-link':'.mx-nav-actions .instagram-link'):'.main-nav .instagram-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href',target);
  await expect(link).toHaveAttribute('rel',/noopener/);
  await expect(link.locator('svg')).toBeVisible();
  const box=await link.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);
  await link.focus();await expect(link).toBeFocused();
  expect(await link.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  await testInfo.attach('instagram-navigation',{body:await page.screenshot(),contentType:'image/png'});
  const [popup]=await Promise.all([context.waitForEvent('page'),page.keyboard.press('Enter')]);
  await popup.waitForLoadState();expect(popup.url()).toBe(target);await popup.close();
  if(compact){
   await expect(toggle).toHaveAttribute('aria-expanded','false');
   await toggle.click();await page.keyboard.press('Escape');
   await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(toggle).toBeFocused();
  }
  const footer=page.locator('footer .instagram-link');await expect(footer).toHaveCount(1);
  await footer.scrollIntoViewIfNeeded();await expect(footer).toBeVisible();
  if(home||route==='/kontakty/'){
   const contact=page.locator(home?'.mx-messengers .instagram-link':'.instagram-contact');
   await contact.scrollIntoViewIfNeeded();await expect(contact).toBeVisible();
   await testInfo.attach('instagram-contact',{body:await page.screenshot(),contentType:'image/png'});
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
for(const width of [320,980,981,1120,1121,1200,1201,1280,1440,1441])test(`Navigation remains clear at ${width}px`,async({page},testInfo)=>{
 for(const route of ['/','/stvorennya-saytiv/']){
  await page.setViewportSize({width,height:800});await page.goto(route+'?maxsite_qa=1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}`).toBe(true);
  const toggle=page.locator(route==='/'?'.mx-menu-toggle':'.nav-toggle');
  if(await toggle.isVisible())await toggle.click();
  const links=page.locator(route==='/'?(await toggle.isVisible()?'#mobileMenu .instagram-link':'.mx-nav-actions .instagram-link'):'.main-nav .instagram-link');
  await expect(links).toBeVisible();await links.scrollIntoViewIfNeeded();
  const box=await links.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);
  const cta=page.locator(route==='/'?'.mx-nav-cta':'.header-actions .request-button');
  if(await cta.isVisible()){const cb=await cta.boundingBox();expect(cb.x).toBeGreaterThanOrEqual(0);expect(cb.x+cb.width).toBeLessThanOrEqual(width+1);}
  if(width===320)await testInfo.attach(`instagram-320-${route==='/'?'home':'landing'}`,{body:await page.screenshot(),contentType:'image/png'});
 }
});
