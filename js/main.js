if(matchMedia('(max-width:900px)').matches&&/\/(about|strengths|projects|approach|contact)\.html$/i.test(location.pathname))location.replace('index.html#'+location.pathname.split('/').pop().replace('.html',''));
/* =====================================================
   SHARED SCRIPT — page transitions, menu, effects
   ===================================================== */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const root=document.documentElement,body=document.body;
const curtain=$('#curtain'),label=$('#curtainLabel');
let navigating=false;

function store(k,v){try{if(v===undefined)return sessionStorage.getItem(k);if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){return null}}

/* ---------- Gmail icon uses the email from js/config.js ---------- */
$$('[data-mail]').forEach(a=>{if(window.SITE&&SITE.email)a.href='mailto:'+SITE.email});

/* ---------- toast ---------- */
let tt;
function toast(t){const e=$('#toast');if(!e)return;e.textContent=t;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),2600)}

/* ---------- count-up numbers ---------- */
function countUp(el){
  const to=+el.dataset.count,suf=el.dataset.suffix||'';
  if(reduce){el.textContent=to+suf;return}
  const t0=performance.now(),dur=1600;
  (function f(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);el.textContent=Math.round(to*e)+suf;if(p<1)requestAnimationFrame(f)})(t0);
}
function start(){
  body.classList.add('ready');
  setTimeout(()=>$$('[data-count]').forEach(countUp),500);
}

/* ---------- called by each page when it is ready to animate in ---------- */
let isReady=false;
const MJA=window.MJA={
  toast,
  ready(){
    if(isReady)return;isReady=true;
    if(root.classList.contains('cover')){root.classList.remove('cover');store('mjaTrans',null);body.classList.add('fadein');start();}else start();
  }
};
// Pages with the welcome intro (home) call MJA.ready() themselves.
if(!$('#intro'))MJA.ready();

/* ---------- page transition ---------- */
function go(url,text){
  if(navigating)return;navigating=true;
  if(reduce){location.href=url;return}
  store('mjaTrans',text||'1');
  body.classList.add('leaving');
  setTimeout(()=>{location.href=url},480);
}
function closeMenu(){body.classList.remove('menu-open')}
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();

document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;
  const href=a.getAttribute('href');
  if(!/^[\w\-]+\.html$/i.test(href))return;           // only our own pages
  const sec=matchMedia('(max-width:900px)').matches&&document.getElementById(href.replace('.html','').replace('index','home'));
  if(sec){e.preventDefault();closeMenu();sec.scrollIntoView({behavior:'smooth',block:'start'});return}
  e.preventDefault();closeMenu();
  if(href.toLowerCase()===current)return;              // already here
  go(href,a.dataset.label||a.textContent.replace(/[0-9↗↘←→]/g,'').trim());
});
// restore state if the user comes back with the browser Back button
addEventListener('pageshow',e=>{
  if(e.persisted){navigating=false;curtain.classList.remove('on','out');body.classList.remove('leaving');root.classList.remove('cover');label.textContent='';body.classList.add('ready')}
});

/* ---------- keyboard: ← → to change page ---------- */
addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||$('#intro')||$('.modal.open'))return;
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  const t=e.key==='ArrowRight'?body.dataset.next:e.key==='ArrowLeft'?body.dataset.prev:null;
  if(t){const [u,l]=t.split('|');go(u,l)}
});

/* ---------- mobile menu ---------- */
const burger=$('#burger');
if(burger)burger.addEventListener('click',()=>{const o=body.classList.toggle('menu-open');burger.setAttribute('aria-expanded',o)});

/* ---------- auto-hide sidebar: open while the mouse is on the left side ---------- */
(function(){
  const side=$('.side');
  if(!side||!matchMedia('(min-width:901px)').matches)return;
  let h=0,armed=true;
  const isOpen=()=>root.classList.contains('side-open');
  const open=()=>{h=0;root.classList.add('side-open')};
  const close=()=>root.classList.remove('side-open');
  // hover-intent: also works when the pointer was ALREADY resting on the left edge as the page loaded
  side.addEventListener('pointermove',()=>{if(armed&&!h&&!isOpen())h=setTimeout(open,120)});
  side.addEventListener('pointerleave',()=>{clearTimeout(h);h=0;armed=true});
  side.addEventListener('focusin',open);
  side.addEventListener('pointerdown',()=>{if(!isOpen())open()}); // click the little menu icon = open right away
  // the menu STAYS open while you use it — it slides away only when you click somewhere else (or press Esc)
  document.addEventListener('pointerdown',e=>{if(!side.contains(e.target))close()},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'){close();armed=false}});
})();

/* ---------- cursor glow, card spotlight, 3D tilt, magnetic buttons ---------- */
if(fine&&!reduce){
  const g=$('#glow');let gx=innerWidth/2,gy=innerHeight/2,tx=gx,ty=gy;
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;g.classList.add('on')},{passive:true});
  (function loop(){gx+=(tx-gx)*.12;gy+=(ty-gy)*.12;g.style.transform='translate('+gx+'px,'+gy+'px)';requestAnimationFrame(loop)})();
  $$('.card,.project,[data-tilt]').forEach(c=>{
    c.addEventListener('mousemove',e=>{
      const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');
      if(c.hasAttribute('data-tilt')){
        c.style.transform='rotateX('+(((y/r.height)-.5)*-12)+'deg) rotateY('+(((x/r.width)-.5)*12)+'deg)';
      }
    });
    c.addEventListener('mouseleave',()=>{if(c.hasAttribute('data-tilt'))c.style.transform=''});
  });
  $$('.mag').forEach(b=>{
    b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.25)+'px)'});
    b.addEventListener('mouseleave',()=>b.style.transform='');
  });
}
})();

/* ---------- phone: smooth scroll-down page (reveal + active menu link) ---------- */
(function(){
  const secs=[...document.querySelectorAll('main.page[id]')];
  if(!matchMedia('(max-width:900px)').matches||secs.length<2)return;
  const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}}),{threshold:.1});
  document.querySelectorAll('.m-only .a').forEach(el=>rv.observe(el));
  const links=[...document.querySelectorAll('.side .nav-list a')];
  const sp=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
    links.forEach(a=>{const on=a.getAttribute('href').replace('.html','').replace('index','home')===e.target.id;a.classList.toggle('active',on)})}),{rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(x=>sp.observe(x));
  addEventListener('load',()=>{try{const t=location.hash&&document.querySelector(location.hash);if(t)setTimeout(()=>t.scrollIntoView(),60)}catch(e){}});
})();
