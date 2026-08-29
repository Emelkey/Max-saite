#!/usr/bin/env node

const fs=require('fs');
const path=require('path');
const {spawn}=require('child_process');
const {chromium}=require('@playwright/test');

const root=path.resolve(__dirname,'..');
const outDir=path.join(root,'artifacts','lighthouse');
fs.mkdirSync(outDir,{recursive:true});
const routes=['/','/stvorennya-saytiv/','/stvorennya-saytu-dlya-biznesu/','/stvorennya-program/','/mista/','/mista/stvorennya-sajtiv-kyiv/','/portfolio/formula-chystoty/','/blog/skilky-koshtuye-stvorennya-sajtu/'];
const thresholds={performance:0.85,accessibility:0.90,'best-practices':0.90,seo:0.95};

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

(async()=>{
  const server=spawn(process.execPath,[require.resolve('http-server/bin/http-server'),'.','-p','4174','-c-1','--silent'],{cwd:root,stdio:'ignore'});
  try {
    await wait(1500);
    const [{default:lighthouse},{launch}]=await Promise.all([import('lighthouse'),import('chrome-launcher')]);
    const chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-gpu']});
    const summary=[]; const failures=[];
    try {
      for (const route of routes) {
        const result=await lighthouse(`http://127.0.0.1:4174${route}`,{port:chrome.port,output:'json',logLevel:'error',formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:2,disabled:false},throttlingMethod:'simulate'});
        const slug=route==='/'?'home':route.replace(/^\/+|\/+$/g,'').replaceAll('/','__');
        fs.writeFileSync(path.join(outDir,`${slug}.json`),result.report);
        const scores=Object.fromEntries(Object.entries(thresholds).map(([category])=>[category,result.lhr.categories[category].score]));
        summary.push({route,scores});
        for (const [category,minimum] of Object.entries(thresholds)) if (scores[category]<minimum) failures.push(`${route} ${category}: ${Math.round(scores[category]*100)} < ${Math.round(minimum*100)}`);
        console.log(`${route}: ${Object.entries(scores).map(([name,value])=>`${name} ${Math.round(value*100)}`).join(', ')}`);
      }
    } finally { await chrome.kill(); }
    fs.writeFileSync(path.join(outDir,'summary.json'),`${JSON.stringify({generatedAt:new Date().toISOString(),thresholds,results:summary,failures},null,2)}\n`);
    if (failures.length) { failures.forEach(failure=>console.error(`Lighthouse budget failed: ${failure}`)); process.exitCode=1; }
  } finally { server.kill('SIGTERM'); }
})().catch(error=>{console.error(error);process.exit(1);});
