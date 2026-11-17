const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
 await page.emulateMedia({reducedMotion:'reduce'});
});
const routes=[
 ['/mista/stvorennya-sajtiv-cherkasy/','#cherkasy-first-scope'],
 ['/mista/stvorennya-sajtiv-dnipro/','main section:has(h2:text("Що отримаєте до початку розробки"))'],
 ['/nishi/sajt-dlya-kliningovoyi-kompaniyi/','#cleaning-project-scope']
];
for(const [route,selector] of routes)test(`priority content ${route} stays readable with working FAQ and internal navigation`,async({page},testInfo)=>{
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(route);
  await expect(page.locator('h1')).toBeVisible();await expect(page.locator('h1')).toHaveCount(1);
  const section=page.locator(selector);await section.scrollIntoViewIfNeeded();await expect(section).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  if(width===390)await testInfo.attach('priority-scope-mobile',{body:await section.screenshot(),contentType:'image/png'});
  const faq=page.locator('main details').first(),summary=faq.locator('summary');
  await summary.click();await expect(faq).toHaveAttribute('open','');await summary.click();await expect(faq).not.toHaveAttribute('open','');
  const link=page.locator('main a[href="/blog/sajt-katalog-chy-internet-magazyn/"], main a[href="/blog/sajt-dlya-kliningovoyi-kompaniyi/"]').first();
  await link.click();await expect(page).toHaveURL(/\/blog\//);await page.goBack();await expect(page).toHaveURL(new RegExp(route+'$'));
  await page.locator('.seo-hero a[href="#lead"]').click();await expect(page.locator('#lead')).toBeInViewport();
  await expect(page.locator('#lead form')).toBeVisible();
  // Navigation only: never submit a real or mock lead for this content change.
 }
});
test('city hub exposes published locations and an online enquiry path without rollout labels',async({page})=>{
 await page.goto('/mista/');const main=page.locator('main');
 await expect(main).not.toContainText(/Wave|QA|noindex|Наступні міста/);
 await page.locator('main a[href="/mista/stvorennya-sajtiv-cherkasy/"]').first().click();
 await expect(page.locator('h1')).toHaveText('Створення сайтів у Черкасах для бізнесу');
 await page.goBack();await page.goForward();await expect(page).toHaveURL(/stvorennya-sajtiv-cherkasy\/$/);
});
