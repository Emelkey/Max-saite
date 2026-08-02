# PR 2 — основні SEO-сторінки MAX SITE

Дата перевірки: 2026-08-02

## Межі PR

PR 2 створено окремою гілкою `seo-core-service-pages` поверх гілки PR 1 `seo-architecture-maxsite`. Цей PR не змінює гілку PR 1, не зливається в `main` і не запускає production-деплой.

## Нові комерційні сторінки

| URL | Title | H1 | Robots |
|---|---|---|---|
| `/stvorennya-saytiv/` | Створення сайтів під ключ в Україні \| MAX SITE | Створення сайтів під ключ в Україні | index, follow |
| `/stvorennya-landing-page/` | Створення Landing Page під ключ \| MAX SITE | Створення Landing Page під ключ | index, follow |
| `/stvorennya-saytu-dlya-biznesu/` | Створення сайту для бізнесу під ключ \| MAX SITE | Створення сайту для бізнесу під ключ | index, follow |
| `/stvorennya-korporatyvnoho-saytu/` | Створення корпоративного сайту під ключ \| MAX SITE | Створення корпоративного сайту під ключ | index, follow |
| `/stvorennya-internet-mahazynu/` | Створення інтернет-магазину під ключ \| MAX SITE | Створення інтернет-магазину під ключ | index, follow |

Кожна сторінка має унікальний description, один H1, self-canonical, Open Graph, Google tag, BreadcrumbList, Service, WebPage та FAQPage schema. Видимий контент FAQ відповідає JSON-LD.

## Контент і перелінковка

- На кожній новій сторінці 900+ видимих слів унікального українського контенту.
- Додані блоки для аудиторії, бізнес-завдань, складу робіт, можливостей, процесу, строків, ціни, портфоліо, переваг, FAQ і заявки.
- Header, footer, головна, блог, міські й нішеві сторінки перелінковані на нові канонічні URL.
- Sitemap містить усі п’ять нових URL і не містить чотири замінені legacy URL.

## Legacy URL і ризик редиректів

| Старий URL | Новий canonical |
|---|---|
| `/stvorennya-sajtiv-pid-klyuch/` | `/stvorennya-saytiv/` |
| `/stvorennya-lendingiv/` | `/stvorennya-landing-page/` |
| `/korporatyvni-sajty/` | `/stvorennya-korporatyvnoho-saytu/` |
| `/internet-magazyn-pid-klyuch/` | `/stvorennya-internet-mahazynu/` |

Старі сторінки залишені доступними з `noindex, follow` і canonical на нові URL. GitHub Pages не підтримує справжні серверні 301 для окремих шляхів. Перед остаточним SEO-перенесенням на інфраструктуру з правилами редиректів потрібно налаштувати чотири 301 і лише після перевірки в Search Console прибирати legacy HTML.

## Автоматична перевірка

- Sitemap URL: 40.
- Базові SEO-перевірки: 40/40.
- Внутрішні посилання: 3540.
- Биті внутрішні посилання: 0.
- Дублікати title/description серед індексованих сторінок: 0.
- Canonical та og:url розходження: 0.
- Некоректні H1 або JSON-LD: 0.
- Google tag: рівно один на кожній індексованій сторінці.
- Production-пакет: 66 HTML-файлів, 40 URL у sitemap, аудит без помилок.
- JavaScript syntax і `git diff --check`: без помилок.

## Візуальна перевірка

- Desktop: 1280×720, горизонтального переповнення немає, desktop-навігація видима.
- Mobile: 390×844, горизонтального переповнення немає, desktop-навігація прихована, burger видимий.
- Чекбокс згоди: 18×18 px, не розтягується стилями текстових полів.
- Плаваючі CTA прибрані з нових SEO-сторінок, тому не перекривають hero та цінову картку.

Знімки:

- `docs/qa/pr2-core-desktop.png`
- `docs/qa/pr2-core-mobile.png`

## Після погодження

1. Спочатку перевірити й об’єднати PR 1.
2. Перебазувати або змінити base PR 2 на `main` після PR 1.
3. Повторити аудит і ручну перевірку diff.
4. Production-деплой виконувати окремою командою після злиття.
