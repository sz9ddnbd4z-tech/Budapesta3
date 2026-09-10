const CACHE_NAME='budapeszt-v21-single-countdown';
const APP_SHELL=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon.svg','./story.css'];

const COUNTDOWN_HOTFIX=`
function showExactDemoGate(){
  clearInterval(window.__demoTimer);
  try{clearInterval(gateTimer);gateTimer=null}catch(e){}
  const gate=document.getElementById('gate');
  document.getElementById('game').hidden=true;
  gate.hidden=false;
  gate.className='gate demo-gate';
  const target=new Date('2026-09-11T13:00:00+02:00').getTime();
  const remaining=target-Date.now();
  gate.innerHTML='<div class="gatecard"><div class="ey">11—14 WRZEŚNIA 2026</div><h1 class="demo-title">Budapeszt,<br><em>na dwoje</em></h1><p class="demo-note">Walcz dzielnie, Martynko.<br>Bo Żubr zostanie wypity za:</p><div class="count" id="demo-count">'+(remaining>0?demoClock(remaining):'TERAZ')+'</div><p class="demo-date">Piątek · 11 września · 13:00 · czas Budapesztu</p><p class="demo-small">✈️ Odlot 14:45 · spierdalamy o 12:45</p><aside class="spoiler"><b>PIERWSZA MISJA · SPOILER</b><span>🌿 Wyzerowanie Żubra w krzakach.</span></aside><section class="pack"><h2>DO SPAKOWANIA</h2><ul><li>Dokumenty i kasa</li><li>Telefon + ładowanie</li><li>Rzeczy do opery</li><li>Rzeczy do kąpieli</li><li>Buty do chodzenia</li><li>Bielizna i skarpety</li><li>Kosmetyczka 100 ml</li><li>Leki / plastry</li><li>Ciepła warstwa</li><li>Mały plecak</li></ul></section><section class="password"><div class="ey">WEJŚCIE DO GRY</div><p style="color:#f9f2e6;font:16px/1.4 Georgia,serif">Podpowiedź: dziewczynki Bambinki 🐈🐈</p><input id="trip-password" type="password" autocomplete="off" placeholder="Wpisz hasło"><button type="button" id="trip-enter">Otwórz dalszą część →</button><p id="pw-status" style="min-height:18px;color:#f4c18f;font-size:12px"></p></section><p style="margin:26px 0 0;color:#ffffff99;font-size:12px">Mała rzecz, na którą warto czekać. ❤️</p></div>';
  const check=()=>{
    const v=document.getElementById('trip-password')?.value||'';
    if(norm(v)!==norm('GrubciaDiuncia')){
      const status=document.getElementById('pw-status');
      if(status)status.textContent='To jeszcze nie to. Dziewczynki patrzą podejrzliwie 👀';
      return;
    }
    clearInterval(window.__demoTimer);
    try{clearInterval(gateTimer);gateTimer=null}catch(e){}
    renderPrologue();
  };
  document.getElementById('trip-enter').onclick=check;
  document.getElementById('trip-password').onkeydown=e=>{if(e.key==='Enter')check()};
  window.__demoTimer=setInterval(()=>{
    const el=document.getElementById('demo-count');
    if(!el)return;
    const left=target-Date.now();
    el.textContent=left>0?demoClock(left):'TERAZ';
  },1000);
}
const __budapestInstallRuntimeOverrides=installRuntimeOverrides;
installRuntimeOverrides=function(){
  try{clearInterval(gateTimer);gateTimer=null}catch(e){}
  __budapestInstallRuntimeOverrides();
  try{clearInterval(gateTimer);gateTimer=null}catch(e){}
};
`;

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  if(url.pathname.endsWith('/story.js')){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{
      const text=await response.text();
      return new Response(text+'\n'+COUNTDOWN_HOTFIX,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store'}});
    }).catch(()=>caches.match(event.request)));
    return;
  }

  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
      return response;
    }).catch(()=>caches.match('./index.html').then(response=>response||caches.match('./'))));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
    return response;
  })));
});