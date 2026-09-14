# MAX SITE SEO — звіт виконання ТЗ від 14.09.2026

Дата перевірки: 14.09.2026

Проєкт: https://maxsite.com.ua/

Базова ревізія перед роботою: `9032d74db3ce54fa08668a559373b2051bf77522`

Принцип приймання: код, збірка, браузерні тести й live/GSC-факти розділено. Відсутні рядки GSC не трактуються як нулі.

## Підсумок

- Усунено внутрішню технічну лексику на `/mista/`; кількість відкритих міських сторінок не змінювалася.
- Додано нормалізовану подію `contact_click(channel)` без телефону, імені, коментаря, URL месенджера чи іншої PII.
- Виправлено `Article`-розмітку київського SERP-матеріалу, додано видимий блок джерел/обмежень і дату редакційної перевірки.
- Створено карти намірів, реєстри 22 міст і готовності контенту, протокол свіжих GSC Inspection та 32 URL-перевірки.
- Не відкрито жодного з 16 відкладених міст, не вигадано офісів, відгуків, кейсів, метрик чи зовнішніх розміщень.
- Локальний production build, SEO-гейт, браузерний QA, Lighthouse та 34 desktop/mobile скриншоти пройдено.

## Статус за блоками ТЗ

| Блок | Статус | Виконання та межа доказів |
| --- | --- | --- |
| MAX-01 | `PASS_LIVE_STATE / PENDING_GOOGLE_RECRAWL` | Львів, Дніпро, Одеса й Харків на live мають HTTP 200, self-canonical та `index, follow`. Свіжі Inspection 14.09 досі показують crawl 03.08 і старий `noindex`; це затримка повторного обходу Google, а не підстава знову змінювати robots. Доступний інструмент Inspection не надсилає заявку на індексацію. |
| MAX-02 | `PASS_REGISTER / BLOCKED_OWNER_DATA` | Реєстр міст містить рівно 22 рядки: 6 indexable і 16 noindex. Наступні 2–3 міста не відкриті: немає одночасно підтверджених попиту, спроможності обслуговувати місто та унікального корисного контенту. |
| MAX-03 | `PASS` | `seo/query-url-map.csv` фіксує 16 кластерів та одну primary URL на намір. Додано поточні метрики GSC за 05–11.09; `n/d` означає відсутність розкритого рядка, не нуль. SERP-доказ 12.09 повторно використано без удаваного нового виміру. |
| MAX-04 | `PASS` | На `/mista/` прибрано слова про similarity/QA gates, Wave 2/3 review і видимий `noindex`. Збережено client-facing пояснення, 6 опублікованих міст, Organization graph, canonical і robots. |
| MAX-05 | `PASS_CURRENT / QUEUED_EVIDENCE_GATES` | Пріоритетні сторінки й 12 ніш внесено до реєстру готовності. Поточний корисний контент збережено; нові фактичні твердження, ліцензії, офіси й результати не додавалися без джерел. |
| MAX-06 | `PASS_CURRENT` | Прийнято наявні чотири P1-сторінки: клінінг, Черкаси, сайт для бізнесу, landing page; також кейси Formula Chystoty та FO-DEZ з явними обмеженнями доказів. На київському дослідженні виправлено Article headline/description та джерела. Непідтверджені числові результати не додано. |
| MAX-07 | `PASS_PREPARATION / BLOCKED_OWNER_EXTERNAL` | Реєстр містить 15 релевантних майданчиків зі статусом `RESEARCHED_NOT_CONTACTED`. Надсилань, купівлі посилань, гарантій розміщення чи вигаданих публікацій немає; потрібні дозволи/акаунти власника. |
| MAX-08 | `PASS_LAB / NO_FIELD_CWV_CLAIM` | По 3 незалежні mobile Lighthouse-прогони для `/`, `/mista/` і київського матеріалу. Медіана: Performance 99; Accessibility 96–97; Best Practices 100; SEO 100; LCP 1.801–1.954 с; CLS 0. Це лабораторний тест локального production build, не польові CWV. |
| MAX-09 | `PASS_CODE_AND_MOCK / BLOCKED_EXTERNAL_LIVE_DELIVERY` | `brief_start`, `contact_click(channel)` та `generate_lead` перевірено. `generate_lead` виникає лише після HTTP 2xx і `{ok:true}` з `lead_id`. У payload аналітики немає PII. Реальну форму власнику не надсилали, а GA4 Admin key-event не змінювали без окремого доступу й контрольованої live-перевірки. |

## GSC і пошукові дані

Свіжі URL Inspection виконано для чотирьох P1 міст. Усі чотири відповіді мають `NEUTRAL`, `Excluded by 'noindex' tag`, `BLOCKED_BY_META_TAG`, останній crawl 03.08.2026. Одночасно live-HTML уже indexable. Рішення: `PENDING_GOOGLE_RECRAWL`, не повторна robots-зміна.

Поточне доступне вікно GSC Search Analytics: 05–11.09.2026, Web, Ukraine, усі пристрої. Приклади фактичних рядків: `сайт для бізнесу` — 12 показів, позиція 18.75; `замовити лендінг` — 16, 33.25; `створення інтернет магазину` — 29, 51.9655; `лендінг для клінінгової компанії` — 4, 12.5; `створення сайтів київ` — 10, 90.3; `створення сайтів у черкасах` — 7, 23.2857. Це не доказ зростання після релізу 12.09 і не гарантія TOP-3.

## Перевірки

- `npm run seo:check`: 85 unit-тестів; 112 HTML-сторінок; 90 sitemap URL; 5,529 внутрішніх посилань; 0 errors. Є одна чесна зовнішня warning: production Worker/Telegram delivery потребує окремого live-тесту.
- `npm run test:browser`: 102 passed, 6 platform-specific skipped, 0 failed. Перевірено desktop/mobile, H1/layout, форми, аналітичні події та відсутність PII.
- URL-checks: 32/32 `PASS`, включно з усіма 22 містами; 6 indexable і 16 noindex відповідають реєстру.
- Lighthouse: 9/9 прогонів без порушення порогів; raw JSON і summary збережено.
- Screenshots: 17 маршрутів × desktop/mobile = 34; manifest збережено. `/mista/` та київський матеріал переглянуто в обох viewport.

## Артефакти

- `seo/query-url-map.csv`
- `seo/city-readiness-register.csv`
- `seo/content-readiness-register.csv`
- `docs/seo/tz-20260914-gsc-inspections.csv`
- `docs/seo/tz-20260914-protected-fields.csv`
- `docs/seo/tz-20260914-url-checks.csv`
- `artifacts/lighthouse/tz-2026-09-14/summary.json` та 9 raw JSON
- `artifacts/screenshots/tz-2026-09-14-r3/manifest.json` та 34 JPG

## Захищені поля та rollback

Телефон `+380972692322`, Telegram `MaxMytt`, GA4 `G-TS8DMMKK34`, canonical/robots міського хаба, 6 опублікованих міських посилань і lead-success gate не змінено. Повний before/after наведено у `docs/seo/tz-20260914-protected-fields.csv`.

Rollback релізу: повернути сайт на попередню production-ревізію `9032d74db3ce54fa08668a559373b2051bf77522`. Google recrawl, зовнішні authority placements, реальна доставка Telegram, налаштування GA4 Admin і бізнес-результати не позначаються як виконані без окремих receipts.
