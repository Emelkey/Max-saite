// Captures actual local production UI. No third-party customer data or generated mockups.
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');
const {chromium} = require('@playwright/test');
const root = path.resolve(__dirname, '..');
(async()=>{
  const server = spawn(process.execPath,[require.resolve('http-server/bin/http-server'),'release/max-site-production','-p','4177','-c-1','--silent','-a','127.0.0.1'],{cwd:root,stdio:'ignore'});
  let browser;
  try {
    await new Promise(r=>setTimeout(r,1000));
    browser = await chromium.launch();
    for (const [name,route] of [['home','/'],['city','/mista/stvorennya-sajtiv-kyiv/']]) {
      for (const [mode,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
        const page = await browser.newPage({viewport,isMobile:mode==='mobile',hasTouch:mode==='mobile'});
        await page.route('**/*', request=>{ const url = new URL(request.request().url()); return url.hostname==='127.0.0.1' ? request.continue() : request.abort(); });
        await page.goto(`http://127.0.0.1:4177${route}`,{waitUntil:'networkidle'});
        const necessary = page.getByRole('button',{name:'Лише необхідні',exact:true});
        if (await necessary.count()) await necessary.click();
        await page.screenshot({path:path.join(root,`assets/portfolio/max-site-${name}-${mode}-20260902.jpg`),type:'jpeg',quality:86});
        await page.close();
      }
    }
  } finally { if(browser) await browser.close(); server.kill(); }
  fs.writeFileSync(path.join(root,'assets/portfolio/max-site-capture-manifest.json'),JSON.stringify({capturedAt:new Date().toISOString(),source:'local production build',routes:['/','/mista/stvorennya-sajtiv-kyiv/'],viewports:['1440x1000','390x844']},null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
