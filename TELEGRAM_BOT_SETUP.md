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

## Test

Submit any form on the site. The message in Telegram should include:

- page title
- page URL
- name
- phone
- business niche, if present
- comment
