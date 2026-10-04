const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

async function motionSnapshot(page){
  return page.evaluate(()=>{
    const journey=document.querySelector('#journey');
    const stage=document.querySelector('#stage');
    const pricing=document.querySelector('#pricing');
    const state=window.demoController.getState();
    return {
      progress:state.progress,
      playing:state.playing,
      range:state.range,
      scrollY:window.scrollY,
      sceneEnd:journey.offsetTop+journey.offsetHeight-stage.clientHeight,
      pricingTop:pricing.getBoundingClientRect().top,
      viewportHeight:window.innerHeight,
      phase:stage.dataset.phase,
      layerOpacity:Number(getComputedStyle(document.querySelector('#layerHeading')).opacity),
    };
  });
}

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
  await expect(page.locator('#pricing')).toBeFocused();
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(100);
});

test('reduced motion and direct section links do not trigger autoplay',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('#motion-controls, #progress, #playButton')).toHaveCount(0);
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);

  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const section of ['pricing','work','services','lead']){
    await page.goto('about:blank');
    await page.goto('/#'+section);
    await page.waitForTimeout(250);
    expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
    await expect(page.locator('#'+section)).toBeInViewport();
  }
});

test('12-second intro reveals pricing as the first content section',async({page},testInfo)=>{
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  expect(await page.locator('.mx-content > section').evaluateAll(sections=>sections.map(section=>section.id)))
    .toEqual(['pricing','work','services','process','faq','lead']);

  // The real animation timeline stays on the intro until the shorter duration ends.
  await page.clock.runFor(11_500);
  const before=await motionSnapshot(page);
  expect(before.playing).toBe(true);
  expect(before.progress).toBeGreaterThan(.95);
  expect(before.scrollY).toBeLessThan(20);
  expect(before.pricingTop).toBeGreaterThan(before.viewportHeight);

  await page.clock.runFor(700);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
  const completed=await motionSnapshot(page);
  expect(completed.progress).toBe(1);
  expect(completed.scrollY).toBeGreaterThan(completed.sceneEnd+5);
  expect(completed.pricingTop).toBeGreaterThanOrEqual(0);
  expect(completed.pricingTop).toBeLessThan(1);
  await expect(page.getByText('01 / ЦІНИ НА ПОСЛУГИ')).toBeInViewport();
  await testInfo.attach('pricing-after-short-intro',{body:await page.screenshot(),contentType:'image/png'});
});

test('interrupted autoplay never forces a later jump to pricing',async({page})=>{
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.clock.runFor(1_000);
  await page.keyboard.press('Tab');
  const interrupted=await motionSnapshot(page);
  await page.clock.runFor(13_000);
  const after=await motionSnapshot(page);
  expect(after.playing).toBe(false);
  expect(after.scrollY).toBe(interrupted.scrollY);
  expect(after.progress).toBe(interrupted.progress);
});

test('skipping active autoplay stays at pricing after the intro deadline',async({page})=>{
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.getByRole('link',{name:'Пропустити анімацію ↓'}).click();
  await expect(page.locator('#pricing')).toBeFocused();
  await expect(page.getByText('01 / ЦІНИ НА ПОСЛУГИ')).toBeInViewport();
  const skipped=await motionSnapshot(page);
  expect(Math.abs(skipped.pricingTop)).toBeLessThan(1);
  await page.clock.runFor(13_000);
  const after=await motionSnapshot(page);
  expect(after.playing).toBe(false);
  expect(after.scrollY).toBe(skipped.scrollY);
  await expect(page.locator('#pricing')).toBeFocused();
});

test('visibility pause resumes only the remaining intro before revealing pricing',async({page})=>{
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.clock.runFor(4_000);
  const pausedProgress=await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
    document.dispatchEvent(new Event('visibilitychange'));
    return window.demoController.getProgress();
  });
  await page.clock.runFor(15_000);
  const paused=await motionSnapshot(page);
  expect(paused.playing).toBe(false);
  expect(paused.progress).toBe(pausedProgress);
  expect(paused.scrollY).toBeLessThan(20);
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(7_500);
  expect((await motionSnapshot(page)).playing).toBe(true);
  await page.clock.runFor(700);
  const completed=await motionSnapshot(page);
  expect(completed.playing).toBe(false);
  expect(completed.progress).toBe(1);
  expect(completed.pricingTop).toBeLessThan(1);
});

test('desktop ArrowDown after a manually completed scene enters pricing',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop keyboard motion');
  await page.goto('/');
  await page.evaluate(()=>{window.demoController.stop();window.demoController.setProgress(1)});
  const before=await motionSnapshot(page);
  await page.keyboard.press('ArrowDown');
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(before.sceneEnd+5);
  const after=await motionSnapshot(page);
  expect(after.progress).toBe(1);
  expect(after.pricingTop).toBeLessThan(1);
});

test('desktop wheel continues the visible scene with only native scrolling',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop scroll motion');
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.clock.runFor(7_000);
  const before=await motionSnapshot(page);
  expect(before.progress).toBeGreaterThan(.25);
  expect(before.scrollY).toBeLessThan(20);

  await page.clock.resume();
  await page.mouse.wheel(0,600);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThan(before.progress+.02);
  const after=await motionSnapshot(page);
  expect(after.scrollY).toBeGreaterThan(0);
  expect(after.scrollY).toBeLessThan(700);
});

test('visible cookie choices do not block scrolling the desktop scene',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop scroll motion');
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.clock.runFor(7_000);
  await page.evaluate(()=>{document.querySelector('.consent-panel').hidden=false});
  const before=await motionSnapshot(page);

  await page.mouse.move(1100,400);
  await page.mouse.wheel(0,600);
  await page.clock.runFor(150);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThan(before.progress+.02);
});

test('desktop reload within the journey leaves the restored scroll under user control',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop scroll motion');
  await page.goto('/');
  await page.mouse.wheel(0,2_500);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(1_800);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThan(.35);
  const before=await motionSnapshot(page);
  expect(before.progress).toBeGreaterThan(.35);
  expect(before.progress).toBeLessThan(.85);
  // WebKit records wheel position in session history after the gesture settles.
  await page.waitForTimeout(500);

  await page.reload();
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(before.range*.35);
  await page.waitForTimeout(300);
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
  const resumed=await motionSnapshot(page);
  expect(resumed.progress).toBeGreaterThan(.35);
  expect(resumed.scrollY).toBeGreaterThan(before.range*.35);
});

for(const key of ['ArrowDown','PageDown']){
  test(`desktop ${key} during autoplay advances to a visible chapter`,async({page,isMobile})=>{
    test.skip(isMobile,'Desktop keyboard motion');
    await page.clock.install();
    await page.goto('/');
    await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
    await page.clock.runFor(900);
    const before=await motionSnapshot(page);
    expect(before.progress).toBeGreaterThan(.04);
    expect(before.progress).toBeLessThan(.18);

    await page.keyboard.press(key);
    await page.clock.runFor(500);
    await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThan(.24);
    const after=await motionSnapshot(page);
    expect(after.playing).toBe(false);
    expect(after.progress).toBeGreaterThan(before.progress+.1);
    expect(after.scrollY).toBeGreaterThan(before.scrollY+before.range*.1);
    expect(after.phase).toBe('ДИЗАЙН У ШАРАХ');
    expect(after.layerOpacity).toBeGreaterThan(.5);
  });
}

test('desktop ArrowUp moves to an earlier scene chapter',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop keyboard motion');
  await page.goto('/');
  await page.evaluate(()=>{
    window.demoController.stop();
    const journey=document.querySelector('#journey');
    const stage=document.querySelector('#stage');
    window.scrollTo({top:journey.offsetTop+.74*(journey.offsetHeight-stage.clientHeight),behavior:'instant'});
  });
  await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThan(.7);
  const before=await motionSnapshot(page);

  await page.keyboard.press('ArrowUp');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getProgress())).toBeLessThan(before.progress-.08);
  const after=await motionSnapshot(page);
  expect(after.scrollY).toBeLessThan(before.scrollY-before.range*.08);
});

test('motion keys leave a focused form editor to native caret movement',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop keyboard motion');
  await page.goto('/#lead');
  const comment=page.locator('#lead-comment');
  await comment.fill('First line\nSecond line\nThird line\nFourth line');
  await page.evaluate(()=>{
    const journey=document.querySelector('#journey');
    const stage=document.querySelector('#stage');
    window.scrollTo({top:journey.offsetTop+.45*(journey.offsetHeight-stage.clientHeight),behavior:'instant'});
    const editor=document.querySelector('#lead-comment');
    editor.focus({preventScroll:true});
    editor.setSelectionRange(2,2);
    window.editableKeyEvents=[];
    window.addEventListener('keydown',event=>{
      if(['ArrowDown','PageDown'].includes(event.key)){
        window.editableKeyEvents.push({key:event.key,prevented:event.defaultPrevented});
      }
    });
  });
  await expect(comment).toBeFocused();

  await page.keyboard.press('ArrowDown');
  const caret=await comment.evaluate(editor=>editor.selectionStart);
  expect(caret).toBeGreaterThan(2);
  await page.keyboard.press('PageDown');
  expect(await page.evaluate(()=>window.editableKeyEvents)).toEqual([
    {key:'ArrowDown',prevented:false},
    {key:'PageDown',prevented:false},
  ]);
  expect(await comment.evaluate(editor=>editor.selectionStart)).toBeGreaterThanOrEqual(caret);
  await expect(comment).toBeFocused();
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
  for(const [index,route] of ['/portfolio/formula-chystoty/','/portfolio/fo-dez/','https://b2bcleanukraine.com/'].entries()){
    await expect(covers.nth(index)).toHaveAttribute('href',route.startsWith('/')?route.slice(1):route);
  }
  await covers.nth(1).click();
  await expect(page).toHaveURL(/\/portfolio\/fo-dez\/$/);
  await expect(page.locator('h1')).toHaveCount(1);
});


test('touch takeover never rewinds, cancels the gesture or jumps after its deadline',async({page,isMobile})=>{
  test.skip(!isMobile,'Native touch scene');
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.clock.runFor(6_000);
  const before=await motionSnapshot(page);
  const gesture=await page.evaluate(()=>{
    const target=document.querySelector('#stage');
    const beforeProgress=window.demoController.getProgress();
    const events=['touchstart','touchmove'].map(type=>{
      const event=new Event(type,{bubbles:true,cancelable:true});
      target.dispatchEvent(event);
      return {type,prevented:event.defaultPrevented};
    });
    return {events,y:window.scrollY,beforeProgress,progress:window.demoController.getProgress()};
  });
  expect(gesture.events.every(e=>!e.prevented)).toBe(true);
  expect(gesture.y).toBe(before.scrollY);
  expect(gesture.progress).toBe(gesture.beforeProgress);
  // Model the scroll/inertia events delivered by the browser after touchmove;
  // this intentionally asserts document position separately from scene progress.
  for(const y of [120,300,520,650]){
    await page.evaluate(y=>window.scrollTo(0,y),y);
    await page.clock.runFor(60);
    expect(await page.evaluate(()=>window.scrollY)).toBe(y);
    expect(await page.evaluate(()=>window.demoController.getProgress())).toBeGreaterThanOrEqual(before.progress);
  }
  const settled=await motionSnapshot(page);
  await page.clock.runFor(15_000);
  const after=await motionSnapshot(page);
  expect(after.playing).toBe(false);
  expect(after.scrollY).toBe(settled.scrollY);
  expect(after.progress).toBe(settled.progress);
});

test('mobile toolbar and keyboard height changes keep scene geometry and native scroll stable',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile viewport changes');
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.locator('#stage').dispatchEvent('touchstart');
  await page.evaluate(()=>window.scrollTo(0,500));
  await page.waitForTimeout(100);
  const before=await motionSnapshot(page);
  const original=page.viewportSize();
  for(const height of [original.height+70,original.height-80,original.height]){
    await page.setViewportSize({width:original.width,height});
    await page.waitForTimeout(100);
    const resized=await motionSnapshot(page);
    expect(resized.range).toBe(before.range);
    expect(resized.scrollY).toBe(before.scrollY);
    expect(resized.progress).toBe(before.progress);
    expect(resized.playing).toBe(false);
  }
  await page.goto('/#lead');
  await page.locator('#lead-name').focus();
  const focused=await motionSnapshot(page);
  await page.setViewportSize({width:original.width,height:original.height-280});
  await page.waitForTimeout(200);
  await expect(page.locator('#lead-name')).toBeFocused();
  expect((await motionSnapshot(page)).range).toBe(focused.range);
  expect((await motionSnapshot(page)).playing).toBe(false);
  await page.setViewportSize(original);
  await expect(page.locator('#lead-name')).toBeFocused();
});

test('touch while paused and restored history cannot resume or redirect autoplay',async({page})=>{
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.clock.runFor(3_000);
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
    document.dispatchEvent(new Event('visibilitychange'));
    document.querySelector('#stage').dispatchEvent(new Event('touchstart',{bubbles:true}));
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
    window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
  });
  const stopped=await motionSnapshot(page);
  await page.clock.runFor(15_000);
  const restored=await motionSnapshot(page);
  expect(restored.playing).toBe(false);
  expect(restored.scrollY).toBe(stopped.scrollY);
  expect(restored.progress).toBe(stopped.progress);
});


test('active autoplay cannot resume after a persisted page restoration',async({page})=>{
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
  await page.clock.runFor(3_000);
  const active=await motionSnapshot(page);
  expect(active.playing).toBe(true);
  const restoredProgress=await page.evaluate(()=>{
    window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
    window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
    return window.demoController.getProgress();
  });
  await page.clock.runFor(15_000);
  const restored=await motionSnapshot(page);
  expect(restored.playing).toBe(false);
  expect(restored.scrollY).toBe(active.scrollY);
  expect(restored.progress).toBe(restoredProgress);
});
