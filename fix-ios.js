(()=>{
const TOP=window;
function bootShell(){
  const shell=document.querySelector('iframe');
  if(!shell)return;
  const bootApp=()=>{
    try{
      const app=shell.contentDocument?.querySelector('#app');
      if(!app)return;
      const boot=()=>patch(app);
      app.addEventListener('load',boot,{once:false});
      boot();
    }catch(e){console.log('Budapeszt iOS fix',e)}
  };
  shell.addEventListener('load',bootShell,{once:false});
  bootApp();
}
function patch(app){
  try{
    const d=app.contentDocument,w=app.contentWindow;
    if(!d||!w)return;
    const main=d.getElementById('main');
    if(!main)return;
    const patchNav=()=>{
      d.querySelectorAll('a.btn').forEach(a=>{
        if(!/nawigacja/i.test(a.textContent||''))return;
        if(a.dataset.iosNavFixed)return;
        a.dataset.iosNavFixed='1';
        a.target='_self';
        a.removeAttribute('rel');
        a.addEventListener('click',e=>{
          e.preventDefault();
          e.stopPropagation();
          TOP.location.assign(a.href);
        },true);
      });
    };
    const patchNext=()=>{
      const input=main.querySelector('.stop .done input');
      if(!input||input.dataset.nextFixed)return;
      const attr=input.getAttribute('onchange')||'';
      const m=attr.match(/complete\(['"]([^'"]+)['"]\)/);
      if(!m)return;
      const id=m[1];
      input.dataset.nextFixed='1';
      input.onchange=()=>{
        if(!input.checked)return;
        if(w.S&&w.S.done){
          w.S.done[id]=true;
          if(typeof w.save==='function')w.save();
        }
        if(typeof w.render==='function')w.render();
        setTimeout(()=>{
          const card=main.querySelector('.stop');
          if(card)card.scrollIntoView({behavior:'smooth',block:'start'});
        },40);
      };
    };
    patchNav();patchNext();
    if(!main.dataset.iosObserver){
      main.dataset.iosObserver='1';
      new MutationObserver(()=>requestAnimationFrame(()=>{patchNav();patchNext()})).observe(main,{childList:true,subtree:true});
    }
  }catch(e){console.log('Budapeszt iOS patch',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootShell);else bootShell();
})();
