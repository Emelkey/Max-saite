# PR 02 — technical fixes

**Branch:** `seo/master-2-0-technical-fixes`  
**Base:** `main` (після злиття PR 01 diff автоматично звузиться до цього пакета)

## Змінені URL

- усі 96 HTML-форм: accessibility labels, input hints і явна згода;
- sitewide `/script.js`: нормалізована GA4 taxonomy, attribution і spam honeypot;
- усі згадки бренду FO-DEZ приведено до одного написання;
- canonical URL не змінювалися; нові SEO URL не створювалися.

## SEO/measurement before → after

| Контроль | До | Після |
|---|---|---|
| Події MASTER 2.0 | неповний набір | усі 13 обов’язкових подій |
| Lead attribution | page URL + поля форми | landing/page type/city/service/referrer/UTM/gclid/timestamp/consent |
| GA4 PII | поля форми не відправлялися | правило збережене й задокументоване |
| Consent | не в усіх формах | required checkbox у 96/96 формах |
| Honeypot | створювався | створюється та реально блокує submit |
| Назва кейсу | `Fo Dez` / `FO-DEZ` | `FO-DEZ` |

## Перевірки

- `node tools/audit-site.js`: 78/78 sitemap URL, 0 errors;
- `git diff --check`: pass;
- malformed input attribute scan: 0;
- manual code review: success event fires once; validation/delivery/spam errors розділені; PII не передається у `trackEvent`.

## Ризики

- Cloudflare Worker є зовнішньою межею: server validation/rate limit не можна підтвердити цим репозиторієм.
- Нові обов’язкові consent checkboxes можуть трохи знизити submit rate, але прибирають неявну згоду.
- Browser/GA4 DebugView verification виконується у фінальному QA PR після підняття локального production package.

## Screenshots

Відтворювані desktop/mobile screenshots сервісної сторінки з формою: `artifacts/screenshots/master-2-0/service-desktop.jpg` і `service-mobile.jpg`. Browser QA перевіряє required validation, consent і keyboard focus.

## Final test evidence

- Final repository has 0 form-accessibility errors.
- GA4 contract verifies all 13 events and rejects contact PII keys.
- Playwright verifies native validation, required consent and keyboard movement between fields.

## Rollback

Revert коміту цього PR повертає попередню taxonomy й markup форм. URL, canonical, sitemap і контентні маршрути не змінюються; data migration не потрібна.
