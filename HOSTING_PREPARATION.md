# MAX SITE — підготовка до хостингу та майбутнього домену

## Що підготовлено

Основна версія сайту залишається налаштованою на чинну адресу GitHub Pages. Для звичайного хостингу створено окремий збирач, який:

- переносить сайт із підпапки `/Max-saite/` у корінь хостингу;
- підставляє майбутній домен у canonical, Open Graph, Schema.org, sitemap і robots;
- може додати Search Console verification token;
- може ввімкнути GA4 або GTM після отримання реального ID;
- може підставити HTTPS endpoint автоматичного надсилання заявок;
- формує готову папку й ZIP-архів;
- не включає службові файли, документацію, Git або конфігурацію Cloudflare Worker.

## Пакет до придбання домену

До появи домену використовується staging-пакет із `noindex`, щоб тимчасова адреса хостингу не створювала дублікати в Google:

```bash
node tools/build-hosting-package.js --staging
```

Результат:

- `release/max-site-staging/`
- `release/max-site-staging.zip`

## Пакет після придбання домену

Приклад для майбутнього домену:

```bash
node tools/build-hosting-package.js --site-url https://example.com
```

За наявності підтверджених інтеграцій:

```bash
node tools/build-hosting-package.js \
  --site-url https://example.com \
  --gtm GTM-XXXXXXX \
  --search-console-token GOOGLE_TOKEN \
  --form-endpoint https://max-site-leads.example.workers.dev
```

Замість GTM можна використати `--ga4 G-XXXXXXXXXX`. Одночасно GA4 і GTM через параметри збирача не додаються: якщо використовується GTM, GA4 налаштовується всередині контейнера.

## Порядок запуску

1. Обрати хостинг і завантажити staging-пакет для технічної перевірки.
2. Не відкривати staging-адресу для індексації: пакет уже містить `noindex`.
3. Придбати домен і підключити SSL.
4. Створити production-пакет із фактичним HTTPS-доменом.
5. Завантажити вміст папки `max-site-production` у корінь сайту.
6. Перевірити головну, форми, 404, sitemap і robots на реальному домені.
7. Підтвердити сайт у Search Console та надіслати sitemap.
8. Після перевірки аналітики й форми запускати рекламу.

## Важливо

- Не завантажувати production-пакет із вигаданим або тимчасовим доменом.
- Не переносити вручну старі canonical з GitHub Pages.
- Не передавати Telegram Bot Token у HTML або JavaScript сайту.
- Telegram Bot Token і Chat ID зберігаються тільки як секрети серверного endpoint.
- Commit, push і deploy виконуються лише після окремої команди власника.
