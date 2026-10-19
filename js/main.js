document.addEventListener('DOMContentLoaded',()=>{
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // hamburger
  const ham=document.getElementById('hamburger'), mm=document.getElementById('mobileMenu');
  const setMenu=(open)=>{
    mm.classList.toggle('open',open);
    mm.setAttribute('aria-hidden',String(!open));
    ham.classList.toggle('open',open);
    ham.setAttribute('aria-expanded',String(open));
    ham.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
  };
  ham.addEventListener('click',()=>setMenu(!mm.classList.contains('open')));
  document.querySelectorAll('.mob-link').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&mm.classList.contains('open')){setMenu(false);ham.focus();} });

  // nav shadow
  const nav=document.getElementById('nav');
  window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40),{passive:true});

  // smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href');
      const behavior=reduce?'auto':'smooth';
      if(id==='#top'){ e.preventDefault(); window.scrollTo({top:0,behavior}); return; }
      if(id==='#') return;
      const t=document.querySelector(id);
      if(t){ e.preventDefault(); window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-76,behavior}); }
    });
  });

  // reveal
  const rev=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); rev.unobserve(e.target);} }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(x=>rev.observe(x));

  // detail dialogs
  document.querySelectorAll('[data-dialog]').forEach(trigger=>{
    trigger.addEventListener('click',()=>{
      const dialog=document.getElementById(trigger.dataset.dialog);
      if(dialog&&typeof dialog.showModal==='function') dialog.showModal();
    });
  });
  document.querySelectorAll('.detail-modal').forEach(dialog=>{
    dialog.querySelectorAll('.modal-close').forEach(button=>button.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('click',event=>{ if(event.target===dialog) dialog.close(); });
  });

  // contact form (Web3Forms)
  const form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const btn=form.querySelector('.cf-submit'), txt=form.querySelector('.cf-btn-text'),
            arr=form.querySelector('.arr'), sp=form.querySelector('.cf-spinner'),
            ok=document.getElementById('cfSuccess'), bad=document.getElementById('cfError'),
            em=document.getElementById('cf-email'), ms=document.getElementById('cf-msg');
      let valid=true; [em,ms].forEach(x=>x.classList.remove('err'));
      if(!em.value||!/\S+@\S+\.\S+/.test(em.value)){ em.classList.add('err'); valid=false; }
      if(!ms.value.trim()){ ms.classList.add('err'); valid=false; }
      if(!valid) return;
      btn.disabled=true; txt.textContent='Sending…'; arr.style.display='none'; sp.style.display='inline-flex';
      ok.style.display='none'; bad.style.display='none';
      try{
        const res=await fetch('https://api.web3forms.com/submit',{
          method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'},
          body:JSON.stringify({
            access_key:'288907e9-dc2d-4c34-8070-b2f6e14af91b',
            from_name:'lyubovoynov.com', subject:'New enquiry from lyubovoynov.com',
            email:em.value, message:ms.value
          })
        });
        const data=await res.json();
        if(data.success){ ok.style.display='block'; form.reset(); }
        else throw new Error(data.message);
      }catch(err){
        const s=encodeURIComponent('Enquiry from lyubovoynov.com');
        const b=encodeURIComponent('From: '+em.value+'\n\n'+ms.value);
        window.location.href='mailto:voynov.lyuboslav@gmail.com?subject='+s+'&body='+b;
      }finally{
        btn.disabled=false; txt.textContent='Send message'; arr.style.display='inline-block'; sp.style.display='none';
      }
    });
  }

  // ─── AGENT LOOP ───
  (function(){
    const root=document.getElementById('loop'); if(!root) return;
    const $=id=>document.getElementById(id);
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const c1=$('c1'),c2=$('c2'),tIntake=$('t-intake'),tCore=$('t-core'),nIntake=$('n-intake'),nCore=$('n-core');
    const chR=$('ch-resolved'),chP=$('ch-pending'),chE=$('ch-esc');
    const tyA=$('ty-auto'),tyH=$('ty-human'),tyP=$('ty-pend');
    const count={a:0,h:0,p:0};
    const set=()=>{ tyA.textContent=count.a; tyH.textContent=count.h; tyP.textContent=Math.max(0,count.p); };
    const on=e=>e&&e.classList.add('is-on'), off=e=>e&&e.classList.remove('is-on');
    const done=e=>e&&e.classList.add('done'), undone=e=>e&&e.classList.remove('done');
    const flow=e=>e&&e.classList.add('flow'), unflow=e=>e&&e.classList.remove('flow');
    const hit=(e,ms=1100)=>{ if(!e)return; e.classList.add('hit'); setTimeout(()=>e.classList.remove('hit'),ms); };
    function reset(){ [c1,c2].forEach(unflow); [nIntake,nCore].forEach(undone); off(tIntake);off(tCore); }

    if(reduce){
      flow(c1);flow(c2); done(nIntake);done(nCore);
      count.a=4; count.h=1; count.p=2; set(); return;
    }
    async function cycle(){
      reset(); await sleep(300);
      on(tIntake); await sleep(520); off(tIntake); done(nIntake);
      flow(c1); await sleep(620);
      on(tCore); await sleep(900);
      flow(c2); await sleep(560); off(tCore); done(nCore);
      hit(chR); count.a+=3; set(); await sleep(560);
      hit(chP); count.p+=1; set(); await sleep(620);
      hit(chE); count.h+=1; set(); await sleep(1200);
      await sleep(1800);
      cycle();
    }
    const obs=new IntersectionObserver(es=>{ if(es[0].isIntersecting){ obs.disconnect(); cycle(); } },{threshold:.2});
    obs.observe(root);
  })();
});
