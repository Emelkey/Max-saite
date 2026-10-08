const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
test('approved founder identity is visible and matches Person structured data',()=>{
  const html=fs.readFileSync(path.join(root,'zasnovnyk/index.html'),'utf8');
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  const person=graph.find(node=>node['@type']==='Person');
  assert.equal(person.name,'Максим Митрофаненко');
  assert.ok(html.includes('<strong>Максим Митрофаненко</strong>'));
  assert.equal(graph.find(node=>node['@type']==='AboutPage').about['@id'],person['@id']);
  assert.equal(graph.find(node=>node['@type']==='Organization').founder['@id'],person['@id']);
  assert.doesNotMatch(html,/внутрішньому реєстрі доказів/);
  const about=fs.readFileSync(path.join(root,'pro-nas/index.html'),'utf8');
  assert.ok(about.includes('href="/zasnovnyk/">Максим Митрофаненко'));
});
