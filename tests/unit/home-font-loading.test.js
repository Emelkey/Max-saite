const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');

test('home discovers its existing first-screen fonts before blocking resources',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const css=fs.readFileSync(path.join(root,'assets/maxsite-2/site.css'),'utf8');
  const consent=html.indexOf('<script src="/assets/consent.js');
  const google=html.indexOf('<script async src="https://www.googletagmanager.com');
  const firstStyle=html.indexOf('<link rel="stylesheet"');
  assert.ok(consent>0&&google>consent,'Consent guard must remain before Google tag.');
  for(const font of ['onest-cyrillic','cormorant-italic-cyrillic','cormorant-italic-latin']){
    const preload=`<link rel="preload" href="assets/fonts/${font}.woff2" as="font" type="font/woff2" crossorigin />`;
    const position=html.indexOf(preload);
    assert.ok(position>0&&position<consent&&position<firstStyle,`${font} must start before blocking resources`);
    assert.equal(html.split(preload).length-1,1,'Do not preload a font twice.');
    assert.ok(css.includes(`${font}.woff2`),'Preload an actual font used by the design.');
    assert.ok(fs.statSync(path.join(root,'assets/fonts',`${font}.woff2`)).size>0);
  }
});
