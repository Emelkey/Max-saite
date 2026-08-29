# MAX SITE SEO MASTER 2.0 — risk register

| ID | Ризик | Рівень | Запобіжник | Rollback/дія |
|---|---|---|---|---|
| R-01 | Масове створення doorway city × service pages | P0 | SERP Decision Gate + similarity/content-quality tests | Залишити URL `noindex`, прибрати із sitemap |
| R-02 | Втрата сигналів через зміну URL | P0 | Freeze чинних slugs/canonical; redirect map | Відкотити canonical, відновити старий URL |
| R-03 | Фейкова локальна присутність | P0 | Заборона LocalBusiness/адрес без доказу | Видалити твердження/schema, повторити validation |
| R-04 | Непідтверджені результати/відгуки | P0 | Evidence field для кожної метрики | Прибрати цифру/відгук до появи джерела |
| R-05 | Подвійний GA4 tag і дубльовані події | P0 | Рівно один Google tag у HTML; loader не додає другий; automated source scan | Повернути останню стабільну analytics версію |
| R-06 | Канібалізація homepage/money/city/niche | P1 | Keyword → URL map; ownership rule | Об’єднати намір через canonical/internal links |
| R-07 | Thin/duplicate city content | P1 | Similarity threshold ≤ 0.55 + local-usefulness checklist | Noindex проблемну city page |
| R-08 | Форми перестали доставляти lead | P0 | Browser tests + endpoint smoke test без реальних PII | Відкотити JS, залишити Telegram fallback |
| R-09 | PII потрапляє у GA4 | P0 | Event allowlist; payload tests | Вимкнути подію, випустити hotfix |
| R-10 | Sitemap містить noindex/canonical aliases | P0 | Automated sitemap gate | Перегенерувати sitemap |
| R-11 | Регресія CWV/mobile/accessibility | P1 | Lighthouse + mobile browser tests | Відкотити важкі assets/components |
| R-12 | Зовнішні посилання низької якості | P1 | Manual outreach, relevance/evidence gate | Не публікувати/не купувати автоматичні пакети |
