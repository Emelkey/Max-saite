# MAX SITE — карта подій і lead attribution

**Оновлено:** 02.09.2026

**GA4 у поточному коді:** `G-TS8DMMKK34`. Зіставлення з потрібним ресурсом у кабінеті — окрема перевірка перед релізом; історичний скриншот містив інший ID. Не замінювати навмання.
**Заборона:** ім’я, телефон, текст коментаря та інші PII не передаються у GA4.

| Подія | Тригер | Безпечні параметри |
|---|---|---|
| `lead_form_start` | перший focus/input у формі | `form_type`, `page_type`, `page_path` |
| `lead_form_submit` | валідована спроба відправки | `form_type`, `page_type`, `page_path` |
| `lead_form_success` | успішна відповідь endpoint, один раз | `form_type`, `page_type`, `delivery_method` |
| `lead_form_error` | validation, honeypot або delivery error | `form_type`, `page_type`, `error_type` |
| `click_phone` | клік `tel:` | `link_location`, `page_path` |
| `click_telegram` | клік `t.me` | `page_path` |
| `click_viber` | клік `viber:` | `page_path` |
| `click_email` | клік `mailto:` | `page_path` |
| `pricing_cta_click` | CTA у тарифній картці | `plan_name`, `page_path` |
| `portfolio_open` | внутрішній перехід до кейсу | `destination_path` |
| `case_live_site_click` | перехід на live site із кейсу | `case_name` |
| `city_service_click` | service link із city hub | `city`, `destination_path` |
| `scroll_75` | перше досягнення 75% | `page_type`, `page_path` |

## Поля lead payload

Endpoint отримує контактні дані через HTTPS POST; вони потрібні для відповіді на заявку, але не для GA4. Разом із заявкою передаються `request_id`, `landing_path`, `page_type`, `city`, `service`, очищений `referrer`, UTM-набір, ISO `timestamp`, `consent` і `consent_state`. UTM зберігаються лише у `sessionStorage` поточної сесії. `gclid` зберігається та передається тільки за одночасно наданих `ad_storage` і `ad_user_data`; після відкликання видаляється. Недоступне сховище не блокує форму.

GA4 отримує лише дозволений перелік параметрів. URL сторінки/реферера очищені від query/hash, телефон, ім’я й коментар не додаються до подій. Не передавайте особисті дані також у самих рекламних UTM. Consent Mode використовує початковий denied до конфігурації Google; advanced mode може надсилати cookieless сигнали. Це не твердження про повну відсутність мережевих запитів до згоди.

`click_phone` означає натискання, не підтверджений дзвінок. `lead_form_success` означає HTTP success + `{ok:true}` від endpoint, не продаж. Старі сумісні `generate_lead`/`phone_click` ще існують: не імпортувати їх разом із новими як дублікати однієї конверсії. Ключові події та імпорт у Ads перевіряються у відповідних кабінетах окремо від тестів коду.

## Spam та зовнішня межа

Код Worker є в `telegram-worker.js`, конфігурація — `wrangler.toml`. Реалізовано серверну валідацію, honeypot, ліміт 20 KB, таймаут Telegram, rate limit 5/5 хвилин та idempotency request ID + hash payload. Rate limit і кеш повторів локальні для isolate, не розподілені: перезапуск або інший isolate обнуляє/не бачить їх. Для глобальної гарантії потрібне окреме сховище та перевірка конфігурації Cloudflare.

Unit-тести підміняють Telegram; браузерні тести підміняють endpoint. Вони не надсилають реальних заявок. GitHub Pages публікує тільки сайт — Worker потребує окремого деплою, безпечної перевірки секретів і погодженої тестової заявки з підтвердженням отримання. Production-доставку та GA4 DebugView не позначати виконаними за результатом mock-тестів.
