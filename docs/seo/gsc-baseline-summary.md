# MAX SITE — Search Console baseline

**Знято:** 28.08.2026  
**Запитаний діапазон:** останні 16 місяців  
**Фактично доступні дані:** 02.08.2026–26.08.2026 (ресурс новий, раніших даних немає)  
**Ресурс:** `https://maxsite.com.ua/`

Повний нормалізований export: [`gsc-baseline.csv`](./gsc-baseline.csv) — 146 рядків: 98 queries, 35 pages, countries, devices і search appearance.

## Підсумок Web Search

| Показник | Значення |
|---|---:|
| Кліки | 2 |
| Покази | 1 385 |
| CTR | 0,1% |
| Середня позиція | 68,3 |

## Найбільший попит у запитах

| Запит | Покази | Позиція |
|---|---:|---:|
| замовити сайт | 243 | 64,8 |
| інтернет магазин під ключ | 142 | 67,9 |
| замовити сайт київ | 80 | 85,8 |
| створення сайтів київ | 64 | 75,0 |
| просування сайту у києві | 41 | 77,3 |
| створення сайту київ | 41 | 80,0 |
| landing page під ключ | 37 | 59,9 |
| створити сайт київ | 35 | — |
| лендінг для клінінгової компанії | 32 | — |
| замовити інтернет магазин під ключ | 26 | — |

## Сторінки з найбільшими показами

| URL | Кліки | Покази | CTR | Позиція |
|---|---:|---:|---:|---:|
| `/stvorennya-internet-mahazynu/` | 0 | 362 | 0% | 75,6 |
| `/mista/stvorennya-sajtiv-kyiv/` | 0 | 326 | 0% | 72,2 |
| `/` | 1 | 240 | 0,4% | 60,6 |
| `/stvorennya-saytu-dlya-biznesu/` | 1 | 124 | 0,8% | 63,6 |
| `/blog/skilky-koshtuye-stvorennya-internet-magazynu/` | 0 | 99 | 0% | 90,3 |
| `/mista/stvorennya-sajtiv-cherkasy/` | 0 | 95 | 0% | 58,6 |
| `/stvorennya-landing-page/` | 0 | 50 | 0% | 58,8 |

## Indexing

| Статус | URL |
|---|---:|
| Проіндексовано | 41 |
| Не проіндексовано | 25 |
| `noindex` | 20 |
| Crawled — currently not indexed | 4 |
| Alternate page with canonical | 1 |

Різниця між 78 URL у sitemap і 41 проіндексованим URL є головним early-stage ризиком. Відкриття Wave 1 city hubs має бути поступовим, після унікалізації й технічного QA.

## Sitemap, CWV, devices

- `/sitemap.xml`: статус **Успішно**, остання обробка 25.08.2026, виявлено 78 сторінок.
- Core Web Vitals: недостатньо польових даних і для mobile, і для desktop.
- Device mix: desktop — 2 кліки / 1 023 покази; mobile — 0 кліків / 362 покази.
- Search appearance: product snippets — 182 покази, 0 кліків, середня позиція 79,8.

## Висновки для implementation

1. Не створювати нові city × service URL: спочатку посилити існуючі власники намірів.
2. Найвищий пріоритет мають `/stvorennya-saytiv/`, `/stvorennya-internet-mahazynu/`, `/stvorennya-landing-page/` і Kyiv hub.
3. П’ять Wave 1 міст треба відкривати лише після similarity/content-quality gates; для Львова, Одеси, Дніпра й Харкова baseline-даних поки недостатньо.
4. CTR низький, але позиції ще переважно 60–90; першочерговий важіль — підняття релевантності/авторитету та індексація, а не лише переписування title.
5. Після релізу щотижнево порівнювати impressions, queries у TOP-20/TOP-10, канібалізацію й organic leads.

