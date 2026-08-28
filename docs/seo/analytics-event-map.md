# MAX SITE — карта подій і lead attribution

**Оновлено:** 28.08.2026  
**GA4:** `G-TS8DMMKK34`  
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

Endpoint отримує PII лише в захищеному payload форми. Разом із заявкою передаються: `landing_path`, `page_type`, `city`, `service`, `referrer`, UTM-набір, `gclid`, ISO `timestamp` і `consent`. Значення UTM/gclid зберігаються лише у `sessionStorage` поточної сесії.

## Spam та зовнішня межа

Клієнтський код має native validation і honeypot. Код Cloudflare Worker не входить до цього репозиторію, тому server-side rate limit, idempotency, validation і safe logging треба окремо підтвердити в репозиторії/налаштуваннях Worker. До такого підтвердження це контрольований відкритий ризик, а не заявлена як виконана серверна функція.
