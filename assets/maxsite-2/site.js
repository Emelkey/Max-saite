/* Homepage UI interactions for the MAX SITE 2.0 layout: header state, mobile
   menu, in-page anchor navigation. Lead-form handling, validation, consent,
   honeypot and delivery are owned by /script.js (the real site-wide handler) —
   this file must not attach a second submit listener to the lead form. */
(() => {
 'use strict';
 const header=document.getElementById('siteNav');
 const toggle=document.getElementById('menuToggle');
 const menu=document.getElementById('mobileMenu');
 const form=document.getElementById('leadForm');
 let ticking=false;
 function updateHeader(){ticking=false;header.classList.toggle('mx-scrolled',window.scrollY>45)}
 window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateHeader)}},{passive:true});
 updateHeader();
 function closeMenu(restoreFocus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Відкрити меню');if(restoreFocus)toggle.focus()}
 toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрити меню':'Відкрити меню')});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true)});
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu()});
 const desktop=window.matchMedia('(min-width:761px)');
 desktop.addEventListener('change',()=>closeMenu());
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href').slice(1);const target=document.getElementById(id);if(!target)return;
  e.preventDefault();closeMenu();window.demoController?.stop();
  if(a.dataset.package&&form)form.elements.comment.value='Цікавить формат: '+a.dataset.package+'. ';
  target.scrollIntoView({behavior:'auto',block:'start'});
  // Move keyboard focus as well as the viewport; no history/query-string PII.
  if(id==='lead'&&form){form.elements.name.focus({preventScroll:true})}
  else if(id==='journey'){document.querySelector('.mx-logo').focus({preventScroll:true})}
  else {if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}
 }));
})();
