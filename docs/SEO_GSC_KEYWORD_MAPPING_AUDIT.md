# MAX SITE — GSC keyword mapping and cannibalization audit

Дата аудиту: 2026-08-10  
Перевірений commit: `41f256911c509fb848169e6152bbe5ded5502c00` (`origin/main`)  
Baseline Search Console: 158 показів, 0 кліків, CTR 0%, середня позиція 66.

## 1. Фактичні canonical URL

| Кластер | Фактична primary URL | Статус |
| --- | --- | --- |
| Створення сайтів | `https://maxsite.com.ua/stvorennya-saytiv/` | 200, index/follow, self-canonical |
| Інтернет-магазин | `https://maxsite.com.ua/stvorennya-internet-mahazynu/` | 200, index/follow, self-canonical |
| Landing Page | `https://maxsite.com.ua/stvorennya-landing-page/` | 200, index/follow, self-canonical |
| Створення сайтів у Києві | `https://maxsite.com.ua/mista/stvorennya-sajtiv-kyiv/` | 200, index/follow, self-canonical |
| Сайт для бізнесу | `https://maxsite.com.ua/stvorennya-saytu-dlya-biznesu/` | index/follow, self-canonical |

## 2. Query mapping

| Query | Expected URL | Existing URL | Primary intent | Risk |
| --- | --- | --- | --- | --- |
| `замовити сайт` | `/stvorennya-saytiv/` | `/stvorennya-saytiv/` | замовлення розробки сайту | середній: головна має дуже схожі Title/H1 |
| `створення сайтів` | `/stvorennya-saytiv/` | `/stvorennya-saytiv/` | загальна комерційна послуга | середній: `/`, `/stvorennya-sajtiv-pid-klyuch/` та бізнес-сайт частково перетинаються |
| `інтернет магазин під ключ` | `/stvorennya-internet-mahazynu/` | `/stvorennya-internet-mahazynu/` | замовлення ecommerce-сайту | низький/середній: існує legacy URL з canonical на primary |
| `створення інтернет магазину під ключ` | `/stvorennya-internet-mahazynu/` | `/stvorennya-internet-mahazynu/` | розробка ecommerce-сайту | низький/середній |
| `створення сайтів Київ` | `/mista/stvorennya-sajtiv-kyiv/` | `/mista/stvorennya-sajtiv-kyiv/` | локальна послуга для Києва | високий не через дубль, а через слабку внутрішню вагу: лише 4 входи |
| `landing page під ключ` | `/stvorennya-landing-page/` | `/stvorennya-landing-page/` | замовлення односторінкового сайту | низький/середній: legacy URL canonical на primary |

## 3. Title та H1

| URL | Current Title | Current H1 | Proposed | Рішення |
| --- | --- | --- | --- | --- |
| `/stvorennya-internet-mahazynu/` | Створення інтернет-магазину під ключ \| MAX SITE | Створення інтернет-магазину під ключ | без змін | уже точно відповідає комерційному наміру |
| `/mista/stvorennya-sajtiv-kyiv/` | Створення сайтів у Києві для бізнесу \| MAX SITE | Створення сайтів у Києві для бізнесу | Title: `Створення сайтів у Києві під ключ \| MAX SITE`; H1: `Створення сайтів у Києві` | точніше відповідає фактичним GSC-запитам без заяви про офіс |
| `/stvorennya-saytiv/` | Створення сайтів під ключ в Україні \| MAX SITE | Створення сайтів під ключ в Україні | Title: `Замовити сайт під ключ в Україні \| MAX SITE`; H1 залишити | підсилити transactional intent, не дублюючи H1 головної |
| `/stvorennya-landing-page/` | Створення Landing Page під ключ \| MAX SITE | Створення Landing Page під ключ | без змін | сильна відповідність кластеру |

## 4. Канібалізація

| Query | Primary URL | Competing URLs | Severity | Action |
| --- | --- | --- | --- | --- |
| `замовити сайт`, `створення сайтів` | `/stvorennya-saytiv/` | `/`, `/stvorennya-sajtiv-pid-klyuch/`, `/stvorennya-saytu-dlya-biznesu/`, `/korporatyvni-sajty/` | середня | головну залишити брендово-категорійною; primary підсилити CTA й transactional формулювання; legacy URL не посилювати |
| `інтернет магазин під ключ` | `/stvorennya-internet-mahazynu/` | `/internet-magazyn-pid-klyuch/`, `/nishi/sajt-dlya-magazynu/` | середня | primary — ecommerce-розробка; niche page — рішення для магазину; legacy URL не додавати до sitemap та внутрішніх анкорів |
| `landing page під ключ` | `/stvorennya-landing-page/` | `/stvorennya-lendingiv/`, `/blog/lending-abo-korporatyvnyj-sajt/` | низька/середня | landing — transactional; blog — informational; legacy URL не посилювати |
| `створення сайтів Київ` | `/mista/stvorennya-sajtiv-kyiv/` | `/mista/`, `/stvorennya-saytiv/` | низька | додати контекстні входи з primary service, каталогу міст і релевантних матеріалів |

Legacy-сторінки повертають окремий HTML, але містять canonical на нові primary URL. Це не критична помилка, однак створює зайвий crawl і може пояснювати статус «альтернативна сторінка з canonical» у Search Console. На цьому етапі URL не видаляються й не перенаправляються.

## 5. Внутрішня перелінковка

Кількість знайдених внутрішніх посилань у HTML:

| Primary URL | Входи | Висновок |
| --- | ---: | --- |
| `/stvorennya-saytiv/` | 184 | сильна вага, але 165 анкорів однакові; потрібна природніша варіативність |
| `/stvorennya-landing-page/` | 166 | сильна вага, помірна варіативність |
| `/stvorennya-internet-mahazynu/` | 125 | достатня вага, бракує контекстних посилань із тематичних статей |
| `/stvorennya-saytu-dlya-biznesu/` | 35 | достатньо для вузької сторінки |
| `/mista/stvorennya-sajtiv-kyiv/` | 4 | критично слабка внутрішня вага для P1-кластера |

## 6. Технічний QA P1/P2

- усі чотири перевірені live URL повертають HTTP 200;
- на кожній сторінці рівно один H1;
- усі сторінки мають унікальні Title і Description;
- `index, follow` присутній;
- canonical self-reference коректний;
- primary URL присутні в `sitemap.xml`;
- видимі breadcrumbs присутні та відповідають `BreadcrumbList`;
- `Service` і `FAQPage` schema присутні;
- FAQ schema відповідає видимим питанням;
- основні контентні зображення на головній переведені у WebP; P1 service pages не мають важких hero-зображень;
- фактичні польові Core Web Vitals потрібно оцінювати в Search Console/CrUX після накопичення даних; source-аудит не замінює польові LCP/INP/CLS.

## 7. Порядок реалізації

1. Посилити релевантність інтернет-магазину без зміни URL.
2. Зробити київську сторінку повноцінною унікальною локальною посадковою без фіктивної адреси.
3. Розвести головну та `/stvorennya-saytiv/` за наміром і підсилити CTA «Замовити сайт».
4. Підсилити Landing Page без дублювання інформаційної статті.
5. Додати контекстну перелінковку й шість підтримувальних матеріалів, не створюючи нових міст або ніш.
6. Після деплою зафіксувати дату й порівнювати GSC через 7, 14 і 28 днів.

