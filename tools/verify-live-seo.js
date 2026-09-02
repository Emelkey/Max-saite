#!/usr/bin/env node
// Read-only HTTP evidence. Fetching HTML does not execute analytics or submit a lead.
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const version=process.argv.find(arg=>arg.startsWith('--version='))?.slice(10);
const phase=process.argv.find(arg=>arg.startsWith('--phase='))?.slice(8);
if (!version || !/^[a-z0-9-]+$/.test(version) || !['pre-release','post-release'].includes(phase)) throw Error('Use --version=unique-name --phase=pre-release|post-release');
const out=path.join(root,'artifacts/seo/live',version+'.json');
if (fs.existsSync(out)) throw Error('Evidence exists; select a new version');
const base='https://maxsite.com.ua';
const sitemapFiles=['sitemap-services.xml','sitemap-blog.xml','sitemap-cities.xml','sitemap-niches.xml','sitemap-cases.xml'];
const routes=new Set(['/','/robots.txt','/sitemap.xml','/master3-deliberately-missing-page/']);
for (const file of sitemapFiles) {
  if (!fs.existsSync(path.join(root,file))) continue;
  for (const [,url] of fs.readFileSync(path.join(root,file),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const parsed=new URL(url); if(parsed.origin!==base) throw Error('Unexpected sitemap origin');
    routes.add(parsed.pathname);
  }
}
for(const route of ['/stvorennya-sajtiv-pid-klyuch/','/stvorennya-lendingiv/','/privacy.html','http://maxsite.com.ua/','https://www.maxsite.com.ua/']) routes.add(route);
const rows=[];
async function inspect(route) {
  const chain=[]; let url=route.startsWith('http')?route:base+route;
  try {
    for(let step=0;step<5;step++) {
      const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'MAX-SITE-ReadOnly-SEO-QA/3.0'}});
      const location=response.headers.get('location');
      chain.push({url,status:response.status,location:location||null});
      if(response.status>=300 && response.status<400 && location) {
        await response.body?.cancel();
        const target=new URL(location,url);
        if(!['maxsite.com.ua','www.maxsite.com.ua'].includes(target.hostname) || !['http:','https:'].includes(target.protocol)) return {route,chain,error:'redirect outside audited site'};
        url=target.href; continue;
      }
      const text=await response.text();
      const canonical=text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1]||null;
      const robots=text.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)/i)?.[1]||null;
      const googleIds=[...new Set(text.match(/G-[A-Z0-9]{7,}/g)||[])];
      return {route,chain,canonical,robots,googleIds,clientRefresh:/http-equiv=["']refresh["']/i.test(text),consentAsset:text.includes('/assets/consent.js'),bodyBytes:Buffer.byteLength(text)};
    }
    return {route,chain,error:'too many redirects'};
  } catch(error) { return {route,chain,error:error.message}; }
}
(async()=>{
  const queue=[...routes];
  await Promise.all(Array.from({length:4},async()=>{while(queue.length){const route=queue.shift();const row=await inspect(route);rows.push(row);console.log(`${route}: ${row.error||row.chain.map(item=>item.status).join(' → ')}`);}}));
  rows.sort((a,b)=>a.route.localeCompare(b.route));
  const report={generatedAt:new Date().toISOString(),phase,site:base,method:'Read-only HTTP GET, no JavaScript, no form submission. Pre-release evidence is NOT verification of unpublished changes.',rows};
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(`Saved ${rows.length} observations to ${out}`);
  if(rows.some(row=>row.error))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
