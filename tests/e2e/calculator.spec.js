const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()}));
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedCalculatorText=text;}}});
  });
  await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
});

test('calculator updates scope and exports the visible result without a lead',async({page})=>{
  const leads=[];
  page.on('request',request=>{if(request.method()==='POST')leads.push(request.url());});
  await page.goto('/kalkulyator-vartosti-saytu/');
  await expect(page.locator('[data-cost-value]')).toContainText('5 906,25');
  await page.locator('[name="site-type"][value="shop"]').check();
  await page.locator('[name="scope"][value="migration"]').check();
  await expect(page.locator('[data-cost-value]')).toContainText('19 293,75');
  await expect(page.locator('[data-cost-questions]')).toContainText('чинні URL');
  const telegram=new URL(await page.locator('[data-cost-telegram]').getAttribute('href'));
  expect(telegram.origin+telegram.pathname).toBe('https://t.me/share/url');
  expect(telegram.searchParams.get('text')).toContain('19 293,75');
  expect(telegram.searchParams.get('text')).toContain('чинні URL');
  const email=new URL(await page.locator('[data-cost-email]').getAttribute('href'));
  expect(email.protocol).toBe('mailto:');
  expect(email.searchParams.get('body')).toContain('19 293,75');
  await page.locator('[data-cost-copy]').click();
  await expect(page.locator('[data-cost-feedback]')).toContainText('скопійовано');
  expect(await page.evaluate(()=>window.copiedCalculatorText)).toContain('19 293,75');
  expect(leads).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('calculator handles unavailable clipboard without losing the result',async({page})=>{
  await page.goto('/kalkulyator-vartosti-saytu/');
  await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('denied');};});
  await page.locator('[data-cost-copy]').click();
  await expect(page.locator('[data-cost-feedback]')).toContainText('Telegram або email');
  await expect(page.locator('[data-cost-value]')).toContainText('5 906,25');
});

for(const route of ['/kalkulyator-vartosti-saytu/','/blog/nextjs-chy-wordpress/']){
  test(`${route} has no broken images or horizontal page overflow`,async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
    expect(await page.locator('img').evaluateAll(images=>images.filter(image=>!image.complete||!image.naturalWidth).map(image=>image.src))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for(const [value,amount] of [['landing','5 906,25'],['business','11 081,25'],['seo','16 312,50'],['shop','19 293,75']]) {
  test(`calculator preserves kopecks for ${value} in result and exports`,async({page})=>{
    await page.goto('/kalkulyator-vartosti-saytu/');
    await page.locator(`[name="site-type"][value="${value}"]`).check();
    await expect(page.locator('[data-cost-value]')).toHaveText(`від ${amount} грн`);
    for(const selector of ['[data-cost-telegram]','[data-cost-email]']) {
      const url=new URL(await page.locator(selector).getAttribute('href'));
      expect(url.searchParams.get(selector.includes('telegram')?'text':'body')).toContain(`від ${amount} грн`);
    }
  });
}

test('secondary budget estimator preserves two kopeck digits for every package',async({page})=>{
  await page.goto('/qa-checklist/');
  const tool=page.locator('[data-budget-tool]');
  for(const [value,amount] of [['landing','5 906,25'],['business','11 081,25'],['seo','16 312,50'],['store','19 293,75']]) {
    await tool.locator('select').selectOption(value);
    await expect(tool.locator('output')).toContainText(`Від ${amount.replaceAll(' ','\u00a0')} грн`);
  }
});
