const DEFAULT_ALLOWED_ORIGINS = [
  "https://emelkey.github.io",
];

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitBuckets = new Map();
// Best-effort isolate-local deduplication; not a substitute for Durable Objects/KV.
const deliveries = new Map();
const DELIVERY_TTL_MS = 12 * 60 * 60 * 1000;

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

  return allowedOrigins.includes(origin) ? origin : "";
};

const getCorsHeaders = (request, env) => {
  const allowedOrigin = getAllowedOrigin(request, env);

  return {
    ...(allowedOrigin ? { "Access-Control-Allow-Origin": allowedOrigin } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

const clean = (value) => String(value || "").trim().slice(0, 1000);

const isRateLimited = (request) => {
  const clientAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const recentRequests = (rateLimitBuckets.get(clientAddress) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitBuckets.set(clientAddress, recentRequests);
    return true;
  }

  recentRequests.push(now);
  rateLimitBuckets.set(clientAddress, recentRequests);

  if (rateLimitBuckets.size > 1000) {
    for (const [address, timestamps] of rateLimitBuckets) {
      if (!timestamps.some((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)) {
        rateLimitBuckets.delete(address);
      }
    }
  }

  return false;
};

const buildTelegramText = (payload) => {
  const fields = payload.fields || {};
  const context = payload.context || {};
  const safeUrl = value => { try { const url = new URL(value); return `${url.origin}${url.pathname}`; } catch { return ""; } };
  const rows = [
    "Нова заявка з сайту MAX SITE",
    `Сторінка: ${clean(payload.pageTitle)}`,
    `URL: ${safeUrl(payload.pageUrl)}`,
    fields.name ? `Ім'я: ${clean(fields.name)}` : "",
    fields.phone ? `Телефон: ${clean(fields.phone)}` : "",
    fields.business ? `Ніша: ${clean(fields.business)}` : "",
    fields.comment ? `Коментар: ${clean(fields.comment)}` : "",
    ...["landing_path", "page_type", "city", "service", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "timestamp", "consent_state"].map(key => context[key] ? `${key}: ${clean(context[key]).slice(0, 180)}` : ""),
    context.referrer ? `referrer: ${safeUrl(context.referrer)}` : "",
    context.consent_state === "ads_granted" && context.gclid ? `gclid: ${clean(context.gclid).slice(0, 180)}` : "",
  ];

  return rows.filter(Boolean).join("\n");
};

export default {
  async fetch(request, env) {
    const headers = getCorsHeaders(request, env);
    const requestOrigin = request.headers.get("Origin") || "";

    if (requestOrigin && !getAllowedOrigin(request, env)) {
      return json({ ok: false, error: "origin_not_allowed" }, 403, headers);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, headers);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ ok: false, error: "telegram_not_configured" }, 500, headers);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 20000) {
      return json({ ok: false, error: "payload_too_large" }, 413, headers);
    }

    let payload;
    try {
      if (!request.headers.get("Content-Type")?.includes("application/json")) return json({ok: false, error: "unsupported_media_type"}, 415, headers);
      const reader = request.body?.getReader();
      if (!reader) return json({ok: false, error: "invalid_lead"}, 400, headers);
      const chunks = []; let size = 0;
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 20000) { await reader.cancel(); return json({ok: false, error: "payload_too_large"}, 413, headers); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      payload = JSON.parse(new TextDecoder().decode(bytes));
    } catch { return json({ok: false, error: "invalid_json"}, 400, headers); }

    const contact = typeof payload?.fields?.phone === "string" ? payload.fields.phone.trim() : "";
    const validPhone = /^\+?[\d\s().-]{9,25}$/.test(contact) && contact.replace(/\D/g, "").length >= 9 && contact.replace(/\D/g, "").length <= 15;
    const validMessenger = /^@[a-z][a-z0-9_]{4,31}$/i.test(contact);
    if (!payload || !payload.fields || (!validPhone && !validMessenger) || payload.context?.consent !== true) {
      return json({ ok: false, error: "invalid_lead" }, 400, headers);
    }

    if (clean(payload.website)) {
      return json({ ok: false, error: "spam_rejected" }, 422, headers);
    }

    const formStartedAt = Number(payload.formStartedAt || 0);
    if (formStartedAt && Date.now() - formStartedAt < 800) {
      return json({ ok: false, error: "form_too_fast" }, 422, headers);
    }

    const requestId = typeof payload.requestId === "string" && /^[a-z0-9-]{16,64}$/i.test(payload.requestId) ? payload.requestId : "";
    const now = Date.now();
    for (const [key, delivery] of deliveries) if (now - delivery.created > DELIVERY_TTL_MS) deliveries.delete(key);
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify({fields: payload.fields, pageUrl: payload.pageUrl}))))).map(byte => byte.toString(16).padStart(2, "0")).join("");
    if (requestId && deliveries.has(requestId)) {
      const previous = deliveries.get(requestId);
      if (previous.digest !== digest) return json({ok: false, error: "idempotency_conflict"}, 409, headers);
      const result = await previous.promise;
      return json(result.body, result.status, headers);
    }
    if (isRateLimited(request)) {
      return json(
        { ok: false, error: "rate_limited" },
        429,
        { ...headers, "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)) }
      );
    }

    const deliver = async () => {
    try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: buildTelegramText(payload),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) {
      console.error("Lead delivery failed", {status: response.status});
      return {body: {ok: false, error: "telegram_request_failed"}, status: 502};
    }
    return {body: {ok: true}, status: 200};
    } catch {
      console.error("Lead delivery transport failed");
      return {body: {ok: false, error: "telegram_transport_failed"}, status: 502};
    }
    };
    const promise = deliver();
    if (requestId) {
      if (deliveries.size >= 1000) deliveries.delete(deliveries.keys().next().value);
      deliveries.set(requestId, {created: now, digest, promise});
    }
    const result = await promise;
    if (requestId && result.status !== 200) deliveries.delete(requestId);
    return json(result.body, result.status, headers);
  },
};
