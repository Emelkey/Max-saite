# MAX SITE — фінальний чекліст Master ТЗ 2026

## P0: технічна база

- [x] HTTPS production domain і єдиний canonical host.
- [x] Self-canonical для всіх sitemap URL.
- [x] Sitemap містить лише канонічні indexable URL зі статусом 200 у статичному пакеті.
- [x] robots.txt посилається на production sitemap.
- [x] 404.html залишається `noindex`.
- [x] Унікальні title, description і рівно один H1.
- [x] Open Graph та Twitter metadata.
- [x] Organization, BreadcrumbList, Service/Article/FAQ/Person schema там, де є видимий контент.
- [x] GA4: `form_submit`, `phone_click`, `messenger_click`, `consultation_click`, `portfolio_click`, `price_cta`, `brief_start`, `brief_complete`.
- [x] Збережені чинні `click_phone`, `generate_lead` і діагностичні події для Google Ads.
- [x] Постійна мобільна панель і телефон у мобільному меню.
- [x] Production endpoint із Telegram fallback.
- [x] OG PNG оптимізовано у WebP без зміни роздільності.

## Архітектура й контент

- [x] 78 канонічних URL — у межах цілі 60–100.
- [x] 8–12+ комерційних кластерів.
- [x] 20 індексованих галузевих сторінок.
- [x] 24 матеріали Knowledge Hub.
- [x] Один намір — один канонічний URL.
- [x] Внутрішні посилання між послугами, нішами, статтями, методологією та кейсами.
- [x] Автор і дата оновлення для нових статей.
- [x] Сторінка SEO-FIRST™.
- [x] Сторінка засновника без непідтверджених регалій.
- [x] Публічний чекліст запуску.
- [x] 2 перевірні кейси без вигаданих метрик.
- [ ] 10+ кейсів — потрібні реальні проєкти та матеріали.
- [ ] 10+ підтверджених відгуків — потрібні дозволи та першоджерела.

## Off-page і зовнішні залежності

- [ ] 20–40 якісних referring domains — окрема 6-місячна PR/outreach робота.
- [ ] Галузеві каталоги — лише релевантні й перевірені майданчики.
- [ ] Партнерські публікації — після погодження партнерів.
- [ ] GA4 key events та імпорт у Google Ads — перевірити в інтерфейсах після production traffic.
- [ ] Нові міста — лише після content gate і перевірки канібалізації.

## Релізний QA

- [x] Source audit.
- [x] Production package audit.
- [x] Внутрішні посилання.
- [x] JSON-LD parsing.
- [x] Мобільна панель і телефон.
- [x] Sitemap/robots/canonical.
- [x] 404 noindex.
- [x] Візуальний browser QA 360 / 390 / 430 / tablet / desktop; горизонтальний overflow сторінки засновника виправлено.
- [x] Live smoke test після GitHub Pages deployment: головна й репрезентативні URL — 200, canonical/H1 коректні, sitemap — 78 URL, 404 — `noindex`.
