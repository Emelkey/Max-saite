
(()=>{'use strict';
 document.documentElement.classList.add('js');
 const $=id=>document.getElementById(id);
 const els={stage:$('stage'),journey:$('journey'),camera:$('camera'),browser:$('primaryBrowser'),intro:$('intro'),layerHeading:$('layerHeading'),responsiveHeading:$('responsiveHeading'),paper:$('paperPlane'),image:$('imagePlane'),copy:$('copyPlane'),nav:$('navPlane'),foot:$('footPlane'),code:$('codePlane'),line:$('buildLine'),notch:$('phoneNotch'),desktop:$('desktopEcho'),tablet:$('tabletEcho'),focus:$('focusLabel'),floor:$('floor'),hint:$('scrollHint')};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const mix=(a,b,t)=>a+(b-a)*t;
 const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
 const pulse=(a,b,c,d,p)=>smooth(a,b,p)*(1-smooth(c,d,p));
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const autoplayDuration=12000;
 function showPricing(){stop();manualAnchor=null;$('pricing').scrollIntoView({block:'start',behavior:'instant'});render(1)}
 let W=0,H=0,range=1,raf=0,autoRaf=0,autoStartTimer=0,playing=false,current=0,autoStartPending=false,resumeOnVisible=false,detachedAutoplay=false,frameCount=0,lastRendered=-1;
 let userControlled=false,manualAnchor=null;
 const touchViewport=window.matchMedia('(pointer:coarse)');
 const metrics={frames:0,maxRenderMs:0,errors:[]};
 // Additional devices use the same HTML structure, not screenshots.
 for(const host of [els.desktop,els.tablet]){const clone=els.browser.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));clone.querySelectorAll('.build-line,.code-plane,.layer-title').forEach(n=>n.remove());host.appendChild(clone)}
 function place(node,cx,cy,w,h,scale,rx=0,ry=0,rz=0){node.style.width=w.toFixed(2)+'px';node.style.height=h.toFixed(2)+'px';node.style.transform=`translate3d(${(cx-w/2).toFixed(2)}px,${(cy-h/2).toFixed(2)}px,0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scale.toFixed(4)})`}
 function heading(node,opacity,dy=0){node.style.opacity=clamp(opacity).toFixed(3);node.style.transform=`translate3d(0,${dy.toFixed(1)}px,0)`;node.setAttribute('aria-hidden',opacity<.12?'true':'false');node.inert=opacity<.12}
 function render(p){const started=performance.now();p=clamp(p);if(p===lastRendered)return;lastRendered=p;current=p;const mobile=W<=700;const baseW=mobile?1000:Math.min(1060,W*.80),baseH=mobile?530:baseW*.51;
  const approach=smooth(.015,.18,p),explode=pulse(.21,.34,.45,.57,p),finish=smooth(.52,.62,p),morph=smooth(.64,.84,p),showFamily=smooth(.84,.96,p);
  let cx=mix(W*(mobile?.5:.76),W*(mobile?.53:.65),smooth(.18,.30,p));
  let cy=mix(H*(mobile?.70:.64),H*(mobile?.56:.535),approach);
  let bw=mix(baseW,mobile?286:306,morph),bh=mix(baseH,mobile?500:570,morph);
  let scale=mobile?mix(W*.88/baseW,.92, morph):mix(.52,Math.min(1,(H-210)/baseH),approach);
  if(!mobile)scale=mix(scale,.76,smooth(.20,.32,p))*(1-.08*explode);
  else scale*=1-.12*explode;
  if(!mobile)scale=mix(scale,Math.min(1,(H-250)/570),morph);
  const chapter=smooth(.16,.25,p)*(1-smooth(.53,.62,p));
  if(mobile){scale=mix(scale,Math.min(.90,(H-355)/500),morph);cx=mix(cx,W*.64,showFamily);cy=mix(cy,H*.555,morph)+65*chapter}
  else{
   cx=mix(cx,W*.69,morph);cy=mix(cy,H*.53,morph);
   // Keep the page mockup beside the chapter text while both are visible.
   cx+=W*.19*chapter;
   // Ease the chapter mockup back into the viewport as its heading appears.
   // The offset ends before the responsive-device chapter begins.
   cx-=W*.14*smooth(.16,.20,p)*(1-smooth(.53,.62,p));
   scale*=1-.42*chapter;
  }
  const rx=mix(15,0,approach)+(mobile?25:42)*explode,ry=(mobile?-6:-17)*explode,rz=mix(-5,0,approach)-(mobile?8:15)*explode;
  place(els.camera,cx,cy,bw,bh,scale,rx,ry,rz);
  const lift=mobile?90:185;
  els.paper.style.transform=`translate3d(0,${38*explode}px,${-24*explode}px)`;
  els.image.style.transform=`translate3d(${30*explode}px,${9*explode}px,${60*explode+1}px)`;
  els.copy.style.transform=`translate3d(${-25*explode}px,${-16*explode}px,${lift*explode+4}px)`;
  els.nav.style.transform=`translate3d(${-45*explode}px,${-28*explode}px,${(lift+50)*explode+3}px)`;
  els.foot.style.transform=`translate3d(${-25*explode}px,${-16*explode}px,${lift*explode+4}px)`;
  const codeAlpha=pulse(.30,.38,.44,.54,p);
  els.code.style.opacity=(codeAlpha*.9).toFixed(3);els.code.style.transform=`translate3d(${-40*explode}px,${-20*explode}px,${(-90+35*explode)}px)`;
  els.browser.querySelectorAll('.layer-title').forEach(n=>n.style.opacity=(explode*.98).toFixed(3));
  const scan=smooth(.54,.63,p);els.line.style.opacity=pulse(.535,.55,.625,.64,p).toFixed(3);els.line.style.transform=`translate3d(${(scan*bw).toFixed(2)}px,0,${6+explode*20}px)`;
  const photoScale=1.045+.04*approach-.075*finish;
  els.image.querySelector('.interior').style.transform=`scale(${photoScale}) translateX(${(-5+5*finish).toFixed(1)}px)`;
  const rounding=12+19*morph;els.browser.querySelector('.chassis').style.borderRadius=rounding+'px';els.browser.querySelector('.chassis').style.borderWidth=(1+5*morph)+'px';els.browser.querySelector('.chrome').style.borderRadius=`${rounding}px ${rounding}px 0 0`;els.browser.querySelector('.chrome-label').style.opacity=1-morph;els.browser.querySelector('.dots').style.opacity=1-morph;els.notch.style.opacity=morph;
  els.focus.style.opacity=morph.toFixed(3);els.focus.textContent=morph<.6?'АДАПТИВНИЙ ІНТЕРФЕЙС':'МОБІЛЬНА ВЕРСІЯ';
  heading(els.intro,1-smooth(.015,.12,p),-160*smooth(.015,.15,p));
  heading(els.layerHeading,pulse(.18,.25,.53,.62,p),28*(1-smooth(.18,.25,p)));
  heading(els.responsiveHeading,smooth(.64,.73,p),30*(1-smooth(.64,.73,p)));
  els.hint.style.opacity=(1-smooth(.03,.12,p)).toFixed(3);
  els.floor.style.transform=`scale(${mix(.7,1.1,approach)})`;els.floor.style.opacity=.4-.15*explode;
  // Two contextual devices enter only after the main page has actually reflowed.
  let desktopScale=mobile?W*.46/1000:Math.min(W*.315/1000,(H*.44)/530);
  let tabletScale=mobile?W*.33/540:Math.min(W*.20/540,(H*.47)/610);
  place(els.desktop,W*(mobile?.29:.51)-100*(1-showFamily),H*(mobile?.56:.56),1000,530,desktopScale,0,12,-8);
  place(els.tablet,W*(mobile?.80:.86)+100*(1-showFamily),H*(mobile?.51:.52),540,610,tabletScale,0,-10,7);
  els.desktop.style.opacity=(showFamily*(mobile?.70:.90)).toFixed(3);els.tablet.style.opacity=(showFamily*(mobile?.55:.82)).toFixed(3);
  const phase=p<.18?['01','ЗНАЙОМСТВО']:p<.55?['02','ДИЗАЙН У ШАРАХ']:p<.66?['03','ГОТОВИЙ ІНТЕРФЕЙС']:['04','АДАПТИВНІСТЬ'];
  els.stage.dataset.progress=p.toFixed(3);els.stage.dataset.phase=phase[1];
  frameCount++;metrics.frames=frameCount;metrics.maxRenderMs=Math.max(metrics.maxRenderMs,performance.now()-started);
 }
 function scrollProgress(){
  const y=clamp(window.scrollY-els.journey.offsetTop,0,range);
  if(!manualAnchor)return y/range;
  // Autoplay never moves the document. Continue from its visible frame when a
  // finger/wheel takes over, without scrollTo, canceling the gesture or rewind.
  const {y:start,p}=manualAnchor;
  return y>=start?p+(1-p)*clamp((y-start)/Math.max(1,range-start)):p*clamp(y/Math.max(1,start));
 }
 function measure(){
  const width=els.stage.clientWidth;
  // iOS toolbar and keyboard changes must not resize the pinned scene or its
  // spacer during a gesture. Re-measure only for a genuine width/orientation change.
  if(touchViewport.matches&&W===width&&H)return;
  if(touchViewport.matches){
   els.stage.style.removeProperty('height');
   H=els.stage.clientHeight;
   els.stage.style.height=H+'px';
   els.journey.style.height=(reduced.matches?H:H*(width<=700?4.8:6.5))+'px';
  }else H=els.stage.clientHeight;
  lastRendered=-1;W=width;range=Math.max(1,els.journey.offsetHeight-H);
  if(manualAnchor)manualAnchor.y=Math.min(manualAnchor.y,range);
  render(reduced.matches?0:(playing?current:scrollProgress()));
 }
 function queue(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!playing)render(reduced.matches?0:scrollProgress())})}
 function pause(){autoStartPending=false;playing=false;cancelAnimationFrame(autoRaf);clearTimeout(autoStartTimer)}
 function stop(){
  if(detachedAutoplay)manualAnchor={p:current,y:clamp(window.scrollY-els.journey.offsetTop,0,range)};
  pause();setDetached(false);resumeOnVisible=false;userControlled=true;
 }
 function setProgress(p){p=clamp(Number(p)||0);stop();manualAnchor=null;if(reduced.matches){render(0);return}window.scrollTo({top:els.journey.offsetTop+p*range,left:0,behavior:'instant'});render(p)}
 function setDetached(value){detachedAutoplay=value}
 function modalOpen(){return info.classList.contains('open')||!!document.querySelector('dialog[open],[aria-modal="true"]:not([aria-hidden="true"]):not(#infoOverlay)')||!$('mobileMenu').hidden}
 function play(){if(reduced.matches||document.hidden)return;if(playing){stop();return}userControlled=false;manualAnchor=null;playing=true;setDetached(true);const from=current>.98?0:current;render(from);const start=performance.now(),duration=autoplayDuration*(1-from);
  // Keep the document still during the intro, then reveal the first content
  // section. Any user interaction cancels autoplay before this handoff.
  const tick=now=>{if(!playing||document.hidden)return;const t=clamp((now-start)/duration);render(from+(1-from)*t);if(t<1)autoRaf=requestAnimationFrame(tick);else showPricing()};autoRaf=requestAnimationFrame(tick)}
 function onMotionChange(){stop();manualAnchor=null;W=0;document.querySelectorAll('[data-go]').forEach(n=>n.disabled=reduced.matches);measure()}
 function maybeAutoStart(){
  if(!autoStartPending||userControlled||document.hidden||reduced.matches)return;
  // Safari and Chromium restore a reloaded page's scroll at different times.
  // Sample the settled position before starting instead of stopping mid-frame.
  clearTimeout(autoStartTimer);
  autoStartTimer=setTimeout(()=>{
   if(!autoStartPending||userControlled||document.hidden||reduced.matches)return;
   if((location.hash&&location.hash!=='#journey')||window.scrollY>els.journey.offsetTop+1){autoStartPending=false;return}
   autoStartPending=false;render(scrollProgress());play();
  },120);
 }
 window.addEventListener('scroll',()=>{
  // A visitor may scroll without a wheel or pointer event (for example via a
  // browser anchor or accessibility action). Hand control to the scroll scene.
  if((playing||resumeOnVisible)&&window.scrollY>els.journey.offsetTop+1)stop();
  queue();
 },{passive:true});window.addEventListener('resize',measure,{passive:true});window.addEventListener('wheel',stop,{passive:true});window.addEventListener('pointerdown',stop,{passive:true,capture:true});window.addEventListener('touchstart',stop,{passive:true,capture:true});window.addEventListener('touchmove',stop,{passive:true,capture:true});document.addEventListener('focusin',stop,{passive:true});
 const keyboardStops=[0,.25,.42,.58,.77,1];
 window.addEventListener('keydown',e=>{
  if(['Home','End','Tab'].includes(e.key)){stop();return}
  if(!['PageDown','PageUp','ArrowDown','ArrowUp'].includes(e.key))return;
  if(e.defaultPrevented||e.isComposing||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||reduced.matches)return;
  const active=document.activeElement;
  if(active?.closest('input,textarea,select,[contenteditable],[role="slider"],[role="spinbutton"],[role="listbox"],[role="combobox"],[role="menu"],[role="tablist"],[role="grid"]'))return;
  if(modalOpen()||active?.closest('.consent-panel'))return;
  const box=els.journey.getBoundingClientRect();
  if(box.bottom<=0||box.top>=window.innerHeight)return;
  const progress=detachedAutoplay?current:scrollProgress();
  const down=e.key==='PageDown'||e.key==='ArrowDown';
  const next=down?keyboardStops.find(p=>p>progress+.025):keyboardStops.slice().reverse().find(p=>p<progress-.025);
  if(next===undefined&&!(down&&progress>=.975))return;
  e.preventDefault();stop();setDetached(false);
  if(next===undefined){showPricing();queue()}
  else setProgress(next);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){resumeOnVisible=playing&&!userControlled;if(playing)pause()}else if(resumeOnVisible&&!userControlled){resumeOnVisible=false;play()}else maybeAutoStart()});
 window.addEventListener('pagehide',stop);
 window.addEventListener('pageshow',e=>{if(e.persisted)stop()});
 document.querySelectorAll('[data-go]').forEach(n=>n.addEventListener('click',()=>{stop();setProgress(Number(n.dataset.go))}));
 const info=$('infoOverlay');function closeInfo(){info.classList.remove('open');info.setAttribute('aria-hidden','true');$('infoOpen').focus()}
 $('infoOpen').onclick=()=>{stop();info.classList.add('open');info.setAttribute('aria-hidden','false');$('infoClose').focus()};$('infoClose').onclick=closeInfo;info.addEventListener('click',e=>{if(e.target===info)closeInfo()});info.addEventListener('keydown',e=>{if(e.key==='Escape')closeInfo();if(e.key==='Tab'){e.preventDefault();$('infoClose').focus()}});
 reduced.addEventListener?reduced.addEventListener('change',onMotionChange):reduced.addListener(onMotionChange);
 window.demoController={setProgress,play,stop,getProgress:()=>current,getState:()=>({progress:current,playing,userControlled,width:W,height:H,range,reducedMotion:reduced.matches,cameraTransform:els.camera.style.transform,metrics:{...metrics}})};
 document.querySelectorAll('[data-go]').forEach(n=>n.disabled=reduced.matches);measure();
 autoStartPending=!reduced.matches;
 window.addEventListener('pageshow',maybeAutoStart,{once:true});
})();
