const {test, expect}=require('@playwright/test');

const cases=[
  ['formula','/portfolio/formula-chystoty/'],
  ['fodez','/portfolio/fo-dez/']
];

test.beforeEach(async({page})=>{
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    return ['127.0.0.1','localhost'].includes(url.hostname)?route.continue():route.abort();
  });
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('portfolio presents three real cases with loaded visual assets and no overflow',async({page},testInfo)=>{
  for(const width of [1440,1024,768,760,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto('/#work');
    await page.locator('#work').scrollIntoViewIfNeeded();

    const articles=page.locator('#work .mx-case');
    await expect(articles).toHaveCount(3);
    await expect(page.locator('#work .mx-project-media img')).toHaveCount(3);
    await expect(page.locator('#work .mx-case-b2b h3')).toHaveText('B2B CLEAN UKRAINE');
    await expect(page.locator('#work .mx-case-selfcase')).toHaveCount(0);
    for(const image of await page.locator('#work .mx-project-media img').all()){
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    }

    const rects=await articles.evaluateAll(elements=>elements.map(el=>{
      const box=el.getBoundingClientRect();
      return {left:box.left,top:box.top,width:box.width,bottom:box.bottom};
    }));
    // 2026-10 layout: three equal live previews on desktop, two plus a
    // full-width B2B card on tablets, one column on phones.
    if(width>1100){
      expect(Math.abs(rects[0].top-rects[1].top)).toBeLessThan(2);
      expect(Math.abs(rects[1].top-rects[2].top)).toBeLessThan(2);
      expect(Math.abs(rects[0].width-rects[2].width)).toBeLessThan(2);
    }else if(width>760){
      expect(Math.abs(rects[0].top-rects[1].top)).toBeLessThan(2);
      expect(rects[2].top).toBeGreaterThanOrEqual(rects[0].bottom);
      expect(rects[2].width).toBeGreaterThan(rects[0].width*1.8);
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

test('B2B project has a real screenshot and opens the verified site from both portfolio surfaces',async({page,context})=>{
  const site='https://b2bcleanukraine.com/';
  // Stub the external destination only; verify the browser actually opens it.
  await context.route('https://b2bcleanukraine.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<h1>B2B CLEAN UKRAINE</h1>'}));
  for(const [path,cardSelector,linkSelectors] of [
    ['/#work','#work .mx-case-b2b',['.mx-project-art','.mx-case-cta']],
    ['/portfolio/','#b2b-clean-ukraine',['.case-main-media','.case-actions .btn:first-child']]
  ]){
    await page.goto(path);
    const card=page.locator(cardSelector);
    await card.scrollIntoViewIfNeeded();
    const screenshot=card.locator('img');
    await expect(screenshot).toHaveAttribute('src',/b2b-clean-home-20261004\.jpg$/);
    await expect.poll(()=>screenshot.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    for(const selector of linkSelectors){
      const link=card.locator(selector);
      await expect(link).toHaveAttribute('href',site);
      await expect(link).toHaveAttribute('target','_blank');
      await expect(link).toHaveAttribute('rel','noopener noreferrer');
      const [opened]=await Promise.all([page.waitForEvent('popup'),link.click()]);
      await expect(opened).toHaveURL(site);
      await expect(opened.locator('h1')).toHaveText('B2B CLEAN UKRAINE');
      await opened.close();
    }
  }
  const schema=await page.locator('script[type="application/ld+json"]').evaluate(el=>JSON.parse(el.textContent));
  expect(schema['@graph'].find(node=>node['@type']==='ItemList').itemListElement).toContainEqual({
    '@type':'ListItem',position:3,name:'B2B CLEAN UKRAINE — сайт для B2B-клінінгу',url:site
  });
  // Replacing the card must not break the historical case's indexed URL.
  await page.goto('/portfolio/max-site/');
  await expect(page.locator('h1')).toContainText('MAX SITE');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://maxsite.com.ua/portfolio/max-site/');
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
