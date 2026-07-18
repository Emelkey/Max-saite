const DEFAULT_ALLOWED_ORIGINS = [
  "https://emelkey.github.io",
  "https://maxsite.ua",
  "https://www.maxsite.ua",
];

const json = (data, status, headers) =>
  Response.json(data, {
    status,
    headers,
  });

const getAllowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin") || "";
  const extraOrigins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowedOrigins = [...DEFAULT_ALLOWED_ORIGINS, ...extraOrigins];

  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};

const getCorsHeaders = (request, env) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(request, env),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
});

const clean = (value) => String(value || "").trim().slice(0, 1000);

const buildTelegramText = (payload) => {
  const fields = payload.fields || {};
  const rows = [
    "Нова заявка з сайту MAX SITE",
    `Сторінка: ${clean(payload.pageTitle)}`,
    `URL: ${clean(payload.pageUrl)}`,
    fields.name ? `Ім'я: ${clean(fields.name)}` : "",
    fields.phone ? `Телефон: ${clean(fields.phone)}` : "",
    fields.business ? `Ніша: ${clean(fields.business)}` : "",
    fields.comment ? `Коментар: ${clean(fields.comment)}` : "",
  ];

  return rows.filter(Boolean).join("\n");
};

export default {
  async fetch(request, env) {
    const headers = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, headers);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ ok: false, error: "telegram_not_configured" }, 500, headers);
    }

    const payload = await request.json().catch(() => null);

    if (!payload || !payload.fields || !clean(payload.fields.phone)) {
      return json({ ok: false, error: "invalid_lead" }, 400, headers);
    }

    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: buildTelegramText(payload),
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      return json({ ok: false, error: "telegram_request_failed" }, 502, headers);
    }

    return json({ ok: true }, 200, headers);
  },
};
