const {test,expect}=require('@playwright/test');
test.setTimeout(60000);
const cases=[['formula-chystoty','Формула Чистоти','https://www.formula-chistoty.ck.ua/'],['fo-dez','FO-DEZ','https://www.fodez.com.ua/'],['b2b-clean-ukraine','B2B CLEAN UKRAINE','https://b2bcleanukraine.com/']];

test.beforeEach(async({page})=>{
 await page.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
 await page.emulateMedia({reducedMotion:'reduce'});
});
for(const [slug,name,live] of cases){
 test(`${name}: readable actual screenshots, sections and form at desktop and narrow mobile widths`,async({page},testInfo)=>{
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});
   // A fresh entry must be distinct from browser history/scroll restoration.
   await page.goto('/portfolio/');
   await page.goto(`/portfolio/${slug}/`);
   await page.evaluate(async()=>{window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
   const initial=await page.evaluate(()=>{
    const header=document.querySelector('.site-header').getBoundingClientRect();
    const breadcrumbs=document.querySelector('.breadcrumbs').getBoundingClientRect();
    const h1=document.querySelector('h1').getBoundingClientRect();
    return {scrollY,headerTop:header.top,headerBottom:header.bottom,breadcrumbsTop:breadcrumbs.top,h1Top:h1.top};
   });
   expect(initial.scrollY).toBe(0);
   expect(Math.abs(initial.headerTop)).toBeLessThanOrEqual(1);
   expect(initial.headerBottom).toBeLessThanOrEqual(initial.breadcrumbsTop);
   expect(initial.headerBottom).toBeLessThanOrEqual(initial.h1Top);
   if([1440,390].includes(width))await testInfo.attach(`${slug}-${width}-initial-viewport`,{body:await page.screenshot({fullPage:false}),contentType:'image/png'});
   await expect(page.locator('h1')).toHaveText(name);
   await expect(page.locator('.case-ownership')).toContainText('пов’язаний із власником MAX SITE');
   await expect(page.locator('.case-intro .btn').first()).toHaveAttribute('href',live);
   await expect(page.locator('.case-intro .btn').first()).toHaveAttribute('rel','noopener noreferrer');
   for(const image of await page.locator('.real-case img').all()){
    await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
   }
   for(const id of ['case-task','case-solution','case-result','case-evidence','lead']){
    const section=page.locator(`#${id}`);await section.scrollIntoViewIfNeeded();await expect(section).toBeVisible();
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
   // Reset after the lead/evidence checks. A scrolled full-page capture paints
   // sticky/fixed elements at the saved scroll offset and can falsely hide H1.
   await page.evaluate(async()=>{window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
   expect(await page.evaluate(()=>scrollY)).toBe(0);
   const returned=await page.evaluate(()=>({headerBottom:document.querySelector('.site-header').getBoundingClientRect().bottom,h1Top:document.querySelector('h1').getBoundingClientRect().top}));
   expect(returned.headerBottom).toBeLessThanOrEqual(returned.h1Top);
   if([1440,390].includes(width))await testInfo.attach(`${slug}-${width}`,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  }
 });
 test(`${name}: section navigation and back/forward retain correct case`,async({page})=>{
  await page.goto(`/portfolio/${slug}/`);
  await page.locator('.case-jump a[href="#case-evidence"]').click();
  await expect(page).toHaveURL(new RegExp(`/portfolio/${slug}/#case-evidence$`));
  await expect(page.locator('#case-evidence')).toBeInViewport();
  await page.goBack();await expect(page).toHaveURL(new RegExp(`/portfolio/${slug}/$`));
  await page.goForward();await expect(page.locator('#case-evidence')).toBeInViewport();
  const next=page.locator('.case-next a').first();await next.focus();await expect(next).toBeFocused();await next.press('Enter');
  await expect(page.locator('h1')).not.toHaveText(name);
  await page.goBack();await expect(page.locator('h1')).toHaveText(name);
 });
}
test('B2B detailed case is reachable from homepage and directory while live cover remains external',async({page})=>{
 for(const [url,selector] of [['/#work','#work .mx-case-b2b .mx-case-cta'],['/portfolio/','#b2b-clean-ukraine .case-actions .btn:first-child']]){
  await page.goto(url);await page.locator(selector).click();await expect(page).toHaveURL(/\/portfolio\/b2b-clean-ukraine\/$/);await expect(page.locator('h1')).toHaveText('B2B CLEAN UKRAINE');
 }
 await page.goto('/portfolio/formula-chystoty/');await page.locator('.case-history summary').click();await expect(page.locator('#measured-mobile-baseline')).toBeVisible();await page.locator('.case-history summary').click();await expect(page.locator('#measured-mobile-baseline')).toBeHidden();
});
