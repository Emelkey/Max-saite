/* Small first-party consent control; loaded before the Google tag on every page. */
(() => {
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
  window.MAX_SITE_GOOGLE_PAGE = {
    page_location: `${location.origin}${location.pathname}`,
    page_referrer: (() => { try { const url = new URL(document.referrer); return `${url.origin}${url.pathname}`; } catch { return ""; } })()
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

  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.createElement("section");
    panel.className = "consent-panel";
    panel.setAttribute("aria-label", "Налаштування приватності");
    panel.innerHTML = '<strong>Ваш вибір приватності</strong><p>Аналітика допомагає покращувати сайт, рекламні cookies — вимірювати рекламу. Заявка працює за будь-якого вибору. <a href="/polityka-konfidentsijnosti/">Докладніше</a></p><div><button type="button" data-choice="necessary">Лише необхідні</button><button type="button" data-choice="analytics">Лише аналітика</button><button type="button" data-choice="all">Дозволити всі</button></div>';
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
      saved = {choice, timestamp: Date.now()};
      window.MAX_SITE_CONSENT = states(choice);
      window.gtag("consent", "update", window.MAX_SITE_CONSENT);
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch {}
      purgeAttribution();
      panel.hidden = true;
      if (panel.contains(document.activeElement)) settings.focus({preventScroll: true});
    });
  });
})();
