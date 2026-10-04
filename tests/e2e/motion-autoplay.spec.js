const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

async function motionSnapshot(page){
  return page.evaluate(()=>{
    const journey=document.querySelector('#journey');
    const stage=document.querySelector('#stage');
    const work=document.querySelector('#work');
    const state=window.demoController.getState();
    return {
      progress:state.progress,
      playing:state.playing,
      range:state.range,
      scrollY:window.scrollY,
      sceneEnd:journey.offsetTop+journey.offsetHeight-stage.clientHeight,
      workTop:work.getBoundingClientRect().top,
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

test('desktop autoplay leaves the document still, then ArrowDown enters page content',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop keyboard motion');
  await page.clock.install();
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);

  // Exercise the real requestAnimationFrame timeline without a 22-second wall-clock wait.
  await page.clock.runFor(23_000);
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
  const completed=await motionSnapshot(page);
  expect(completed.progress).toBeGreaterThan(.98);
  expect(completed.scrollY).toBeLessThan(20);
  expect(completed.workTop).toBeGreaterThan(completed.viewportHeight);

  await page.keyboard.press('ArrowDown');
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(completed.sceneEnd+5);
  const after=await motionSnapshot(page);
  expect(after.progress).toBeGreaterThan(.98);
  expect(after.workTop).toBeLessThan(after.viewportHeight);
});

test('desktop wheel hands autoplay progress to scrolling without rewinding',async({page,isMobile})=>{
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
  expect(after.scrollY).toBeGreaterThan(before.range*before.progress);
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

test('desktop reload within the journey resumes autoplay from restored scroll',async({page,isMobile})=>{
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
  await expect.poll(()=>page.evaluate(()=>window.demoController.getState().playing)).toBe(true);
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
    await page.clock.runFor(1_800);
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
  for(const [index,route] of ['/portfolio/formula-chystoty/','/portfolio/fo-dez/','/portfolio/max-site/'].entries()){
    await expect(covers.nth(index)).toHaveAttribute('href',route.slice(1));
  }
  await covers.nth(1).click();
  await expect(page).toHaveURL(/\/portfolio\/fo-dez\/$/);
  await expect(page.locator('h1')).toHaveCount(1);
});
