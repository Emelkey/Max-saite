#!/usr/bin/env node

const fs=require('fs');
const os=require('os');
const path=require('path');
const {spawn,spawnSync}=require('child_process');
const {chromium}=require('@playwright/test');

const root=path.resolve(__dirname,'..');
const baselineCommit='f22f2e02fa77f520d37d75b28ba7dbf51b288daf';
const outDir=path.join(root,'artifacts','seo','baseline');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'max-site-baseline-'));
const archive=path.join(temp,'site.tar');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

(async()=>{
  const archived=spawnSync('git',['archive','--format=tar',`--output=${archive}`,baselineCommit],{cwd:root,encoding:'utf8'});
  if (archived.status!==0) throw new Error(archived.stderr||'git archive failed');
  const extracted=spawnSync('tar',['-xf',archive,'-C',temp],{encoding:'utf8'});
  if (extracted.status!==0) throw new Error(extracted.stderr||'tar extraction failed');
  const server=spawn(process.execPath,[require.resolve('http-server/bin/http-server'),'.','-p','4176','-c-1','--silent','-a','127.0.0.1'],{cwd:temp,stdio:'ignore'});
  try {
    await wait(1200);
    const browser=await chromium.launch({headless:true});
    try {
      for (const [mode,use] of Object.entries({desktop:{viewport:{width:1440,height:1000}},mobile:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}})) {
        const context=await browser.newContext(use);
        const page=await context.newPage();
        await page.route('https://www.googletagmanager.com/**',request=>request.fulfill({status:200,contentType:'application/javascript',body:''}));
        await page.route('https://www.google-analytics.com/**',request=>request.fulfill({status:204,body:''}));
        await page.goto('http://127.0.0.1:4176/',{waitUntil:'domcontentloaded'});
        await page.waitForTimeout(1200);
        await page.screenshot({path:path.join(outDir,`home-${mode}.png`),fullPage:false});
        await context.close();
      }
    } finally { await browser.close(); }
  } finally {
    server.kill('SIGTERM');
    fs.rmSync(temp,{recursive:true,force:true});
  }
  fs.writeFileSync(path.join(outDir,'screenshot-manifest.json'),`${JSON.stringify({baselineCommit,capturedAt:new Date().toISOString(),files:['home-desktop.png','home-mobile.png']},null,2)}\n`);
  console.log(`Captured baseline screenshots from ${baselineCommit}.`);
})().catch(error=>{console.error(error);fs.rmSync(temp,{recursive:true,force:true});process.exit(1);});
