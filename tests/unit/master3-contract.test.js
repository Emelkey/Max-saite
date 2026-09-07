const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'../..');
const {buildGraph}=require('../../tools/lib/schema-graph');
const {editorialBody}=require('../../tools/lib/editorial-body');

test('release audit counts case content but not breadcrumbs or lead forms',()=>{
  const html='<header>HEADER</header><main><nav>BREADCRUMBS</nav><section><h1>CASE</h1><p>Evidence</p></section><section class="seo-lead reveal">FORM</section></main><footer>FOOTER</footer>';
  const body=editorialBody(html,'/portfolio/example/');
  assert.match(body,/Evidence/);
  assert.doesNotMatch(body,/HEADER|BREADCRUMBS|FORM|FOOTER/);
  assert.equal(editorialBody(html,'/blog/example/'),'');
  assert.equal(editorialBody('<article class="article-body">BLOG</article>', '/blog/example/'),'BLOG');
});

test('schema builder uses canonical entities and visible FAQ answers',()=>{
  const graph=buildGraph({nodes:[{'@type':'Service',name:'Test'}],canonical:'https://maxsite.com.ua/test/',title:'Test',description:'Test description',main:'<details><summary>Visible?</summary><p>Exactly this answer.</p></details>'})['@graph'];
  assert.equal(graph.find(node=>node['@type']==='Service').provider['@id'],'https://maxsite.com.ua/#organization');
  assert.equal(graph.find(node=>node['@type']==='FAQPage').mainEntity[0].acceptedAnswer.text,'Exactly this answer.');
  assert.equal(graph.filter(node=>node['@type']==='Organization').length,1);
});

test('expanded niche pages have specific copy, usable FAQ and no placeholder evidence',()=>{
  const data=require('../../seo/niche-content.json');
  for (const [slug,entry] of Object.entries(data)) {
    const html=fs.readFileSync(path.join(root,'nishi',slug,'index.html'),'utf8');
    const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    assert.ok(main.replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length>=500,slug);
    assert.equal(entry.faq.length,5);
    assert.equal(new Set(entry.faq.map(row=>row[0])).size,5);
    assert.match(main,/Self-case|self-case/);
    assert.doesNotMatch(main,/Окремий блок або сторінка|\{\{|undefined/);
  }
});

test('preview robots replace conflicting index directive',()=>{
  const source=fs.readFileSync(path.join(root,'tools/build-hosting-package.js'),'utf8');
  const fn=source.match(/const addNoindex = \(html\) => \{([\s\S]*?)\n\};/)[1];
  const result=vm.runInNewContext(`(html=>{${fn}})('<head><meta name="robots" content="index, follow"></head>')`);
  assert.equal((result.match(/name="robots"/g)||[]).length,1);
  assert.match(result,/noindex, nofollow/);
  assert.doesNotMatch(result,/content="index/);
});

test('budget estimator matches published tariffs and explicitly excludes integration pricing',()=>{
  const source=fs.readFileSync(path.join(root,'assets/project-tools.js'),'utf8');
  assert.match(source,/landing:10500,business:19700,seo:29000,store:34300/);
  assert.match(source,/Окрема оцінка/);
  assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
});

test('city similarity includes every published record and refuses empty extraction',()=>{
  const source=fs.readFileSync(path.join(root,'tools/check-city-similarity.js'),'utf8');
  assert.match(source,/city\.index && city\.state === "published"/);
  assert.doesNotMatch(source,/priority === 1/);
  assert.match(source,/Substantive city extraction too short/);
});
