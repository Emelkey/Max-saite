#!/usr/bin/env node
// Repeatable navigation-only laboratory observations. Never sends forms.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2),mode=args[0],out=path.resolve(args[1]||'artifacts/lab-experiment');
if(!['public-pair','head-order'].includes(mode))throw Error('Use public-pair or head-order, followed by a fresh output directory');
if(fs.existsSync(out))throw Error('Preserve existing experiment; choose a fresh output directory');
fs.mkdirSync(out,{recursive:true});
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const earlyStyles=html=>{const tag=html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/i)?.[0];if(!tag)throw Error('Missing stylesheet');return html.replace(tag,'').replace(/(<head\b[^>]*>)/i,`$1\n${tag}`);};
const blocked=['*googletagmanager.com*','*google-analytics.com*','*analytics.google.com*','*doubleclick.net*','*connect.facebook.net*','*facebook.com/tr*','*mc.yandex*'];
const metrics=['largest-contentful-paint','first-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index','total-byte-weight'];
(async()=>{
 let server;const targets=[];
 if(mode==='head-order'){
  const base=path.join(root,'release/max-site-production');
  const original=fs.readFileSync(path.join(base,'index.html'),'utf8');
  server=http.createServer((req,res)=>{
   const u=new URL(req.url,'http://localhost');const experiment=u.pathname.split('/')[1];
   if(!['baseline','early-css'].includes(experiment)){res.writeHead(404);return res.end();}
   let suffix=u.pathname.replace(/^\/(baseline|early-css)/,'');if(suffix==='/'||suffix==='')suffix='/index.html';
   const f=path.resolve(base,'.'+suffix);if(!f.startsWith(base+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}
   let bytes=fs.readFileSync(f);if(suffix==='/index.html'){
    let html=experiment==='early-css'?earlyStyles(original):original;
    // Same subdirectory base for both conditions; absolute first-party paths also stay local.
    html=html.replace(/<head>/,'<head><base href="/'+experiment+'/">').replace(/(["'])\/(assets\/|styles\.css|script\.js)/g,'$1/'+experiment+'/$2');bytes=Buffer.from(html);
   }
   const ext=path.extname(f);res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.avif':'image/avif','.webp':'image/webp','.png':'image/png'}[ext]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex'});res.end(bytes);
  });
  await new Promise(r=>server.listen(4253,'127.0.0.1',r));
  targets.push({label:'baseline',url:'http://127.0.0.1:4253/baseline/',htmlSha256:hash(original)},{label:'early-css',url:'http://127.0.0.1:4253/early-css/',htmlSha256:hash(earlyStyles(original))});
 }else{
  for(const [label,url,pattern] of [['nextjs','https://www.formula-chistoty.ck.ua/',/\/_next\//],['wordpress','https://webartix.com.ua/',/\/wp-content\//]]){
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});const html=await response.text();if(!response.ok||!pattern.test(html))throw Error(`Cannot verify ${label} marker: ${url}`);
   targets.push({label,url:response.url,httpStatus:response.status,htmlSha256:hash(html),stackEvidence:pattern.source,stackCaveat:'Public asset marker; exact runtime version and server configuration not inferred.'});
  }
 }
 let chrome;
 try{
  const [{default:lighthouse},{launch}]=await Promise.all([import('lighthouse'),import('chrome-launcher')]);
  chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-gpu']});
  const samples=[];
  for(let run=1;run<=3;run++)for(const target of (run%2?targets:[...targets].reverse())){
   const r=await lighthouse(target.url,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:2,disabled:false},throttlingMethod:'simulate',blockedUrlPatterns:blocked});
   if(r.lhr.runtimeError)throw Error(JSON.stringify(r.lhr.runtimeError));
   const file=`${target.label}-${run}.json`;fs.writeFileSync(path.join(out,file),r.report);
   const sample={label:target.label,run,file,reportSha256:hash(r.report),fetchedAt:r.lhr.fetchTime,lighthouseVersion:r.lhr.lighthouseVersion,config:r.lhr.configSettings,environment:r.lhr.environment,scores:Object.fromEntries(Object.entries(r.lhr.categories).map(([k,v])=>[k,v.score])),metrics:Object.fromEntries(metrics.map(k=>[k,{value:r.lhr.audits[k].numericValue,unit:r.lhr.audits[k].numericUnit}]))};samples.push(sample);console.log(JSON.stringify({label:target.label,run,metrics:sample.metrics}));
  }
  const median=xs=>[...xs].sort((a,b)=>a-b)[1];
  const summary={measuredAt:new Date().toISOString(),mode,targets,blockedUrlPatterns:blocked,method:'Three cold mobile Lighthouse navigations per target, alternating order; simulated Lighthouse mobile throttling; 390x844 DPR2; same browser and host. Analytics vendor requests blocked on both targets. No form interactions.',limitations:mode==='public-pair'?'Two different public homepages, content, hosting and implementations. Observational sample, not a controlled platform experiment, client before/after, CrUX p75 or a winner ranking.':'Same local production package. Only first-party stylesheet discovery order changes. Loopback delivery is not production latency. Lab LCP/CLS and TBT do not establish field INP or CrUX p75.',samples,medians:targets.map(t=>({label:t.label,metrics:Object.fromEntries(metrics.map(k=>[k,median(samples.filter(s=>s.label===t.label).map(s=>s.metrics[k].value))])),scores:Object.fromEntries(Object.keys(samples[0].scores).map(k=>[k,median(samples.filter(s=>s.label===t.label).map(s=>s.scores[k]))]))}))};fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary.medians));
 }finally{if(chrome)await chrome.kill();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
