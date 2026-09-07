const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".main-nav a");

const analyticsConfig = window.MAX_SITE_ANALYTICS || {};
const analyticsEnabled = analyticsConfig.enabled === true;

const isValidGa4Id = (value) => /^G-[A-Z0-9]+$/i.test(value || "");
const isValidGtmId = (value) => /^GTM-[A-Z0-9]+$/i.test(value || "");

const loadAnalytics = () => {
  if (!analyticsEnabled) return;

  if (isValidGtmId(analyticsConfig.tagManagerId)) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(
      analyticsConfig.tagManagerId
    )}`;
    document.head.appendChild(script);
    return;
  }

  if (isValidGa4Id(analyticsConfig.measurementId)) {
    const googleTagUrl = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      analyticsConfig.measurementId
    )}`;
    const existingGoogleTag = document.querySelector(
      `script[src="${googleTagUrl}"]`
    );

    if (existingGoogleTag && typeof window.gtag === "function") return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args) => window.dataLayer.push(args);
    window.gtag("js", new Date());
    window.gtag("config", analyticsConfig.measurementId, {
      anonymize_ip: true,
      ...window.MAX_SITE_GOOGLE_PAGE,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = googleTagUrl;
    document.head.appendChild(script);
  }
};

const trackEvent = (eventName, parameters = {}) => {
  if (!analyticsEnabled) return;

  // Explicit schema prevents future callers from leaking form fields or arbitrary URLs.
  const allowedParameters = new Set(["page_type", "city", "service", "form_type", "error_type", "delivery_method", "lead_source", "link_location", "messenger", "plan_name", "case_name", "destination_path", "lead_id"]);
  const safeParameters = {
    page_path: window.location.pathname,
    ...Object.fromEntries(Object.entries(parameters).filter(([key]) => allowedParameters.has(key)).map(([key, value]) => [key, String(value).split(/[?#]/)[0].slice(0, 100)])),
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, safeParameters);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...safeParameters });
  }
};

const PAGE_CONTEXT = (() => {
  const path = window.location.pathname;
  const cityMatch = path.match(/^\/mista\/stvorennya-sajtiv-([^/]+)\//);
  const serviceMap = [
    ["/stvorennya-saytiv/", "website_development"],
    ["/stvorennya-saytu-dlya-biznesu/", "business_website"],
    ["/stvorennya-landing-page/", "landing_page"],
    ["/stvorennya-internet-mahazynu/", "ecommerce"],
    ["/stvorennya-korporatyvnoho-saytu/", "corporate_website"],
    ["/stvorennya-program/", "custom_software"],
    ["/seo-prosuvannya/", "seo"],
    ["/google-ads/", "google_ads"],
  ];
  const service = serviceMap.find(([prefix]) => path.startsWith(prefix))?.[1] || "";

  return {
    page_type: cityMatch
      ? "city_hub"
      : path === "/portfolio/" ? "portfolio_index"
      : path === "/blog/" ? "blog_index"
      : path.startsWith("/nishi/") ? (path === "/nishi/" ? "niche_index" : "niche")
      : path.startsWith("/portfolio/")
        ? "case"
        : path.startsWith("/blog/")
          ? "article"
          : service
            ? "service"
            : path === "/"
              ? "home"
              : "supporting",
    city: cityMatch?.[1] || "",
    service,
  };
})();

const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"];

const getAttribution = () => {
  const params = new URLSearchParams(window.location.search);
  const attribution = {};

  ATTRIBUTION_KEYS.forEach((key) => {
    const advertisingAllowed = window.MAX_SITE_CONSENT?.ad_storage === "granted" && window.MAX_SITE_CONSENT?.ad_user_data === "granted";
    const analyticsAllowed = window.MAX_SITE_CONSENT?.analytics_storage === "granted";
    const storageAllowed = key === "gclid" ? advertisingAllowed : analyticsAllowed;
    const currentValue = params.get(key);

    if (!storageAllowed) {
      try { sessionStorage.removeItem(`max_site_${key}`); } catch {}
      // The current landing-page value can accompany a consented form submission,
      // but it is not persisted across pages before the matching storage consent.
      attribution[key] = key === "gclid" ? "" : (currentValue || "").slice(0, 180);
      return;
    }

    let stored = "";
    try {
      if (currentValue) sessionStorage.setItem(`max_site_${key}`, currentValue.slice(0, 180));
      stored = sessionStorage.getItem(`max_site_${key}`) || "";
    } catch { /* Storage denial must never break navigation or lead delivery. */ }
    attribution[key] = (currentValue || stored).slice(0, 180);
  });

  return attribution;
};

loadAnalytics();

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll('a[href="#lead"]').forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href") || "";

  if (href.startsWith("tel:")) {
    trackEvent("click_phone", {
      page_type: PAGE_CONTEXT.page_type,
      city: PAGE_CONTEXT.city,
      service: PAGE_CONTEXT.service,
      link_location: link.closest(".floating-contact")
        ? "mobile_sticky_bar"
        : link.closest(".main-nav")
          ? "mobile_navigation"
          : link.closest("header")
            ? "header"
            : "page",
    });
    trackEvent("phone_click", {
      link_location: link.closest(".floating-contact")
        ? "mobile_sticky_bar"
        : link.closest(".main-nav")
          ? "mobile_navigation"
          : link.closest("header")
            ? "header"
            : "page",
    });
  } else if (href.startsWith("viber:")) {
    trackEvent("click_viber");
    trackEvent("messenger_click", { messenger: "viber" });
  } else if (href.includes("wa.me/") || href.includes("api.whatsapp.com/")) {
    trackEvent("click_whatsapp");
    trackEvent("messenger_click", { messenger: "whatsapp" });
  } else if (href.includes("t.me/")) {
    trackEvent("click_telegram");
    trackEvent("messenger_click", { messenger: "telegram" });
  } else if (href.includes("instagram.com/")) {
    trackEvent("click_instagram");
  } else if (href.startsWith("mailto:")) {
    trackEvent("click_email");
  } else if (link.closest(".price-card, .shop-card")) {
    const planCard = link.closest(".price-card, .shop-card");
    const planName = planCard?.querySelector("h3")?.textContent?.trim().slice(0, 60) || "unknown";
    trackEvent("select_plan", { plan_name: planName });
    trackEvent("price_cta", { plan_name: planName });
    trackEvent("pricing_cta_click", { plan_name: planName });
  } else if (
    link.closest(".work-card, .case-study, .portfolio-case") &&
    /^https?:\/\//i.test(href)
  ) {
    const caseCard = link.closest(".work-card, .case-study, .portfolio-case");
    const caseName = caseCard?.querySelector("h1, h2, h3")?.textContent?.trim().slice(0, 80) || "case";
    trackEvent("outbound_case_click", { case_name: caseName });
    trackEvent("portfolio_click", { case_name: caseName });
    trackEvent("case_live_site_click", { case_name: caseName });
  } else if (/^\/portfolio\//.test(href)) {
    trackEvent("portfolio_open", { destination_path: new URL(href, window.location.origin).pathname });
  } else if (
    PAGE_CONTEXT.page_type === "city_hub" &&
    /^\/(?:stvorennya|sajty|seo|google-ads)/.test(href)
  ) {
    trackEvent("city_service_click", {
      city: PAGE_CONTEXT.city,
      destination_path: new URL(href, window.location.origin).pathname,
    });
  } else if (link.matches('[href="#lead"], [href$="#lead"]')) {
    trackEvent("lead_cta_click");
    trackEvent("consultation_click", { link_text: link.textContent.trim().slice(0, 80) });
  }
});

let scroll75Tracked = false;
window.addEventListener(
  "scroll",
  () => {
    if (scroll75Tracked) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY / scrollable >= 0.75) {
      scroll75Tracked = true;
      trackEvent("scroll_75", { page_type: PAGE_CONTEXT.page_type });
    }
  },
  { passive: true }
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const observeAnalyticsView = (selector, eventName, parameterBuilder = () => ({})) => {
  const elements = document.querySelectorAll(selector);
  if (!elements.length || !("IntersectionObserver" in window)) return;

  const analyticsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        trackEvent(eventName, parameterBuilder(entry.target));
        analyticsObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );

  elements.forEach((element) => analyticsObserver.observe(element));
};

observeAnalyticsView("#pricing", "view_pricing");
observeAnalyticsView(".work-card, .case-study", "view_case", (card) => ({
  case_name: card.querySelector("h2, h3")?.textContent?.trim().slice(0, 80) || "case",
}));

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const telegramConfig = window.MAX_SITE_TELEGRAM || {};

const sanitizedUrl = (value) => {
  try { const url = new URL(value); return `${url.origin}${url.pathname}`; } catch { return ""; }
};

const getFormValue = (form, name) => {
  const field = form.elements[name];
  return field && "value" in field ? field.value.trim() : "";
};

const buildLeadPayload = (form) => {
  const fields = {
    name: getFormValue(form, "name"),
    phone: getFormValue(form, "phone"),
    business: getFormValue(form, "business"),
    comment: getFormValue(form, "comment"),
  };

  const attribution = getAttribution();
  const consent = form.elements.consent ? Boolean(form.elements.consent.checked) : false;

  return {
    source: "MAX SITE",
    pageTitle: document.title,
    pageUrl: sanitizedUrl(window.location.href),
    requestId: form.dataset.requestId,
    website: getFormValue(form, "website"),
    formStartedAt: Number(form.dataset.formStartedAt || 0),
    fields,
    context: {
      landing_path: window.location.pathname,
      page_type: PAGE_CONTEXT.page_type,
      city: PAGE_CONTEXT.city,
      service: PAGE_CONTEXT.service,
      referrer: sanitizedUrl(document.referrer).slice(0, 500),
      ...attribution,
      timestamp: new Date().toISOString(),
      consent,
      consent_state: window.MAX_SITE_CONSENT?.ad_storage === "granted" && window.MAX_SITE_CONSENT?.ad_user_data === "granted" ? "ads_granted" : "ads_denied",
    },
  };
};

const buildTelegramText = (payload) => {
  const rows = [
    "Нова заявка з сайту MAX SITE",
    `Сторінка: ${payload.pageTitle}`,
    `URL: ${payload.pageUrl}`,
    payload.fields.name ? `Ім'я: ${payload.fields.name}` : "",
    payload.fields.phone ? `Телефон: ${payload.fields.phone}` : "",
    payload.fields.business ? `Ніша: ${payload.fields.business}` : "",
    payload.fields.comment ? `Коментар: ${payload.fields.comment}` : "",
  ];

  return rows.filter(Boolean).join("\n");
};

const setButtonState = (button, text, disabled = false) => {
  if (!button) return;
  button.textContent = text;
  button.disabled = disabled;
};

const setFormStatus = (statusElement, message, state = "") => {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.dataset.state = state;
};

const appendTelegramFallback = (statusElement, payload, formType) => {
  if (!statusElement) return;
  const text = buildTelegramText(payload);
  const username = telegramConfig.username || "MaxMytt";
  const feedback = document.createElement("span");
  feedback.className = "lead-fallback-feedback";
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "btn btn-ghost";
  copyButton.textContent = "Скопіювати текст заявки";
  copyButton.addEventListener("click", async () => {
    try {
      if (typeof navigator.clipboard?.writeText !== "function") throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      feedback.textContent = " Текст скопійовано. Відкрийте Telegram, вставте його та надішліть повідомлення.";
    } catch {
      feedback.textContent = " Автоматичне копіювання недоступне. Скопіюйте текст із поля нижче та надішліть його в Telegram.";
      let manualText = statusElement.querySelector("textarea[data-lead-fallback-text]");
      if (!manualText) {
        manualText = document.createElement("textarea");
        manualText.readOnly = true;
        manualText.rows = 6;
        manualText.dataset.leadFallbackText = "true";
        manualText.setAttribute("aria-label", "Текст заявки для копіювання");
        manualText.value = text;
        statusElement.append(manualText);
      }
      manualText.focus();
      manualText.select();
    }
  });
  const link = document.createElement("a");
  // Keep personal lead details out of URLs, referrers and GA4 outbound link_url.
  // Copying is a separate explicit action; opening Telegram is not a delivery.
  link.href = `https://t.me/${username}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Відкрити Telegram";
  link.addEventListener("click", () => {
    trackEvent("lead_fallback_open", {
      form_type: formType,
      page_type: PAGE_CONTEXT.page_type,
    });
  });
  statusElement.append(" ", copyButton, " ", link, feedback);
};

const sendLead = async (payload) => {
  if (!telegramConfig.endpoint) {
    return { fallback: true };
  }

  let response;
  try {
    response = await fetch(telegramConfig.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    const deliveryError = new Error("Lead endpoint request failed");
    deliveryError.code = ["AbortError", "TimeoutError"].includes(error?.name)
      ? "endpoint_timeout"
      : "endpoint_network";
    throw deliveryError;
  }

  if (!response.ok) {
    const deliveryError = new Error(`Telegram endpoint error: ${response.status}`);
    deliveryError.code = response.status >= 500 ? "endpoint_5xx" : "endpoint_4xx";
    throw deliveryError;
  }

  const result = await response.json().catch(() => null);
  if (result?.ok !== true) {
    const deliveryError = new Error("Lead delivery was not acknowledged");
    deliveryError.code = "endpoint_unacknowledged";
    throw deliveryError;
  }
  return {
    ...result,
    // Backward-compatible while the strengthened Worker is being deployed.
    lead_id: result.lead_id || payload.requestId,
  };
};

document.querySelectorAll(".lead-form, .compact-form").forEach((form) => {
  form.dataset.formStartedAt = String(Date.now());
  const formType = form.classList.contains("compact-form") ? "compact" : "main";

  const statusElement = document.createElement("p");
  statusElement.className = "form-status";
  statusElement.setAttribute("role", "status");
  statusElement.setAttribute("aria-live", "polite");
  form.appendChild(statusElement);

  const attribution = getAttribution();
  const hiddenValues = {
    landing_path: window.location.pathname,
    page_type: PAGE_CONTEXT.page_type,
    city: PAGE_CONTEXT.city,
    service: PAGE_CONTEXT.service,
    referrer: sanitizedUrl(document.referrer).slice(0, 500),
    ...attribution,
    timestamp: new Date().toISOString(),
    consent_state: window.MAX_SITE_CONSENT?.ad_storage === "granted" && window.MAX_SITE_CONSENT?.ad_user_data === "granted" ? "ads_granted" : "ads_denied",
  };

  Object.entries(hiddenValues).forEach(([name, value]) => {
    let field = form.elements[name];
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    field.value = value;
  });

  if (!form.elements.website) {
    const honeypot = document.createElement("input");
    honeypot.type = "text";
    honeypot.name = "website";
    honeypot.tabIndex = -1;
    honeypot.autocomplete = "off";
    honeypot.setAttribute("aria-hidden", "true");
    honeypot.className = "form-honeypot";
    form.appendChild(honeypot);
  }

  const trackFormStart = () => {
    if (form.dataset.analyticsStarted === "true") return;
    form.dataset.analyticsStarted = "true";
    trackEvent("form_start", { form_type: formType });
    trackEvent("lead_form_start", { form_type: formType, page_type: PAGE_CONTEXT.page_type });
    trackEvent("brief_start", { form_type: formType });
  };

  form.addEventListener("input", trackFormStart);
  form.addEventListener("focusin", trackFormStart);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.dataset.submitting === "true") return;

    if (getFormValue(form, "website")) {
      trackEvent("lead_form_error", {
        form_type: formType,
        page_type: PAGE_CONTEXT.page_type,
        error_type: "spam_honeypot",
      });
      setFormStatus(statusElement, "Заявку не відправлено. Оновіть сторінку та спробуйте ще раз.", "error");
      return;
    }

    if (!form.reportValidity()) {
      trackEvent("lead_form_error", {
        form_type: formType,
        page_type: PAGE_CONTEXT.page_type,
        error_type: "validation",
      });
      return;
    }

    const button = form.querySelector("button");
    const defaultText = button?.textContent || "Отримати консультацію";
    form.dataset.requestId ||= crypto.randomUUID();
    const payload = buildLeadPayload(form);
    form.dataset.submitting = "true";
    form.dataset.leadSuccessTracked = "false";

    trackEvent("form_submit", { form_type: formType });
    trackEvent("lead_form_submit", { form_type: formType, page_type: PAGE_CONTEXT.page_type });

    setButtonState(button, "Відправляємо...", true);
    setFormStatus(statusElement, "Надсилаємо заявку…", "sending");

    try {
      const result = await sendLead(payload);
      if (result.fallback) {
        setButtonState(button, "Надіслати напряму", false);
        setFormStatus(statusElement, "Автоматичне надсилання недоступне. Скопіюйте текст заявки та надішліть його в Telegram.", "fallback");
        appendTelegramFallback(statusElement, payload, formType);
      } else {
        if (form.dataset.leadSuccessTracked !== "true") {
          form.dataset.leadSuccessTracked = "true";
          trackEvent("lead_form_success", {
            form_type: formType,
            page_type: PAGE_CONTEXT.page_type,
            city: PAGE_CONTEXT.city,
            service: PAGE_CONTEXT.service,
            delivery_method: "endpoint",
            lead_id: result.lead_id,
          });
          trackEvent("generate_lead", {
            form_type: formType,
            page_type: PAGE_CONTEXT.page_type,
            city: PAGE_CONTEXT.city,
            service: PAGE_CONTEXT.service,
            delivery_method: "endpoint",
            lead_source: "website",
            lead_id: result.lead_id,
          });
          trackEvent("brief_complete", {
            form_type: formType,
            delivery_method: "endpoint",
          });
        }
        setButtonState(button, "Заявку відправлено", true);
        setFormStatus(statusElement, "Дякуємо! Заявку успішно відправлено.", "success");
        form.reset();
        delete form.dataset.requestId;
      }
    } catch (error) {
      console.error(error);
      trackEvent("lead_delivery_error", { form_type: formType });
      trackEvent("lead_form_error", {
        form_type: formType,
        page_type: PAGE_CONTEXT.page_type,
        error_type: error?.code || "delivery",
      });
      setButtonState(button, "Спробувати ще раз", false);
      setFormStatus(statusElement, "Заявку не підтверджено. Спробуйте ще раз або надішліть її напряму.", "error");
      appendTelegramFallback(statusElement, payload, formType);
    }
    form.dataset.submitting = "false";

    setTimeout(() => {
      setButtonState(button, defaultText, false);
    }, 2600);
  });
});
