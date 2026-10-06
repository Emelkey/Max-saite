/* MAX SITE homepage motion (2026-10 redesign).
   Decorative only: never touches lead submission (owned by /script.js) or
   header/menu/anchors (owned by site.js). Everything degrades to static. */
(() => {
 'use strict';
 const root = document.documentElement;
 // Compatibility surface for QA tools written for the former autoplay scene:
 // the 2026-10 homepage has no autoplay timeline, so it never "plays".
 window.demoController = window.demoController || {
  getState: () => ({ playing: false, progress: 1, range: 0 }),
  getProgress: () => 1,
  stop: () => {}
 };
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

 // Scroll reveal: content is visible without JS; with JS it fades in once.
 const revealTargets = document.querySelectorAll('.mx-rv');
 if (!('IntersectionObserver' in window) || reduced.matches) {
  revealTargets.forEach(el => el.classList.add('is-in'));
 } else {
  const reveal = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-in'); reveal.unobserve(entry.target); }
   });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealTargets.forEach(el => reveal.observe(el));
  // Anchor jumps and restored scroll positions must never leave content hidden.
  const revealAll = () => revealTargets.forEach(el => el.classList.add('is-in'));
  window.addEventListener('hashchange', revealAll);
  if (location.hash) revealAll();
  document.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) revealAll(); });
 }

 // Pause decorative loops that are off-screen to keep scrolling smooth.
 const loopBlocks = document.querySelectorAll('.mx-hero, .mx-ticker, .mx-work, .mx-pricing, .mx-services, .mx-founder, .mx-process, .mx-lead, .mx-footer');
 if ('IntersectionObserver' in window) {
  const pauser = new IntersectionObserver(entries => {
   entries.forEach(entry => entry.target.classList.toggle('mx-paused', !entry.isIntersecting));
  }, { rootMargin: '120px 0px' });
  loopBlocks.forEach(el => pauser.observe(el));
 }
 document.addEventListener('visibilitychange', () => root.classList.toggle('mx-paused', document.hidden));

 // Rotating word in the H1. The static text ("сайти.") stays in the HTML for SEO.
 const rotor = document.querySelector('.mx-rotor');
 if (rotor && !reduced.matches) {
  const words = (rotor.dataset.words || '').split('|').filter(Boolean);
  let index = 0;
  if (words.length > 1) {
   window.setInterval(() => {
    if (document.hidden || root.classList.contains('mx-paused')) return;
    const hero = document.querySelector('.mx-hero');
    if (hero && hero.classList.contains('mx-paused')) return;
    index = (index + 1) % words.length;
    rotor.classList.remove('is-swap');
    void rotor.offsetWidth;
    rotor.textContent = words[index];
    rotor.classList.add('is-swap');
   }, 2600);
  }
 }

 // Soft light that follows a mouse pointer across the hero (desktop only).
 const hero = document.querySelector('.mx-hero');
 if (hero && finePointer.matches && !reduced.matches) {
  let frame = 0, x = 0, y = 0;
  hero.addEventListener('pointermove', e => {
   const rect = hero.getBoundingClientRect();
   x = e.clientX - rect.left; y = e.clientY - rect.top;
   if (frame) return;
   frame = requestAnimationFrame(() => {
    frame = 0;
    hero.style.setProperty('--mx-x', x + 'px');
    hero.style.setProperty('--mx-y', y + 'px');
    hero.classList.add('is-pointer');
   });
  }, { passive: true });
  hero.addEventListener('pointerleave', () => hero.classList.remove('is-pointer'));
 }

 // "Що потрібно?" chips prefill the comment the same way pricing buttons do.
 const form = document.getElementById('leadForm');
 if (form) {
  const chips = document.querySelectorAll('.mx-choice button[data-format]');
  const comment = form.elements.comment;
  const prefix = /^Цікавить формат: [^.]*\.\s*/;
  const select = chip => {
   chips.forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
   if (comment) comment.value = 'Цікавить формат: ' + chip.dataset.format + '. ' + comment.value.replace(prefix, '');
  };
  chips.forEach(chip => {
   chip.setAttribute('aria-pressed', 'false');
   chip.addEventListener('click', () => select(chip));
  });
  // Keep chips in sync when a pricing button prefilled the comment.
  document.querySelectorAll('[data-package]').forEach(link => link.addEventListener('click', () => {
   chips.forEach(chip => chip.setAttribute('aria-pressed', 'false'));
  }));
 }
})();
