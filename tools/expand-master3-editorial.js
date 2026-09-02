const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname,'..');
const content = require('../seo/editorial-expansions.json');
const esc = value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
for (const [slug,data] of Object.entries(content)) {
  const file = path.join(root,'blog',slug,'index.html');
  let html = fs.readFileSync(file,'utf8');
  const block = '<div data-master3-editorial>'+data.sections.map(s=>`<section class="seo-band"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')+`<section class="seo-band"><h2>Застосувати до свого проєкту</h2><p>${data.links.map(([url,label])=>`<a href="${url}">${esc(label)}</a>`).join(' · ')}</p><h3>Джерела й межі висновків</h3><ul>${data.sources.map(([url,label])=>`<li><a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></li>`).join('')}</ul><p>Сценарії та послідовності перевірки — редакційна практика MAX SITE, не гарантія результату. Джерела перевірено 02.09.2026. Наступний плановий перегляд — березень 2027 або раніше, якщо зміняться вимоги платформ.</p><p><a href="/pro-nas/">Редакція MAX SITE</a> · Оновлено <time datetime="2026-09-02">2 вересня 2026</time>.</p></section></div>`;
  // Replace only our bounded wrapper on subsequent runs; keep existing article/FAQ and form.
  const marker = /<div data-master3-editorial>[\s\S]*?<\/section><\/div>/;
  html = marker.test(html) ? html.replace(marker,block) : html.replace(/<section class="seo-lead/,block+'<section class="seo-lead');
  html = html.replace(/оновлено \d{2}\.\d{2}\.\d{4}/g,'оновлено 02.09.2026');
  html = html.replace(/"dateModified":"[^"]+"/g,'"dateModified":"2026-09-02"');
  fs.writeFileSync(file,html);
}
