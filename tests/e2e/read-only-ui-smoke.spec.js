const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});

// A touch press can keep :active for a frame or two after the tap gesture;
// wait for the browser to release it before sampling the settled spring.
const settle=async locator=>{await expect.poll(()=>locator.evaluate(el=>el.matches(':active'))).toBe(false);return locator.evaluate(async el=>{
  getComputedStyle(el).transform;
  await Promise.all(el.getAnimations().filter(a=>a.transitionProperty==='transform').map(a=>a.finished.catch(()=>{})));
});};
const activate=(locator,isMobile)=>isMobile?locator.tap():locator.click();

test.beforeEach(async({page,baseURL})=>{
  const origin=new URL(baseURL).origin;
  // Install the boundary before navigation. Only same-site GET/HEAD requests
  // are allowed; no production leads, analytics collection, or ad clicks.
  await page.context().route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===origin&&['GET','HEAD'].includes(request.method())){
      // Do not let an otherwise allowed URL redirect outside this boundary.
      const response=await route.fetch({maxRedirects:0});
      if(response.status()>=300&&response.status()<400)return route.abort();
      return route.fulfill({response});
    }
    if(url.origin==='https://www.googletagmanager.com')return route.fulfill({status:200,contentType:'application/javascript',body:''});
    return route.abort();
  });
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()})));
});

test('read-only release UI: pricing, spring, CTA navigation and empty form',async({page,isMobile,baseURL},testInfo)=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  if(process.env.EXPECTED_RELEASE_REVISION){
    const response=await page.request.get(`${baseURL}/.well-known/max-site-release.json?release_check=${process.env.EXPECTED_RELEASE_REVISION}`,{maxRedirects:0});
    expect(response.ok()).toBe(true);
    expect((await response.json()).revision).toBe(process.env.EXPECTED_RELEASE_REVISION);
  }
  await page.goto('/?maxsite_qa=1#pricing');
  await expect(page.locator('#pricing')).toBeInViewport();
  const cta=page.locator('.mx-price .mx-pill').first();
  await cta.scrollIntoViewIfNeeded();
  if(!isMobile){
    await cta.hover();
    await settle(cta);
    expect(await cta.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1.015,3);
  }
  await testInfo.attach('pricing-buttons',{body:await page.screenshot(),contentType:'image/png'});
  await activate(cta,isMobile);
  await expect(page.locator('#lead-name')).toBeFocused();
  await expect(page.locator('#lead-name')).toHaveValue('');
  await expect(page.locator('#lead-phone')).toHaveValue('');
  await expect(page.locator('#lead-comment')).toHaveValue('Цікавить формат: Старт. ');
  await expect(page.locator('#lead-consent')).not.toBeChecked();
  await expect(page.locator('.mx-submit')).toBeEnabled();
  await settle(cta);
  expect(await cta.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await testInfo.attach('lead-form-without-submission',{body:await page.screenshot(),contentType:'image/png'});
});

test('read-only mobile menu can open, close, reopen and navigate',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile navigation only.');
  await page.goto('/?maxsite_qa=1');
  const toggle=page.locator('#menuToggle'),menu=page.locator('#mobileMenu');
  await toggle.tap();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.tap();
  await menu.getByRole('link',{name:'Ціни',exact:true}).tap();
  await expect(menu).toBeHidden();
  await expect(page.locator('#pricing')).toBeFocused();
  expect(await page.evaluate(()=>window.demoController.getState().playing)).toBe(false);
});

test('read-only reduced-motion and disabled states remain stationary',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?maxsite_qa=1#lead');
  const button=page.locator('.mx-submit');
  await page.keyboard.press('Tab');
  await button.focus();
  await expect(button).toBeFocused();
  expect(await button.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await button.evaluate(el=>{el.disabled=true;});
  await button.hover({force:true});
  expect(await button.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
});
