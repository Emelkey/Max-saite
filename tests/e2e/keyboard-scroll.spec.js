const {test,expect}=require('@playwright/test');

test.beforeEach(async({page,isMobile})=>{
  test.skip(isMobile,'Desktop keyboard navigation.');
  await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
  await page.route(/https:\/\/(?:[a-z0-9-]+\.)?google-analytics\.com\//,route=>route.fulfill({status:204,body:''}));
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

for(const route of ['/','/stvorennya-landing-page/']){
  test(`arrow keys scroll ${route} down and up`,async({page},testInfo)=>{
    await page.goto(route,{waitUntil:'networkidle'});
    await page.locator('h1').click();
    const start=await page.evaluate(()=>scrollY);
    for(let i=0;i<5;i++)await page.keyboard.press('ArrowDown');
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(start+60);
    // Wait for the browser's own keyboard-scroll animation to settle.
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(start+100);
    const down=await page.evaluate(()=>scrollY);
    await testInfo.attach('page-after-arrow-down',{body:await page.screenshot(),contentType:'image/png'});
    for(let i=0;i<5;i++)await page.keyboard.press('ArrowUp');
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(down-40);
  });
}

test('arrow keys move the textarea caret without scrolling the page',async({page})=>{
  await page.goto('/');
  const comment=page.locator('#lead-comment');
  await comment.scrollIntoViewIfNeeded();
  await comment.fill('First line\nSecond line\nThird line');
  await comment.focus();
  await expect(comment).toBeFocused();
  const start=await page.evaluate(()=>scrollY);
  const end=await comment.evaluate(element=>element.value.length);
  await page.keyboard.press('ArrowUp');
  await expect.poll(()=>comment.evaluate(element=>element.selectionStart)).toBeLessThan(end);
  await page.keyboard.press('ArrowDown');
  await expect.poll(()=>comment.evaluate(element=>element.selectionStart)).toBe(end);
  expect(await page.evaluate(()=>scrollY)).toBe(start);
});

test('nested scroll regions retain their arrow keys',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    const region=document.createElement('div');
    region.id='keyboard-scroll-region';
    region.tabIndex=0;
    region.style.cssText='position:fixed;top:100px;left:20px;height:80px;width:200px;overflow-y:auto;z-index:1000';
    region.innerHTML='<div style="height:400px">Local keyboard QA</div>';
    document.body.append(region);
    window.keyboardQaPrevented=null;
    document.addEventListener('keydown',event=>{window.keyboardQaPrevented=event.defaultPrevented;});
  });
  await page.locator('#keyboard-scroll-region').focus();
  const start=await page.evaluate(()=>scrollY);
  await page.keyboard.press('ArrowDown');
  expect(await page.evaluate(()=>window.keyboardQaPrevented)).toBe(false);
  expect(await page.evaluate(()=>scrollY)).toBe(start);
});
