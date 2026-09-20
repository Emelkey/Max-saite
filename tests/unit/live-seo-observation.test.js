const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inspectHtml,googleHeaderNoindex,evaluateObservation,summarize}=require('../../tools/lib/live-seo-observation');
const origin='https://maxsite.com.ua';
const route='/stvorennya-saytiv/';
const good=`<html><head><title>Розробка сайтів</title><link href="${origin}${route}" REL="canonical"><meta content="index,follow" name="robots"></head><body><h1>Створення сайтів</h1></body></html>`;
const observation=()=>({route,chain:[{url:origin+route,status:200}],...inspectHtml(good),contentType:'text/html; charset=utf-8',xRobotsTag:''});
const evaluate=row=>evaluateObservation(row,{origin,expectedCanonical:origin+route});

test('live HTML pass is not presented as Google indexing, robots policy or deployment proof',()=>{
 const row=evaluate(observation());
 assert.equal(row.htmlHttpPass,true);
 assert.equal(row.googleIndexStatus,'NOT_CHECKED');
 assert.equal(row.robotsTxtPolicyStatus,'NOT_EVALUATED');
 assert.equal(summarize([row],new Set([route])).ok,true);
});
test('metadata parsing accepts attribute order, case and quoted/unquoted values',()=>{
 const html=`<HEAD><TITLE>Title</TITLE><LINK HREF='${origin}${route}' REL=canonical><META CONTENT='noindex,follow' NAME=Googlebot></HEAD><h1>Title</h1>`;
 const r=inspectHtml(html);assert.deepEqual(r.canonicals,[origin+route]);assert.equal(r.metaNoindex,true);assert.equal(r.h1Count,1);
});
test('noindex and none directives are blocking but nosnippet is not',()=>{
 for(const content of ['noindex','none','INDEX, NOINDEX'])assert.equal(inspectHtml(good.replace('index,follow',content)).metaNoindex,true);
 assert.equal(inspectHtml(good.replace('index,follow','nosnippet')).metaNoindex,false);
});
test('Google-specific X-Robots-Tag is honoured without confusing another bot',()=>{
 assert.equal(googleHeaderNoindex('noindex'),true);
 assert.equal(googleHeaderNoindex('googlebot: noindex, nofollow'),true);
 assert.equal(googleHeaderNoindex('otherbot: noindex'),false);
 assert.equal(googleHeaderNoindex('otherbot: noindex, googlebot: index'),false);
 assert.equal(googleHeaderNoindex('otherbot: index, googlebot: none'),true);
 assert.equal(evaluate({...observation(),xRobotsTag:'googlebot: noindex'}).htmlHttpPass,false);
});
test('duplicate and wrong canonical declarations cannot pass',()=>{
 assert.ok(evaluate({...observation(),canonicals:[origin+route,origin+route]}).issues.includes('CANONICAL_MISMATCH'));
 assert.ok(evaluate({...observation(),canonicals:[origin+'/']}).issues.includes('CANONICAL_MISMATCH'));
});
test('404, soft 404 without title and redirecting canonical routes cannot pass',()=>{
 assert.ok(evaluate({...observation(),chain:[{url:origin+route,status:404}]}).issues.includes('HTTP_NOT_200'));
 assert.ok(evaluate({...observation(),title:null}).issues.includes('MISSING_TITLE'));
 assert.ok(evaluate({...observation(),chain:[{url:origin+route,status:301},{url:origin+route,status:200}]}).issues.includes('CANONICAL_ROUTE_REDIRECTS'));
});
test('wrong media types and missing H1 are reported',()=>{
 assert.ok(evaluate({...observation(),contentType:'application/json'}).issues.includes('NOT_HTML'));
 assert.ok(evaluate({...observation(),h1Count:0}).issues.includes('H1_COUNT'));
});
test('a fetch failure or missing expected route does not produce a green summary',()=>{
 const goodRow=evaluate(observation());
 assert.equal(summarize([goodRow],new Set([route,'/mista/'])).ok,false);
 assert.equal(summarize([goodRow,{route:'/robots.txt',error:'timeout'}],new Set([route])).ok,false);
 assert.equal(summarize([evaluate({route,chain:[],error:'timeout'})],new Set([route])).htmlHttpFailed,1);
});
test('script fragments are not counted as actual headings',()=>{
 assert.equal(inspectHtml(good.replace('</body>',`<script>const sample='<h1>Not real</h1>';</script></body>`)).h1Count,1);
});
test('read-only live command is explicit about pre-release scope and fails validation errors',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../../tools/verify-live-seo.js'),'utf8');
 assert.match(code,/method:'GET'/);assert.match(code,/if\(!summary.ok\)process.exitCode=1/);
 assert.match(code,/Pre-release evidence is NOT verification of unpublished changes/);
 assert.doesNotMatch(code,/method:\s*['"]POST['"]/i);
});
test('home dashboard is illustrative and does not invent numerical SEO gains',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');
 const dashboard=html.match(/<div class="dashboard reveal"[\s\S]*?<\/section>/)?.[0]||'';
 assert.ok(dashboard.includes('Умовна ілюстрація, не показники клієнтського проєкту.'));
 assert.doesNotMatch(dashboard,/[+]\s*\d+(?:[.,]\d+)?\s*%/);
 assert.ok(dashboard.includes('class="chart" aria-hidden="true"'));
});
