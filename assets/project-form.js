/* Presentation-only prefill. Submission, consent, attribution, validation,
   honeypot, delivery and request idempotency remain owned by /script.js. */
(() => {
  'use strict';
  const formats = new Map([
    ['start', 'Старт'],
    ['business', 'Бізнес'],
    ['seo', 'SEO Pro'],
    ['shop', 'Інтернет-магазин'],
  ]);
  const format = formats.get(new URLSearchParams(window.location.search).get('format'));
  if (!format) return;
  const form = document.getElementById('leadForm');
  const comment = form?.elements.comment;
  if (!comment || comment.value.trim()) return;
  // Only a fixed label is copied; arbitrary query values and PII are ignored.
  comment.value = `Цікавить формат: ${format}. `;
  const label = document.getElementById('project-package-name');
  const notice = document.getElementById('project-package');
  if (label && notice) {
    label.textContent = format;
    notice.hidden = false;
  }
})();
