const {test,expect}=require('@playwright/test');

// 2026-10 homepage: decorative CSS motion only. No autoplay timeline, no
// scroll hijacking, and content must never stay hidden behind an animation.
test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('homepage has no autoplay player and keeps the approved section order',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#motion-controls, #progress, #playButton, #stage')).toHaveCount(0);
  await expect(page.locator('.mx-footer .consent-settings')).toHaveCount(1);
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
  expect(await page.locator('.mx-content > section').evaluateAll(sections=>sections.map(section=>section.id)))
    .toEqual(['work','pricing','services','founder','process','faq','lead']);
  await expect(page.locator('h1')).toContainText('Створюємо');
  await expect(page.locator('h1')).toContainText('Вражаємо досвідом.');
});

test('direct section links land on visible content without waiting for motion',async({page})=>{
  for(const section of ['work','pricing','services','process','faq','lead']){
    await page.goto('about:blank');
    await page.goto('/#'+section);
    await expect(page.locator('#'+section)).toBeInViewport();
    await expect.poll(()=>page.evaluate(id=>[...document.querySelectorAll('#'+id+' .mx-rv')].every(el=>Number(getComputedStyle(el).opacity)>.95),section)).toBe(true);
  }
});

test('reduced motion removes loops and shows every revealed block immediately',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const state=await page.evaluate(()=>({
    hidden:[...document.querySelectorAll('.mx-rv')].filter(el=>Number(getComputedStyle(el).opacity)<1).length,
    ticker:getComputedStyle(document.querySelector('.mx-ticker > div')).animationName,
    rotor:document.querySelector('.mx-rotor').textContent
  }));
  expect(state.hidden).toBe(0);
  expect(state.ticker).toBe('none');
  await page.waitForTimeout(3000);
  expect(await page.locator('.mx-rotor').textContent()).toBe(state.rotor);
});

test('portfolio cards keep live previews inside their frames',async({page})=>{
  await page.goto('/#work');
  for(const name of ['formula','fodez','b2b']){
    const art=page.locator(`#work .mx-case-${name} .mx-project-art`);
    await expect(art).toBeVisible();
    const overflow=await art.evaluate(el=>el.scrollWidth-el.clientWidth);
    expect(overflow,`${name} preview overflow`).toBeLessThanOrEqual(1);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('desktop wheel scrolling moves the page natively from the first frame',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop wheel');
  await page.goto('/');
  await page.mouse.move(600,400);
  await page.mouse.wheel(0,900);
  await expect.poll(()=>page.evaluate(()=>window.scrollY),{timeout:1500}).toBeGreaterThan(500);
});
