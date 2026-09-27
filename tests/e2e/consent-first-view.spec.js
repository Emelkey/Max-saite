const {test,expect}=require('@playwright/test');

const measurement='G-TS8DMMKK34';
const query='?utm_source=google&utm_medium=cpc&utm_campaign=qa_search&gclid=qa-click-id&gbraid=qa-braid&email=private%40example.test&phone=%2B380000000000';
const commands=page=>page.evaluate(()=>window.dataLayer.map(entry=>Array.from(entry)));
const pageviews=entries=>entries.filter(([command,name,params])=>
  (command==='config'&&name==='G-TS8DMMKK34'&&params?.send_page_view!==false)
  || (command==='event'&&name==='page_view'));

test.beforeEach(async({page})=>{
  // Browser tests exercise consent commands without sending QA traffic to GA4.
  await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
  await page.route(/https:\/\/(?:[a-z0-9-]+\.)?google-analytics\.com\//,route=>route.fulfill({status:204,body:''}));
});

for(const route of ['/stvorennya-saytiv/','/stvorennya-sajtiv-pid-klyuch/']){
  for(const choice of ['analytics','all']){
    test(`${route} fresh ${choice} grant sends one sanitized first pageview`,async({page})=>{
      await page.goto(`${route}${query}`);
      expect(await page.evaluate(()=>localStorage.getItem('max_site_consent_v1'))).toBeNull();
      let entries=await commands(page);
      expect(entries.find(([command,name])=>command==='config'&&name===measurement)[2]).toMatchObject({
        page_location:`http://127.0.0.1:4173${route}`,
        send_page_view:false
      });
      expect(pageviews(entries)).toHaveLength(0);

      await page.getByRole('button',{name:choice==='analytics'?'Лише аналітика':'Дозволити всі',exact:true}).click();
      entries=await commands(page);
      const views=pageviews(entries);
      expect(views).toHaveLength(1);
      expect(views[0][0]).toBe('event');
      const location=views[0][2].page_location;
      expect(location).toBe(`http://127.0.0.1:4173${route}?utm_source=google&utm_medium=cpc&utm_campaign=qa_search${choice==='all'?'&gclid=qa-click-id&gbraid=qa-braid':''}`);
      expect(views[0][2].send_to).toBe(measurement);
      expect(JSON.stringify(entries)).not.toMatch(/private%40example\.test|private@example\.test|380000000000/);

      await page.getByRole('button',{name:'Налаштування cookies',exact:true}).click();
      await page.getByRole('button',{name:'Лише необхідні',exact:true}).click();
      await page.getByRole('button',{name:'Налаштування cookies',exact:true}).click();
      await page.getByRole('button',{name:'Дозволити всі',exact:true}).click();
      expect(pageviews(await commands(page))).toHaveLength(1);
    });
  }
}

for(const choice of ['analytics','all']){
  test(`saved ${choice} consent keeps one automatic pageview`,async({page})=>{
    await page.addInitScript(choice=>localStorage.setItem('max_site_consent_v1',JSON.stringify({choice,timestamp:Date.now()})),choice);
    await page.goto(`/stvorennya-saytiv/${query}`);
    const entries=await commands(page);
    const views=pageviews(entries);
    expect(views).toHaveLength(1);
    expect(views[0][0]).toBe('config');
    expect(views[0][2].send_page_view).toBeUndefined();
    expect(views[0][2].page_location).toContain('utm_source=google');
    expect(views[0][2].page_location.includes('gclid=')).toBe(choice==='all');
  });
}
