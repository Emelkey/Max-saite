# MASTER 4.0 — форми, GA4, consent і безпека лідів

Дата технічної перевірки: 2026-09-07.

Статус публікації Worker: **не підтверджено**. Під час preflight Cloudflare OAuth
token був протермінований і оновлення входу не вдалося. Потрібен окремий
авторизований вхід; GitHub Pages deploy не оновлює Worker або Durable Objects.

## Що реалізовано в репозиторії

- `requestId` форми є технічним `lead_id`. Після підтвердженої доставки однаковий `lead_id` передається у `lead_form_success` і `generate_lead`.
- `generate_lead` спрацьовує тільки після HTTP `2xx` та явного `{"ok": true}` від Worker. Відкриття Telegram не є успішною заявкою і не створює `generate_lead`.
- Події успішної заявки містять тільки дозволені технічні параметри: тип сторінки, місто, послугу, тип форми, метод доставки, джерело та `lead_id`. Ім’я, телефон, коментар, email і довільні URL відсікає allowlist.
- `click_phone` містить місце кліку та контекст сторінки, але не номер телефону.
- Помилки endpoint розділено на `endpoint_4xx`, `endpoint_5xx`, `endpoint_timeout`, `endpoint_network` та `endpoint_unacknowledged`. Жодна з них не створює конверсію.
- Після невдалої доставки форма не показує хибний успіх: користувач може повторити відправлення, явно скопіювати текст заявки кнопкою та відкрити звичайне Telegram-посилання. Контактні дані не включаються в Telegram URL; буфер обміну заповнюється лише після окремої дії користувача.
- Рекламний `gclid` не зберігається і не передається без `ad_storage` та `ad_user_data`. UTM не зберігаються між сторінками без `analytics_storage`; значення з поточної landing URL може супроводжувати добровільно відправлену форму.
- Відкликання cookie-згоди очищає з `sessionStorage` як `gclid`, так і всі збережені UTM.
- Worker вимагає валідний UUID `lead_id`, контакт, checkbox-згоду, допустимі довжини полів, JSON до 20 KB; також перевіряє Origin, honeypot і мінімальний час заповнення.
- У production-конфігурації репозиторію підготовлено два SQLite Durable Objects: окремий gate ліміту запитів за хешем IP і окремий gate доставки за `lead_id`. Після окремого Worker deploy вони дають розподілене обмеження, серіалізацію повторів, конфлікт при зміні payload та 12-годинне дедуплікування підтверджених успіхів без збереження контактних полів.
- Дедуплікування не є гарантією exactly-once доставки: якщо Telegram прийняв повідомлення, але відповідь втрачено або отримано timeout, повтор може створити дублікат. `lead_id` у повідомленні допомагає виявити такий неоднозначний випадок.
- У Telegram-повідомлення додається `lead_id`, щоб звірити бізнес-заявку з GA4 без передачі контактних даних у GA4.
- API-відповіді мають `Cache-Control: no-store`, `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`, `Referrer-Policy: no-referrer` та `X-Content-Type-Options: nosniff`.

## Матриця очікуваної поведінки

| Сценарій | Статус для користувача | GA4 |
|---|---|---|
| Worker повернув `2xx`, `ok: true` | «Заявку відправлено» | один `lead_form_success` і один `generate_lead` з тим самим `lead_id` |
| Worker повернув `4xx` | повтор + Telegram fallback | `lead_form_error`, без `generate_lead` |
| Worker повернув `5xx` або не підтвердив JSON | повтор + Telegram fallback | `lead_form_error`, без `generate_lead` |
| timeout / network error | повтор + Telegram fallback | `lead_form_error`, без `generate_lead` |
| endpoint відсутній у непублічній збірці | показ ручного fallback без автоматичної навігації або очищення форми; копіювання та Telegram — окремі явні дії | без `generate_lead`; `lead_fallback_open` лише при явному відкритті Telegram |
| повтор з тим самим `lead_id` і payload після підтвердженого успіху | повернення збереженого успіху, без повторної відправки в Telegram | браузер фіксує успіх один раз у поточній формі |
| Telegram міг прийняти повідомлення, але підтвердження втрачено | помилка й ручний retry; можливий дублікат, який звіряється за `lead_id` | без конверсії до отримання `ok: true` |
| той самий `lead_id`, інший payload | HTTP 409 | помилка, без конверсії |

## Автоматичний контроль

- Unit-тести Worker перевіряють validation, Origin/CORS, payload bytes, honeypot, Telegram error body, безпечний retry, `lead_id`, isolate fallback, Durable Object rate limit і дедуплікування.
- Unit-тести frontend перевіряють no-PII allowlist, очищення URL, consent gating та класифікацію `4xx` / `5xx` / timeout.
- Контрактний тест перевіряє рівно один Google tag і один consent bootstrap на кожному зі 110 HTML-документів, правильний Measurement ID та порядок consent-before-tag.
- Playwright перевіряє success/error UI, той самий `lead_id` у двох конверсійних подіях, відсутність PII, Telegram fallback і очищення attribution після відкликання згоди.
- Wrangler 4.129.0 `deploy --dry-run` успішно зібрав Worker і розпізнав обидва Durable Object bindings; dry-run нічого не публікував.
- Ці тести входять у наявний GitHub Actions quality gate. Вони не доводять, що зовнішні production bindings і Telegram secret уже розгорнуто.

## Обов’язкові зовнішні release gates

1. Розгорнути `telegram-worker.js` з `wrangler.toml` у правильному Cloudflare account. До deploy перевірити, що `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID` задані тільки як Worker secrets, не в Git.
2. Перший deploy застосує migration `v1` і створить `LeadDeliveryGate` та `LeadRateGate`. Не видаляти migration з історії після першого production deploy.
3. Виконати один контрольний тестовий lead із production форми, звірити один Telegram message та один `lead_id`, після чого перевірити Realtime/DebugView GA4. Не використовувати персональні дані реального клієнта в тесті.
4. У GA4 позначити `generate_lead` основною key event. `click_phone` можна позначити окремою key event, але не прирівнювати її до підтвердженого ліда у звітах.
5. Імпортувати `generate_lead` у Google Ads як primary conversion; `click_phone` — як secondary/observational, доки немає підтвердження фактичного дзвінка.
6. Перевірити, що production property має Measurement ID `G-TS8DMMKK34`. Налаштування GA4/Ads виконується в зовнішніх акаунтах і не може бути підтверджене лише кодом репозиторію.

## Команди перевірки та rollout Worker

Локально, без публікації:

```bash
npm test
npm run build
npx playwright test tests/e2e/site.spec.js --grep 'lead response|consent choices'
npx --yes wrangler@latest deploy --dry-run --outdir /private/tmp/max-site-worker-dryrun
```

Перед production deploy звірити Cloudflare account і наявність secrets (значення командою не виводяться):

```bash
npx --yes wrangler@latest whoami
npx --yes wrangler@latest deployments list
npx --yes wrangler@latest secret list
```

Лише у правильному Cloudflare account і в погоджене release window:

```bash
npx --yes wrangler@latest deploy
```

Безпечні post-deploy probes, які не створюють заявку:

```bash
curl -i -X OPTIONS 'https://max-site-leads.emelkey777.workers.dev/' \
  -H 'Origin: https://maxsite.com.ua' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'
curl -i 'https://max-site-leads.emelkey777.workers.dev/' \
  -H 'Origin: https://maxsite.com.ua'
```

Очікування: OPTIONS — `204` з дозволеним production origin; GET — `405`; обидві відповіді — `Cache-Control: no-store` і `X-Content-Type-Options: nosniff`. Після цього потрібен рівно один контрольний submit через UI, бо тільки він перевіряє секрети й реальну доставку Telegram.

## Сумісність і ризики Worker deploy

- Новий frontend сумісний зі старим Worker: якщо відповідь ще не містить `lead_id`, frontend використовує власний `requestId` після підтвердженого `ok: true`.
- Новий Worker сумісний із попереднім production frontend цієї гілки, бо той уже надсилає UUID `requestId`, контакт і явну form consent.
- Якщо Durable Object bindings відсутні, Worker продовжить працювати через isolate-local fallback, але розподілений rate limit/dedup не діятиме. Це слід вважати degraded mode, а не виконаним production gate.
- Migration `v1` створює нові SQLite namespaces. Перед deploy треба звірити історію live Worker: якщо поза репозиторієм уже існує migration з тегом `v1` або класи з такими назвами, спочатку узгодити новий унікальний tag/class mapping, не перезаписувати навмання.
- Durable Object lifecycle migration незворотна як звичайний source rollback. Після першого deploy зберігати migration/bindings у конфігурації; rollback коду не повинен намагатися видалити namespaces.
- Ліміт `5` різних заявок за `5` хвилин застосовується до хешу IP. Для офісного NAT або активної команди це може дати `429`; після перших реальних даних перевірити false positives до зміни порога.
- Worker deploy окремий від GitHub Pages deploy. Публікація лише Pages не активує Durable Objects і не оновлює lead endpoint.

## Site response headers: обмеження GitHub Pages

`.htaccess` із production package не застосовується GitHub Pages. Тому HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy` та `Permissions-Policy` для HTML потрібно додати на фактичному edge/proxy (наприклад, Cloudflare Response Header Transform Rules або Worker) і перевірити реальними HTTP response headers після релізу. Не позначати цей пункт виконаним за наявністю `.htaccess` у ZIP.

Рекомендований мінімум після compatibility review:

```text
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP спочатку запускати в `Content-Security-Policy-Report-Only`, перевірити Google tag, форми, шрифти, зображення та месенджери, і лише потім переводити в enforcing mode. `includeSubDomains` та `preload` не додавати без окремого аудиту піддоменів. GitHub Pages migration потрібна тільки якщо edge-рівень не може дати перевірні redirects/headers/logs.

## Відкат

- Frontend і Worker розгортати одним release window: старий Worker сумісний із новим frontend завдяки frontend fallback на власний `requestId`, але Durable Object захист починає діяти тільки після Worker deploy.
- У разі помилки повернути попередню версію Worker-коду; не видаляти Durable Object namespaces і не відкочувати consent до fabricated `granted`.
- Durable Objects зберігають тільки digest, статус, timestamp і технічний `lead_id`; alarms видаляють rate state за 5 хвилин і delivery state за 12 годин.

Cloudflare configuration reference: https://developers.cloudflare.com/workers/wrangler/configuration/#durable-objects
