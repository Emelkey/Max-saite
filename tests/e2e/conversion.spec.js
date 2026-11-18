const {test,expect}=require('@playwright/test');
test.beforeEach(async({page,baseURL})=>{
 const origin=new URL(baseURL).origin;
 await page.context().route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});
test('calculator transfers scope to real form, preserves notes and supports repeated changes without sending',async({page})=>{
 const posts=[];page.on('request',r=>{if(r.method()==='POST')posts.push(r.url());});
 await page.goto('/kalkulyator-vartosti-saytu/');
 const comment=page.locator('#lead textarea[name=comment]');
 await comment.fill('Мій додатковий опис');
 await page.locator('[name=site-type][value=shop]').check();
 await page.locator('[name=scope][value=migration]').check();
 await page.locator('[data-cost-lead]').click();
 await expect(comment).toHaveValue(/Інтернет-магазин[\s\S]*чинні URL[\s\S]*Мій додатковий опис/);
 await page.locator('[data-cost-lead]').click();
 expect((await comment.inputValue()).match(/Калькулятор MAX SITE/g)).toHaveLength(1);
 await page.locator('[name=site-type][value=business]').check();
 await expect(comment).toHaveValue(/Калькулятор MAX SITE: Сайт для бізнесу/);
 await expect(comment).toHaveValue(/Мій додатковий опис/);
 await expect(page.locator('#lead [name=consent]')).not.toBeChecked();
 await expect(page.locator('[data-cost-telegram]')).toHaveText('Поділитися через Telegram');
 expect(new URL(await page.locator('[data-cost-email]').getAttribute('href')).pathname).toBe('');
 expect(posts).toEqual([]);
});
for(const width of [320,390,1440])test(`conversion routes fit ${width}px without hidden primary controls`,async({page},info)=>{
 await page.setViewportSize({width,height:844});
 for(const path of ['/','/kalkulyator-vartosti-saytu/','/obgovoryty-proiekt/']){
  await page.goto(path);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator('h1')).toBeVisible();
  if(path==='/'){
   await expect(page.locator('.mx-hero-actions .mx-btn-primary')).toHaveText(/Отримати кошторис/);
   await expect(page.locator('.mx-hero-actions a[href="tel:+380972692322"]')).toBeVisible();
  }
  await info.attach(`${width}-${path.replaceAll('/','_')}`,{body:await page.screenshot(),contentType:'image/png'});
 }
});
