/* =====================================================
   PROJECTS PAGE — filter + details popup
   ===================================================== */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------- build the map cards from js/places.js ---------- */
function rng(seed){let s=seed*2654435761%4294967296;return()=>((s=(s*1664525+1013904223)%4294967296)/4294967296)}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
const TAG={mall:'Mall',beach:'Beachfront',nature:'Nature',food:'Food',landmark:'Landmark'};
function mapSVG(p,n){
  const r=rng(n+7),beach=p.cat==='beach';
  let roads='',blocks='';
  for(let k=0;k<8;k++){const y=-10+k*38+(r()*12-6);roads+=`<path d="M-30 ${y} L430 ${y+(r()*30-15)}"/>`}
  for(let k=0;k<10;k++){const x=-10+k*46+(r()*12-6);roads+=`<path d="M${x} -30 L${x+(r()*34-17)} 270"/>`}
  for(let k=0;k<26;k++){const x=r()*380,y=r()*220,w=14+r()*30,h=10+r()*22;blocks+=`<rect x="${x|0}" y="${y|0}" width="${w|0}" height="${h|0}" rx="2"/>`}
  const main=`M-20 ${190-r()*40} C 110 ${150+r()*30}, 250 ${60+r()*30}, 430 ${40+r()*40}`;
  const route=beach?`M-10 ${30+r()*30} C 90 ${30+r()*20}, 120 ${100+r()*10}, 200 135`:`M${r()>.5?-10:410} ${220} C ${100+r()*60} 200, ${140+r()*40} 150, 200 135`;
  const water=beach?`<path class="water" d="M-20 ${150+r()*10} C 70 ${118+r()*14}, 140 ${196+r()*10}, 230 ${150+r()*8} S 360 ${118+r()*12}, 430 ${152+r()*8} L430 270 L-20 270Z"/>
      <path class="wave" d="M20 205 q18 -9 36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0"/><path class="wave w2" d="M-10 230 q18 -9 36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0"/>`:
      `<circle class="ring" cx="200" cy="135" r="26"/><circle class="ring" cx="200" cy="135" r="46"/>`;
  return `<svg class="mapsvg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g class="pan"><g class="roads">${roads}</g><g class="blocks">${blocks}</g><path class="avenue" d="${main}"/>${water}
    <path class="route" d="${route}"/>
    <ellipse class="pulse" cx="200" cy="135" rx="10" ry="4"/><ellipse class="pulse p2" cx="200" cy="135" rx="10" ry="4"/>
    <g transform="translate(200 135)"><g class="pin" style="--i:${n}"><path d="M0 0C-10-13-16-20-16-30a16 16 0 0132 0c0 10-6 17-16 30z"/><circle cx="0" cy="-30" r="6"/></g></g></g></svg>`;
}
const grid=$('.projects');
if(grid&&window.PLACES){
  grid.innerHTML=PLACES.map((p,i)=>`<article class="project a z" style="--d:${(0.12+i*0.08).toFixed(2)}s" data-cat="${p.cat}" tabindex="0" data-title="${esc(p.name)}" data-area="${esc(p.area)}" data-q="${esc(p.q||p.name+' '+p.area)}" data-desc="${esc(p.desc)}">
    <div class="art">${mapSVG(p,i)}<span class="maptag"><i></i>${esc(p.area)}</span><span class="mapzoom" aria-hidden="true"><b>+</b><b>−</b></span></div>
    <div class="pbody"><span class="ptag">${TAG[p.cat]||'Place'} · ${esc(p.area.split(',')[0])}</span><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p><div class="pmore"><span>View on map</span><i>↗</i></div></div></article>`).join('');
  if(window.MJA&&MJA.reveal)$$('.project').forEach(MJA.reveal);
}
let busy=0;
$$('.filter').forEach(b=>b.addEventListener('click',()=>{
  if(b.classList.contains('active'))return;
  $$('.filter').forEach(x=>x.classList.toggle('active',x===b));
  const f=b.dataset.filter,all=$$('.project'),token=++busy;
  const matches=p=>f==='all'||p.dataset.cat===f;
  // the first-load entrance animation would override our transitions, so drop it
  all.forEach(p=>{p.classList.remove('a','z');p.getAnimations().forEach(a=>a.cancel())});
  const leaving=all.filter(p=>!p.hidden&&!matches(p));
  const entering=all.filter(p=>p.hidden&&matches(p));
  const staying=all.filter(p=>!p.hidden&&matches(p));
  if(reduce){leaving.forEach(p=>p.hidden=true);entering.forEach(p=>p.hidden=false);return}

  // 1) cards that don't match fade, shrink and blur away
  const outs=leaving.map((p,i)=>p.animate(
    [{opacity:1,transform:'scale(1)',filter:'blur(0)'},{opacity:0,transform:'scale(.85) translateY(1.5rem)',filter:'blur(6px)'}],
    {duration:380,delay:i*50,easing:'cubic-bezier(.55,0,.8,.3)',fill:'forwards'}).finished.catch(()=>{}));

  Promise.all(outs).then(()=>{
    if(token!==busy)return;
    const first=new Map(staying.map(p=>[p,p.getBoundingClientRect()]));
    leaving.forEach(p=>{p.getAnimations().forEach(a=>a.cancel());p.hidden=true});
    entering.forEach(p=>p.hidden=false);
    // 2) remaining cards glide smoothly into their new spots
    staying.forEach(p=>{
      const r=p.getBoundingClientRect(),o=first.get(p),dx=o.left-r.left,dy=o.top-r.top;
      if(dx||dy)p.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:700,easing:'cubic-bezier(.22,1,.36,1)'});
    });
    // 3) cards that now match rise back in, one after another
    entering.forEach((p,i)=>p.animate(
      [{opacity:0,transform:'scale(.85) translateY(2rem)',filter:'blur(8px)'},{opacity:1,transform:'none',filter:'blur(0)'}],
      {duration:700,delay:120+i*110,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
  });
}));

const modal=$('#modal');
function openModal(p){$('#mTitle').textContent=p.dataset.title;$('#mDesc').textContent=p.dataset.desc;$('#mArea').textContent=p.dataset.area||'';const l=$('#mLink');if(l)l.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.dataset.q||p.dataset.title);modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
$$('.project').forEach(p=>{
  p.addEventListener('click',()=>openModal(p));
  p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(p)}});
});
$('#modalX').onclick=closeModal;
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
})();
