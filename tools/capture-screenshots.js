#!/usr/bin/env node

const fs=require('fs');
const path=require('path');
const {spawn}=require('child_process');
const {chromium}=require('@playwright/test');

const root=path.resolve(__dirname,'..');
const outDir=path.join(root,'artifacts','screenshots','master-2-0');
const pages={
  home:'/',
  service:'/stvorennya-saytiv/',
  city:'/mista/stvorennya-sajtiv-kyiv/',
  case:'/portfolio/formula-chystoty/',
  blog:'/blog/skilky-koshtuye-stvorennya-sajtu/'
};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

(async()=>{
  fs.rmSync(outDir,{recursive:true,force:true});
  fs.mkdirSync(outDir,{recursive:true});
  const server=spawn(process.execPath,[require.resolve('http-server/bin/http-server'),'.','-p','4175','-c-1','--silent','-a','127.0.0.1'],{cwd:root,stdio:'ignore'});
  try {
    await wait(1200);
    const browser=await chromium.launch({headless:true});
    try {
      for (const [name,route] of Object.entries(pages)) {
        for (const [mode,use] of Object.entries({desktop:{viewport:{width:1440,height:1000},deviceScaleFactor:1},mobile:{viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true}})) {
          const context=await browser.newContext(use);
          const page=await context.newPage();
          await page.route('https://www.googletagmanager.com/**',request=>request.fulfill({status:200,contentType:'application/javascript',body:''}));
          await page.route('https://www.google-analytics.com/**',request=>request.fulfill({status:204,body:''}));
          await page.goto(`http://127.0.0.1:4175${route}`,{waitUntil:'domcontentloaded'});
          await page.waitForTimeout(1200);
          await page.screenshot({path:path.join(outDir,`${name}-${mode}.jpg`),type:'jpeg',quality:88,fullPage:false});
          await context.close();
        }
      }
    } finally { await browser.close(); }
  } finally { server.kill('SIGTERM'); }
  const manifest={generatedAt:new Date().toISOString(),pages:Object.entries(pages).flatMap(([name,route])=>['desktop','mobile'].map(mode=>({name,route,mode,file:`${name}-${mode}.jpg`})))};
  fs.writeFileSync(path.join(outDir,'manifest.json'),`${JSON.stringify(manifest,null,2)}\n`);
  console.log(`Captured ${manifest.pages.length} screenshots in ${outDir}`);
})().catch(error=>{console.error(error);process.exit(1);});
