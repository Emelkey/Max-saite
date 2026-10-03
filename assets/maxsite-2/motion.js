
(()=>{'use strict';
 document.documentElement.classList.add('js');
 const $=id=>document.getElementById(id);
 const els={stage:$('stage'),journey:$('journey'),camera:$('camera'),browser:$('primaryBrowser'),intro:$('intro'),layerHeading:$('layerHeading'),responsiveHeading:$('responsiveHeading'),paper:$('paperPlane'),image:$('imagePlane'),copy:$('copyPlane'),nav:$('navPlane'),foot:$('footPlane'),code:$('codePlane'),line:$('buildLine'),notch:$('phoneNotch'),desktop:$('desktopEcho'),tablet:$('tabletEcho'),phase:$('phaseNum'),phaseName:$('phaseName'),progress:$('progress'),progressText:$('progressText'),play:$('playButton'),playText:$('playText'),focus:$('focusLabel'),floor:$('floor'),hint:$('scrollHint')};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const mix=(a,b,t)=>a+(b-a)*t;
 const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
 const pulse=(a,b,c,d,p)=>smooth(a,b,p)*(1-smooth(c,d,p));
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let W=0,H=0,range=1,raf=0,autoRaf=0,playing=false,current=0,autoStartPending=false,lastPhase='',frameCount=0,lastRendered=-1;
 const metrics={frames:0,maxRenderMs:0,errors:[]};
 // Additional devices use the same HTML structure, not screenshots.
 for(const host of [els.desktop,els.tablet]){const clone=els.browser.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));clone.querySelectorAll('.build-line,.code-plane,.layer-title').forEach(n=>n.remove());host.appendChild(clone)}
 function place(node,cx,cy,w,h,scale,rx=0,ry=0,rz=0){node.style.width=w.toFixed(2)+'px';node.style.height=h.toFixed(2)+'px';node.style.transform=`translate3d(${(cx-w/2).toFixed(2)}px,${(cy-h/2).toFixed(2)}px,0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scale.toFixed(4)})`}
 function heading(node,opacity,dy=0){node.style.opacity=clamp(opacity).toFixed(3);node.style.transform=`translate3d(0,${dy.toFixed(1)}px,0)`;node.setAttribute('aria-hidden',opacity<.12?'true':'false');node.inert=opacity<.12}
 function render(p){const started=performance.now();p=clamp(p);if(p===lastRendered)return;lastRendered=p;current=p;const mobile=W<=700;const baseW=mobile?1000:Math.min(1060,W*.80),baseH=mobile?530:baseW*.51;
  const approach=smooth(.015,.18,p),explode=pulse(.21,.34,.45,.57,p),finish=smooth(.52,.62,p),morph=smooth(.64,.84,p),showFamily=smooth(.84,.96,p);
  let cx=mix(W*.5,W*(mobile?.53:.65),smooth(.18,.30,p));
  let cy=mix(H*(mobile?.59:.76),H*(mobile?.56:.535),approach);
  let bw=mix(baseW,mobile?286:306,morph),bh=mix(baseH,mobile?500:570,morph);
  let scale=mobile?mix(W*.88/baseW,.92, morph):mix(.80,Math.min(1,(H-210)/baseH),approach);
  if(!mobile)scale=mix(scale,.76,smooth(.20,.32,p))*(1-.08*explode);
  else scale*=1-.12*explode;
  if(!mobile)scale=mix(scale,Math.min(1,(H-250)/570),morph);
  if(mobile){scale=mix(scale,Math.min(.90,(H-355)/500),morph);cx=mix(cx,W*.64,showFamily);cy=mix(cy,H*.555,morph)}
  else{cx=mix(cx,W*.69,morph);cy=mix(cy,H*.53,morph)}
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
  if(phase[1]!==lastPhase){els.phase.textContent=phase[0];els.phaseName.innerHTML=phase[1]+'<span>ІДЕЯ → ДИЗАЙН → АДАПТИВНІСТЬ</span>';lastPhase=phase[1]}
  els.progress.value=Math.round(p*1000);els.progress.style.setProperty('--progress',p);els.progressText.textContent=Math.round(p*100)+'%';els.progress.setAttribute('aria-valuetext',Math.round(p*100)+'%, '+phase[1]);
  els.stage.dataset.progress=p.toFixed(3);els.stage.dataset.phase=phase[1];
  frameCount++;metrics.frames=frameCount;metrics.maxRenderMs=Math.max(metrics.maxRenderMs,performance.now()-started);
 }
 function measure(){lastRendered=-1;W=els.stage.clientWidth;H=els.stage.clientHeight;range=Math.max(1,els.journey.offsetHeight-H);render(reduced.matches?0:clamp((window.scrollY-els.journey.offsetTop)/range))}
 function queue(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!playing)render(reduced.matches?0:clamp((window.scrollY-els.journey.offsetTop)/range))})}
 function stop(){autoStartPending=false;playing=false;cancelAnimationFrame(autoRaf);els.playText.textContent=current>=.998?'Повторити':'Показати рух';els.play.querySelector('.play-icon').textContent='▶';els.play.setAttribute('aria-pressed','false')}
 function setProgress(p){p=clamp(Number(p)||0);if(reduced.matches){render(0);return}window.scrollTo({top:els.journey.offsetTop+p*range,left:0,behavior:'instant'});render(p)}
 function play(){if(reduced.matches||document.hidden)return;if(playing){stop();return}playing=true;els.playText.textContent='Пауза';els.play.querySelector('.play-icon').textContent='Ⅱ';els.play.setAttribute('aria-pressed','true');const from=current>.98?0:current;setProgress(from);const start=performance.now(),duration=22000*(1-from);
  const tick=now=>{if(!playing||document.hidden)return;const t=clamp((now-start)/duration);setProgress(from+(1-from)*t);if(t<1)autoRaf=requestAnimationFrame(tick);else stop()};autoRaf=requestAnimationFrame(tick)}
 function onMotionChange(){stop();els.play.disabled=reduced.matches;els.progress.disabled=reduced.matches;document.querySelectorAll('[data-go]').forEach(n=>n.disabled=reduced.matches);document.querySelector('.scrubber label').textContent=reduced.matches?'РУХ ВИМКНЕНО':'ГОРТАЙТЕ';measure()}
 function maybeAutoStart(){
  if(!autoStartPending||document.hidden||reduced.matches)return;
  if((location.hash&&location.hash!=='#journey')||window.scrollY>Math.max(60,window.innerHeight*.1)){autoStartPending=false;return}
  requestAnimationFrame(()=>{
   if(!autoStartPending||document.hidden||reduced.matches)return;
   if((location.hash&&location.hash!=='#journey')||window.scrollY>Math.max(60,window.innerHeight*.1)){autoStartPending=false;return}
   autoStartPending=false;play();
  });
 }
 function stopForPointer(e){if(e.target instanceof Element&&e.target.closest('#playButton'))return;stop()}
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',measure,{passive:true});window.addEventListener('wheel',stop,{passive:true});window.addEventListener('pointerdown',stopForPointer,{passive:true});window.addEventListener('touchstart',stopForPointer,{passive:true});window.addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End','Tab'].includes(e.key))stop()});document.addEventListener('visibilitychange',()=>{if(document.hidden){if(playing)stop()}else maybeAutoStart()});
 els.progress.addEventListener('input',()=>{stop();setProgress(els.progress.value/1000)});els.play.addEventListener('click',()=>{autoStartPending=false;play()});document.querySelectorAll('[data-go]').forEach(n=>n.addEventListener('click',()=>{stop();setProgress(Number(n.dataset.go))}));
 const info=$('infoOverlay');function closeInfo(){info.classList.remove('open');info.setAttribute('aria-hidden','true');$('infoOpen').focus()}
 $('infoOpen').onclick=()=>{stop();info.classList.add('open');info.setAttribute('aria-hidden','false');$('infoClose').focus()};$('infoClose').onclick=closeInfo;info.addEventListener('click',e=>{if(e.target===info)closeInfo()});info.addEventListener('keydown',e=>{if(e.key==='Escape')closeInfo();if(e.key==='Tab'){e.preventDefault();$('infoClose').focus()}});
 reduced.addEventListener?reduced.addEventListener('change',onMotionChange):reduced.addListener(onMotionChange);
 window.demoController={setProgress,play,stop,getProgress:()=>current,getState:()=>({progress:current,playing,width:W,height:H,range,reducedMotion:reduced.matches,cameraTransform:els.camera.style.transform,metrics:{...metrics}})};
 onMotionChange();
 autoStartPending=!reduced.matches;
 window.addEventListener('pageshow',maybeAutoStart,{once:true});
})();
