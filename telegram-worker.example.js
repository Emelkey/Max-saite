export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "https://maxsite.ua",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return new Response("Telegram is not configured", { status: 500, headers });
    }

    const payload = await request.json().catch(() => null);

    if (!payload || !payload.fields || !payload.fields.phone) {
      return new Response("Invalid lead", { status: 400, headers });
    }

    const rows = [
      "Нова заявка з сайту MAX SITE",
      `Сторінка: ${payload.pageTitle || ""}`,
      `URL: ${payload.pageUrl || ""}`,
      payload.fields.name ? `Ім'я: ${payload.fields.name}` : "",
      payload.fields.phone ? `Телефон: ${payload.fields.phone}` : "",
      payload.fields.business ? `Ніша: ${payload.fields.business}` : "",
      payload.fields.comment ? `Коментар: ${payload.fields.comment}` : "",
    ].filter(Boolean);

    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: rows.join("\n"),
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      return new Response("Telegram request failed", { status: 502, headers });
    }

    return Response.json({ ok: true }, { headers });
  },
};
