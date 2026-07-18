const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".main-nav a");

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
  window.location.href = `https://t.me/${username}`;
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
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const button = form.querySelector("button");
    const defaultText = button?.textContent || "Отримати консультацію";
    const payload = buildLeadPayload(form);

    setButtonState(button, "Відправляємо...", true);

    try {
      const result = await sendLead(payload);
      setButtonState(button, result.fallback ? "Відкрито Telegram" : "Заявку відправлено", true);
      form.reset();
    } catch (error) {
      console.error(error);
      await openTelegramFallback(buildTelegramText(payload));
      setButtonState(button, "Відкрито Telegram", true);
    }

    setTimeout(() => {
      setButtonState(button, defaultText, false);
    }, 2600);
  });
});
