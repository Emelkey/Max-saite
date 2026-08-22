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
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = googleTagUrl;
    document.head.appendChild(script);
  }
};

const trackEvent = (eventName, parameters = {}) => {
  if (!analyticsEnabled) return;

  const safeParameters = {
    page_path: window.location.pathname,
    ...parameters,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, safeParameters);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...safeParameters });
  }
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
  } else if (link.closest(".price-card, .shop-card")) {
    const planCard = link.closest(".price-card, .shop-card");
    const planName = planCard?.querySelector("h3")?.textContent?.trim().slice(0, 60) || "unknown";
    trackEvent("select_plan", { plan_name: planName });
    trackEvent("price_cta", { plan_name: planName });
  } else if (
    link.closest(".work-card, .case-study") &&
    /^https?:\/\//i.test(href)
  ) {
    const caseCard = link.closest(".work-card, .case-study");
    const caseName = caseCard?.querySelector("h2, h3")?.textContent?.trim().slice(0, 80) || "case";
    trackEvent("outbound_case_click", { case_name: caseName });
    trackEvent("portfolio_click", { case_name: caseName });
  } else if (link.matches('[href="#lead"], [href$="#lead"]')) {
    trackEvent("lead_cta_click");
    trackEvent("consultation_click", { link_text: link.textContent.trim().slice(0, 80) });
  }
});

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

  return {
    source: "MAX SITE",
    pageTitle: document.title,
    pageUrl: window.location.href,
    website: getFormValue(form, "website"),
    formStartedAt: Number(form.dataset.formStartedAt || 0),
    fields,
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

const openTelegramFallback = async (text) => {
  try {
    await navigator.clipboard?.writeText(text);
  } catch (error) {
    console.warn("Could not copy Telegram lead text", error);
  }

  const username = telegramConfig.username || "MaxMytt";
  window.location.href = `https://t.me/${username}?text=${encodeURIComponent(text)}`;
};

const sendLead = async (payload) => {
  if (!telegramConfig.endpoint) {
    await openTelegramFallback(buildTelegramText(payload));
    return { fallback: true };
  }

  const response = await fetch(telegramConfig.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Telegram endpoint error: ${response.status}`);
  }

  return response.json().catch(() => ({}));
};

document.querySelectorAll(".lead-form, .compact-form").forEach((form) => {
  form.dataset.formStartedAt = String(Date.now());
  const formType = form.classList.contains("compact-form") ? "compact" : "main";

  const statusElement = document.createElement("p");
  statusElement.className = "form-status";
  statusElement.setAttribute("role", "status");
  statusElement.setAttribute("aria-live", "polite");
  form.appendChild(statusElement);

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
    trackEvent("brief_start", { form_type: formType });
  };

  form.addEventListener("input", trackFormStart);
  form.addEventListener("focusin", trackFormStart);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const button = form.querySelector("button");
    const defaultText = button?.textContent || "Отримати консультацію";
    const payload = buildLeadPayload(form);

    trackEvent("form_submit", { form_type: formType });

    setButtonState(button, "Відправляємо...", true);
    setFormStatus(statusElement, "Надсилаємо заявку…", "sending");

    try {
      const result = await sendLead(payload);
      if (result.fallback) {
        trackEvent("lead_fallback_open", { form_type: formType });
        setButtonState(button, "Відкрито Telegram", true);
        setFormStatus(statusElement, "Надішліть підготовлений текст у Telegram.", "fallback");
      } else {
        trackEvent("generate_lead", {
          form_type: formType,
          delivery_method: "endpoint",
          lead_source: "website",
        });
        trackEvent("brief_complete", {
          form_type: formType,
          delivery_method: "endpoint",
        });
        setButtonState(button, "Заявку відправлено", true);
        setFormStatus(statusElement, "Дякуємо! Заявку успішно відправлено.", "success");
      }
      form.reset();
    } catch (error) {
      console.error(error);
      trackEvent("lead_delivery_error", { form_type: formType });
      await openTelegramFallback(buildTelegramText(payload));
      setButtonState(button, "Відкрито Telegram", true);
      setFormStatus(statusElement, "Автоматична відправка недоступна. Надішліть заявку у Telegram.", "error");
    }

    setTimeout(() => {
      setButtonState(button, defaultText, false);
    }, 2600);
  });
});
