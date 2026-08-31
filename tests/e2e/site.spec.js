const {test,expect}=require('@playwright/test');

const keyRoutes=[
  '/',
  '/stvorennya-saytiv/',
  '/stvorennya-saytu-dlya-biznesu/',
  '/stvorennya-program/',
  '/mista/',
  '/mista/stvorennya-sajtiv-kyiv/',
  '/portfolio/formula-chystoty/',
  '/blog/skilky-koshtuye-stvorennya-sajtu/'
];

for (const route of keyRoutes) {
  test(`${route} renders without console errors or horizontal overflow`,async({page})=>{
    const consoleErrors=[];
    page.on('console',message=>{if(message.type()==='error') consoleErrors.push(message.text());});
    await page.route('https://www.googletagmanager.com/**',request=>request.fulfill({status:200,contentType:'application/javascript',body:''}));
    await page.route('https://www.google-analytics.com/**',request=>request.fulfill({status:204,body:''}));
    const response=await page.goto(route,{waitUntil:'domcontentloaded'});
    expect(response.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://maxsite.com.ua${route}`);
    const layout=await page.evaluate(()=>{
      const viewportWidth=window.innerWidth;
      const scrollWidth=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);
      const offenders=[...document.body.querySelectorAll('*')]
        .map(element=>{
          const rect=element.getBoundingClientRect();
          return {
            selector:`${element.tagName.toLowerCase()}${element.id?`#${element.id}`:''}${[...element.classList].map(name=>`.${name}`).join('')}`,
            left:Math.round(rect.left*100)/100,
            right:Math.round(rect.right*100)/100,
            width:Math.round(rect.width*100)/100
          };
        })
        .filter(rect=>rect.left < -1 || rect.right > viewportWidth+1)
        .slice(0,10);

      return {
        overflow:Math.max(0,scrollWidth-viewportWidth),
        viewportWidth,
        scrollWidth,
        scrollbarWidth:Math.max(0,window.innerWidth-document.documentElement.clientWidth),
        offenders
      };
    });
    expect(layout.overflow,JSON.stringify(layout,null,2)).toBeLessThanOrEqual(1);
    expect(consoleErrors).toEqual([]);
  });
}

test('mobile navigation exposes phone contact',async({page,isMobile})=>{
  test.skip(!isMobile,'mobile-only interaction');
  await page.goto('/');
  await page.locator('.nav-toggle').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.main-nav')).toBeVisible();
  await expect(page.locator('.mobile-nav-phone')).toHaveAttribute('href','tel:+380972692322');
});

test('desktop header labels remain readable',async({page,isMobile})=>{
  test.skip(isMobile,'desktop-only layout');
  await page.goto('/');
  const callButton=page.locator('.call-button');
  const aboutLink=page.locator('.main-nav > a',{hasText:'Про нас'});
  await expect(callButton).toBeVisible();
  await expect(aboutLink).toBeVisible();

  const layout=await page.evaluate(()=>{
    const call=document.querySelector('.call-button');
    const label=call.querySelector('span');
    const about=[...document.querySelectorAll('.main-nav > a')].find(link=>link.textContent.trim()==='Про нас');
    const callRect=call.getBoundingClientRect();
    const labelRect=label.getBoundingClientRect();
    return {
      callOverflow:call.scrollWidth-call.clientWidth,
      labelInside:labelRect.left>=callRect.left-1 && labelRect.right<=callRect.right+1,
      aboutWhiteSpace:getComputedStyle(about).whiteSpace
    };
  });

  expect(layout.callOverflow).toBeLessThanOrEqual(1);
  expect(layout.labelInside).toBe(true);
  expect(layout.aboutWhiteSpace).toBe('nowrap');
});

test('desktop wheel scrolling stays native and responsive',async({page,isMobile})=>{
  test.skip(isMobile,'desktop mouse-wheel behavior');
  await page.goto('/');
  expect(await page.locator('html').evaluate(element=>getComputedStyle(element).scrollBehavior)).toBe('auto');
  expect(await page.locator('.site-header').evaluate(element=>getComputedStyle(element).backdropFilter)).toBe('none');
  await page.mouse.wheel(0,700);
  await expect.poll(()=>page.evaluate(()=>window.scrollY),{timeout:1000}).toBeGreaterThan(300);
});

test('lead form validates required fields and consent',async({page})=>{
  await page.goto('/stvorennya-saytiv/');
  const form=page.locator('form').first();
  const submit=form.locator('button[type="submit"]');
  await submit.click();
  const invalid=await form.locator(':invalid').count();
  expect(invalid).toBeGreaterThan(0);
  await expect(form.locator('input[name="consent"]')).toHaveAttribute('required','');
});

test('lead form controls are reachable by keyboard',async({page})=>{
  await page.goto('/stvorennya-saytiv/');
  const form=page.locator('form').first();
  const name=form.locator('input[name="name"]');
  const phone=form.locator('input[name="phone"]');
  await name.focus();
  await expect(name).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(phone).toBeFocused();
});

test('phone and messengers retain safe destinations',async({page})=>{
  await page.goto('/');
  await expect(page.locator('a[href="tel:+380972692322"]:visible').first()).toBeVisible();
  await expect(page.locator('a[href="https://t.me/MaxMytt"]:visible').first()).toBeVisible();
  expect(await page.locator('a[href^="viber://"]').count()).toBeGreaterThan(0);
});

test('404 document is useful and noindex',async({page})=>{
  await page.goto('/404.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/i);
  expect(await page.locator('a[href="/"]').count()).toBeGreaterThan(0);
});
