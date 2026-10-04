const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('homepage motion starts automatically without a player and stops on interaction',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#motion-controls, #progress, #playButton')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Пропустити анімацію ↓'})).toBeVisible();
  await expect(page.locator('.mx-footer .consent-settings')).toHaveCount(1);
  await expect.poll(()=>page.evaluate(()=>window.demoController?.getState().playing)).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThan(0.005);
  await page.keyboard.press('Tab');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
  await page.getByRole('link',{name:'Пропустити анімацію ↓'}).click();
  await expect(page.locator('#work')).toBeFocused();
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(100);
});

test('reduced motion and direct section links do not trigger autoplay',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('#motion-controls, #progress, #playButton')).toHaveCount(0);
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);

  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/#work');
  await page.waitForTimeout(250);
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
});

test('visible chapter text stays clear of the moving preview',async({page,isMobile})=>{
  const viewports=isMobile?[[390,844],[320,640]]:[[1440,900]];
  for(const [width,height] of viewports){
    await page.setViewportSize({width,height});
    await page.goto('/');
    for(const progress of [.22,.4]){
      const layout=await page.evaluate(value=>{
        window.demoController.stop();
        window.demoController.setProgress(value);
        const heading=document.querySelector('#layerHeading');
        const h=heading.getBoundingClientRect();
        const c=document.querySelector('#camera').getBoundingClientRect();
        return {
          headingOpacity:Number(getComputedStyle(heading).opacity),
          overlap:Math.max(0,Math.min(h.right,c.right)-Math.max(h.left,c.left))*Math.max(0,Math.min(h.bottom,c.bottom)-Math.max(h.top,c.top)),
        };
      },progress);
      expect(layout.headingOpacity,`${width}px at ${progress}`).toBeGreaterThan(.5);
      expect(layout.overlap,`${width}px at ${progress}`).toBe(0);
    }
  }
});

test('portfolio covers open their case pages',async({page})=>{
  await page.goto('/#work');
  const covers=page.locator('.mx-project-art');
  await expect(covers).toHaveCount(3);
  for(const [index,route] of ['/portfolio/formula-chystoty/','/portfolio/fo-dez/','/portfolio/max-site/'].entries()){
    await expect(covers.nth(index)).toHaveAttribute('href',route.slice(1));
  }
  await covers.nth(1).click();
  await expect(page).toHaveURL(/\/portfolio\/fo-dez\/$/);
  await expect(page.locator('h1')).toHaveCount(1);
});
