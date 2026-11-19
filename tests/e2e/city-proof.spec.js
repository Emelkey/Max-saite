const {test,expect}=require('@playwright/test');
for(const slug of ['cherkasy','dnipro']) test(`${slug}: useful city content and existing lead path on desktop/mobile`,async({page})=>{
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/api/lead',()=>{throw new Error('No lead submission is permitted in this read-only smoke test');});
 await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(`/mista/stvorennya-sajtiv-${slug}/`);
 await expect(page.locator('h1')).toHaveText(slug==='cherkasy'?'Створення сайтів у Черкасах для бізнесу':'Створення сайтів у Дніпрі для бізнесу');
 const content=slug==='cherkasy'?page.locator('#cherkasy-live-service-path'):page.getByRole('heading',{name:'Приклад картки обладнання: що побачить покупець'});
 await content.scrollIntoViewIfNeeded();await expect(content).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 if(slug==='cherkasy'){
  await expect(content.locator('a[href^="https://www.formula-chistoty.ck.ua/"]')).toHaveCount(3);
  await content.locator('a[href="#lead"]').click();
 }else await page.locator('.hero-buttons a[href="#lead"]').click();
 await expect(page.locator('#lead form')).toBeVisible();
 const phone=page.locator('#lead form input[name="phone"]');
 await expect(phone).toBeVisible();
 await expect(phone).toHaveAttribute('inputmode','tel');
 await expect(phone).toHaveAttribute('autocomplete','tel');
});
