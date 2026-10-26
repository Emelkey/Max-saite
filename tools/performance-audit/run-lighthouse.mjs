// Read-only public navigation collector. Preparation only until explicit release gate.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
const root = path.dirname(fileURLToPath(import.meta.url));
const value = name => process.argv.find(v => v.startsWith(`--${name}=`))?.slice(name.length+3);
const allSites = JSON.parse(await fs.readFile(path.join(root, 'sites.json'), 'utf8'));
const wanted = value('sites')?.split(',');
if (wanted?.some(k => !allSites.some(s => s.key === k))) throw Error('Unknown site key');
const sites = allSites.filter(s => !wanted || wanted.includes(s.key));
const runs = Number(value('runs') || '3');
if (!Number.isInteger(runs) || runs < 1 || runs > 5) throw Error('runs must be 1–5');
const strategy = value('strategy') || 'both';
if (!['mobile','desktop','both'].includes(strategy)) throw Error('Invalid strategy');
const modes = strategy === 'both' ? ['mobile','desktop'] : [strategy];
const jobs = [];
for (let round=1;round<=runs;round++) for (const site of sites) for (const route of site.routes) for (const mode of modes) jobs.push({round,site,route,mode,url:site.origin+route.path});
if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({preparationOnly:true,baselineStarted:false,numberOfNavigations:jobs.length,jobs:jobs.map(j=>({round:j.round,site:j.site.key,kind:j.route.kind,mode:j.mode,url:j.url}))}, null, 2));
  process.exit(0);
}
const gatePath=value('release-manifest');
if (!gatePath) throw Error('STOP: require parent-confirmed final-live release manifest before any site request');
const gate=JSON.parse(await fs.readFile(path.resolve(gatePath),'utf8'));
if(gate.finalReleaseConfirmed!==true || !gate.confirmedAt || !gate.parentGoAhead) throw Error('STOP: final-live release confirmation and parent go-ahead absent');
for(const site of sites) if(!/^[a-f0-9]{40}$/.test(gate.commits?.[site.key] || '')) throw Error(`STOP: exact current live commit missing for ${site.key}`);
const label=value('label');
if(!label || !/^[a-z0-9-]+$/.test(label)) throw Error('Supply unique --label=baseline-... or --label=after-...');
await fs.mkdir(path.join(root,'evidence'),{recursive:true});
const output=path.join(root,'evidence',label);
await fs.mkdir(output,{recursive:false});
const lhRoot=process.env.LIGHTHOUSE_PACKAGE || '/workspace/shared/maxsite-improvements-20261026/node_modules/lighthouse';
const {default:lighthouse,desktopConfig}=await import(pathToFileURL(path.join(lhRoot,'core/index.js')));
const {launch}=await import(pathToFileURL(path.resolve(lhRoot,'../chrome-launcher/dist/index.js')));
const chromePath=process.env.CHROME_PATH || '/usr/bin/chromium';
// Same guard in both batches: no lead API or external collection calls. Other resources remain enabled.
const blockedUrlPatterns=['*/api/lead*','*/api/tender*','*max-site-leads.emelkey777.workers.dev*','*api.telegram.org/*','*google-analytics.com/*collect*','*analytics.google.com/*collect*','*doubleclick.net/*','*facebook.com/tr*'];
const meta={label,startedAt:new Date().toISOString(),releaseGate:gate,runs,modes,chromePath,host:{platform:process.platform,arch:process.arch,node:process.version,cpuCount:os.cpus().length,cpuModel:os.cpus()[0]?.model},methodology:'Sequential round-robin cold Chrome profiles; Lighthouse official mobile/desktop simulated throttling. No form, contact, consent or other interaction. Lead/collection endpoints blocked for safety; guarded lab load results are not field CWV. Report all valid runs, medians and min/max. TBT is not INP.',blockedUrlPatterns};
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(meta,null,2));
const rows=[];
let halted=false;
for(const job of jobs){
  const name=`${job.site.key}-${job.route.kind}-${job.mode}-${job.round}`;
  const row={site:job.site.key,kind:job.route.kind,mode:job.mode,round:job.round,requestedUrl:job.url,expectedCommit:gate.commits[job.site.key]};
  let chrome;
  try{
    console.log(`START ${name} ${new Date().toISOString()}`);
    // Do not silently disable browser/OS sandboxing to work around an executor limitation.
    chrome=await launch({chromePath,chromeFlags:['--headless=new','--no-first-run','--disable-gpu'],logLevel:'error'});
    const result=await lighthouse(job.url,{port:chrome.port,logLevel:'error',output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo'],throttlingMethod:'simulate',blockedUrlPatterns},job.mode==='desktop'?desktopConfig:undefined);
    if(!result) throw Error('No Lighthouse result');
    const lhr=result.lhr;
    await fs.writeFile(path.join(output,`${name}.json`),JSON.stringify(lhr,null,2));
    await fs.writeFile(path.join(output,`${name}.html`),result.report[1]);
    row.valid=!lhr.runtimeError && lhr.finalDisplayedUrl===job.url && lhr.audits['http-status-code']?.score!==0;
    row.finalDisplayedUrl=lhr.finalDisplayedUrl;
    row.runtimeError=lhr.runtimeError;
    row.runWarnings=lhr.runWarnings;
    row.lighthouseVersion=lhr.lighthouseVersion;
    row.fetchTime=lhr.fetchTime;
    row.configSettings=lhr.configSettings;
    row.environment=lhr.environment;
    row.scores=Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score===null?null:Math.round(v.score*100)]));
    row.metrics=Object.fromEntries(['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift','server-response-time','total-byte-weight'].map(k=>[k,lhr.audits[k]?.numericValue??null]));
    row.actionableAudits=Object.entries(lhr.audits).filter(([,a])=>a.score!==null&&a.score<1&&a.details&&a.details.type!=='debugdata').map(([id,a])=>({id,title:a.title,score:a.score,displayValue:a.displayValue,metricSavings:a.metricSavings}));
    row.evidence=`${name}.json`;
    // Unexpected redirects, renderer/network error, or challenge response is not a speed sample.
    if(!row.valid) halted=true;
  }catch(error){row.valid=false;row.error=String(error.stack||error);halted=true;}
  finally{if(chrome) await chrome.kill();}
  rows.push(row);
  await fs.writeFile(path.join(output,'runs.json'),JSON.stringify({meta,halted,results:rows},null,2));
  console.log(`DONE ${name} valid=${row.valid} scores=${JSON.stringify(row.scores)} error=${row.error||row.runtimeError?.message||''}`);
  if(halted)break; // Diagnose exact blocker; never turn failed navigation into a score or retry blindly.
}
const stats=values=>{if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)))return null;const s=[...values].sort((a,b)=>a-b);return{median:s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2,min:s[0],max:s.at(-1)}};
const groups=[];
for(const site of sites)for(const route of site.routes)for(const mode of modes){
  const samples=rows.filter(r=>r.site===site.key&&r.kind===route.kind&&r.mode===mode);
  const complete=samples.length===runs&&samples.every(r=>r.valid);
  groups.push({site:site.key,kind:route.kind,mode,url:site.origin+route.path,samples:samples.length,complete,scores:complete?Object.fromEntries(Object.keys(samples[0].scores).map(k=>[k,stats(samples.map(r=>r.scores[k]))])):null,metrics:complete?Object.fromEntries(Object.keys(samples[0].metrics).map(k=>[k,stats(samples.map(r=>r.metrics[k]))])):null,evidence:samples.map(r=>r.evidence)});
}
await fs.writeFile(path.join(output,'summary.json'),JSON.stringify({meta,endedAt:new Date().toISOString(),complete:!halted&&rows.length===jobs.length,results:groups},null,2));
if(halted)process.exitCode=1;
