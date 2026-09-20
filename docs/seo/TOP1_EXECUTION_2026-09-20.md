# MAX SITE — виконання TOP1 ТЗ та повторне приймання, 20.09.2026

ТЗ: `MAX_SITE_SEO_TOP1_MASTER_TZ_2026-09-10.pdf`, версія 4.0, 8 сторінок. Репозиторій: `Emelkey/Max-saite`. Гілка: `seo/top1-execution-2026-09-20`, PR #20. База `main`: `16a89c9fcf1fde26ebfcd56af7142d75e05d98de`.

## Головний результат перевірки

Більшість реалізації ТЗ уже міститься в базовому коді від 10–16 вересня. Вона перевірена повторно, а не переписана чи зарахована як нова робота. Нові зміни цієї гілки: виправлення недоказового відсотка у графічному блоці та посилення автоматичної перевірки опублікованого HTML.

**Повне завершення бізнес-цілі TOP1 не заявлено.** Реалізація коду, публікація, індексація Google, позиції й отримані зовнішні згадки — різні результати.

## Перевірено фактично

- Незалежно отримано точний вихідний знімок через Actions artifact; SHA-256 архіву звірено.
- Source inventory: 112 HTML-файлів, 90 canonical/indexable маршрутів; відсутніх alt, дубльованих title/description/H1, non-self canonical і orphan pages — 0.
- Повний локальний `npm run seo:check` пройдено; 90/90 сторінок production-пакета мають базові SEO-перевірки, 5 538 внутрішніх посилань перевірено, помилок 0.
- Unit-набір розширено з 85 до 97 тестів. Повторна перевірка браузера та Lighthouse виконується у quality workflow саме фінального head PR; статус дивитися в Actions, а не переносити з попереднього commit.
- Read-only live HTTP/HTML crawl 20.09.2026: 90/90 очікуваних цільових сторінок повернули 200, один H1 і відповідний canonical без noindex у HTML/HTTP headers. Це не URL Inspection і не підтвердження включення в Google.
- Live marker на момент 20.09.2026 18:10:39 UTC: `50080215cb7fda4c08676a80c2c216d2a189437e`. Він **не дорівнює** базовому main `16a89c9fcf1fde26ebfcd56af7142d75e05d98de`. Нові зміни PR #19 не вважати опублікованими.
- GSC Wizard повернув `payment_required`. Історичні 2 057 показів / 1 клік / 65,36 за 11.08–07.09 не названі актуальним станом.

Доказ live-перевірки: Actions run `35528199866`, artifact `top1-live-observation`; JSON `top1-pr20-35528199866-1.json` і `top1-base-release.json`. Свіжі повторні observations зберігаються окремо від перевірки коду в кожному PR run. Помилка live receipt навмисно не замаскована успішним build.

## Реалізовано в цьому PR

1. На головній знято непідтверджене `+68%`; збережено графіку й додано видимий підпис «Умовна ілюстрація, не показники клієнтського проєкту». Графік позначено декоративним для screen reader. Ціни, Title, H1, canonical, форми та контакти не змінено.
2. `tools/verify-live-seo.js` більше не повертає зелений результат тільки тому, що HTTP-запит відбувся. Для очікуваних маршрутів перевіряються 200 без redirect hop, canonical, H1, title, тип HTML, robots/googlebot і X-Robots-Tag. Втрачені маршрути та порожня карта не можуть пройти gate.
3. Поля `googleIndexStatus=NOT_CHECKED` і `robotsTxtPolicyStatus=NOT_EVALUATED` явно відділяють HTML-перевірку від даних Google та повної оцінки robots.txt.
4. PR snapshot workflow читає production через GET, зберігає live JSON і порівнює release marker з base revision. Він не виконує JavaScript на сайті, не надсилає форм, не змінює DNS, Ads, GSC або production.
5. Додано 12 unit-сценаріїв і desktop/mobile browser-сценарій для правдивості та читабельності графічного блоку.

## Матриця всіх розділів ТЗ

| Розділ | Стан | Реалізація / що залишилося |
|---|---|---|
| 1. Baseline | ЗБЕРЕЖЕНО, ПОТОЧНИЙ ЗРІЗ ЗАБЛОКОВАНО | Історичний GSC JSON не підміняється свіжим; потрібен доступ або експорт з Search Console. |
| 2. Діагноз | УТОЧНЕНО | Спільний query у кількох URL — сигнал перевірки, не автоматичний доказ шкідливої канібалізації. Відсутність fresh GSC/backlink index не дозволяє робити нові висновки про позиції або весь посилальний профіль. |
| 3. Keyword map | РЕАЛІЗОВАНО / SOURCE PASS | `seo/full-intent-map.json`, `top1-intent-map.json`, `keyword-map.csv`; усі 90 маршрутів, загальний intent у `/stvorennya-saytiv/`. |
| 4. P0 та quick wins | РЕАЛІЗОВАНО / SOURCE PASS | Inventory, різні H1, canonical, alt, business/cleaning intent; фактичний вибір URL Google потребує нового GSC. |
| 5. Money pages | РЕАЛІЗОВАНО / SOURCE PASS | П'ять чинних сторінок; scope, тарифи з межами, кейси, приймання, ecommerce SKU/склад/повернення/інтеграції. |
| 6. City SEO | РЕАЛІЗОВАНО / LIVE HTML PASS | Київ, Львів, Одеса, Дніпро, Харків і Черкаси; 16 непідготовлених міських сторінок залишено noindex за реєстром. Не відкривати їх масово. |
| 7. Кейси/E-E-A-T | 3 КЕЙСИ Є; ЦІЛЬ 5 НЕ ЗАКРИТА | Formula Chistoty, FO-DEZ, власний MAX SITE; два додаткові кейси та відгуки потребують реальних матеріалів і дозволів. Власний кейс не називати незалежним клієнтом. |
| 8. Authority | ПІДГОТОВЛЕНО, НЕ ОПУБЛІКОВАНО | 15 цілей у CSV, профіль і тексти звернень. Нових зовнішніх розміщень у цій роботі — 0; це не твердження, що весь домен має 0 backlinks. Надсилання, реєстрації й витрати не виконано. |
| 9. Expert assets | РЕАЛІЗОВАНО / SOURCE PASS | Дослідження 50 студій, 15 SERP-зрізів, calculator, brief, QA/приймання, fashion ecommerce, platform lab і case evidence вже в репозиторії. Дані мають дати й межі. |
| 10. CTR/snippets | ЗБЕРЕЖЕНО / DATA GATE | Без масового переписування Title. FAQ schema не означає гарантії rich result; average position не є єдиним місцем у Google. |
| 11. Technical | SOURCE PASS / LIVE HTML PASS | 90 canonical маршрутів; exact-release check виявив відставання production. Справжні edge 301, field CWV і Google index status не оголошено виконаними. |
| 12. Internal linking | РЕАЛІЗОВАНО / SOURCE PASS | `contextual-links.json`, 38 джерел / 160 керованих переходів; загальний build-аудит 5 538 посилань. |
| 13. Моніторинг | ЧИННИЙ / DATA BLOCKED | Дублі задач не створювалися. Щотижнева перевірка шести міст уже є; свежі GSC-метрики заблоковані тарифом. |
| 14. Відповідальні | РОЗДІЛЕНО | Код/QA — у PR; дозволи, бізнес-факти, зовнішні акаунти/публікації — власник; відгуки — реальні клієнти. |
| 15. Спринти | ПРОВЕДЕНО ПОВТОРНЕ ПРИЙМАННЯ | Не запускаємо реалізовані S0–S5 з нуля. Offsite та наступні порівнянні вимірювання лишаються окремим потоком. |
| 16. DoD | ЧАСТКОВО ЗАКРИТО | Технічні тести окремо від main/production, GSC, field CWV, реальних leads і зовнішніх доказів. |
| 17. STOP rules | ДОТРИМАНО | Немає нових doorway, фейкових кейсів/офісів/відгуків, купівлі посилань чи обіцянки TOP1 за строк. |
| 18. Джерела | ЗБЕРЕЖЕНО | Датовані source/evidence файли, дані live HTTP, workflow і офіційні Google/GitHub документи нижче. |

## Умови завершення, які ще потрібні

- **Публікація:** окреме погодження merge/release, оскільки попереднє обмеження власника забороняє автоматично змінювати main/production. Нова версія включатиме ще не опублікований PR #19: перед релізом перевірити сумісність lead handler і провести окремо дозволену TEST-заявку з підтвердженням отримання. Mock не замінює цю перевірку.
- **GSC:** відновити підключення або надати експорт Performance (query/page/date/device/country) та URL Inspection шести міст. Не купувати підписку автоматично. До цього не змінювати intent map за старими цифрами.
- **Зовнішні докази:** дві реальні завершені роботи, роль MAX SITE, URL, матеріали та дозвіл; окремі добровільні відгуки. Benish, BigWish та інші заявки не є завершеними кейсами.
- **Публікації:** підтверджені профілі/контакти/доступи і дозвіл на конкретні звернення або витрати. Чернетки вже підготовлено.
- **Справжні 301:** alias contract у `seo/redirects.csv` лишається pending-edge-layer. Не маскувати HTML canonical/refresh під HTTP 301 і не змінювати DNS без узгодженого migration window.
- **Результат Google:** наступні зіставні періоди, перевірка вибраних Google canonical та справжніх organic leads. Оцінювати фіксовані запити, країну/пристрій і конверсії, а не одну середню позицію.

## Джерела правил

- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/essentials/spam-policies
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow

## Перед публікацією

Перевірити diff фінального PR, його quality job і desktop/mobile artifacts; синхронізуватися з новими змінами main без force push. Не обходити невдалий test або невідповідний production marker. Після дозволеного релізу перевірити exact revision, sitemap, 90 сторінок, asset hashes і lead-delivery contract. Підтверджений production release має окремий receipt, а не тільки успішний PR build.
