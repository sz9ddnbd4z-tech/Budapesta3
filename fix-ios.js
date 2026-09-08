(()=>{
const TOP=window.top;
function bootShell(){
  const shell=document.querySelector('iframe');
  if(!shell)return;
  const bootApp=()=>{try{const app=shell.contentDocument?.querySelector('#app');if(!app)return;const boot=()=>patch(app);app.addEventListener('load',boot);boot()}catch(e){console.log('Budapeszt iOS fix',e)}};
  shell.addEventListener('load',bootShell);bootApp();
}
function patch(app){
  try{
    const d=app.contentDocument,w=app.contentWindow;if(!d||!w)return;const main=d.getElementById('main');if(!main)return;
    if(!d.getElementById('iosux')){const s=d.createElement('style');s.id='iosux';s.textContent='html,body{width:100%;overflow-x:hidden;-webkit-text-size-adjust:100%}.randombar{padding-bottom:calc(10px + env(safe-area-inset-bottom));padding-left:max(13px,env(safe-area-inset-left));padding-right:max(13px,env(safe-area-inset-right))}.toast{bottom:calc(75px + env(safe-area-inset-bottom))}.btn,a.btn,button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}';d.head.appendChild(s)}
    const patchNav=()=>d.querySelectorAll('a.btn').forEach(a=>{if(!/nawigacja/i.test(a.textContent||'')||a.dataset.iosNavFixed)return;a.dataset.iosNavFixed='1';a.target='_top';a.removeAttribute('rel');a.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();TOP.location.href=a.href},true)});
    const patchTiles=()=>d.querySelectorAll('.grid').forEach(g=>{g.querySelectorAll('.tile > .btn,.tile > button,.tile > a.btn').forEach(b=>{if(/nawigacja/i.test(b.textContent||'')||b.dataset.iosTileFixed)return;const tile=b.closest('.tile');const ans=tile?.querySelector('.ans')||b.nextElementSibling;if(!ans)return;b.dataset.iosTileFixed='1';b.type='button';b.setAttribute('aria-expanded',ans.classList.contains('open')?'true':'false');b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const open=!ans.classList.contains('open');ans.classList.toggle('open',open);b.setAttribute('aria-expanded',open?'true':'false')},true)})});
    const patchNext=()=>{const input=main.querySelector('.stop .done input');if(!input||input.dataset.nextFixed)return;const attr=input.getAttribute('onchange')||'';const m=attr.match(/complete\(['"]([^'"]+)['"]\)/);if(!m)return;const id=m[1];input.dataset.nextFixed='1';input.onchange=()=>{if(!input.checked)return;try{if(typeof w.complete==='function')w.complete(id);else w.eval('complete('+JSON.stringify(id)+')')}catch(e){console.log('Budapeszt next patch',e)}setTimeout(()=>main.querySelector('.stop')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}};
    const run=()=>{patchNav();patchTiles();patchNext()};run();
    if(!main.dataset.iosObserver){main.dataset.iosObserver='1';new MutationObserver(()=>requestAnimationFrame(run)).observe(main,{childList:true,subtree:true})}
  }catch(e){console.log('Budapeszt iOS patch',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootShell);else bootShell();
})();
