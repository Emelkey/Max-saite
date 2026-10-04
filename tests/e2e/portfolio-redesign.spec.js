const {test, expect}=require('@playwright/test');

const cases=[
  ['formula','/portfolio/formula-chystoty/'],
  ['fodez','/portfolio/fo-dez/'],
  ['selfcase','/portfolio/max-site/']
];

test.beforeEach(async({page})=>{
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    return ['127.0.0.1','localhost'].includes(url.hostname)?route.continue():route.abort();
  });
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('portfolio presents a featured real case and loaded visual assets without overflow',async({page},testInfo)=>{
  for(const width of [1440,1024,768,760,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto('/#work');
    await page.locator('#work').scrollIntoViewIfNeeded();

    const articles=page.locator('#work .mx-case');
    await expect(articles).toHaveCount(3);
    for(const image of await page.locator('#work .mx-project-media img').all()){
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    }

    const rects=await articles.evaluateAll(elements=>elements.map(el=>{
      const box=el.getBoundingClientRect();
      return {left:box.left,top:box.top,width:box.width,bottom:box.bottom};
    }));
    expect(rects[0].top).toBeLessThan(rects[1].top);
    if(width>760){
      expect(rects[0].width).toBeGreaterThan(rects[1].width*1.8);
      expect(Math.abs(rects[1].top-rects[2].top)).toBeLessThan(2);
    }else{
      expect(rects[1].top).toBeGreaterThanOrEqual(rects[0].bottom);
      expect(rects[2].top).toBeGreaterThanOrEqual(rects[1].bottom);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
    if([1440,768,390,320].includes(width)){
      await testInfo.attach(`portfolio-${width}`,{body:await page.locator('#work').screenshot(),contentType:'image/png'});
    }
  }
});

test('each cover and explicit case action opens the matching local page',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const [name,route] of cases){
    for(const selector of ['.mx-project-art','.mx-case-cta']){
      await page.goto('/#work');
      const link=page.locator(`#work .mx-case-${name} ${selector}`);
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/','\\/')}$`));
      await expect(page.locator('h1')).toHaveCount(1);
    }
  }
});

test('portfolio links retain keyboard focus and calm reduced-motion behavior',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#work');
  const cover=page.locator('#work .mx-case-formula .mx-project-art');
  await cover.focus();
  await expect(cover).toBeFocused();
  const styles=await cover.evaluate(el=>({outline:getComputedStyle(el).outlineStyle,transition:getComputedStyle(el.querySelector('img')).transitionDuration}));
  expect(styles.outline).not.toBe('none');
  expect(styles.transition).toMatch(/(?:0s|0\.00001s)/);
});
