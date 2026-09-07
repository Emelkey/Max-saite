const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

const keyRoutes=[
  '/',
  '/stvorennya-saytiv/',
  '/stvorennya-saytu-dlya-biznesu/',
  '/stvorennya-program/',
  '/mista/',
  '/mista/stvorennya-sajtiv-kyiv/',
  '/portfolio/formula-chystoty/',
  '/blog/skilky-koshtuye-stvorennya-sajtu/'
  ,'/mista/stvorennya-sajtiv-lviv/'
  ,'/mista/stvorennya-sajtiv-odesa/'
  ,'/mista/stvorennya-sajtiv-dnipro/'
  ,'/mista/stvorennya-sajtiv-kharkiv/'
  ,'/nishi/sajt-dlya-magazynu/'
  ,'/nishi/sajt-dlya-medychnyh-poslug/'
  ,'/nishi/sajt-dlya-vyrobnytstva/'
  ,'/nishi/sajt-dlya-neruhomosti/'
  ,'/nishi/sajt-dlya-kursiv/'
  ,'/portfolio/max-site/'
  ,'/qa-checklist/'
  ,'/blog/ga4-konversiyi-dlya-sajtu/'
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

for (const ok of [true,false]) test(`lead response ok:${ok} is reflected honestly and without PII in analytics`,async({page})=>{
  const requests=[];
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedLead=text;}}}));
  await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
  await page.route('https://max-site-leads.emelkey777.workers.dev/**',async route=>{
    requests.push(route.request().postDataJSON());
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok})});
  });
  await page.goto('/stvorennya-saytiv/?gclid=do-not-send&email=private@example.test');
  const form=page.locator('form').first();
  await form.locator('[name=name]').fill('Private test person');
  await form.locator('[name=phone]').fill('+380000000000');
  await form.locator('[name=consent]').check();
  await form.locator('button[type=submit]').click();
  await expect(form.locator('.form-status')).toHaveAttribute('data-state',ok?'success':'error');
  expect(requests).toHaveLength(1);
  expect(requests[0].context.gclid).toBe('');
  expect(requests[0].pageUrl).not.toContain('?');
  expect(requests[0].requestId).toMatch(/^[a-f0-9-]{36}$/);
  const events=await page.evaluate(()=>window.dataLayer.filter(item=>item[0]==='event').map(item=>Array.from(item)));
  const successes=events.filter(item=>item[1]==='lead_form_success');
  expect(successes).toHaveLength(ok?1:0);
  const conversions=events.filter(item=>item[1]==='generate_lead');
  expect(conversions).toHaveLength(ok?1:0);
  if(ok){
    expect(successes[0][2].lead_id).toBe(requests[0].requestId);
    expect(conversions[0][2].lead_id).toBe(requests[0].requestId);
    expect(conversions[0][2].page_type).toBe('service');
    expect(conversions[0][2].service).toBe('website_development');
  }else{
    const fallback=form.locator('.form-status a',{hasText:'Відкрити Telegram'});
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveAttribute('href','https://t.me/MaxMytt');
    expect(await page.evaluate(()=>window.__copiedLead)).toBeUndefined();
    await form.getByRole('button',{name:'Скопіювати текст заявки',exact:true}).click();
    await expect(form.locator('.lead-fallback-feedback')).toContainText('Текст скопійовано');
    expect(await page.evaluate(()=>window.__copiedLead)).toContain('Private test person');
    expect(await page.evaluate(()=>window.__copiedLead)).toContain('+380000000000');
    expect(await form.locator('a').evaluateAll(links=>links.every(link=>!link.href.includes('text=')&&!link.href.includes('380000000000')))).toBe(true);
    await fallback.evaluate(link=>link.addEventListener('click',event=>event.preventDefault()));
    await fallback.click();
    const afterFallback=await page.evaluate(()=>window.dataLayer.filter(item=>item[0]==='event').map(item=>Array.from(item)));
    expect(afterFallback.filter(item=>item[1]==='generate_lead')).toHaveLength(0);
    expect(afterFallback.filter(item=>item[1]==='lead_fallback_open')).toHaveLength(1);
    expect(JSON.stringify(afterFallback)).not.toMatch(/Private test person|380000000000|private@example/);
  }
  expect(JSON.stringify(events)).not.toMatch(/Private test person|380000000000|private@example/);
});

test('missing endpoint offers manual fallback without PII URLs or false delivery',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Clipboard unavailable');}}}));
  await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
  let endpointRequests=0;
  await page.route('https://max-site-leads.emelkey777.workers.dev/**',route=>{endpointRequests++;return route.abort();});
  await page.goto('/stvorennya-saytiv/');
  await page.evaluate(()=>{window.MAX_SITE_TELEGRAM.endpoint='';});
  const form=page.locator('form').first();
  await form.locator('[name=name]').fill('Private fallback person');
  await form.locator('[name=phone]').fill('+380000000000');
  await form.locator('[name=consent]').check();
  await form.locator('button[type=submit]').click();
  await expect(form.locator('.form-status')).toHaveAttribute('data-state','fallback');
  await expect(form.locator('[name=phone]')).toHaveValue('+380000000000');
  await form.getByRole('button',{name:'Скопіювати текст заявки',exact:true}).click();
  await expect(form.getByLabel('Текст заявки для копіювання',{exact:true})).toHaveValue(/Private fallback person/);
  await expect(form.getByLabel('Текст заявки для копіювання',{exact:true})).toHaveAttribute('readonly','');
  await expect(form.locator('.lead-fallback-feedback')).toContainText('Автоматичне копіювання недоступне');
  await expect(form.getByRole('link',{name:'Відкрити Telegram',exact:true})).toHaveAttribute('href','https://t.me/MaxMytt');
  const events=await page.evaluate(()=>window.dataLayer.filter(item=>item[0]==='event').map(item=>Array.from(item)));
  expect(events.filter(item=>['generate_lead','lead_form_success','lead_fallback_open'].includes(item[1]))).toHaveLength(0);
  expect(JSON.stringify(events)).not.toMatch(/Private fallback person|380000000000/);
  expect(endpointRequests).toBe(0);
});

test('consent choices are independent from form consent and revocable',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Налаштування cookies',exact:true}).click();
  await page.getByRole('button',{name:'Дозволити всі',exact:true}).click();
  expect(await page.evaluate(()=>window.MAX_SITE_CONSENT.ad_storage)).toBe('granted');
  await page.evaluate(()=>{
    sessionStorage.setItem('max_site_gclid','test-click-id');
    sessionStorage.setItem('max_site_utm_source','test-source');
  });
  await page.getByRole('button',{name:'Налаштування cookies',exact:true}).click();
  await page.getByRole('button',{name:'Лише необхідні',exact:true}).click();
  expect(await page.evaluate(()=>window.MAX_SITE_CONSENT.ad_storage)).toBe('denied');
  expect(await page.evaluate(()=>sessionStorage.getItem('max_site_gclid'))).toBeNull();
  expect(await page.evaluate(()=>sessionStorage.getItem('max_site_utm_source'))).toBeNull();
  await expect(page.locator('.consent-panel')).toBeHidden();
});

test('budget estimator and editable resources work without sending personal data',async({page})=>{
  await page.goto('/qa-checklist/');
  await page.locator('#budget-format').selectOption('store');
  await expect(page.locator('[data-budget-tool] output')).toContainText(/34\s*300/);
  await page.getByLabel('CRM та синхронізація',{exact:true}).check();
  await expect(page.locator('[data-budget-tool] output')).toContainText('Окрема оцінка: CRM');
  for (const link of await page.locator('#project-resources a[download]').all()) {
    const response=await page.request.get(await link.getAttribute('href'));
    expect(response.status()).toBe(200);
    expect((await response.text()).length).toBeGreaterThan(500);
  }
});

test('fragment navigation exposes the calculator heading below the sticky header',async({page})=>{
  await page.goto('/qa-checklist/#budget-estimator');
  const heading=page.locator('#budget-estimator > h2');
  await expect(heading).toBeVisible();
  await expect.poll(async()=>{
    const box=await heading.boundingBox();
    const header=await page.locator('header').first().boundingBox();
    return box.y-(header.y+header.height);
  }).toBeGreaterThanOrEqual(8);
  const fontSize=await heading.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeLessThanOrEqual(36);
});

test('case link records the actual project name',async({page})=>{
  await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
  await page.goto('/portfolio/max-site/');
  // Prevent opening a live external page while testing the delegated click handler.
  await page.locator('.case-actions a').first().evaluate(link=>link.addEventListener('click',event=>event.preventDefault()));
  await page.locator('.case-actions a').first().click();
  const names=await page.evaluate(()=>window.dataLayer.filter(item=>item[0]==='event' && item[1]==='case_live_site_click').map(item=>item[2].case_name));
  expect(names).toEqual(['MAX SITE']);
});

for (const width of [360,390,430,768]) test(`contact controls fit ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/nishi/sajt-dlya-magazynu/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  const bar=page.locator('.floating-contact');
  await expect(bar).toBeVisible();
  if (await bar.isVisible()) {
    for (const link of await bar.locator('a:visible').all()) {
      const box=await link.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x+box.width).toBeLessThanOrEqual(width+1);
    }
  }
});
