#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const DEFAULT_ROOT = path.resolve(__dirname, "..");
const ignored = new Set([".git", ".github", "node_modules", "release", "artifacts", "docs", "tools", "tests", "seo"]);

function dimensions(file) {
  const b = fs.readFileSync(file);
  if (b.length >= 24 && b.subarray(1, 4).toString() === "PNG") return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length >= 12 && b.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))) {
    let p = 2; const sof = new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
    while (p + 8 < b.length) { while (p < b.length && b[p] !== 0xff) p++; while (p < b.length && b[p] === 0xff) p++; const marker = b[p++]; if (sof.has(marker)) return { width: b.readUInt16BE(p + 5), height: b.readUInt16BE(p + 3) }; if (p + 2 > b.length) break; const length = b.readUInt16BE(p); if (length < 2) break; p += length; }
  }
  if (b.length >= 30 && b.subarray(0,4).toString() === "RIFF" && b.subarray(8,12).toString() === "WEBP") {
    const type = b.subarray(12,16).toString();
    if (type === "VP8X") return { width: 1 + b.readUIntLE(24,3), height: 1 + b.readUIntLE(27,3) };
    if (type === "VP8L") { const p = 21; return { width: 1 + (b[p] | ((b[p+1] & 0x3f) << 8)), height: 1 + ((b[p+1] >> 6) | (b[p+2] << 2) | ((b[p+3] & 0x0f) << 10)) }; }
    if (type === "VP8 " && b.subarray(23,26).equals(Buffer.from([0x9d,0x01,0x2a]))) return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  for (let p = b.indexOf(Buffer.from("ispe")); p >= 4; p = b.indexOf(Buffer.from("ispe"), p + 4)) { const size = b.readUInt32BE(p - 4); if (size >= 20 && p + 16 <= b.length) { const width = b.readUInt32BE(p+8), height = b.readUInt32BE(p+12); if (width && height) return { width, height }; } }
  throw new Error("unsupported or corrupt raster format");
}
function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function verifyHash(file, expected, label, errors) {
  if (!/^[a-f0-9]{64}$/.test(expected || "")) errors.push(`manifest: missing or invalid SHA-256 for ${label}`);
  else if (sha256(file) !== expected) errors.push(`manifest: content hash differs for ${label}; regenerate responsive images from the current source`);
}
function parseSrcset(value) { return value.split(",").map((x) => x.trim()).filter(Boolean).map((part) => { const m = part.match(/^(\S+)\s+(\d+)w$/); return m ? { reference:m[1], width:Number(m[2]) } : { reference:part, width:null }; }); }
function attribute(tag, name) { return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1]; }
function localPath(root, htmlFile, reference) { const clean = reference.replace(/[?#].*$/, ""); if (/^(?:https?:|data:)/i.test(clean)) return null; const result = clean.startsWith("/") ? path.join(root, clean.replace(/^\/+/, "")) : path.resolve(path.dirname(htmlFile), clean); const rel = path.relative(root,result); return rel.startsWith("..") || path.isAbsolute(rel) ? undefined : result; }
function isExplicitlyDecorative(html, imageIndex, tag) {
  const marker=/\b(?:aria-hidden=["']true["']|role=["'](?:presentation|none)["']|data-decorative=["']true["'])/i;
  if (marker.test(tag)) return true;
  const stack=[];
  for (const match of html.slice(0,imageIndex).matchAll(/<\/?(picture|div|figure|span)\b[^>]*>/gi)) {
    const name=match[1].toLowerCase();
    if (match[0][1]==="/") { for (let i=stack.length-1;i>=0;i--) if (stack[i].name===name) { stack.splice(i,1); break; } }
    else stack.push({name,tag:match[0]});
  }
  return stack.some((entry)=>marker.test(entry.tag));
}

function auditResponsiveImages(root = DEFAULT_ROOT, options = {}) {
  const errors = []; const observations = { htmlFiles:0,imageElements:0,vectorImages:0,rasterImages:0,intentionalEmptyAlt:0,srcsetCandidates:0,manifestSources:0 };
  const manifestFile = path.join(root,"assets/responsive/manifest.json"); let manifest = [];
  try { manifest = JSON.parse(fs.readFileSync(manifestFile,"utf8")); } catch (e) { errors.push(`assets/responsive/manifest.json: ${e.message}`); }
  if (!Array.isArray(manifest)) { errors.push("assets/responsive/manifest.json: root must be an array"); manifest=[]; }
  observations.manifestSources=manifest.length; const rows=new Map(), expectedVariants=new Set(), referencedSources=new Set();
  for (const row of manifest) {
    const source=String(row.source||"").replaceAll("\\","/"); if (!source || rows.has(source)) { errors.push(`manifest: missing or duplicate source: ${source||"(empty)"}`); continue; } rows.set(source,row);
    const sourceFile=path.join(root,source); if (!fs.existsSync(sourceFile)) { errors.push(`manifest: source missing: ${source}`); continue; }
    try { const actual=dimensions(sourceFile); if (actual.width!==row.width || actual.height!==row.height) errors.push(`manifest: dimensions differ for ${source}: declared ${row.width}x${row.height}, actual ${actual.width}x${actual.height}`); } catch(e) { errors.push(`manifest: cannot read ${source}: ${e.message}`); }
    const candidates=Array.isArray(row.candidates)?row.candidates:[]; if (!candidates.length || candidates.some((w)=>!Number.isInteger(w)||w<=0) || new Set(candidates).size!==candidates.length || candidates.some((w,i)=>i&&w<=candidates[i-1]) || candidates.at(-1)!==row.width) errors.push(`manifest: invalid candidates for ${source}`);
    verifyHash(sourceFile,row.sourceSha256,source,errors);
    const stem=source.replace(/^assets\//,"").replace(/\.[^.]+$/,"");
    const rowVariants=new Set();
    for (const width of candidates) for (const ext of ["avif","webp"]) { const variant=`assets/responsive/${stem}-${width}.${ext}`; expectedVariants.add(variant); rowVariants.add(variant); const vf=path.join(root,variant); if (!fs.existsSync(vf)) errors.push(`manifest: candidate file missing: ${variant}`); else { try { const actual=dimensions(vf); if (actual.width!==width) errors.push(`manifest: candidate width differs for ${variant}: descriptor ${width}w, actual ${actual.width}px`); } catch(e) { errors.push(`manifest: cannot read ${variant}: ${e.message}`); } verifyHash(vf,row.variantSha256?.[variant],variant,errors); } }
    for (const variant of Object.keys(row.variantSha256||{})) if (!rowVariants.has(variant)) errors.push(`manifest: unexpected candidate hash for ${source}: ${variant}`);
  }
  function auditCandidate(file,route,c) { observations.srcsetCandidates++; if (!c.width) { errors.push(`${route}: invalid srcset candidate: ${c.reference}`); return; } const local=localPath(root,file,c.reference); if (local===null) return; if (local===undefined) { errors.push(`${route}: srcset candidate escapes site root: ${c.reference}`); return; } if (!fs.existsSync(local)) { errors.push(`${route}: srcset candidate missing: ${c.reference}`); return; } try { const actual=dimensions(local); if (actual.width!==c.width) errors.push(`${route}: srcset width differs for ${c.reference}: descriptor ${c.width}w, actual ${actual.width}px`); } catch(e) { errors.push(`${route}: cannot read srcset candidate ${c.reference}: ${e.message}`); } }
  function audit(file) {
    observations.htmlFiles++; const html=fs.readFileSync(file,"utf8"), route=path.relative(root,file).replaceAll(path.sep,"/");
    for (const match of html.matchAll(/<img\b[^>]*>/gi)) { const tag=match[0], src=attribute(tag,"src")||"", alt=attribute(tag,"alt"); observations.imageElements++;
      if (alt===undefined) errors.push(`${route}: image missing alt: ${src}`); else if (!alt) { observations.intentionalEmptyAlt++; if (!isExplicitlyDecorative(html,match.index,tag)) errors.push(`${route}: empty alt lacks explicit decorative or aria-hidden context: ${src}`); }
      if (!(/\bwidth=["']?\d+/i.test(tag)&&/\bheight=["']?\d+/i.test(tag))) errors.push(`${route}: image missing intrinsic dimensions: ${src}`);
      if (/\.svg(?:[?#]|$)/i.test(src)) { observations.vectorImages++; continue; } observations.rasterImages++;
      const sourceLocal=localPath(root,file,src); if (sourceLocal&&fs.existsSync(sourceLocal)) referencedSources.add(path.relative(root,sourceLocal).replaceAll(path.sep,"/")); else errors.push(`${route}: source image missing or outside root: ${src}`);
      const imgSrcset=attribute(tag,"srcset"); if (!imgSrcset) errors.push(`${route}: raster image missing width srcset: ${src}`); else parseSrcset(imgSrcset).forEach((c)=>auditCandidate(file,route,c));
      if (!attribute(tag,"sizes")) errors.push(`${route}: raster image missing sizes: ${src}`); if (!/\bdata-responsive=["']true/i.test(tag)) errors.push(`${route}: raster image is not marked responsive: ${src}`);
      const ps=html.lastIndexOf("<picture",match.index), pe=html.indexOf("</picture>",match.index), picture=ps>=0&&pe>=0?html.slice(ps,pe+10):"";
      for (const format of ["avif","webp"]) { const sourceTag=[...picture.matchAll(/<source\b[^>]*>/gi)].find((m)=>attribute(m[0],"type")===`image/${format}`)?.[0], srcset=sourceTag&&attribute(sourceTag,"srcset"); if (!srcset) errors.push(`${route}: raster image missing ${format.toUpperCase()} picture source: ${src}`); else parseSrcset(srcset).forEach((c)=>auditCandidate(file,route,c)); }
      if (/fetchpriority=["']high/i.test(tag)&&/loading=["']lazy/i.test(tag)) errors.push(`${route}: LCP image is lazy-loaded: ${src}`); if (!/fetchpriority=["']high/i.test(tag)&&!/loading=["']lazy/i.test(tag)) errors.push(`${route}: non-LCP raster image is not lazy-loaded: ${src}`);
    }
  }
  function collect(dir) { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { if (ignored.has(entry.name)) continue; const file=path.join(dir,entry.name); if (entry.isDirectory()) collect(file); else if (entry.name.endsWith(".html")) audit(file); } } collect(root);
  for (const source of referencedSources) if (!rows.has(source)) errors.push(`manifest: referenced raster source is not covered: ${source}`); for (const source of rows.keys()) if (!referencedSources.has(source)) errors.push(`manifest: stale unreferenced source entry: ${source}`);
  const responsiveRoot=path.join(root,"assets/responsive"); if (fs.existsSync(responsiveRoot)) { const walk=(dir)=>{ for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { const file=path.join(dir,entry.name); if (entry.isDirectory()) walk(file); else if (entry.name!=="manifest.json") { const rel=path.relative(root,file).replaceAll(path.sep,"/"); if (!expectedVariants.has(rel)) errors.push(`manifest: orphan candidate file: ${rel}`); } } }; walk(responsiveRoot); }
  const result={generatedAt:new Date().toISOString(),observations,errors}; if (options.writeOutput!==false) { const output=path.join(root,"artifacts/seo/responsive-images.json"); fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,`${JSON.stringify(result,null,2)}\n`); } return result;
}
if (require.main===module) { const result=auditResponsiveImages(); console.log(`Responsive image audit: ${result.observations.rasterImages} raster + ${result.observations.vectorImages} SVG occurrences; ${result.observations.srcsetCandidates} candidates; ${result.errors.length} errors.`); for (const error of result.errors) console.error(`ERROR ${error}`); if (result.errors.length) process.exit(1); }
module.exports={auditResponsiveImages,dimensions,isExplicitlyDecorative,parseSrcset};
