/* =====================================================
   HOME PAGE — welcome intro (first visit only), typed roles, profile download
   ===================================================== */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const intro=$('#intro');
let seen=false;try{seen=sessionStorage.getItem('mjaIntro')==='1'}catch(e){}
const fromTransition=document.documentElement.classList.contains('cover');

/* typed roles */
const roles=['Keyword Researcher','On-Page Specialist','Technical Auditor','Link Building Strategist','Organic Growth Specialist'];
let started=false;
function typer(){
  if(started)return;started=true;const el=$('#typed');
  if(reduce){el.textContent=roles[0];return}
  let r=0,c=0,del=false;
  (function tick(){
    const w=roles[r];el.textContent=w.slice(0,c);
    if(!del&&c===w.length){del=true;return setTimeout(tick,1700)}
    if(del&&c===0){del=false;r=(r+1)%roles.length}
    c+=del?-1:1;setTimeout(tick,del?32:70);
  })();
}

/* intro — HELLO / WELCOME, then wait for the click */
if(fromTransition||!intro){
  if(intro)intro.remove();
  MJA.ready();typer();
}else{
  function letters(el,text,base,step,extra){
    [...text].forEach((c,i)=>{
      const s=document.createElement('span');s.className='lt'+(extra&&c==='.'?' dot':'');
      s.textContent=c;s.style.animationDelay=(base+i*step)+'s'+(extra?'':',');
      el.appendChild(s);
    });
  }
  const wb=$('#welcomeBig');
  // wait for the fonts first so the letters never jump/reflow mid-animation (max 700ms)
  function buildWelcome(){
    if(wb.children.length)return;
    letters(wb,'WELCOME',.35,.09,false);
    // shimmer wave on WELCOME (delay applied to 2nd animation)
    [...wb.children].forEach((s,i)=>{s.style.animationDelay=(.35+i*.09)+'s,'+(1.8+i*.12)+'s'});
  }
  Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,700))]).then(buildWelcome);
  let opened=false;
  function openSite(){
    if(opened)return;opened=true;
    document.body.classList.add('opening');
    intro.classList.add('open');
    setTimeout(()=>{MJA.ready();typer()},reduce?0:650);
    setTimeout(()=>{intro.remove();document.body.classList.remove('opening')},reduce?100:2000);
  }
  $('#enter').addEventListener('click',openSite);
  addEventListener('keydown',e=>{if(e.key==='Enter')openSite()});
}

/* download profile */
$('#download').onclick=()=>{
  const t='MC VHEN ASMA\nSEO Specialist (Search Engine Optimization)\n\nLocation: Misamis Oriental, Mindanao, Philippines\nLanguages: English, Tagalog, Cebuano\n\nSUMMARY\nSearch Engine Optimization specialist focused on helping websites rank higher, earn organic traffic and grow online. Known for discipline, honest communication, adaptability and a strong sense of accountability.\n\nCORE SERVICES\n• Keyword Research\n• On-Page Optimization\n• Technical SEO\n• Link Building\n• Analytics & Reporting\n• Continuous Learning\n\nContact: '+SITE.email;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'}));a.download='Mc-Vhen-Asma-Profile.txt';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);MJA.toast('Profile downloaded');
};
})();
