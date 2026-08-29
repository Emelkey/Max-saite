# MAX SITE SEO MASTER 2.0 — baseline

**Дата знімка:** 28.08.2026  
**Production:** <https://maxsite.com.ua/>  
**Репозиторій:** `Emelkey/Max-saite`

Цей документ фіксує стан до змін SEO MASTER 2.0. Позиції в Google не гарантуються: контрольованими є технічна якість, індексація, контент, перелінковка, вимірювання та регулярність робіт.

## 1. Архітектура та експлуатація

| Компонент | Поточний стан |
|---|---|
| Framework | Статичний HTML/CSS/JavaScript; Next.js/App Router/Pages Router не використовуються |
| Контент | Окремі `index.html` у каталогах; частина масових змін відтворюється скриптами у `tools/` |
| Metadata | Вбудовані в кожен HTML: title, description, canonical, Open Graph, Twitter |
| Sitemap / robots | Статичні `/sitemap.xml` та `/robots.txt` |
| Schema | JSON-LD у HTML; на сторінках використовуються Organization, WebSite, WebPage, Service, FAQPage, BreadcrumbList, Article, Person та інші релевантні типи |
| Redirects | Server-side 301 у GitHub Pages відсутні. Старі URL збережені як `noindex` canonical aliases; зміна slug без зовнішнього redirect layer заборонена |
| Analytics | GA4 `G-TS8DMMKK34`: один inline Google tag на сторінку; loader у `script.js` виявляє його й не завантажує другий екземпляр |
| Forms | Client-side форми, honeypot, native validation; production endpoint `https://max-site-leads.emelkey777.workers.dev`; Telegram fallback |
| Lead delivery | POST JSON до Cloudflare Worker; у репозиторії немає server-side коду Worker, тому rate limit/server validation треба перевіряти окремо на стороні Worker |
| Deployment | GitHub Pages через `.github/workflows/pages.yml`, автоматично після push у `main` |
| Production build | `tools/build-hosting-package.js`; збирає `release/max-site-production`, підставляє GA4, Search Console token і form endpoint |
| Environment | GitHub Actions variable `GA4_ID`, `SEARCH_CONSOLE_TOKEN`; form endpoint заданий у workflow |
| CI/CD | Source audit → production build → production audit → GitHub Pages artifact → deploy |
| Tests | `tools/audit-site.js`; на baseline перевіряє metadata, canonical, sitemap, schema та внутрішні посилання |

## 2. Route inventory

Повна інвентаризація: [`route-inventory.csv`](./route-inventory.csv).

| Показник | Baseline |
|---|---:|
| HTML-документів | 104 |
| Indexable URL | 78 |
| URL у sitemap | 78 |
| City pages | 23 |
| Indexable city pages | 3 |
| Noindex pages | 26 |
| Внутрішніх посилань у графі | 4 850 |
| Indexable URL без inlinks | 0 |
| Критичних помилок `audit-site.js` | 0 |

## 3. Збережені артефакти до змін

Каталог `artifacts/seo/baseline/` містить:

- HTML ключових сторінок: головна, money pages, п’ять Wave 1 міст, каталог міст і кейс;
- `metadata.json` — title, description, H1, canonical, robots і schema;
- `link-graph.json` — внутрішній граф посилань;
- `sitemap.xml` і `robots.txt`;
- `city-pages.csv` — статус усіх city pages;
- `summary.json` — машинозчитуваний підсумок.

Desktop/mobile screenshots, Lighthouse JSON і Search Console export додаються окремими файлами до цього baseline, бо залежать від browser/runtime та доступу до GSC.

## 4. Сильні сторони

- Канонічні indexable URL уже мають стабільні адреси та присутні в sitemap.
- 78/78 sitemap URL проходять поточний технічний аудит.
- Немає битих внутрішніх посилань і orphan indexable pages.
- Каталог міст та 23 міські URL вже існують; масові тонкі сторінки переважно закриті `noindex`.
- Є реальні кейси «Формула Чистоти» та FO-DEZ, окремі money pages, ніші й Knowledge Hub.
- На city pages чесно вказано дистанційну роботу без фейкових локальних офісів.
- Форми мають базову валідацію, honeypot і fallback у Telegram.
- Production deploy уже має source/production audit gates.

## 5. Виявлені ризики та P0/P1

1. **P0 — redirects:** GitHub Pages не дає керованих server-side 301. Slug/canonical не змінювати без Cloudflare redirect layer.
2. **P0 — city scaling:** лише 3 з 23 міських URL indexable. П’ять Wave 1 hubs можна відкрити лише після унікалізації та SERP Decision Gate.
3. **P1 — шаблонність city pages:** структура, тарифи, процес і FAQ повторюються; потрібен similarity gate.
4. **P1 — analytics taxonomy:** існують `form_start`, `form_submit`, `generate_lead`, але бракує точних подій MASTER 2.0 (`lead_form_*`, `pricing_cta_click`, `case_live_site_click`, `city_service_click`, `scroll_75`).
5. **P1 — form attribution:** payload не містить повного набору hidden fields UTM/gclid/referrer/page_type/city/service/consent/timestamp.
6. **P1 — spam protection boundary:** server validation/rate limit не підтверджені кодом цього репозиторію.
7. **P1 — proof/E-E-A-T:** двох основних клієнтських кейсів недостатньо для конкурентних міських запитів; вигадані кейси, цифри й відгуки заборонені.
8. **P1 — automation:** немає єдиної команди `npm run seo:check`, similarity/content-quality gates і browser tests.
9. **P1 — CWV/Lighthouse:** немає versioned Lighthouse baseline для ключових шаблонів.

Детальний контроль ризиків: [`master-2-0-risk-register.md`](./master-2-0-risk-register.md).

## 6. Незмінні правила реалізації

- Не перейменовувати чинні canonical URL без справжнього 301.
- Не додавати LocalBusiness/PostalAddress для міст без фактичної присутності.
- Не створювати city × service URL без SERP Decision Gate.
- Не публікувати непідтверджені рейтинги, відгуки, клієнтів чи бізнес-метрики.
- Не передавати PII у GA4.
- Нові indexable сторінки додаються у sitemap лише після проходження SEO gates.
