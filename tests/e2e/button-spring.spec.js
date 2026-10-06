const {test,expect}=require('@playwright/test');

const buttons='.btn, .call-button, .floating-request, .mx-nav-cta, .mx-pill';
const state=locator=>locator.evaluate(el=>{
  const css=getComputedStyle(el);
  const matrix=new DOMMatrixReadOnly(css.transform);
  return {scale:matrix.a,y:matrix.f,transform:css.transform,
    outline:css.outlineStyle,outlineWidth:parseFloat(css.outlineWidth),
    duration:css.transitionDuration,animation:css.animationName,
    width:el.offsetWidth,height:el.offsetHeight};
});
const settled=async(locator,scale=1)=>{
  await expect.poll(async()=>Math.abs((await state(locator)).scale-scale)).toBeLessThan(.001);
  // A spring crosses its target before it settles; don't mistake that crossing
  // for its final geometry, especially on different browser frame rates.
  await locator.evaluate(el=>Promise.all(el.getAnimations()
    .filter(animation=>animation.transitionProperty==='transform')
    .map(animation=>animation.finished.catch(()=>{}))));
  expect(Math.abs((await state(locator)).scale-scale)).toBeLessThan(.001);
};

test.beforeEach(async({page})=>{
  // Local build only. No test lead or analytics request reaches production.
  await page.route('https://**/*',route=>route.request().url().includes('googletagmanager.com')
    ? route.fulfill({status:200,contentType:'application/javascript',body:''}) : route.abort());
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('main actions rest without animation or layout overflow',async({page},testInfo)=>{
  for(const path of ['/#pricing','/stvorennya-saytiv/','/poslugy/']){
    await page.goto(path);
    const controls=page.locator(buttons);
    expect(await controls.count()).toBeGreaterThan(0);
    for(const control of await controls.all()){
      const css=await state(control);
      expect(css.transform).toBe('none');
      expect(css.animation).toBe('none');
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await testInfo.attach(`buttons-${path.replace(/[^a-z]/g,'')||'home'}`,{body:await page.screenshot(),contentType:'image/png'});
  }
});

test('fine-pointer hover and repeated press return smoothly without moving layout',async({page,isMobile})=>{
  test.skip(isMobile,'Fine-pointer hover belongs to desktop; mobile gets native touch tests.');
  await page.goto('/#pricing');
  const button=page.locator('.mx-price .mx-pill').first();
  await button.scrollIntoViewIfNeeded();
  const before=await state(button);
  const scroll=await page.evaluate(()=>scrollY);
  await button.hover();
  await settled(button,1.015);
  expect((await state(button)).y).toBeCloseTo(-2,1);
  for(let repeat=0;repeat<3;repeat++){
    await page.mouse.down();
    await settled(button,.97);
    // Release away from the link to cancel navigation, as a real aborted press.
    await page.mouse.move(1,200);
    await page.mouse.up();
    await settled(button);
    expect((await state(button)).width).toBe(before.width);
    expect((await state(button)).height).toBe(before.height);
    expect(await page.evaluate(()=>scrollY)).toBe(scroll);
    await button.hover();
    await settled(button,1.015);
  }
});

test('keyboard focus stays visible and Space press clears after invalid submission',async({page})=>{
  await page.goto('/#lead');
  const button=page.locator('.mx-submit');
  await page.keyboard.press('Tab');
  await button.focus();
  await expect(button).toBeFocused();
  await settled(button,1.015);
  expect((await state(button)).outlineWidth).toBeGreaterThanOrEqual(2);
  expect((await state(button)).outline).not.toBe('none');
  await page.keyboard.down('Space');
  await settled(button,.97);
  await page.keyboard.up('Space');
  await expect(page.locator('#lead-name')).toBeFocused();
  await settled(button);
  await expect(page.locator('.form-status')).not.toHaveAttribute('data-state','success');
});

test('reduced motion removes hover, focus and press transforms',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [path,selector] of [['/#lead','.mx-submit'],['/stvorennya-saytiv/','.compact-form button[type=submit]']]){
    await page.goto(path);
    const button=page.locator(selector);
    await button.scrollIntoViewIfNeeded();
    await page.keyboard.press('Tab');
    await button.focus();
    await page.keyboard.down('Space');
    expect((await state(button)).transform).toBe('none');
    expect((await state(button)).duration.split(',').every(v=>parseFloat(v)<.001)).toBe(true);
    await page.keyboard.up('Space');
    await button.hover();
    expect((await state(button)).transform).toBe('none');
  }
});

test('pending submit is stationary and repeated activation sends one mocked lead',async({page})=>{
  const requests=[];
  let complete;
  const pending=new Promise(resolve=>{complete=resolve;});
  await page.route('https://max-site-leads.emelkey777.workers.dev/**',async route=>{
    const payload=route.request().postDataJSON();requests.push(payload);
    await pending;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,lead_id:payload.requestId})});
  });
  await page.goto('/#lead');
  const form=page.locator('#leadForm');
  await form.locator('[name=name]').fill('LOCAL QA ONLY');
  await form.locator('[name=phone]').fill('@local_qa');
  await form.locator('[name=business]').fill('Local test');
  await form.locator('[name=consent]').check();
  const button=form.locator('button[type=submit]');
  await button.click();
  await expect(button).toBeDisabled();
  await button.hover({force:true});
  expect((await state(button)).transform).toBe('none');
  await expect.poll(()=>requests.length).toBe(1);
  await form.evaluate(el=>{el.requestSubmit();el.requestSubmit();});
  expect(requests).toHaveLength(1);
  complete();
  await expect(form.locator('.form-status')).toHaveAttribute('data-state','success');
  expect(requests).toHaveLength(1);
});

test('native touch tap releases without sticky hover and keeps CTA navigation',async({page,isMobile})=>{
  test.skip(!isMobile,'Native touch applies to mobile contexts.');
  await page.goto('/#pricing');
  const button=page.locator('.mx-price .mx-pill').first();
  await button.tap();
  await expect(page.locator('#lead-name')).toBeFocused();
  await expect(page.locator('#lead-comment')).toHaveValue('Цікавить формат: Старт. ');
  await settled(button);
  const y=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(450);
  expect(await page.evaluate(()=>scrollY)).toBe(y);
  await expect(page.locator('#leadForm')).toBeInViewport();
});

test('touch scroll cancels a press without activating the CTA or sticking',async({page,isMobile,browserName,context})=>{
  test.skip(!isMobile||browserName!=='chromium','Native drag is exercised through Chromium CDP; WebKit has tap coverage.');
  await page.goto('/#pricing');
  const button=page.locator('.mx-price .mx-pill').first();
  await button.scrollIntoViewIfNeeded();
  const box=await button.boundingBox();
  const before=await page.evaluate(()=>scrollY);
  const client=await context.newCDPSession(page);
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await settled(button,.97);
  for(let step=1;step<=6;step++){
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*24}]});
    await page.waitForTimeout(20);
  }
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await settled(button);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+30);
  await expect(page.locator('#lead-comment')).toHaveValue('');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
