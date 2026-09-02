const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
for (const slug of ['formula-chystoty','fo-dez','max-site']) {
  const file = path.join(root,'portfolio',slug,'index.html');
  let html = fs.readFileSync(file,'utf8');
  const stamp = '<p class="case-evidence-note" data-case-editorial-date><a href="/pro-nas/">Редакція MAX SITE</a> · Опис перевірено <time datetime="2026-09-02">2 вересня 2026</time>. Це дата перевірки кейсу, не дата запуску клієнтського сайту.</p>';
  if (!html.includes('data-case-editorial-date')) html = html.replace('<div class="seo-content">', '<div class="seo-content">'+stamp);
  html = html.replace('Велика частка мобільних користувачів','Необхідність зручного звернення з телефона');
  if (slug === 'fo-dez' && !html.includes('data-live-verification')) {
    html = html.replace(stamp,stamp+'<p class="case-evidence-note" data-live-verification>Публічну версію <a href="https://www.fodez.com.ua/" target="_blank" rel="noopener noreferrer">FO-DEZ</a> перевірено 02.09.2026: сайт представляє клінінгові послуги у Білій Церкві. Наведені нижче знімки показують зафіксовану раніше реалізацію; актуальний зміст і географія можуть відрізнятися. Бізнес-метрики цим переглядом не підтверджуються.</p>');
  }
  if (slug === 'formula-chystoty' && !html.includes('data-live-verification')) {
    html = html.replace(stamp,stamp+'<p class="case-evidence-note" data-live-verification>Публічну версію <a href="https://www.formula-chistoty.ck.ua/" target="_blank" rel="noopener noreferrer">Formula Chystoty</a> перевірено 02.09.2026: доступні сторінки клінінгових послуг, контакти й приклади робіт. Це перевірка доступності та змісту, не підтвердження кількості звернень або продажів.</p>');
  }
  if (slug === 'max-site') {
    const gallery = '<h2>Реальні екрани підготовленої версії</h2><p>Знімки локальної production-збірки MAX SITE від 02.09.2026. Вони показують інтерфейс, а не показники трафіку або продажу.</p><div class="case-gallery case-evidence-gallery">'+[['home','Головна сторінка'],['city','Міський хаб']].flatMap(([route,label])=>[['desktop',1440,1000,'Широкий екран'],['mobile',390,844,'Мобільний екран']].map(([mode,width,height,caption])=>`<figure class="portfolio-gallery-card"><img src="/assets/portfolio/max-site-${route}-${mode}-20260902.jpg" width="${width}" height="${height}" alt="${label} MAX SITE — ${caption.toLowerCase()}" loading="lazy"><figcaption>${label} · ${caption}</figcaption></figure>`)).join('')+'</div>';
    html = html.replace(/<h2>Desktop і mobile реалізація<\/h2>[\s\S]*?<\/section>/,gallery+'</section>');
    html = html.replace('основну сторінку <a href="/stvorennya-saytiv/">створення сайтів під ключ</a>','сторінку <a href="/seo-sajt-pid-google/">SEO-підготовки сайту</a>');
  }
  fs.writeFileSync(file,html);
}
