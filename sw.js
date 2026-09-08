const C='budapeszt-v11';
const SHELL=['./','./index.html','./app-v8.html','./app-v5.html?v=20260908e','./manifest.webmanifest','./icon-180.png','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  const local=u.origin===self.location.origin;
  const html=u.pathname.endsWith('.html')||u.pathname.endsWith('/')||u.pathname.endsWith('sw.js');
  if(local&&html){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(fetch(e.request).then(r=>{if(r.ok||r.type==='opaque'){const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request)));
});