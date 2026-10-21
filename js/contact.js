/* =====================================================
   CONTACT PAGE — email, copy button, message form
   ===================================================== */
(function(){
const $=(s,r=document)=>r.querySelector(s);
$('#emailShow').textContent=SITE.email;
const fb=$('#fbLink');if(fb&&SITE.facebook)fb.href=SITE.facebook;
const li=$('#liLink');if(li&&SITE.linkedin)li.href=SITE.linkedin;

$('#copyEmail').onclick=async()=>{
  try{await navigator.clipboard.writeText(SITE.email)}
  catch(e){const x=document.createElement('textarea');x.value=SITE.email;document.body.append(x);x.select();document.execCommand('copy');x.remove()}
  MJA.toast('Email copied!');
};

$('#form').onsubmit=e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  location.href='mailto:'+SITE.email+'?subject='+encodeURIComponent(f.get('subject'))+'&body='+encodeURIComponent('Name: '+f.get('name')+'\nEmail: '+f.get('email')+'\n\n'+f.get('message'));
  MJA.toast('Opening your email app…');
};
})();
