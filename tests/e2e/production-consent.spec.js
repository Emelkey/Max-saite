const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve('release/max-site-production');
const origin='https://maxsite.com.ua';
const measurement='G-TS8DMMKK34';
const commands=page=>page.evaluate(()=>window.dataLayer.map(entry=>Array.from(entry)));
const pageviews=entries=>entries.filter(([command,name,params])=>(command==='config'&&name===measurement&&params?.send_page_view!==false)||(command==='event'&&name==='page_view'));

async function localProduction(page,{missingTag=false}={}){
  // Exercise the actual production-origin branch using only local build bytes.
  // No request, analytics event or form payload can reach a live service.
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin){
      if(url.origin==='https://www.googletagmanager.com') return route.fulfill({status:200,contentType:'application/javascript',body:''});
      return route.abort();
    }
    let pathname=decodeURIComponent(url.pathname);
    if(pathname.endsWith('/'))pathname+='index.html';
    const file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
    if(missingTag&&file.endsWith('.html'))return route.fulfill({status:200,contentType:'text/html',body:fs.readFileSync(file,'utf8').replace(/<script async src="https:\/\/www.googletagmanager.com\/gtag\/js\?id=G-TS8DMMKK34"><\/script>/,'')});
    return route.fulfill({path:file});
  });
}

for(const choice of ['analytics','all']){
  test(`production saved ${choice} consent initializes once after real HTML parsing`,async({page})=>{
    await localProduction(page);
    await page.addInitScript(choice=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice,timestamp:Date.now()})),choice);
    for(const url of [origin+'/',origin+'/stvorennya-saytiv/?utm_source=google&utm_medium=cpc',origin+'/stvorennya-saytiv/']){
      await page.goto(url);
      expect(pageviews(await commands(page))).toHaveLength(1);
      await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
    }
    await page.reload();
    expect(pageviews(await commands(page))).toHaveLength(1);
  });
}

test('production fresh grant, repeated grant and revoke send only one consented view',async({page})=>{
  await localProduction(page);
  await page.goto(origin+'/stvorennya-saytiv/?utm_source=google&utm_medium=cpc');
  expect(pageviews(await commands(page))).toHaveLength(0);
  for(const choice of ['necessary','analytics','all','necessary','all']){
    if(await page.locator('.consent-panel').isHidden())await page.getByRole('button',{name:'Налаштування cookies',exact:true}).click();
    await page.locator(`.consent-panel [data-choice="${choice}"]`).click();
    expect(pageviews(await commands(page))).toHaveLength(choice==='necessary'&&!(await commands(page)).some(x=>x[0]==='event'&&x[1]==='page_view')?0:1);
    await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
  }
});

test('missing HTML tag recovers without repeating its existing inline config',async({page})=>{
  await localProduction(page,{missingTag:true});
  await page.addInitScript(()=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice:'analytics',timestamp:Date.now()})));
  await page.goto(origin+'/stvorennya-saytiv/');
  expect(pageviews(await commands(page))).toHaveLength(1);
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
});

test('explicit QA survives navigation, still delivers to mocked endpoint, and clears for ads',async({page})=>{
  await localProduction(page);
  const requests=[];
  await page.route('https://max-site-leads.emelkey777.workers.dev/**',async route=>{
    const payload=route.request().postDataJSON();requests.push(payload);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,lead_id:payload.requestId})});
  });
  await page.goto(origin+'/?maxsite_qa=1');
  await page.goto(origin+'/stvorennya-saytiv/');
  expect(await page.evaluate(()=>window['ga-disable-G-TS8DMMKK34'])).toBe(true);
  const form=page.locator('#lead form');
  await form.locator('[name=name]').fill('LOCAL QA');
  await form.locator('[name=phone]').fill('@local_qa');
  await form.locator('[name=consent]').check();
  await form.evaluate(el=>el.requestSubmit());
  await expect(form.locator('.form-status')).toHaveAttribute('data-state','success');
  expect(requests).toHaveLength(1);
  expect((await commands(page)).filter(x=>x[0]==='event'&&x[1]==='generate_lead')).toHaveLength(0);
  expect(requests[0]).not.toHaveProperty('qa');
  await page.goto(origin+'/stvorennya-saytiv/?utm_source=google&utm_medium=cpc&gclid=local-click');
  expect(await page.evaluate(()=>window.MAX_SITE_QA)).toBe(false);
  expect(await page.evaluate(()=>window['ga-disable-G-TS8DMMKK34'])).toBeUndefined();
  await form.locator('[name=name]').fill('LOCAL QA');
  await form.locator('[name=phone]').fill('@local_qa');
  await form.locator('[name=consent]').check();
  await form.evaluate(el=>el.requestSubmit());
  await expect(form.locator('.form-status')).toHaveAttribute('data-state','success');
  expect(requests).toHaveLength(2);
  expect((await commands(page)).filter(x=>x[0]==='event'&&x[1]==='generate_lead')).toHaveLength(1);
});
