#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const map=require('../seo/niche-scenarios.json');
let changed=0;
for(const p of map.pages){
 if(!/^\/nishi\/sajt-dlya-[a-z0-9-]+\/$/.test(p.url))throw Error(`Invalid niche route ${p.url}`);
 const file=path.join(root,p.url,'index.html'),html=fs.readFileSync(file,'utf8');
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
 const nav=main?.[1].match(/<nav\b[^>]*class="[^"]*breadcrumbs[^>]*>[\s\S]*?<\/nav>/)?.[0]||'';
 const oldHero=main?.[1].match(/<section\b[^>]*class="[^"]*seo-hero[^>]*>[\s\S]*?<\/section>/)?.[0];
 const lead=main?.[1].match(/<section\b[^>]*class="[^"]*seo-lead[^>]*>[\s\S]*?<\/section>/)?.[0];
 if(!oldHero||!lead)throw Error(`Missing preserved hero/form: ${p.url}`);
 const h1=oldHero.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0];
 if(!h1)throw Error(`Missing preserved H1 ${p.url}`);
 const hero=`<section class="seo-hero niche-scenario-hero"><div><span class="eyebrow">Рішення для вашого бізнесу</span>${h1}<p>${escape(p.heroSummary)}</p><div class="hero-buttons"><a class="btn" href="#lead">Обговорити структуру</a><a class="btn btn-ghost" href="/kalkulyator-vartosti-saytu/">Оцінити базовий формат</a></div></div><aside class="seo-hero-card"><strong>Що погодимо в брифі</strong><p>${escape(p.heroBrief)}</p></aside></section>`;
 for(const l of p.links)if(!fs.existsSync(path.join(root,l.url,'index.html')))throw Error(`Missing target ${l.url}`);
 const body=`${nav}\n${hero}\n<div class="seo-content"><p data-editorial-review="${escape(p.reviewedAt)}">Сценарій і зміст перевірено <time datetime="${escape(p.reviewedAt)}">12 вересня 2026</time>. <a href="/zasnovnyk/#editorial-policy">Редакція MAX SITE</a>.</p><section class="seo-band"><h2>${escape(p.heading)}</h2><p>${escape(p.intro)}</p></section>${p.sections.map(s=>`<section class="seo-band"><h2>${escape(s.heading)}</h2><p>${escape(s.text)}</p></section>`).join('')}<section class="seo-band"><h2>Питання до проєктування</h2><div class="faq-list">${p.faq.map(f=>`<details><summary>${escape(f.question)}</summary><p>${escape(f.answer)}</p></details>`).join('')}</div></section><section class="seo-band"><h2>Підготуйте наступний крок</h2><p>Це сценарій майбутнього проєкту, а не опис виконаного замовлення. Формат, строк і точний склад робіт погоджуємо за вашим брифом. Орієнтир бюджету можна розрахувати в калькуляторі, а інтеграції оцінюємо окремо.</p><ul>${p.links.map(l=>`<li><a href="${escape(l.url)}">${escape(l.label)}</a></li>`).join('')}</ul></section>${lead}</div>`;
 const next=html.replace(/(<main\b[^>]*>)[\s\S]*?(<\/main>)/i,`$1\n${body}\n$2`);
 if(next!==html){changed++;if(!process.argv.includes('--check'))fs.writeFileSync(file,next);}
}
console.log(`Niche scenarios: ${map.pages.length} curated pages, ${changed} ${process.argv.includes('--check')?'stale':'updated'}.`);
if(process.argv.includes('--check')&&changed)process.exitCode=1;
