import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import os from 'node:os';
import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
const origin='https://maxsite.com.ua';
const expected='ce088208b4315b153d8bc892a81cd24cdd98ca71';
const out='artifacts/max-speed-diagnostic';
await fs.mkdir(out,{recursive:true});
async function receipt(){const response=await fetch(origin+'/.well-known/max-site-release.json',{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Release receipt HTTP'+response.status);const data=await response.json();if(data.revision!==expected)throw Error('Public revision drift');return data;}
const before=await receipt();
const blockedUrlPatterns=['*/api/lead*','*/api/tender*','*max-site-leads.emelkey777.workers.dev*','*api.telegram.org/*','*google-analytics.com/*collect*','*analytics.google.com/*collect*','*doubleclick.net/*','*facebook.com/tr*'];
const rows=[];
for(let round=1;round<=1;round++)for(const arm of round%2?['baseline-disable-gpu','default-renderer']:['default-renderer','baseline-disable-gpu']){
 const id=`${round}-${arm}`;let chrome;
 try{
  const flags=['--headless=new','--no-first-run',...(arm==='baseline-disable-gpu'?['--disable-gpu']:[])];
  chrome=await launch({chromePath:process.env.CHROME_PATH,chromeFlags:flags,logLevel:'error'});
  const result=await lighthouse(origin+'/',{port:chrome.port,logLevel:'error',output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],throttlingMethod:'simulate',blockedUrlPatterns});
  const lhr=result.lhr;
  await fs.writeFile(`${out}/${id}.json`,JSON.stringify(lhr));
  if(result.artifacts?.Trace)await fs.writeFile(`${out}/${id}.trace.json.gz`,gzipSync(JSON.stringify(result.artifacts.Trace)));
  if(result.artifacts?.DevtoolsLog)await fs.writeFile(`${out}/${id}.network.json.gz`,gzipSync(JSON.stringify(result.artifacts.DevtoolsLog)));
  const browser=await puppeteer.connect({browserURL:`http://127.0.0.1:${chrome.port}`});
  try{const session=await browser.target().createCDPSession();const info=await session.send('SystemInfo.getInfo');await fs.writeFile(`${out}/${id}.gpu-info.json`,JSON.stringify(info,null,2));}finally{await browser.disconnect();}
  if(lhr.runtimeError||lhr.finalDisplayedUrl!==origin+'/')throw Error('Invalid navigation: '+JSON.stringify(lhr.runtimeError));
  rows.push({round,arm,flags,fetchTime:lhr.fetchTime,environment:lhr.environment,version:lhr.lighthouseVersion,config:lhr.configSettings,score:lhr.categories.performance.score,metrics:lhr.audits.metrics.details.items[0],lcp:lhr.audits['lcp-breakdown-insight'],filename:id+'.json',artifactKeys:Object.keys(result.artifacts||{})});
  console.log(JSON.stringify({round,arm,score:lhr.categories.performance.score,LCP:lhr.audits['largest-contentful-paint'].numericValue,observedLCP:lhr.audits.metrics.details.items[0].observedLargestContentfulPaint,TBT:lhr.audits['total-blocking-time'].numericValue}));
  await fs.writeFile(`${out}/progress.json`,JSON.stringify(rows,null,2));
 }finally{await chrome?.kill();}
}
const after=await receipt();
await fs.writeFile(`${out}/summary.json`,JSON.stringify({before,after,host:{node:process.version,cpu:os.cpus()[0]?.model,count:os.cpus().length},methodology:'Read-only unchanged live MAX homepage. One final trace-instrumented paired cold mobile Lighthouse runs per renderer, alternating AB/BA order, same Chrome and runner. Baseline matches original --disable-gpu; default-renderer removes only this audit flag. This is a controlled diagnostic, not a deployed site change, field CWV, or permission to remove motion. Lead/collection endpoints blocked in both arms. All results retained.',rows},null,2));
