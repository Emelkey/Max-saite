# TRACK-01 · карта конверсій і атрибуції

**Статус:** історичне застосування цілей `VERIFIED` 24.09 22:09–22:09:49 EEST за S4; campaign-specific goal і GA4 link окремо перевірені нативно 27.09 (S5); рекламна атрибуція `PENDING_REAL_AD_ATTRIBUTION`.

| Результат | Ідентифікатор/подія | Роль | Умова та прогалина |
|---|---|---|---|
| Доставлена заявка | GA4 `generate_lead`, Ads action `7714121659` | Єдина основна form-ціль кампанії через custom goal `6459211132` | Одна подія після підтвердженого успіху чинного handler. Стан action/goal і реальні Ads-конверсії перечитати. |
| Клік телефону | GA4 `click_phone`, Ads action `7714121656` | Secondary / діагностика | Не називати розмовою; S4 `primary_for_goal=false`, custom goal не містить його. |
| Клік Telegram/Viber | Event name/Ads ID невідомі | Secondary / діагностика | Відкриття месенджера не підтверджує повідомлення. |
| Перегляд/початок форми/scroll | Поточні IDs невідомі | Допоміжна аналітика | Не оптимізувати як лід. |
| Підтверджений дзвінок | Журналу немає | Потенційна окрема основна ціль | Лише за достовірним обліком, не на підставі `tel:`. |
| QUALIFIED / WON | Захищений журнал власника | Майбутній offline outcome | Імпорт лише фактичних підтверджених записів і підтримуваного маршруту. |

GA4 property `548154976`, Measurement ID `G-TS8DMMKK34` і link до правильного Ads customer підтверджені S5; S8 точково звірив production config `maxsite.com.ua` з repo main `76b77a7`. S4 receipt: дві дії ENABLED, `primary_for_goal=false`, `SUBMIT_LEAD_FORM / WEBSITE` у кампанії `biddable=false`, custom goal з одним `generate_lead`; бюджет і `TARGET_SPEND` не змінювались. Ця custom-goal конфігурація означає, що сам action-level secondary flag не дає підстави назвати ціль неактивною. Не створювати дубль однойменного native/GA4 signal.

S5 нативно підтвердив GA4 stream `max` / `G-TS8DMMKK34`, link до Ads customer `778-225-5000`, і campaign-specific goal `MAX SITE | generate_lead | campaign 24122973025` рівно з однією дією `MAX SITE (web) generate_lead`. Recent conversions немає. GA4 lead-acquisition 30.08–26.09: Direct 1, Organic Search 1, Paid Search 0 new leads. Це не доводить ні відсутності реальних звернень, ні єдиної причини нуля Ads. S12 локально підтвердив, що явний GA4 `page_location` у `assets/consent.js` обрізає query навіть за consent — конкретний конфігураційний дефект. Історичний ефект на Ads attribution ще не виміряний.

S10: власник підтвердив **дві доставлені через форму заявки в Telegram**. Їхній статус `REAL/TEST`, дати, технічні IDs і рекламне джерело не надані. Це підтвердження доставки, а не доказ business lead, GA4 receipt, Ads conversion або збігу з двома GA4 new leads. Кваліфікація й оплата теж невідомі.

S12 локальний fix перевіряє dataLayer config calls. При першому consent grant на вже відкритій landing page `send_page_view:false` не replay початковий page_view; це не гарантує зміну GA4 session source на Paid Search. Живий Tag Assistant/DebugView та consented click-to-lead cohort потрібні після release, перш ніж робити висновок про ingestion або Ads attribution.

S11 owner screenshot показує повідомлення форми 24.08 і 02.09 з `google/cpc` та click-ID параметрами в URL, 11.09 без них, окремий QA test 22.08 і тестоподібний запис. Скріншот не встановлює, які саме повідомлення належать до власникових двох і чи є вони `REAL/TEST`; не переносити контакти, повні URL чи click IDs у звіт. 02.09 входить до S2 вікна, 24.08 — ні; обидва позначені paid повідомлення сталися до міграції цілей 24.09. Мітки — слід для перевірки, не підтверджений Ads attribution receipt.

S6 connector повернув 14 conversion-action rows; для `MAX SITE (web) generate_lead` вказано `ENABLED`, `primary_for_goal=false`, `MANY_PER_CLICK`, без дати recent conversion, але ID відсутній у цьому **prewrite** export. S13 нативно змінив Count action `7714121659` з `Every` на `One`; refresh підтвердив `One`, campaign custom goal лишився тільки `generate_lead`, budget 300 грн/день. Це зменшує ризик повторного рахунку в Ads, але не доводить event deduplication або live attribution. Шість інших дій із `primary_for_goal=true` в S6 inventory не означають, що кампанія оптимізується за всіма: S5/S13 campaign-specific custom goal тільки з `generate_lead`.

**Перевірки для закриття:** повний conversion-action inventory (ID, source/type, category, status, counting, attribution/lookback, import date, campaign/custom-goal membership), зв'язок GA4↔Ads, tag/consent, дозволені `gclid`/`gbraid`/`wbraid` і UTM, click-to-lead cohort, production-only GA4 фільтрація, conversion lag. Події в GA4 й повідомлення Telegram не повинні автоматично дорівнювати Ads conversions.

**Кодова умова:** використати чинну точку успіху форми та наявний непрозорий `lead_id`; не змінювати API-контракт заради аналітики. Подія рівно один раз на підтверджене прийняття, без повторів на retry/reload/duplicate submit. Analytics failure не блокує доставку. Ім'я, телефон, email, коментар і Telegram username не передаються в GA4/dataLayer/URL/Git. Згода не обходиться; тестові події не потрапляють у бойові конверсії.

**Тестова матриця:** локально/preview success, validation error, 5xx/timeout, повторна відправка; перевірити одну подію лише у success і нуль у всіх failure. Ізолювати від бойового Telegram/Ads. Власник уже підтвердив робочу доставку, тому повторна production TEST-заявка потрібна лише за нової технічної необхідності й чинного конкретного дозволу. Прямий TEST без рекламного кліку не доводить Ads attribution.

S8 перевірив на поточній production-ревізії: lead event у коді виникає тільки після HTTP `ok` і matching `lead_id`, є guard від повтору; targeted unit suite 10/10. Consent за замовчуванням denied, revocation очищає attribution, preview origins виключені. Десктопний шлях до `#lead` зберіг тестовий UTM. Production submit, mobile visual і GA4 receipt не виконувались; ці статуси не можна підміняти code/test PASS.
