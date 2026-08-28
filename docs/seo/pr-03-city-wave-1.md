# PR 03 — Wave 1 city hubs

**Branch:** `seo/master-2-0-city-wave-1`

## Змінені URL

- `/mista/stvorennya-sajtiv-kyiv/`
- `/mista/stvorennya-sajtiv-lviv/`
- `/mista/stvorennya-sajtiv-odesa/`
- `/mista/stvorennya-sajtiv-dnipro/`
- `/mista/stvorennya-sajtiv-kharkiv/`
- `/mista/`
- шість national service pages отримали контекстні links на Wave 1.

Slugs і canonical збережені. Львів, Одеса, Дніпро й Харків переведені з `noindex` у `index` тільки після content, schema, links і similarity gates; sitemap збільшено з 78 до 82 URL.

## Унікальна цінність

Кожен hub має окремий market context, 3 бізнес-сценарії, decision block і 2 унікальні FAQ. Кейси подані як nationwide proof, без вигаданого місцевого офісу або локального клієнта. City data зберігає відмінки, preposition, publish state, related cities/services, proof mode і дати.

## SEO before → after

| Контроль | До | Після |
|---|---|---|
| Indexable Wave 1 | 1/5 | 5/5 |
| FAQ | 4–6 | 6–8, щонайменше 2 унікальні |
| WebPage/WebSite/Service graph | неповний у 4 hubs | централізовані IDs + City `areaServed` |
| LocalBusiness | 0 | 0 |
| Service → city links | переважно Київ | 5 Wave 1 hubs на 6 money pages |
| City → cases | загальний portfolio | 2 прямі підтверджені cases |
| City → related cities | частково noindex | лише 3 indexable related hubs |
| 5-gram Jaccard | 0.52–0.55 у шаблонної четвірки raw | 0.02–0.19 після standard-block removal |

## Перевірки

- `node tools/validate-cities.js`: 23 records, 7 indexable;
- `node tools/check-city-similarity.js`: усі 10 пар PASS, max 0.1880;
- `node tools/audit-site.js`: 82/82, 0 errors;
- мовний scan: немає `в Львові`, `у Одесі`, `в Дніпрі`, `в Харкові`;
- LocalBusiness scan: 0;
- `git diff --check`: pass.

## Ризики

- Чотири нові indexable hubs можуть індексуватися поступово; позиції не гарантуються.
- Field CWV з’явиться лише після накопичення реальних даних.
- Інші 16 city pages залишаються `noindex` і не мають links з indexable city catalogue.

## Screenshots

Відтворювані desktop/mobile screenshots усіх Wave 1 templates додаються у PR 06 після browser QA.

## Rollback

Revert цього PR повертає robots/sitemap і попередній контент. URL не змінюються, тому redirect/data migration не потрібні.
