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
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args) => window.dataLayer.push(args);
    window.gtag("js", new Date());
    window.gtag("config", analyticsConfig.measurementId, {
      anonymize_ip: true,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      analyticsConfig.measurementId
    )}`;
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
  const label = (link.textContent || link.getAttribute("aria-label") || "")
    .trim()
    .slice(0, 80);

  if (href.startsWith("tel:")) {
    trackEvent("contact_click", { contact_method: "phone", link_label: label });
  } else if (href.startsWith("viber:")) {
    trackEvent("contact_click", { contact_method: "viber", link_label: label });
  } else if (href.includes("t.me/")) {
    trackEvent("contact_click", { contact_method: "telegram", link_label: label });
  } else if (href.includes("instagram.com/")) {
    trackEvent("contact_click", { contact_method: "instagram", link_label: label });
  } else if (link.matches('[href="#lead"], [href$="#lead"]')) {
    trackEvent("lead_cta_click", { link_label: label });
  } else if (link.matches(".work-actions a, .case-actions a")) {
    trackEvent("portfolio_click", { link_label: label });
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const button = form.querySelector("button");
    const defaultText = button?.textContent || "Отримати консультацію";
    const payload = buildLeadPayload(form);

    trackEvent("lead_submit", {
      form_type: form.classList.contains("compact-form") ? "compact" : "main",
    });

    setButtonState(button, "Відправляємо...", true);

    try {
      const result = await sendLead(payload);
      trackEvent("lead_result", {
        delivery_method: result.fallback ? "telegram_fallback" : "endpoint",
        result: "success",
      });
      setButtonState(button, result.fallback ? "Відкрито Telegram" : "Заявку відправлено", true);
      form.reset();
    } catch (error) {
      console.error(error);
      trackEvent("lead_result", {
        delivery_method: "telegram_fallback",
        result: "endpoint_error",
      });
      await openTelegramFallback(buildTelegramText(payload));
      setButtonState(button, "Відкрито Telegram", true);
    }

    setTimeout(() => {
      setButtonState(button, defaultText, false);
    }, 2600);
  });
});
