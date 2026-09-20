const {test}=require('node:test');
const assert=require('node:assert/strict');
const {summarize}=require('../../tools/lib/live-seo-observation');
test('an empty expected sitemap cannot produce a passing site audit',()=>{
  assert.equal(summarize([],new Set()).ok,false);
});
