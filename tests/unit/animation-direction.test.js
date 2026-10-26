const{test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
test('emerging animation direction is scoped honestly and links to the verified own channel without embeds',()=>{
 const about=fs.readFileSync('pro-nas/index.html','utf8'),services=fs.readFileSync('poslugy/index.html','utf8');
 const block=about.match(/<section class="seo-band" id="animation-stories"[\s\S]*?<\/section>/)[0];
 for(const text of ['Новий творчий напрям','аніматика','не портфоліо завершених клієнтських мультфільмів','після оцінки задуму та пробного фрагмента','власний творчий канал'])assert.ok(block.includes(text),text);
 assert.match(block,/href="https:\/\/www.youtube.com\/@SmilePlanetCartoons" target="_blank" rel="noopener noreferrer"/);
 assert.match(block,/нова вкладка/);assert.doesNotMatch(block,/<(?:iframe|video|script)\b|\b3D\b|грн|гарантуємо/i);
 assert.match(services,/href="\/pro-nas\/#animation-stories"/);
 assert.ok(services.indexOf('data-animation-direction')>services.indexOf('id="seo-master-services"'));
 assert.equal((about.match(/<h1\b/g)||[]).length,1);
});
