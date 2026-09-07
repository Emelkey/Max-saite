# MASTER 4.0 — evidence: калькулятор вартості сайту

Дата перевірки: 2026-09-06.

## Результат

- Раніше окремого публічного route калькулятора не було.
- Додано indexable route `/kalkulyator-vartosti-saytu/` з унікальними title, description, canonical і H1.
- Розрахунок використовує тільки опубліковані стартові орієнтири: 10 500, 19 700, 29 000 і 34 300 грн.
- Додатковим вимогам не присвоюються вигадані доплати. Вони формують перелік питань для ручного кошторису.
- Результат доступний через `role=status`, `aria-live=polite`; форма працює клавіатурою та має `noscript` fallback.
- Schema graph обмежений перевірними сутностями Organization, WebSite, WebPage і BreadcrumbList. SoftwareApplication, Offer, Review та AggregateRating навмисно не додані.
- Є прямі посилання на бриф/шаблони, чекліст запуску, TCO CSV, пояснення ціни та релевантні сторінки послуг.
- Результат доступний без форми та контакту: його можна скопіювати, передати через Telegram або відкрити в email-клієнті.
- Числовий строк навмисно не вигадується. Калькулятор показує, що календар формується після перевірки контенту, сторінок, інтеграцій і погоджень.

## Перевірка

`node --test tests/unit/cost-calculator-contract.test.js`

`node tools/generate-sitemaps.js && node tools/seo-check.js routes && node tools/seo-check.js metadata && node tools/seo-check.js canonicals && node tools/seo-check.js sitemap && node tools/seo-check.js schema && node tools/seo-check.js links`

Калькулятор дає стартовий орієнтир, а не цінову оферту. Точний кошторис залишається owner/sales gate після брифу й фіксації обсягу.
