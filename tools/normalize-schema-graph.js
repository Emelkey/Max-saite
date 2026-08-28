#!/usr/bin/env node

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const excluded=new Set(['.git','.github','artifacts','docs','node_modules','release','tools']);
const entity=JSON.parse(fs.readFileSync(path.join(root,'seo','site-entity.json'),'utf8'));

function collect(directory) {
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    if (excluded.has(entry.name)) return [];
    const file=path.join(directory,entry.name);
    if (entry.isDirectory()) return collect(file);
    return entry.name.endsWith('.html')?[file]:[];
  });
}
const text=value=>value.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const getType=node=>[].concat(node?.['@type']||[]);
const flatten=value=>Array.isArray(value)?value.flatMap(flatten):value?.['@graph']?value['@graph'].flatMap(flatten):value&&typeof value==='object'?[value]:[];

let changed=0;
for (const file of collect(root)) {
  const source=fs.readFileSync(file,'utf8');
  const robots=source.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1]||'';
  if (/noindex/i.test(robots) || path.basename(file)==='404.html') continue;
  const canonical=source.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
  const title=text(source.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');
  const description=source.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]||'';
  if (!canonical || !title || !description) throw new Error(`Metadata required before schema normalization: ${path.relative(root,file)}`);

  const scripts=[...source.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const nodes=[];
  for (const script of scripts) nodes.push(...flatten(JSON.parse(script[1])));
  const has=type=>nodes.some(node=>getType(node).includes(type));
  if (!has('Organization')) nodes.unshift(entity.organization);
  if (!has('WebSite')) nodes.splice(1,0,{...entity.website,inLanguage:'uk-UA'});
  if (!has('WebPage')) nodes.splice(2,0,{
    '@type':'WebPage',
    '@id':`${canonical}#webpage`,
    url:canonical,
    name:title,
    description,
    inLanguage:'uk-UA',
    isPartOf:{'@id':'https://maxsite.com.ua/#website'}
  });
  if (!has('BreadcrumbList')) throw new Error(`BreadcrumbList required: ${path.relative(root,file)}`);

  const graph=`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':nodes})}</script>`;
  let index=0;
  const next=source.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,()=>index++===0?graph:'');
  if (next!==source) { fs.writeFileSync(file,next); changed+=1; }
}
console.log(`Normalized schema graph on ${changed} indexable HTML files.`);
