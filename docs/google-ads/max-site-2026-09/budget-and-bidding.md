# BUDGET-01 · бюджет, економіка, ставки

**Статус:** `NEEDS_OWNER_DECISION` для економічного CPC; `PREPARED` для безпечного контролю. S2: поле конектора `campaign_budget_returned=300.0`, метадані поля неоднозначні; S4: 24.09 native readback підтвердив 300 UAH/day; S5: 27.09 native Ads знову показує **300 UAH/day**, Maximize Clicks та max CPC limit checkbox **OFF**. До будь-якого запису знову перевірити native amount/units/history, shared budgets, automations і bid adjustments. Нинішні 300 грн не поширювати на всі дні історії.

**Принцип витрат:** не підвищувати підтверджений сумарний середньоденний бюджет MAX SITE; не копіювати 300 грн в кожну групу або нову кампанію. Середньоденний budget не є жорсткою денною межею: приклад ТЗ для незмінних 300 грн — за стандартних умов до 600 грн окремого дня і 9 120 грн повного місяця (30,4×). Це не гарантія довільного 28-денного вікна чи billed total з податками.

## Економіка, яку має заповнити власник

| Змінна | Значення зараз | Джерело, потрібне для розрахунку |
|---|---|---|
| Ціна проєкту за сегментом | `UNKNOWN` | Договір/оплачений проєкт. |
| Прямі витрати виконання | `UNKNOWN` | Облік власника. |
| Частка маржинального внеску, допустима для залучення | `UNKNOWN` | Рішення власника. |
| P(оплата \| кваліфікований лід) | `UNKNOWN` | Підтверджений журнал результатів. |
| P(кваліфікований лід \| рекламний клік) | `UNKNOWN` | Ідентична Ads cohort + кваліфікація. |

`Contribution = ціна − прямі витрати`; `Max_CAC = Contribution × погоджена частка`; `Max_CPQL = Max_CAC × P(оплата | qualified)`; `Economic_CPC = Max_CPQL × P(qualified | ad click)`. Сирі форми, phone clicks і GA4 events не є кваліфікованими лідами. Рекламну CPA форми рахувати окремо. Через невідомі inputs **жодне число не позначено прибутковим CPC/CPQL/CAC**.

S2: середній CPC 72,11 грн за 28 днів, 66,37 грн за 13–19.09, 50,70 грн за 20–26.09. Це спостереження, не рекомендація ceiling. S5 підтвердив max CPC limit **OFF**; Manual CPC — альтернативний контрольований варіант після аналізу, не обов'язковий перезапуск. Рекомендоване конкретне значення ceiling зараз `UNKNOWN` до економіки, bid adjustments і прогнозу обсягу. Надто низька межа може майже зупинити аукціони; bid adjustments можуть застосуватися поверх ceiling. Не перемикати на Maximize Conversions/Target CPA лише через виконану конфігурацію цілі; потрібні надійні реальні сигнали.

S5 billing summary: September current-month net cost 12 730,20 грн, August net cost 8 204,86 грн. Це календарні billing-періоди, їх не зіставляти прямо з 28-денним S2 served cost 11 537,4643 грн. Активний auto-payment та balance видно; явного payment block на переглянутому екрані немає, але повні payment restrictions ще не доведені.

S7 після паузи старого RSA, S9 після exact DIY negative, S13 після Count `One` та S14 після paired landing migration показали бюджет **300 UAH/day**; кампанія після S14 `Eligible/Search`. Нативні Automated Rules: 0; Scripts: один `MAX SITE conversion audit 2026-09-24`, Enabled, frequency `—`, last run 24.09 22:09 success. Запланованої частоти немає у відображенні. Auto-apply recommendations лишаються неперевіреними. Жодне правило чи скрипт у цьому пакеті не створювали й не запускали в Ads; `budget-guard-dry-run.js` — лише локальний repo/outputs файл.

## Чернетка правил, усі `DRY_RUN=true`

| Подія | Дія зараз | Умова автоматичної дії |
|---|---|---|
| Зміна бюджету/ставок стороннім правилом, disapproval, недоступна сторінка | Зафіксувати діагноз і повідомити уповноваженому власнику | Пауза лише за окремою погодженою політикою. |
| Витрачено 2× підтвердженого Max_CPQL без qualified lead | Перегляд сегмента з урахуванням lag | Max_CPQL нині `UNKNOWN`; автоматична пауза вимкнена. |
| Витрачено 3× Max_CPQL | Кандидат на погоджену паузу/переробку | Потрібні підтверджені дані й політика; не математична гарантія збитку. |
| Дані відсутні/неповні/застарілі | Fail-closed щодо мутацій, журнал помилки | Ніколи самовільно не вмикати чи підвищувати бюджет. |

## Виконуваний read-only guard

`budget-guard-dry-run.js` — готовий до ручного Preview в Google Ads Scripts **тільки після свіжого нативного звіряння**; у Ads його не встановлено, не запускали й не планували. `DRY_RUN=true` незмінний у конфігурації, а код узагалі не має write/email/URL-fetch методів. Він перевіряє exact customer `7782255000`, account `MAX SITE`, campaign `24122973025` / `MAXSITE WEB`, UAH, часовий пояс `Europe/Kiev` або `Europe/Kyiv`, Enabled, не shared DAILY budget рівно 300 грн, `TARGET_SPEND` і CPC ceiling `null`. Некоректна/відсутня відповідь дає `BLOCKED` із JSON execution log і exception; успіх — `PASS_READ_ONLY`. Додатково записує **спостережений** yesterday served cost/clicks/conversions, без трактування денного бюджету як жорсткої межі.

У коді явно `NOT_EVALUATED` для policy/landing/auto-apply та порогів 2×/3× Max_CPQL. Перші потребують окремих native перевірок; другі — затвердженої власником економіки й приватного журналу qualified leads. Скрипт моніторить лише allowlisted кампанію і **не доводить сумарний бюджет усіх типів кампаній акаунта**. Жодних повідомлень або автопауз немає. Локально перевірено `node --check` і mock run: baseline PASS та 5 fail-closed сценаріїв; це не Ads Scripts Preview/readback.

Методи звірено з [AdsApp Account](https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_account), [CampaignSelector](https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_campaignselector), [Budget](https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_budget), [CampaignBidding](https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_campaignbidding), [Stats](https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_stats) та [Execution Logs](https://developers.google.com/google-ads/scripts/docs/troubleshooting/execution-logs), перевірка 27.09.2026. `Budget.getAmount()` і `Stats.getCost()` повертають account currency, не micros; скрипт не множить їх на мільйон.
