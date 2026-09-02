const test=require('node:test');
const assert=require('node:assert/strict');
const {normalize,ngrams}=require('../../tools/lib/city-similarity');
test('similarity extraction cannot swallow preceding sibling content',()=>{
  const html='<header>navigation</header><main><section><h2>Unique Kyiv procurement story</h2></section><section><span class="eyebrow">Вартість</span>Common price</section><section>Proof remains visible here always</section></main><footer>footer</footer>';
  const text=normalize(html);
  assert.match(text,/unique kyiv procurement story/);
  assert.match(text,/proof remains/);
  assert.doesNotMatch(text,/common price|navigation|footer/);
});
test('explicit city-specific sections survive pricing words and nested sections',()=>{
  const html='<main><section data-seo-city-specific="true"><span class="eyebrow">Вартість</span><section>Unique inner example</section>City terms</section><section data-seo-shared="process">Shared process</section></main>';
  assert.match(normalize(html),/unique inner example city terms/);
  assert.doesNotMatch(normalize(html),/shared process/);
});
test('five-word windows preserve sequence and do not manufacture short matches',()=>{
  assert.equal(ngrams('one two three four').size,0);
  assert.deepEqual([...ngrams('one two three four five six')],['one two three four five','two three four five six']);
});
