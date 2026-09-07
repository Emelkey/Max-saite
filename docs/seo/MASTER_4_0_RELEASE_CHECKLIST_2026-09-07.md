# MAX SITE — MASTER 4.0: чекліст релізу та відкриті умови

Підготовлено: 7 вересня 2026. Фінальна перевірка публікації: 8 вересня 2026.
Джерело: конкурентне ТЗ від 6 вересня 2026.

## Результат поточного етапу

Опубліковано технічний та редакційний реліз MASTER 4.0 разом із попередніми
неопублікованими змінами MASTER 3.0. Це **не означає виконання всієї 90-денної
програми**: зовнішні дані, нові клієнтські кейси, PR-публікації, польові CWV та
позиції Google не можна замінити змінами коду.

[PR #14](https://github.com/Emelkey/Max-saite/pull/14) об'єднано після успішного
CI; окремий production workflow завершився успішно. На
[maxsite.com.ua](https://maxsite.com.ua/) підтверджено точний merge SHA
`196ac040635d82714f9fbe7cd72f4c6c6f139930`, контрольні суми 26 файлів
і receipt (27 HTTP-ресурсів). Усі 88 URL із sitemap віддають прямий HTTP 200,
self-canonical і не мають meta noindex. Це перевірка публічного сайту,
а не лише локального build.

Перші два CI виявили мобільне переповнення й недоступний клік на cookies.
Причини відтворено з ширшим fallback-шрифтом і виправлено; третій PR CI та
production CI пройшли без вимкнення перевірок. Тепер заголовок засновника,
FAQ grid, form/footer і contact bar не розширюють мобільний viewport.

## Виконано в релізі

- [x] Перевірено 110 HTML-документів; 88 indexable URL у п'яти sitemap.
- [x] Canonical, robots, унікальні Title/H1, базові schema та внутрішні посилання
  проходять автоматичний контроль без помилок.
- [x] Прибрано внутрішні посилання на `/index.html`; головний canonical — `/`.
- [x] Міста узгоджені з реєстром: 23 записи покриття, 7 indexable city pages
  плюс хаб. Чернетки інших міст не додано в sitemap заради кількості.
- [x] Переписано 35 коротких Description; збережено унікальність метаданих.
- [x] На восьми основних комерційних сторінках є контекстні переходи до трьох
  реальних кейсів; кейси пов'язані з релевантними послугами/нішами/містом.
  Суміжні приклади не видаються за реалізовані ecommerce/software кейси.
- [x] Прибрано повторюваний exact-match анкор із загальних header/footer.
- [x] 23 растрові джерела отримали 150 AVIF/WebP варіантів; 42 растрові входження
  мають responsive delivery, 414 srcset-кандидатів. SVG залишені векторними:
  поточний аудит бачить 218 SVG-входжень, а не 216 растрових файлів із ТЗ.
- [x] Немає штучного upscale малих оригіналів; sizes, розміри, eager/high для
  пріоритетного зображення та lazy для інших проходять аудит.
- [x] Шість декоративних зображень мають явний порожній alt і decorative context.
- [x] Контроль SHA-256 джерел і варіантів працює незалежно від timestamp checkout.
- [x] Organization MAX SITE має власні logo/image/contactPoint і телефон
  `+380972692322`. Немає фіктивного офісу, рейтингу або чужого бізнес-профілю.
  Легітимний кейс «Формула Чистоти» збережено як портфоліо.
- [x] Переглянуто й змістовно доповнено 16 статей: власні сценарії, первинні
  джерела, точні застереження, основна CTA. Прибрано повторні загальні абзаци.
- [x] Усі 28 статей проходять структурний editorial-check: автор, видима дата,
  джерела, відсутність дубльованих абзаців усередині статті. Це не автоматична
  оцінка повноти відповіді або ранжування.
- [x] Дата перегляду і `Article.dateModified` синхронізовані лише у 16 реально
  переглянутих статтях; sitemap lastmod не оновлюється масово датою build.
- [x] Чотири практичні приклади перенесено в основне редакційне тіло статей;
  наступні кроки конкретизовано, застарілі видимі дати перегляду узгоджено.
  Аудит пакета не підміняє редакційну оцінку довільною квотою слів.
- [x] Додано `/kalkulyator-vartosti-saytu/`: чотири опубліковані стартові тарифи,
  уточнення обсягу, копіювання, Telegram/email export без обов'язкової заявки.
  Точні строки та надбавки не вигадані: потрібна оцінка обсягу.
- [x] Порівняння Next.js / WordPress / Shopify / Хорошоп: TCO, SEO, підтримка,
  типи задач, посилання на офіційні джерела та CSV для порівняння пропозицій.
- [x] Додано завантажуваний SEO migration checklist; збережено бриф, шаблон ТЗ
  та QA checklist запуску.
- [x] `generate_lead` лише після HTTP success + `ok:true`, технічний `lead_id`,
  allowlist аналітики, класифікація помилок і очищення attribution при відкликанні згоди.
- [x] Telegram recovery не містить ПІБ/телефону/коментаря в URL: окрема кнопка
  копіювання та звичайне посилання, ручне копіювання при відмові clipboard.
  Fallback не створює конверсію і не очищає незбережені поля.
- [x] Серверний validation/rate-limit/idempotency реалізований та протестований;
  публікація Worker є окремою умовою нижче.
- [x] CI блокує SEO/тестові помилки. Release receipt з Git SHA і SHA-256 дозволяє
  перевірити, що production віддає саме опубліковані HTML/CSS/JS/assets.
- [x] 546 локальних CSS/JS-посилань отримують детермінований content hash
  під час build. Це оновлює кеш після зміни файлів; вихідні HTML, зовнішні
  Google URL, canonical, інші query-параметри та fragments збережені.
- [x] Мобільні заголовки й FAQ перевірені також із ширшим fallback-шрифтом;
  contact bar не розширює кнопку поверх сусідньої при фокусі. Браузерні
  синтетичні перевірки блокують відправлення тестових подій у реальну GA4.
- [x] Підготовлено шість точних edge-301, security headers, preview noindex,
  перевірки кінцевого 200/canonical, план DNS/rollback. Ці правила **не активні**
  на GitHub Pages і не потрапляють у його публічний пакет.

## Перевірки

| Перевірка | Зафіксований локальний результат |
|---|---|
| SEO / sitemap / metadata / links / schema | 0 помилок |
| Unit tests | 66 passed, 0 failed |
| Content-quality | 0 помилок; 1 попередження про окрему live-перевірку Worker |
| Browser | 84 passed, 6 platform-specific skipped, 0 failed |
| Lighthouse mobile | 6 сторінок × 3 прогони = 18; Performance 99–100, Accessibility 93–96, Best Practices 100, SEO 100 |
| Lighthouse у фінальному production CI | 6 сторінок × 3 прогони; медіани Performance 97–98, Accessibility 93–96, Best Practices 100, SEO 100 |
| Production package audit | 88/88 базових SEO-перевірок, понад 5200 внутрішніх посилань, 0 помилок |
| Image audit | 0 помилок |
| Edge config | 6 redirect rules; конфігурація проходить; live edge не активований |
| git diff --check | без помилок |
| Незалежна live-перевірка після deploy | точний SHA, 27/27 HTTP-ресурсів, 88/88 canonical URL, 0 помилок |
| HTTP / www / справжня 404 | HTTP і www: один 301 → 200; відсутня сторінка: HTTP 404 |

Артефакти: `artifacts/seo/checks/`, `artifacts/seo/responsive-images.json`,
`artifacts/lighthouse/master4-20260907/`, `artifacts/playwright/report/`,
`artifacts/seo/master4-visual/`. GitHub CI повторює тести на фінальному commit.
Підсумок Lighthouse — лабораторний, **не CrUX p75**.

## Не завершено — не приховувати у звіті

| Умова ТЗ | Статус / потрібний наступний крок |
|---|---|
| Реальний 301 `/index.html` → `/` і керовані headers | Потрібні окремо погоджена edge/DNS-міграція, preview і rollback. GitHub Pages зараз повертає HTML; canonical сам по собі не є 301. |
| Production Durable Objects / Telegram QA | Cloudflare OAuth протермінований. Потрібні відновлення входу, звірка migration history/secrets, Worker deploy і один контрольний lead. Pages deploy не змінює Worker. |
| Exactly-once доставка | Дедуплікуються підтверджені успіхи. Якщо Telegram прийняв повідомлення, але відповідь загубилась, повтор може дублювати повідомлення; абсолютної гарантії немає. |
| GA4/Ads production events | Код перевірено; реальна доставка → GA4 DebugView → Ads import потребують перевірки зовнішніх акаунтів. `click_phone` не є доказом розмови. |
| GSC cannibalization / cleanup | Потрібні всі доступні query/page/country/device дані (до 16 міс.), backlinks та роль URL у лідах. Реєстри створено; merge/noindex/410 без доказів не виконано. |
| 5 повних кейсів із результатами | Є 3 URL; потрібні щонайменше 2 нові реалізовані проєкти, дозволи, періоди й верифіковані результати. Немає вигаданих кейсів/відгуків. |
| legalName / founder / відгуки | Додавати лише підтверджені публічні реквізити, дозволи та зовнішні джерела. |
| 50–100 цінових пропозицій | Дослідження ще не виконано; потрібна відтворювана вибірка однакового обсягу, дата, raw data, медіана/діапазони. Калькулятор тарифів його не замінює. |
| GSC/CWV benchmark + 5 city SERP studies | Потрібні власні/дозволені дані та датовані зіставні SERP-вибірки. Не видано припущення за замір. |
| 3–5 referring domains щомісяця | Є outreach/evidence реєстри; реальні редакційні згадки не отримані цією кодовою зміною. Платні/масові схеми не застосовано. |
| CrUX і позиції Top-3/1 | Залежать від реальних користувачів, даних Google, конкуренції та часу. Місце №1 не гарантоване. |
| День 2/7/14/30 після релізу | Потрібні майбутні перевірки coverage/sitemap/CWV/404/leads. Не позначати виконаними у день публікації. |

## Rollback

Попередня remote-main база: `d1fe955b0492af9bb80b20e15d12194177e1b757`.
У разі істотної регресії підготувати rollback PR релізного merge commit і
перевірити його workflow окремо: у попередній базі `d1fe955` був автоматичний
деплой на push у main. Сліпий повний revert поверне цю поведінку. До merge
rollback PR потрібно зберегти ручне керування публікацією та сумісну перевірку
пакета/production-версії, пройти CI, а потім окремо запустити production
workflow. Не застосовувати force push/reset.
DNS у цьому релізі не змінюється. Worker/Durable Objects має окремий rollback
план; після migration не видаляти namespaces або migration history.

## Публікація та live-докази

- Push початкового релізу: `c79a068ceaed69e6178e43e91c5a938d3dd53e9d`.
- PR: https://github.com/Emelkey/Max-saite/pull/14.
- Перший CI: https://github.com/Emelkey/Max-saite/actions/runs/34153756297 —
  80 browser passed, 3 skipped, 1 failed (mobile consent settings pointer
  interception). Це реальна причина затримки релізу; перевірку не вимкнено.
- Другий CI: https://github.com/Emelkey/Max-saite/actions/runs/34156079758 —
  74 browser passed, 4 skipped, 8 failed. Посилена перевірка виявила справжню
  різницю layout viewport у Linux. Причини відтворено локально і виправлено;
  перевірки не послаблені й кліки не виконуються через force.
- Pre-release HTTP evidence: `artifacts/seo/live/master4-20260907-before.json`.
  Це стан попередньої production-версії: новий калькулятор ще повертає 404.
- Фінальний PR head: `6f9eb6ecbd5590d89118a7719584931a4e1fca15`.
- Третій PR CI: https://github.com/Emelkey/Max-saite/actions/runs/34157537175 —
  success, browser/SEO/unit/Lighthouse/package audit пройдено.
- Merge / production SHA: `196ac040635d82714f9fbe7cd72f4c6c6f139930`.
- Explicit production deployment:
  https://github.com/Emelkey/Max-saite/actions/runs/34163771789 — success.
  Опубліковано 8 вересня о 00:40–00:41 за Києвом (7 вересня 21:40–21:41 UTC).
- Незалежний post-deploy receipt/hash check:
  `artifacts/seo/master4-production-20260908.json` — `ok: true`, 27 ресурсів.
- Повний read-only HTTP audit:
  `artifacts/seo/live/master4-20260908-after.json` — 96 спостережень;
  додаткове зіставлення всіх 88 sitemap URL підтвердило прямий 200,
  self-canonical і відсутність meta noindex.
- Новий калькулятор: https://maxsite.com.ua/kalkulyator-vartosti-saytu/ — HTTP 200.
- Мобільна головна в production: inner/client/scroll width = 412/412/412 px;
  заголовок засновника відображається звичайним регістром без розриву слова.
- Цей фінальний звіт і post-deploy докази додаються окремим documentation-only
  commit після релізу. Публічний пакет залишається на зазначеному production SHA;
  docs/artifacts не входять у website bundle і повторного деплою не потребують.
