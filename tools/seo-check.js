#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const check = process.argv[2];
const allowed = new Set(['routes','metadata','canonicals','sitemap','robots','schema','links','content-quality']);
if (!allowed.has(check)) {
  console.error(`Usage: node tools/seo-check.js ${[...allowed].join('|')}`);
  process.exit(2);
}

const origin = 'https://maxsite.com.ua';
const ignored = new Set(['.git','node_modules','release','artifacts']);
const errors = [];
const warnings = [];
const rows = [];

function collect(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory,entry.name);
    if (entry.isDirectory()) result.push(...collect(file));
    else if (entry.name.endsWith('.html')) result.push(file);
  }
  return result;
}
function routeFromFile(file) {
  const rel = path.relative(root,file).replaceAll(path.sep,'/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0,-'index.html'.length)}`;
  return `/${rel}`;
}
function targetFile(sourceFile, href) {
  const clean = href.replace(/[?#].*$/,'');
  if (clean.startsWith('/')) {
    const relative = clean.replace(/^\/+/, '');
    return !relative || clean.endsWith('/') ? path.join(root,relative,'index.html') : path.join(root,relative);
  }
  let target = path.resolve(path.dirname(sourceFile),clean);
  if (!path.extname(target) || clean.endsWith('/')) target = path.join(target,'index.html');
  return target;
}
const text = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
const meta = (html,name,attribute='name') => (html.match(new RegExp(`<meta\\s+[^>]*${attribute}=["']${name}["'][^>]*>`, 'i'))?.[0].match(/content=["']([^"']*)["']/i)?.[1] || '').trim();

for (const file of collect(root)) {
  const html = fs.readFileSync(file,'utf8');
  const route = routeFromFile(file);
  const robots = meta(html,'robots').toLowerCase();
  const indexable = route !== '/404.html' && !robots.includes('noindex');
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || '';
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = meta(html,'description');
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(match=>text(match[1]));
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const links = [...html.matchAll(/\shref=["']([^"']+)["']/gi)].map(match=>match[1]);
  const schemas = [];
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { schemas.push(JSON.parse(match[1])); } catch (error) { errors.push(`${route}: invalid JSON-LD (${error.message})`); }
  }
  rows.push({file,route,html,robots,indexable,canonical,title,description,h1s,main,links,schemas});
}

const indexable = rows.filter(row=>row.indexable);
const ownerCheck = (field,label) => {
  const owners = new Map();
  for (const row of indexable) {
    const value = row[field];
    if (!value) errors.push(`${row.route}: missing ${label}`);
    else if (owners.has(value)) errors.push(`${row.route}: duplicate ${label} with ${owners.get(value)}`);
    else owners.set(value,row.route);
  }
};

if (check === 'routes') {
  for (const row of rows) {
    if (!row.robots) errors.push(`${row.route}: missing robots directive`);
    if (row.indexable && row.h1s.length !== 1) errors.push(`${row.route}: expected one H1, found ${row.h1s.length}`);
    if (!row.indexable && row.route !== '/404.html' && !row.canonical.startsWith(origin)) errors.push(`${row.route}: noindex page lacks production canonical`);
  }
}

if (check === 'metadata') {
  ownerCheck('title','title'); ownerCheck('description','description');
  for (const row of indexable) {
    if (row.h1s.length !== 1) errors.push(`${row.route}: expected one H1`);
    if (/\{\{|\}\}|undefined|null/i.test(`${row.title} ${row.description}`)) errors.push(`${row.route}: unresolved metadata token`);
  }
}

if (check === 'canonicals') {
  for (const row of indexable) {
    const expected = `${origin}${row.route}`;
    if (row.canonical !== expected) errors.push(`${row.route}: canonical ${row.canonical || 'MISSING'} != ${expected}`);
    if (/[?&](?:utm_|gclid)/i.test(row.canonical)) errors.push(`${row.route}: tracking parameter in canonical`);
  }
}

function sitemapUrls() {
  const index = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  const sitemapFiles = [...index.matchAll(/<sitemap>[\s\S]*?<loc>https:\/\/maxsite\.com\.ua\/([^<]+)<\/loc>[\s\S]*?<\/sitemap>/g)].map(match=>match[1]);
  if (!sitemapFiles.length) errors.push('sitemap.xml is not a sitemap index');
  const urls=[];
  for (const name of sitemapFiles) {
    const file=path.join(root,name);
    if (!fs.existsSync(file)) { errors.push(`missing child sitemap ${name}`); continue; }
    const xml=fs.readFileSync(file,'utf8');
    urls.push(...[...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g)].map(match=>match[1]));
  }
  return urls;
}

if (check === 'sitemap') {
  const urls=sitemapUrls(); const set=new Set(urls);
  if (set.size !== urls.length) errors.push('duplicate URL across child sitemaps');
  for (const row of indexable) if (!set.has(`${origin}${row.route}`)) errors.push(`${row.route}: indexable canonical missing from sitemaps`);
  for (const url of urls) {
    const route=new URL(url).pathname; const row=rows.find(item=>item.route===route);
    if (!row) errors.push(`${route}: sitemap URL has no local page`);
    else if (!row.indexable || row.canonical !== url) errors.push(`${route}: sitemap URL is noindex or non-canonical`);
  }
}

if (check === 'robots') {
  const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
  if (!/^User-agent:\s*\*/mi.test(robots)) errors.push('robots.txt missing wildcard user agent');
  if (!/^Allow:\s*\/$/mi.test(robots)) errors.push('robots.txt does not allow public crawl');
  if (!robots.includes('Sitemap: https://maxsite.com.ua/sitemap.xml')) errors.push('robots.txt missing sitemap index');
  if (/Disallow:\s*\/(?:assets|styles\.css|script\.js)/i.test(robots)) errors.push('robots.txt blocks render assets');
}

function walkSchema(value, visit) {
  if (!value || typeof value !== 'object') return;
  visit(value);
  if (Array.isArray(value)) value.forEach(item=>walkSchema(item,visit));
  else Object.values(value).forEach(item=>walkSchema(item,visit));
}
if (check === 'schema') {
  for (const row of indexable) {
    if (!row.schemas.length) errors.push(`${row.route}: no JSON-LD`);
    const presentTypes=new Set();
    for (const schema of row.schemas) walkSchema(schema,node=>{
      for (const type of [].concat(node['@type']||[])) presentTypes.add(type);
      if ('@type' in node && !node['@type']) errors.push(`${row.route}: schema node missing @type`);
      for (const [key,value] of Object.entries(node)) if (value === null || value === undefined) errors.push(`${row.route}: schema ${key} is null`);
      const types=[].concat(node['@type']||[]);
      if (types.includes('Article')) for (const field of ['headline','datePublished','dateModified','author','publisher','image','mainEntityOfPage']) if (!node[field]) errors.push(`${row.route}: Article missing ${field}`);
      if (types.includes('Service') && !node.name) errors.push(`${row.route}: Service missing name`);
      if (types.includes('FAQPage')) for (const question of node.mainEntity||[]) if (question.name && !text(row.main).includes(question.name)) errors.push(`${row.route}: schema FAQ is not visible: ${question.name}`);
      if (row.route.startsWith('/mista/') && row.route !== '/mista/' && types.includes('LocalBusiness')) errors.push(`${row.route}: city page must not claim LocalBusiness`);
      if ((types.includes('Review') || types.includes('AggregateRating')) && !text(row.main).match(/відгук|рейтинг/i)) errors.push(`${row.route}: rating schema lacks visible evidence`);
    });
    for (const required of ['Organization','WebSite','WebPage','BreadcrumbList']) if (!presentTypes.has(required)) errors.push(`${row.route}: schema graph missing ${required}`);
  }
}

if (check === 'links') {
  const inlinks=new Map(); const anchors=new Map();
  for (const row of rows) for (const href of row.links) {
    if (/^(?:https?:|mailto:|tel:|viber:|javascript:|#)/i.test(href)) continue;
    const target=targetFile(row.file,href);
    if (!fs.existsSync(target)) errors.push(`${row.route}: broken link ${href}`);
    else { const targetRoute=routeFromFile(target); inlinks.set(targetRoute,(inlinks.get(targetRoute)||0)+1); }
  }
  for (const row of indexable) {
    if (row.route !== '/' && !inlinks.get(row.route)) errors.push(`${row.route}: orphan page`);
    if (row.links.length > 150) warnings.push(`${row.route}: ${row.links.length} links; review navigation density`);
  }
}

if (check === 'content-quality') {
  const fakeLocation=/ми\s+(?:знаходимося|розташовані|маємо офіс)\s+(?:у|в)\s+(?:Києві|Львові|Одесі|Дніпрі|Харкові)/i;
  const cityData=JSON.parse(fs.readFileSync(path.join(root,'seo','cities.json'),'utf8'));
  for (const city of cityData) {
    if (!city.slug || !city.nominative || !city.locative || !city.preposition || !city.state) errors.push(`cities.json: incomplete record ${city.slug||'UNKNOWN'}`);
    if (city.state === 'published' && city.index !== true) errors.push(`cities.json: published city must be indexable: ${city.slug}`);
    if (city.relatedCitySlugs?.includes(city.slug)) errors.push(`cities.json: self related city ${city.slug}`);
    if (city.index) {
      const cityFile=path.join(root,'mista',`stvorennya-sajtiv-${city.slug}`,'index.html');
      if (!fs.existsSync(cityFile)) errors.push(`cities.json: indexable city has no route: ${city.slug}`);
      else {
        const cityHtml=fs.readFileSync(cityFile,'utf8');
        if ((cityHtml.match(/<details\b/gi)||[]).length < 3) errors.push(`city route has fewer than 3 visible FAQs: ${city.slug}`);
        if (!cityHtml.includes(`<title>${city.title}</title>`)) errors.push(`cities.json title mismatch: ${city.slug}`);
        if (!cityHtml.includes(`<h1>${city.h1}</h1>`)) errors.push(`cities.json H1 mismatch: ${city.slug}`);
      }
    }
  }
  for (const row of indexable) {
    const mainText=text(row.main);
    if (fakeLocation.test(mainText)) errors.push(`${row.route}: possible fake local-presence claim`);
    if (row.route.startsWith('/mista/') && row.route !== '/mista/') {
      if (!/case|кейс|proof|доказ/i.test(row.main)) errors.push(`${row.route}: city page lacks proof block`);
      if (!/ринок|галуз|бізнес|сценар/i.test(mainText)) errors.push(`${row.route}: city page lacks market context`);
    }
    for (const form of row.html.matchAll(/<form\b[\s\S]*?<\/form>/gi)) {
      const markup=form[0];
      if (!/name=["']consent["']/i.test(markup)) errors.push(`${row.route}: form missing consent`);
      for (const field of markup.matchAll(/<(?:input|textarea|select)\b[^>]*>/gi)) {
        const tag=field[0]; if (/type=["'](?:hidden|submit)["']/i.test(tag)) continue;
        if (!/aria-label=|id=["'][^"']+["']/i.test(tag)) errors.push(`${row.route}: form field lacks accessible name`);
      }
    }
    for (const image of row.html.matchAll(/<img\b[^>]*>/gi)) {
      const tag=image[0];
      if (!/\balt=["'][^"']*["']/i.test(tag)) errors.push(`${row.route}: image missing alt`);
      if (!(/\bwidth=["']?\d+/i.test(tag) && /\bheight=["']?\d+/i.test(tag))) warnings.push(`${row.route}: image relies on CSS ratio: ${tag.match(/src=["']([^"']+)/)?.[1]||'unknown'}`);
    }
  }
  const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
  for (const event of ['lead_form_start','lead_form_submit','lead_form_success','lead_form_error','click_phone','click_telegram','click_viber','click_email','pricing_cta_click','portfolio_open','case_live_site_click','city_service_click','scroll_75']) if (!script.includes(`"${event}"`)) errors.push(`script.js missing event ${event}`);
  if (!/honeypot/i.test(script)) errors.push('script.js missing honeypot handling');
  warnings.push('External lead endpoint rate limiting and server validation require production-owner verification.');
}

const output={check,generatedAt:new Date().toISOString(),pages:rows.length,indexable:indexable.length,errors,warnings};
const outDir=path.join(root,'artifacts','seo','checks'); fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,`${check}.json`),`${JSON.stringify(output,null,2)}\n`);
console.log(`${check}: ${rows.length} pages, ${errors.length} errors, ${warnings.length} warnings.`);
for (const warning of warnings.slice(0,20)) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exit(1);
