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
   await page.goto(`/portfolio/${slug}/`);
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
   await page.locator('.case-intro').scrollIntoViewIfNeeded();
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
