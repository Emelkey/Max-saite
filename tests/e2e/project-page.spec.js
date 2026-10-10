const {test,expect}=require('@playwright/test');

test.use({serviceWorkers:'block'});
const projectPath='/obgovoryty-proiekt/';
const endpoint='https://max-site-leads.emelkey777.workers.dev/**';
const formats=[['start','Старт'],['business','Бізнес'],['seo','SEO Pro'],['shop','Інтернет-магазин']];
const events=page=>page.evaluate(()=>window.dataLayer.filter(item=>item[0]==='event').map(item=>({name:item[1],parameters:item[2]})));
const activate=(locator,isMobile)=>isMobile?locator.tap():locator.click();
const localOnly=baseURL=>test.skip(!['127.0.0.1','localhost','[::1]'].includes(new URL(baseURL).hostname),'Synthetic form interactions run against localhost only.');

async function expectNoAutomaticKeyboard(page){
  await expect(page.locator('#lead-name')).not.toBeFocused();
  expect(await page.evaluate(()=>document.activeElement.matches('input, textarea, select'))).toBe(false);
}

async function fillLead(page){
  await page.locator('#lead-name').fill('LOCAL QA PRIVATE NAME');
  await page.locator('#lead-phone').fill('@local_qa_private');
  await page.locator('#lead-comment').fill('LOCAL QA PRIVATE COMMENT');
  await page.locator('#lead-consent').check();
}

test.beforeEach(async({page,baseURL})=>{
  const origin=new URL(baseURL).origin;
  // All external traffic is blocked at the context boundary. Individual tests
  // may fulfill the lead endpoint locally, but none can submit a real lead.
  await page.context().route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===origin&&['GET','HEAD'].includes(request.method())){
      const response=await route.fetch({maxRedirects:0});
      if(response.status()>=300&&response.status()<400)return route.abort();
      return route.fulfill({response});
    }
    if(url.origin==='https://www.googletagmanager.com')return route.fulfill({status:200,contentType:'application/javascript',body:''});
    return route.abort();
  });
  await page.addInitScript(()=>{
    if(!localStorage.getItem('max_site_consent_v1'))localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'necessary',timestamp:Date.now()}));
  });
});

for(const [width,height] of [[320,640],[390,844]]){
  test(`project form starts in the ${width}px first viewport without opening a keyboard`,async({page},testInfo)=>{
    await page.setViewportSize({width,height});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(projectPath);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#leadForm')).toBeVisible();
    await expect(page.locator('#lead-name')).toBeInViewport({ratio:1});
    await expect(page.locator('#lead-phone')).toBeInViewport({ratio:1});
    await expect(page.locator('#lead-comment')).toBeInViewport();
    await expectNoAutomaticKeyboard(page);
    for(const field of ['#lead-name','#lead-phone','#lead-comment'])expect(await page.locator(field).evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    expect(await page.evaluate(()=>scrollY)).toBe(0);
    const layout=await page.evaluate(()=>({inner:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    expect(layout).toEqual({inner:width,client:width,scroll:width});
    expect(errors).toEqual([]);
    await testInfo.attach(`project-form-${width}`,{body:await page.screenshot(),contentType:'image/png'});
  });
}

for(const [format,label] of formats){
  test(`${label} pricing CTA navigates in the same tab and prefills its allowed format`,async({page,isMobile,context})=>{
    await page.goto('/#pricing');
    const action=page.locator(`a[data-package="${label}"]`);
    await expect(action).toHaveAttribute('href',`${projectPath}?format=${format}`);
    expect(await action.getAttribute('target')).not.toBe('_blank');
    await activate(action,isMobile);
    await expect(page).toHaveURL(new RegExp(`/obgovoryty-proiekt/\\?format=${format}$`));
    await expect(page.locator('#lead-comment')).toHaveValue(`Цікавить формат: ${label}. `);
    await expect(page.locator('#lead-name')).toHaveValue('');
    await expect(page.locator('#lead-phone')).toHaveValue('');
    await expect(page.locator('#lead-consent')).not.toBeChecked();
    await expectNoAutomaticKeyboard(page);
    expect(context.pages()).toHaveLength(1);
  });
}

for(const [name,selector] of [['header','.mx-nav-cta'],['hero','.mx-hero-actions .mx-btn-primary']]){
  test(`${name} project action opens the form immediately and supports back/repeated navigation`,async({page,isMobile,context})=>{
    await page.goto('/');
    for(let visit=0;visit<2;visit++){
      const action=page.locator(selector);
      await expect(action).toHaveAttribute('href',projectPath);
      await activate(action,isMobile);
      await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
      await expect(page.locator('#lead-name')).toBeInViewport({ratio:1});
      await expect(page.locator('#lead-comment')).toHaveValue('');
      await expectNoAutomaticKeyboard(page);
      expect(context.pages()).toHaveLength(1);
      await page.goBack();
      await expect(page).toHaveURL(/\/$/);
      expect(new URL(page.url()).pathname).toBe('/');
      await expect(action).toBeVisible();
    }
  });
}

test('mobile menu project action navigates normally and does not leave an open menu on return',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile menu only.');
  await page.goto('/');
  const toggle=page.locator('#menuToggle'),menu=page.locator('#mobileMenu');
  for(let visit=0;visit<2;visit++){
    await toggle.tap();
    await expect(menu).toBeVisible();
    const action=menu.getByRole('link',{name:'Обговорити проєкт',exact:true});
    await expect(action).toHaveAttribute('href',projectPath);
    await action.tap();
    await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
    await expect(page.locator('#lead-name')).toBeInViewport({ratio:1});
    await expectNoAutomaticKeyboard(page);
    await page.goBack();
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
  }
});

test('unknown format values cannot inject markup or prefill private query data',async({page,baseURL})=>{
  localOnly(baseURL);
  for(const format of ['unknown','__proto__','<img src=x onerror="window.unexpectedProjectMarkup=true">','Private project text']){
    await page.goto(`${projectPath}?format=${encodeURIComponent(format)}&name=PRIVATE_QUERY_NAME&phone=PRIVATE_QUERY_PHONE&comment=PRIVATE_QUERY_COMMENT`);
    await expect(page.locator('#lead-comment')).toHaveValue('');
    await expect(page.locator('#lead-name')).toHaveValue('');
    await expect(page.locator('#lead-phone')).toHaveValue('');
    expect(await page.evaluate(()=>window.unexpectedProjectMarkup)).toBeUndefined();
    await expect(page.locator('#leadForm img')).toHaveCount(0);
    expect(JSON.stringify(await events(page))).not.toMatch(/PRIVATE_QUERY|Private project text|onerror/);
  }
});

test('project variants remain noindex with a clean canonical and working privacy link',async({page})=>{
  await page.goto(`${projectPath}?format=seo`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/\bnoindex\b/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://maxsite.com.ua${projectPath}`);
  await expect(page.locator('#lead-consent')).toHaveAttribute('required','');
  const privacy=page.locator('#leadForm a[href*="polityka-konfidentsijnosti"]').first();
  await expect(privacy).toBeVisible();
  const href=await privacy.getAttribute('href');
  expect(new URL(href,page.url()).pathname).toBe('/polityka-konfidentsijnosti/');
  const response=await page.request.get(new URL(href,page.url()).href);
  expect(response.status()).toBe(200);
});

test('project form fails closed without its script',async({page})=>{
  await page.route('**/script.js*',route=>route.abort());
  await page.goto(projectPath);
  await expect(page.locator('#leadForm')).toHaveAttribute('method','post');
  await expect(page.locator('#leadForm button[type=submit]')).toBeDisabled();
  await expectNoAutomaticKeyboard(page);
});

test('required fields and explicit form consent prevent any lead request',async({page,baseURL})=>{
  localOnly(baseURL);
  const requests=[];
  await page.route(endpoint,route=>{requests.push(route.request().postDataJSON());return route.abort();});
  await page.goto(projectPath);
  const submit=page.locator('#leadForm button[type=submit]');
  await submit.click();
  await expect(page.locator('#lead-name')).toBeFocused();
  await page.locator('#lead-name').fill('LOCAL QA PRIVATE NAME');
  await page.locator('#lead-phone').fill('@local_qa_private');
  await submit.click();
  expect(await page.locator('#lead-consent').evaluate(input=>input.validity.valueMissing)).toBe(true);
  expect(requests).toHaveLength(0);
  await expect(page.locator('#leadForm .form-status')).not.toHaveAttribute('data-state','success');
});

test('consented attribution survives actual CTA navigation while URLs and analytics exclude lead PII',async({page,isMobile,baseURL})=>{
  localOnly(baseURL);
  const requests=[];
  await page.route(endpoint,async route=>{
    const payload=route.request().postDataJSON();
    requests.push(payload);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,lead_id:payload.requestId})});
  });
  await page.goto('/');
  await page.evaluate(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'all',timestamp:Date.now()})));
  await page.goto('/?utm_source=qa-google&utm_medium=cpc&utm_campaign=qa-project&gclid=qa-project-click&email=PRIVATE_QUERY_EMAIL#pricing');
  await activate(page.locator('a[data-package="Бізнес"]'),isMobile);
  await expect(page).toHaveURL(new RegExp(`${projectPath}\\?format=business$`));
  await fillLead(page);
  await page.locator('#leadForm button[type=submit]').click();
  await expect(page.locator('#leadForm .form-status')).toHaveAttribute('data-state','success');
  expect(requests).toHaveLength(1);
  expect(requests[0].fields).toMatchObject({name:'LOCAL QA PRIVATE NAME',phone:'@local_qa_private',comment:'LOCAL QA PRIVATE COMMENT'});
  expect(requests[0].pageUrl).toBe(`${new URL(baseURL).origin}${projectPath}`);
  expect(requests[0].context).toMatchObject({landing_path:projectPath,utm_source:'qa-google',utm_medium:'cpc',utm_campaign:'qa-project',gclid:'qa-project-click',consent:true,consent_state:'ads_granted'});
  expect(requests[0].context.referrer).not.toContain('?');
  await expect(page.locator('#lead-name')).toHaveValue('');
  await expect(page.locator('#lead-phone')).toHaveValue('');
  const recorded=await events(page);
  for(const name of ['lead_form_submit','lead_form_success','generate_lead','brief_complete'])expect(recorded.filter(event=>event.name===name)).toHaveLength(1);
  expect(recorded.find(event=>event.name==='generate_lead').parameters.lead_id).toBe(requests[0].requestId);
  const analytics=await page.evaluate(()=>JSON.stringify({events:window.dataLayer,page:window.MAX_SITE_GOOGLE_PAGE}));
  expect(analytics).not.toMatch(/LOCAL QA PRIVATE|local_qa_private|PRIVATE_QUERY_EMAIL/);
  expect(page.url()).not.toMatch(/PRIVATE|local_qa|phone=|name=|comment=|email=/);
});

test('necessary-only consent does not persist attribution across the CTA or enable ad storage',async({page,isMobile,baseURL})=>{
  localOnly(baseURL);
  const requests=[];
  await page.route(endpoint,async route=>{
    const payload=route.request().postDataJSON();requests.push(payload);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,lead_id:payload.requestId})});
  });
  await page.goto('/?utm_source=qa-denied&gclid=qa-denied-click');
  await activate(page.locator('.mx-hero-actions .mx-btn-primary'),isMobile);
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  expect(await page.evaluate(()=>({source:sessionStorage.getItem('max_site_utm_source'),gclid:sessionStorage.getItem('max_site_gclid')}))).toEqual({source:null,gclid:null});
  await fillLead(page);
  await page.locator('#leadForm button[type=submit]').click();
  await expect(page.locator('#leadForm .form-status')).toHaveAttribute('data-state','success');
  expect(requests).toHaveLength(1);
  expect(requests[0].context).toMatchObject({utm_source:'',gclid:'',consent:true,consent_state:'ads_denied'});
});

for(const failure of ['HTTP 500','missing acknowledgement']){
  test(`project ${failure} preserves inputs and permits a successful idempotent retry`,async({page,baseURL})=>{
    localOnly(baseURL);
    const requests=[];
    await page.route(endpoint,async route=>{
      const payload=route.request().postDataJSON();requests.push(payload);
      const first=requests.length===1;
      const body=first&&failure==='missing acknowledgement'?{ok:true}:{ok:true,lead_id:payload.requestId};
      await route.fulfill({status:first&&failure==='HTTP 500'?500:200,contentType:'application/json',body:JSON.stringify(body)});
    });
    await page.goto(`${projectPath}?format=start`);
    await fillLead(page);
    const submit=page.locator('#leadForm button[type=submit]');
    await submit.click();
    await expect(page.locator('#leadForm .form-status')).toHaveAttribute('data-state','error');
    await expect(page.locator('#lead-name')).toHaveValue('LOCAL QA PRIVATE NAME');
    await expect(page.locator('#lead-phone')).toHaveValue('@local_qa_private');
    await expect(page.locator('#lead-comment')).toHaveValue('LOCAL QA PRIVATE COMMENT');
    await expect(page.locator('#lead-consent')).toBeChecked();
    await expect(submit).toBeEnabled();
    await expect(page.locator('#leadForm').getByRole('link',{name:'Відкрити Telegram',exact:true})).toHaveAttribute('href','https://t.me/MaxMytt');
    expect(requests).toHaveLength(1);
    expect((await events(page)).filter(event=>['generate_lead','lead_form_success','brief_complete'].includes(event.name))).toHaveLength(0);
    await submit.click();
    await expect(page.locator('#leadForm .form-status')).toHaveAttribute('data-state','success');
    expect(requests).toHaveLength(2);
    expect(requests[1].requestId).toBe(requests[0].requestId);
    expect((await events(page)).filter(event=>event.name==='generate_lead')).toHaveLength(1);
    expect(JSON.stringify(await events(page))).not.toMatch(/LOCAL QA PRIVATE|local_qa_private/);
    expect(page.url()).not.toMatch(/PRIVATE|local_qa|phone=|name=|comment=/);
  });
}
