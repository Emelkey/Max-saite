# Telegram lead bot setup

This site is static, so the Telegram bot token must never be placed in browser JavaScript.
Use the Cloudflare Worker in `telegram-worker.js` as the protected webhook.

## Required secrets

- `TELEGRAM_BOT_TOKEN` from BotFather
- `TELEGRAM_CHAT_ID` for the user, group, or channel that should receive leads

## Deploy

```bash
npx wrangler login
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler deploy
```

After deploy, copy the Worker URL into `assets/telegram-config.js`:

```js
window.MAX_SITE_TELEGRAM = {
  endpoint: "https://max-site-leads.<account>.workers.dev",
  username: "MaxMytt",
};
```

## Message format

Notifications and the manual-copy fallback show only the essentials:

```text
MAX SITE • нова заявка
Ім'я: Тест
Телефон: +380000000000
Запит: Створення сайту
Потрібен каталог товарів
```

The request contains the business/project field and the complete accepted comment.
Empty fields and identical business/comment values are omitted. Page metadata,
URLs, lead IDs, attribution, timestamps and consent are not displayed. The lead
payload, consent handling, analytics and delivery acknowledgement are unchanged.

## Test

Run `node --test tests/unit/lead-delivery.test.js`. Telegram calls are mocked;
this does not submit live leads. The formatter change requires a separate
Cloudflare Worker deployment after review; publishing the static site alone
only updates the manual-copy fallback.
