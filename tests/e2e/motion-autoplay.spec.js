const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('homepage animation begins on entry and pauses when the visitor interacts',async({page})=>{
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController?.getState().playing)).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThan(0.005);
  await expect(page.locator('#playButton')).toHaveAttribute('aria-pressed','true');
  await page.locator('#playButton').click();
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
  await expect(page.locator('#playButton')).toHaveAttribute('aria-pressed','false');
});

test('reduced motion and direct section links do not trigger autoplay',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('#playButton')).toBeDisabled();
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);

  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/#work');
  await page.waitForTimeout(250);
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
});

test('portfolio covers align and open their case pages',async({page,isMobile})=>{
  await page.goto('/#work');
  const covers=page.locator('.mx-project-art');
  await expect(covers).toHaveCount(3);
  for(const [index,route] of ['/portfolio/formula-chystoty/','/portfolio/fo-dez/','/portfolio/max-site/'].entries()){
    await expect(covers.nth(index)).toHaveAttribute('href',route.slice(1));
  }
  if(!isMobile){
    const tops=await covers.evaluateAll(elements=>elements.map(element=>Math.round(element.getBoundingClientRect().top)));
    expect(Math.max(...tops)-Math.min(...tops)).toBeLessThanOrEqual(1);
  }
  await covers.nth(1).click();
  await expect(page).toHaveURL(/\/portfolio\/fo-dez\/$/);
  await expect(page.locator('h1')).toHaveCount(1);
});
