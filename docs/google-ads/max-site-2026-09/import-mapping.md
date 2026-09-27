# CSV та імпорт: mapping і запобіжники

**Стан:** `PREPARED`, internal mapping only. Ці CSV не є готовим файлом Google Ads Editor і не завантажувались. Перед завантаженням треба отримати поточний нативний inventory, обрати конкретний імпортер, підтвердити його колонки/типи, зробити preview та зафіксувати diff.

| Файл | Зміст | Mapping, який треба підтвердити |
|---|---|---|
| `campaign-keyword-map.csv` | 26 рядків: 24 початкові кандидатні/існуючі та 2 додані legacy ledger rows. Target landing Exact+Phrase мають `LIVE_ENABLED_VERIFIED_NO_IMPORT`, paired legacy Exact+Phrase — `LIVE_PAUSED_VERIFIED_NO_IMPORT` за S14; решта не для сліпого імпорту | Native per-keyword criterion IDs ще потрібні: S6 64 criterion rows із null ID/status, S14 UI підтвердив group/text/match/status, але не IDs. S7 49 позитивів/27 Enabled/22 Paused — **pre-S14**. |
| `negative-keywords.csv` | 4 запити S2: 2 технічні BROAD `ALREADY_PRESENT_NO_IMPORT`, DIY Exact `APPLIED_VERIFIED_NO_IMPORT`, Москва `REVIEW_NO_IMPORT` | S6: 236 campaign negatives і UI S7: 249 усіх рівнів — prewrite. Перша DIY спроба відхилена auto-review; після окремого «робимо» S9 native save/readback пройшов. CSV — ledger, не інструкція повторного імпорту. |
| `responsive-search-ads.csv` | 2 наявні RSA — canonical та landing; S7 старий третій RSA paused, але не включений як import-рядок | Existing ad IDs, ad group IDs, Final URL, headline 1–15, description 1–4; S7 canonical Enabled/Eligible/Approved, S14 landing RSA `824944536200` Enabled/Eligible після keyword migration. Не створювати дубль. |
| `assets.csv` | Рівно 11 існуючих S6 asset IDs: 1 call, 6 approved sitelinks, 4 approved callouts; усі `EXISTING_NO_IMPORT` | Точні URL/тексти з connector export. Association/eligibility/call hours ще окремо перевірити. Нових asset за цим CSV не створювати. |
| `baseline-*.csv` | Датовані source-derived витяги S2 | Тільки evidence; **не** Ads Editor import. |

**Правила:** ніяких формульних префіксів у довільному тексті; UTF-8; ID і телефони — текст, витрати — decimal UAH; один логічний ключ `(customer,campaign,ad_group,keyword,match)` або `(ad_group,ad_id)` на об'єкт. Наявні сутності редагувати тільки за точним ID після readback; нові — draft/paused до eligibility та окремого запуску. Preview має показати відсутність дублів і відсутність непогодженої зміни бюджету. Імпорт файлу не дорівнює публікації; після застосування потрібен live readback.

**ADS-02 фактичний стан:** S7 підтвердив canonical `825024420905` Enabled/Eligible/Approved із правильним Final URL і попереднім трафіком; старий `820333812947` Paused, readback пройдено, бюджет 300 UAH/day. Старий RSA мав оманливе загальне price claim, тому автоматично re-enable його як rollback не можна. Наступні Ads CSV лишаються `NO_IMPORT` до schema/preview та дозволу.

**SEARCH-01 фактичний стан:** S9 за конкретним дозволом власника нативно додав `[как создать сайт для продажи одежды]` на рівні Campaign/Exact. Prewrite фільтри не знайшли дублів чи відповідного positive keyword; після `super+r` рядок зберігся, кампанія Eligible, бюджет 300 UAH/day. Ніякого повторного імпорту цього рядка не робити. Інші негативи з CSV не застосовані.

S14 нативно парно переніс існуючі landing Exact+Phrase `створення лендінгу`: target group `199901337563` Enabled/Eligible і target RSA/URL перевірені до паузи legacy, legacy `Max web` `204759032331` matching пара Paused після target readback. Фінальний refresh підтвердив 4 keyword стани, кампанію Eligible/Search, 300 грн/день і незмінну custom goal. CSV — ledger; повторний імпорт цих чотирьох рядків заборонений. S4 manifest IDs залишаються історичними, бо S14 UI не показав criterion IDs.
