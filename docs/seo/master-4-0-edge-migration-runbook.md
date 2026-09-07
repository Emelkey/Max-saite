# MAX SITE MASTER 4.0 — контрольована edge-міграція

Дата підготовки: 2026-09-06
Статус: **підготовлено, не активовано**

## Навіщо цей окремий етап

Поточний production працює на GitHub Pages. Ця платформа не дає проєкту
керованих точних HTTP 301 та повного набору response headers. Репозиторій тому
містить окремий Cloudflare Pages candidate, але його не можна вмикати разом зі
зміною URL, без preview-перевірки або без окремого дозволу на DNS cutover.

Cloudflare Pages читає `_redirects` і `_headers` із кореня готового static output.
Правила не застосовуються до відповіді Pages Functions/advanced Worker, тому при
додаванні Functions їх треба перенести в код middleware. Джерела:

- https://developers.cloudflare.com/pages/configuration/redirects/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/custom-domains/

## Підготовлений контракт

- [`edge/cloudflare-pages/_redirects`](../../edge/cloudflare-pages/_redirects) —
  шість точних 301: `/index.html`, чотири legacy service aliases і `privacy.html`.
- [`edge/cloudflare-pages/_headers`](../../edge/cloudflare-pages/_headers) — HSTS,
  `nosniff`, Referrer Policy, Permissions Policy, X-Frame-Options та CSP
  `Report-Only`.
- [`seo/redirects.csv`](../../seo/redirects.csv) — джерело правди для маршруту,
  власника, причини й статусу.
- `node tools/verify-edge-contract.js --config-only` блокує розбіжність registry
  та Cloudflare files без мережевих запитів.

## Gate 0 — рішення перед міграцією

1. Зафіксувати production commit SHA і зберегти GitHub Pages deployment як rollback.
2. Підтвердити, що на тому самому релізі не змінюються canonical URL, контентні
   власники запитів або структура sitemap.
3. Зібрати поточний GSC export, GA4 baseline, DNS records і TTL.
4. Перевірити право на Cloudflare zone та Pages project; не передавати API tokens
   у репозиторій.
5. Визначити вікно cutover і відповідального за rollback.

## Gate 1 — immutable build і preview

1. Виконати `npm ci && npm run seo:check && npm run test:browser`.
2. Зібрати рівно той самий пакет `release/max-site-production`.
3. Скопіювати `_redirects` та `_headers` із `edge/cloudflare-pages/` у корінь
   build output лише в Cloudflare deployment pipeline.
4. Розгорнути branch preview без custom domain.
5. Перевірити в preview response вбудований `X-Robots-Tag: noindex, nofollow`;
   для приватної перевірки додатково закрити preview через Cloudflare Access.
   Не залишати індексовану копію production.
6. Перевірити 1:1 parity усіх 88 sitemap URL, assets, canonical, schema, форми,
   телефон, Telegram, GA4 consent і `generate_lead`.

## Gate 2 — headers compatibility

1. CSP спочатку залишається `Content-Security-Policy-Report-Only`.
2. Перевірити в Chrome/Safari mobile та desktop: сторінки, Google tag, consent,
   form endpoint і всі CTA без console CSP violations, що блокували б функцію.
3. HSTS не має `includeSubDomains` або `preload`: їх можна додати лише після
   окремого аудиту всіх піддоменів.
4. Після щонайменше семи днів чистого report-only моніторингу CSP можна винести
   в окремий PR для enforcement.

## Gate 3 — DNS cutover (лише окреме підтвердження)

1. Знизити TTL завчасно, не видаляючи rollback records.
2. Додати custom domain до Cloudflare Pages і дочекатися активного TLS.
3. Змінити лише hosting target. Не міняти URL, контент або analytics ID.
4. Перевірити apex, `www`, HTTP→HTTPS, canonical host і відсутність redirect loop.
5. Запустити workflow **Cloudflare Pages post-deploy edge contract**. Він робить
   лише read-only GET, перевіряє шість точних ланцюжків `301 → 200`, canonical
   кінцевих сторінок і шість security headers та
   зберігає immutable JSON evidence.
6. Live preview gate перевірити окремою командою з фактичним preview origin:

   ```bash
   node tools/verify-edge-contract.js --base-url=https://maxsite.com.ua --preview-origin=https://BRANCH.PROJECT.pages.dev --version=unique-cutover-preview-check
   ```

   Замінити `BRANCH.PROJECT` на перевірений hostname. Без `--preview-origin`
   JSON прямо фіксує, що live preview noindex **не перевірено**. HTTP-перевірка
   вимагає `X-Robots-Tag: noindex, nofollow` на головній і калькуляторі; мережеві
   збої також зберігаються як невдалі спостереження, а не втрачають звіт.

## Rollback

Rollback запускається при масових 404/5xx, loop, недоступній формі, відсутній GA4
або canonical mismatch. Повернути попередні DNS records, перевірити GitHub Pages
deployment SHA, повторити sitemap smoke test і записати часові межі інциденту.
Файли legacy aliases не видаляти в тому самому релізі: вони є безпечним fallback.

## Моніторинг після cutover

| Коли | Контроль |
|---|---|
| 0–2 години | 200 sitemap URLs, 301 registry, форми, GA4 Realtime, 404/5xx |
| День 1–2 | edge logs, CSP reports, GSC URL Inspection для priority routes |
| День 7 | crawl errors, canonical choice, organic landing pages, lead delivery |
| День 14 | GSC Coverage/Pages, CWV, redirect hits; рішення про завершення rollback window |

Міграція завершена лише коли 14-денний моніторинг не показує системних помилок.
