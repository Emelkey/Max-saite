#!/usr/bin/env node

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const ignored=new Set(['.git','node_modules','release','artifacts']);
const cache=new Map();

function collect(directory) {
  const out=[];
  for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    if (ignored.has(entry.name)) continue;
    const file=path.join(directory,entry.name);
    if (entry.isDirectory()) out.push(...collect(file));
    else if (entry.name.endsWith('.html')) out.push(file);
  }
  return out;
}

function assetPath(htmlFile,src) {
  if (/^(?:https?:|data:)/i.test(src)) return null;
  const clean=src.replace(/[?#].*$/,'');
  return clean.startsWith('/') ? path.join(root,clean.replace(/^\/+/,'')) : path.resolve(path.dirname(htmlFile),clean);
}

function dimensions(file) {
  if (cache.has(file)) return cache.get(file);
  if (!fs.existsSync(file)) return null;
  let result=null;
  if (file.endsWith('.svg')) {
    const svg=fs.readFileSync(file,'utf8').slice(0,1000);
    const width=Number(svg.match(/<svg\b[^>]*\bwidth=["']([\d.]+)/i)?.[1]);
    const height=Number(svg.match(/<svg\b[^>]*\bheight=["']([\d.]+)/i)?.[1]);
    const viewBox=svg.match(/\bviewBox=["'][^"']*?([\d.]+)\s+([\d.]+)["']/i);
    result=width&&height?[Math.round(width),Math.round(height)]:viewBox?[Math.round(Number(viewBox[1])),Math.round(Number(viewBox[2]))]:null;
  } else {
    try {
      const output=execFileSync('/usr/bin/sips',['-g','pixelWidth','-g','pixelHeight',file],{encoding:'utf8'});
      const width=Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]);
      const height=Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]);
      if (width&&height) result=[width,height];
    } catch {}
  }
  cache.set(file,result);
  return result;
}

let changed=0;
for (const htmlFile of collect(root)) {
  let html=fs.readFileSync(htmlFile,'utf8');
  const updated=html.replace(/<img\b[^>]*>/gi,tag=>{
    if (/\bwidth=["']?\d+/i.test(tag)&&/\bheight=["']?\d+/i.test(tag)) return tag;
    const src=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const file=src&&assetPath(htmlFile,src);
    const size=file&&dimensions(file);
    if (!size) return tag;
    changed+=1;
    return tag.replace(/<img\b/i,`<img width="${size[0]}" height="${size[1]}"`);
  });
  if (updated!==html) fs.writeFileSync(htmlFile,updated);
}
console.log(`Added intrinsic dimensions to ${changed} image elements.`);
