#!/usr/bin/env node
// Repeatable source inventory; HTTP/Google indexing evidence is kept separately.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const origin = 'https://maxsite.com.ua';
const ignored = new Set(['.git','.github','node_modules','release','artifacts','docs','tools','tests','seo','edge','assets']);
const attr = (tag,name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`,'i'))?.[1] || '';
const text = html => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&(?:nbsp|amp|quot|#39);/g,' ').replace(/\s+/g,' ').trim();
const route = file => file === 'index.html' ? '/' : `/${file.replace(/index\.html$/, '')}`;
function csv(content) {
  const rows=[]; let row=[],value='',quoted=false;
  for (let i=0;i<content.length;i++) { const c=content[i];
    if(c==='"') { if(quoted&&content[i+1]==='"') {value+='"';i++;} else quoted=!quoted; }
    else if(c===','&&!quoted) {row.push(value);value='';}
    else if(c==='\n'&&!quoted) {row.push(value.replace(/\r$/,''));if(row.some(Boolean))rows.push(row);row=[];value='';}
    else value+=c;
  }
  if(value||row.length){row.push(value);rows.push(row);}
  const [headers,...data]=rows;
  return data.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]||''])));
}
function collect(dir='') {
  return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>ignored.has(e.name)?[]:e.isDirectory()?collect(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);
}
function grams(value) { const words=value.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];return new Set(words.slice(4).map((_,i)=>words.slice(i,i+5).join(' '))); }
function similarity(a,b) {let n=0;for(const v of a)if(b.has(v))n++;return a.size+b.size-n ? n/(a.size+b.size-n):0;}
function audit({revision, output}={}) {
  const read=file=>revision?execFileSync('git',['show',`${revision}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:10e6}):fs.readFileSync(path.join(root,file),'utf8');
  const files=revision?execFileSync('git',['ls-tree','-r','--name-only',revision],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html')&&!f.split('/').some(s=>ignored.has(s))):collect();
  const baseline=JSON.parse(fs.readFileSync(path.join(root,'seo/evidence/top1-20260910-gsc-baseline.json'),'utf8'));
  const owners=JSON.parse(fs.readFileSync(path.join(root,'seo/top1-intent-map.json'),'utf8')).owners;
  const oldMap=csv(read('seo/keyword-map.csv'));
  const redirects=csv(read('seo/redirects.csv'));
  const childMaps=[...read('sitemap.xml').matchAll(/<loc>[^<]*\/([^/<]+\.xml)<\/loc>/g)].map(m=>m[1]);
  const sitemaps=new Set(childMaps.flatMap(f=>[...read(f).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])));
  const metrics=new Map(baseline.datasets.pages.rows.map(r=>[r.keys[0],r]));
  const rows=files.sort().map(file=>{
    const html=read(file),urlPath=route(file),url=origin+urlPath;
    const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
    const body=main.split(/<section\b[^>]*class="[^"]*\bseo-lead\b/i)[0].replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi,' ');
    const metas=html.match(/<meta\b[^>]*>/gi)||[];
    const meta=name=>attr(metas.find(t=>attr(t,'name')===name)||'','content');
    const linkTags=html.match(/<link\b[^>]*>/gi)||[];
    const canonical=attr(linkTags.find(t=>attr(t,'rel')==='canonical')||'','href');
    const links=[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map(m=>{try{return new URL(m[1],url)}catch{return null}}).filter(u=>u?.origin===origin).map(u=>u.pathname);
    const contextual=[...body.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map(m=>{try{return new URL(m[1],url)}catch{return null}}).filter(u=>u?.origin===origin).map(u=>u.pathname);
    const schemas=[],schemaErrors=[];for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{schemas.push(JSON.parse(m[1]))}catch(e){schemaErrors.push(e.message)}}
    const types=new Set();const walk=v=>{if(!v||typeof v!=='object')return;[].concat(v['@type']||[]).forEach(t=>types.add(t));Object.values(v).forEach(walk)};schemas.forEach(walk);
    const owner=owners.find(o=>o.url===urlPath),old=oldMap.find(o=>o.canonical_url===url);
    const title=text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');
    const h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>text(m[1]));
    const indexable=!/noindex/i.test(meta('robots'))&&urlPath!=='/404.html';
    return {route:urlPath,file,url,indexable,robots:meta('robots'),canonical,selfCanonical:canonical===url,title,description:meta('description'),h1,hreflang:linkTags.filter(t=>attr(t,'hreflang')).map(t=>({lang:attr(t,'hreflang'),url:attr(t,'href')})),schemaTypes:[...types].sort(),schemaErrors,primary:owner?.primary||old?.primary_query||h1[0]||title,secondary:owner?.secondary||old?.secondary_queries.split(';').map(x=>x.trim())||[],intent:owner?.intent||old?.intent||(urlPath.startsWith('/blog/')?'Informational: '+title:'Supporting: '+title),intentSource:owner?'TOP1 approved map':old?'existing keyword map':'page-specific supporting intent, review on expansion',inSitemap:sitemaps.has(url),redirectPlan:redirects.find(r=>r.from===url)||null,clientRedirect:!!html.match(/http-equiv=["']refresh/i),images:(html.match(/<img\b[^>]*>/gi)||[]).map(t=>({src:attr(t,'src'),hasAlt:/\balt=/.test(t),alt:attr(t,'alt')})),gsc:metrics.get(url)||null,htmlSha256:crypto.createHash('sha256').update(html).digest('hex'),bodySha256:crypto.createHash('sha256').update(text(body)).digest('hex'),bodyWords:text(body).split(/\s+/).filter(Boolean).length,links,contextual,bodyText:text(body)};
  });
  const indexable=rows.filter(r=>r.indexable), sets=new Map(indexable.map(r=>[r.route,grams(r.bodyText)]));
  for(const r of rows){r.inboundSourcePages=rows.filter(s=>s.indexable&&s.route!==r.route&&s.links.includes(r.route)).map(s=>s.route);r.contextualInboundSourcePages=rows.filter(s=>s.indexable&&s.route!==r.route&&s.contextual.includes(r.route)).map(s=>s.route);r.duplicateTitleWith=indexable.filter(s=>s.route!==r.route&&s.title===r.title).map(s=>s.route);r.duplicateDescriptionWith=indexable.filter(s=>s.route!==r.route&&s.description===r.description).map(s=>s.route);r.highSimilarityWith=r.indexable?indexable.filter(s=>s.route!==r.route).map(s=>({route:s.route,jaccard5gram:similarity(sets.get(r.route),sets.get(s.route))})).filter(x=>x.jaccard5gram>=0.5).sort((a,b)=>b.jaccard5gram-a.jaccard5gram):[];delete r.bodyText;}
  const result={generatedAt:new Date().toISOString(),sourceRevision:revision||'working-tree',kind:'Source inventory, not HTTP or Google index status',gscWindow:'2026-08-11/2026-09-07',similarityMethod:'5-word Jaccard of main before lead form, excluding navigation. Editorial review signal, not a Google ranking metric.',summary:{html:rows.length,indexable:indexable.length,missingAlt:rows.flatMap(r=>r.images).filter(i=>!i.hasAlt).length,emptyAlt:rows.flatMap(r=>r.images).filter(i=>i.hasAlt&&!i.alt).length,nonSelfCanonical:indexable.filter(r=>!r.selfCanonical).length,duplicateMetadata:indexable.filter(r=>r.duplicateTitleWith.length||r.duplicateDescriptionWith.length).length,orphan:indexable.filter(r=>r.route!=='/'&&!r.inboundSourcePages.length).length},rows};
  if(output){const target=path.resolve(root,output);if(!target.startsWith(root+path.sep))throw Error('Output outside repository');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');}
  return result;
}
if(require.main===module){const args=process.argv.slice(2);const opt=name=>args[args.indexOf(name)+1];const result=audit({revision:args.includes('--revision')?opt('--revision'):undefined,output:args.includes('--output')?opt('--output'):'artifacts/seo/top1-current-inventory.json'});console.log(JSON.stringify(result.summary,null,2));}
module.exports={audit,csv,grams,similarity,route};
