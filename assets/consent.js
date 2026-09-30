/* Small first-party consent control; loaded before the Google tag on every page. */
(() => {
  // QA/preview visits must never enter the production GA4 property. This file
  // executes synchronously before the Google tag, including automatic pageviews.
  // https://developers.google.com/tag-platform/security/guides/privacy
  if (location.origin !== "https://maxsite.com.ua") {
    window["ga-disable-G-TS8DMMKK34"] = true;
  }
  const key = "max_site_consent_v1";
  const denied = {analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"};
  let saved = null;
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value && Number.isFinite(value.timestamp) && value.timestamp <= Date.now() && Date.now() - value.timestamp < 180 * 86400000 && ["necessary", "analytics", "all"].includes(value.choice)) saved = value;
  } catch {}
  const states = choice => ({...denied, analytics_storage: choice === "analytics" || choice === "all" ? "granted" : "denied", ...(choice === "all" ? {ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted"} : {})});
  window.MAX_SITE_CONSENT = states(saved?.choice);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", window.MAX_SITE_CONSENT);
  window.gtag("set", "ads_data_redaction", true);
  window.gtag("set", "url_passthrough", false);
  const measurementId = "G-TS8DMMKK34";
  const ensureGoogleTag = (config = {}) => {
    if (location.origin !== "https://maxsite.com.ua") return false;
    const src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    const scripts = document.scripts ? Array.from(document.scripts) : [];
    let script = scripts.find(item => item.src === src);
    if (!script) {
      if (!document.head?.appendChild || !document.createElement) return false;
      script = document.createElement("script");
      script.async = true;
      script.src = src;
      script.dataset.maxSiteGa4Fallback = "true";
      document.head.appendChild(script);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {anonymize_ip: true, ...config});
      return true;
    }
    return false;
  };
  const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_source_platform", "utm_term", "utm_content"];
  const clickKeys = ["gclid", "gbraid", "wbraid", "gad_source", "gad_campaignid", "gclsrc"];
  const looksLikePhone = value => /(?:^|\D)(?:\+?380\d{9}|0\d{9})(?:$|\D)/.test(value.replace(/[ ().-]/g, ""));
  const safeCampaignValue = value => value.length <= 180
    && /^[\p{L}\p{N}][\p{L}\p{N} _.,:/+%~-]*$/u.test(value)
    && !looksLikePhone(value);
  const safeClickValue = value => /^[A-Za-z0-9._~-]{1,250}$/.test(value) && !looksLikePhone(value);
  const googlePage = () => {
    const url = new URL(`${location.origin}${location.pathname}`);
    const source = new URLSearchParams(location.search || "");
    if (window.MAX_SITE_CONSENT.analytics_storage === "granted") {
      for (const key of campaignKeys) {
        const value = source.get(key);
        if (value && safeCampaignValue(value)) url.searchParams.set(key, value);
      }
      if (window.MAX_SITE_CONSENT.ad_storage === "granted" && window.MAX_SITE_CONSENT.ad_user_data === "granted") {
        for (const key of clickKeys) {
          const value = source.get(key);
          if (value && safeClickValue(value)) url.searchParams.set(key, value);
        }
      }
    }
    return {
      page_location: url.href,
      page_referrer: (() => { try { const referrer = new URL(document.referrer); return `${referrer.origin}${referrer.pathname}`; } catch { return ""; } })()
    };
  };
  // A fresh denied visit must not consume its only automatic pageview before
  // the visitor has chosen analytics. Saved analytics consent keeps the normal
  // automatic pageview on navigation.
  let pageViewSent = window.MAX_SITE_CONSENT.analytics_storage === "granted";
  window.MAX_SITE_GOOGLE_PAGE = {
    ...googlePage(),
    ...(pageViewSent ? {} : {send_page_view: false})
  };
  const purgeAttribution = () => {
    try {
      if (window.MAX_SITE_CONSENT.ad_storage !== "granted") {
        sessionStorage.removeItem("max_site_gclid");
      }
      if (window.MAX_SITE_CONSENT.analytics_storage !== "granted") {
        ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
          .forEach(key => sessionStorage.removeItem(`max_site_${key}`));
      }
    } catch {}
  };
  purgeAttribution();
  // Production must remain measurable even if an HTML-level Google tag is
  // removed by a cache, optimizer or stale template. consent.js is the
  // first-party source of truth and only self-heals after analytics consent.
  if (window.MAX_SITE_CONSENT.analytics_storage === "granted") {
    ensureGoogleTag(window.MAX_SITE_GOOGLE_PAGE);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.createElement("section");
    panel.className = "consent-panel";
    panel.setAttribute("aria-label", "Налаштування приватності");
    panel.innerHTML = '<strong>Ваш вибір cookies</strong><p>Аналітика й реклама — за вашим вибором. Форма працює завжди. <a href="/polityka-konfidentsijnosti/">Докладніше</a></p><div><button type="button" data-choice="necessary">Лише необхідні</button><button type="button" data-choice="analytics">Лише аналітика</button><button type="button" data-choice="all">Дозволити всі</button></div>';
    panel.hidden = Boolean(saved);
    document.body.append(panel);
    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "consent-settings";
    settings.textContent = "Налаштування cookies";
    (document.querySelector("footer") || document.body).append(settings);
    settings.addEventListener("click", () => { panel.hidden = false; panel.querySelector("button").focus(); });
    panel.addEventListener("click", event => {
      const choice = event.target.closest("button[data-choice]")?.dataset.choice;
      if (!choice) return;
      const analyticsWasGranted = window.MAX_SITE_CONSENT.analytics_storage === "granted";
      saved = {choice, timestamp: Date.now()};
      window.MAX_SITE_CONSENT = states(choice);
      window.gtag("consent", "update", window.MAX_SITE_CONSENT);
      const previousPageLocation = window.MAX_SITE_GOOGLE_PAGE.page_location;
      window.MAX_SITE_GOOGLE_PAGE = googlePage();
      if (window.MAX_SITE_CONSENT.analytics_storage === "granted") {
        ensureGoogleTag({...window.MAX_SITE_GOOGLE_PAGE, send_page_view: false});
      }
      if (window.MAX_SITE_GOOGLE_PAGE.page_location !== previousPageLocation) {
        // Refresh later event context without an automatic pageview.
        window.gtag("config", "G-TS8DMMKK34", {...window.MAX_SITE_GOOGLE_PAGE, send_page_view: false});
      }
      if (!analyticsWasGranted && window.MAX_SITE_CONSENT.analytics_storage === "granted" && !pageViewSent) {
        // The first analytics grant on this page gets one consented pageview.
        // Event-level location follows the same allowlist as later events.
        window.gtag("event", "page_view", {...window.MAX_SITE_GOOGLE_PAGE, send_to: "G-TS8DMMKK34"});
        pageViewSent = true;
      }
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch {}
      purgeAttribution();
      window.dispatchEvent(new Event("max-site:consent-change"));
      panel.hidden = true;
      if (panel.contains(document.activeElement)) settings.focus({preventScroll: true});
    });
  });
})();
