const assert=require("node:assert/strict"); const fs=require("node:fs"); const path=require("node:path"); const os=require("node:os"); const test=require("node:test");
const {auditResponsiveImages,dimensions,isExplicitlyDecorative,parseSrcset}=require("../../tools/audit-responsive-images.js"); const root=path.resolve(__dirname,"../..");
test("srcset parser requires numeric width descriptors",()=>{ assert.deepEqual(parseSrcset("one.webp 480w, two.webp 768w"),[{reference:"one.webp",width:480},{reference:"two.webp",width:768}]); assert.equal(parseSrcset("one.webp 2x")[0].width,null); });
test("empty alt needs an explicit decorative context",()=>{ const plain='<div><img src="x.svg" alt=""></div>'; assert.equal(isExplicitlyDecorative(plain,plain.indexOf("<img"),'<img src="x.svg" alt="">'),false); const hidden='<div aria-hidden="true"><img src="x.svg" alt=""></div>'; assert.equal(isExplicitlyDecorative(hidden,hidden.indexOf("<img"),'<img src="x.svg" alt="">'),true); assert.equal(isExplicitlyDecorative(plain,plain.indexOf("<img"),'<img src="x.svg" alt="" role="presentation">'),true); });
test("dimension reader verifies generated WebP and AVIF pixels",()=>{ const manifest=JSON.parse(fs.readFileSync(path.join(root,"assets/responsive/manifest.json"),"utf8")); const row=manifest.find((item)=>item.candidates.includes(480)); const stem=row.source.replace(/^assets\//,"").replace(/\.[^.]+$/,""); for (const ext of ["webp","avif"]) assert.equal(dimensions(path.join(root,`assets/responsive/${stem}-480.${ext}`)).width,480); });

function responsiveFixture(t) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),"maxsite-image-audit-"));
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  const row=JSON.parse(fs.readFileSync(path.join(root,"assets/responsive/manifest.json"),"utf8"))[0];
  const manifestFile=path.join(directory,"assets/responsive/manifest.json");
  for(const relative of [row.source,...Object.keys(row.variantSha256)]) {
    const destination=path.join(directory,relative);
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.copyFileSync(path.join(root,relative),destination);
  }
  fs.writeFileSync(manifestFile,JSON.stringify([row]));
  const stem=row.source.replace(/^assets\//,"").replace(/\.[^.]+$/,"");
  const srcset=ext=>row.candidates.map(width=>`/assets/responsive/${stem}-${width}.${ext} ${width}w`).join(", ");
  fs.writeFileSync(path.join(directory,"index.html"),`<picture><source type="image/avif" srcset="${srcset("avif")}"><source type="image/webp" srcset="${srcset("webp")}"><img src="/${row.source}" srcset="${srcset("webp")}" alt="Fixture image" width="${row.width}" height="${row.height}" sizes="100vw" data-responsive="true" loading="lazy"></picture>`);
  return {directory,row,manifestFile,audit:()=>auditResponsiveImages(directory,{writeOutput:false})};
}

test("content hashes survive fresh-checkout timestamp ordering",t=>{
  const fixture=responsiveFixture(t), earlier=new Date("2020-01-01"), later=new Date("2026-01-01");
  fs.utimesSync(fixture.manifestFile,earlier,earlier);
  for(const variant of Object.keys(fixture.row.variantSha256)) fs.utimesSync(path.join(fixture.directory,variant),earlier,earlier);
  fs.utimesSync(path.join(fixture.directory,fixture.row.source),later,later);
  assert.deepEqual(fixture.audit().errors,[]);
});

test("changed source bytes fail even when dimensions and timestamp are preserved",t=>{
  const fixture=responsiveFixture(t), source=path.join(fixture.directory,fixture.row.source), original=fs.statSync(source);
  fs.appendFileSync(source,Buffer.from([0]));
  fs.utimesSync(source,original.atime,original.mtime);
  assert.ok(fixture.audit().errors.some(error=>error.includes(`content hash differs for ${fixture.row.source}`)));
});

test("changed derivative bytes fail independently of its dimensions",t=>{
  const fixture=responsiveFixture(t), variant=Object.keys(fixture.row.variantSha256)[0];
  fs.appendFileSync(path.join(fixture.directory,variant),Buffer.from([0]));
  assert.ok(fixture.audit().errors.some(error=>error.includes(`content hash differs for ${variant}`)));
});

test("missing hashes and stale hash entries fail manifest validation",t=>{
  const fixture=responsiveFixture(t), variant=Object.keys(fixture.row.variantSha256)[0];
  delete fixture.row.sourceSha256;
  delete fixture.row.variantSha256[variant];
  fixture.row.variantSha256["assets/responsive/orphan-480.webp"]="a".repeat(64);
  fs.writeFileSync(fixture.manifestFile,JSON.stringify([fixture.row]));
  const errors=fixture.audit().errors;
  assert.ok(errors.some(error=>error.includes(`missing or invalid SHA-256 for ${fixture.row.source}`)));
  assert.ok(errors.some(error=>error.includes(`missing or invalid SHA-256 for ${variant}`)));
  assert.ok(errors.some(error=>error.includes("unexpected candidate hash")));
});
