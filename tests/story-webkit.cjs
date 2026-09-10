const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const {webkit,chromium,devices}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(req.url.split('?')[0]);const file=path.join(root,name==='/'?'index.html':name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(data)});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const engine=process.env.BROWSER==='chromium'?'chromium':'webkit';
 const browser=await (engine==='chromium'?chromium:webkit).launch({headless:true});
 const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'allow'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-09-10T12:00:00+02:00'));
 const url='http://127.0.0.1:'+server.address().port;
 async function start(){await page.getByRole('button',{name:/Tryb roboczy/}).click();await page.getByRole('button',{name:/Zaczynamy/}).click()}
 async function complete(){await page.locator('.done').click()}
 await page.goto(url);assert(await page.locator('.count').isVisible());assert(await page.locator('#game').isHidden());
 const countdown=await page.locator('.count').innerText();await page.clock.setFixedTime(new Date('2026-09-10T12:00:01+02:00'));await page.waitForFunction(old=>document.querySelector('.count').textContent!==old,countdown);
 await start();assert.equal(await page.locator('#clue-count').innerText(),'0/5');
 await page.getByRole('button',{name:/^SOB/}).click();assert.match(await page.locator('.stop h3').innerText(),/Kalmár/);
 await page.getByRole('button',{name:'Wpisz lub popraw trop'}).click();
 await page.locator('#clue-word').fill('lekkość <img src=x onerror=alert(1)>');
 assert(await page.locator('#clue-sign').isDisabled());
 assert.equal(await page.locator('#clue-count').innerText(),'1/5');
 await page.locator('#clue-word').fill('lekkość');
 await complete();await page.getByRole('button',{name:/Cofnij ostatni punkt/}).click();
 assert.equal(await page.locator('#clue-word').inputValue(),'lekkość');
 await complete();await complete();
 await page.getByRole('button',{name:'Wpisz lub popraw trop'}).click();await page.locator('#clue-sign').fill('ciemnozielona kopuła');
 await page.reload();await start();assert.match(await page.locator('.stop h3').innerText(),/Góra Gellerta/);
 assert.equal(await page.locator('#clue-sign').inputValue(),'ciemnozielona kopuła');
 await complete();await complete();
 await page.getByRole('button',{name:/Przejdź do kolejnego dnia/}).click();
 assert.match(await page.locator('.head h2').innerText(),/Sobota/);
 await page.reload();await start();assert.match(await page.locator('.head h2').innerText(),/Sobota/);
 for(let i=0;i<4;i++)await complete();
 await page.getByRole('button',{name:'Wpisz lub popraw trop'}).click();await page.locator('#clue-color').fill('miodowy złoty');await complete();
 await page.getByRole('button',{name:/Pomijamy · Kalmár/}).click();
 assert.equal(await page.evaluate(()=>S.choices.s6),'skip');
 await page.reload();await start();assert.equal(await page.evaluate(()=>S.choices.s6),'skip');
 while(await page.locator('.done input').count())await complete();
 await page.getByRole('button',{name:/Przejdź do kolejnego dnia/}).click();await complete();
 await page.getByRole('button',{name:'Wpisz lub popraw trop'}).click();await page.locator('#clue-symbol').fill('lew przy moście');await complete();
 while(await page.locator('.done input').count())await complete();
 await page.getByRole('button',{name:/Przejdź do kolejnego dnia/}).click();
 await page.getByRole('button',{name:'Wpisz lub popraw trop'}).click();await page.locator('#clue-cover').fill('nocny Dunaj i światła');
 assert.equal(await page.locator('#clue-count').innerText(),'5/5');assert.equal(await page.locator('#postcard').count(),0);
 while(await page.locator('.done input').count())await complete();
 assert.match(await page.locator('#pct').innerText(),/^100%/);
 const prompt=await page.locator('#postcard-prompt').inputValue();
 for(const s of ['lekkość','ciemnozielona kopuła','miodowy złoty','lew przy moście','nocny Dunaj i światła'])assert(prompt.includes(s));
 await page.locator('#clue-word').fill('   ');assert.equal(await page.locator('#postcard-prompt').count(),0);assert.equal(await page.locator('#clue-count').innerText(),'4/5');
 await page.locator('#clue-word').fill('<script>alert("x")</script>');assert((await page.locator('#postcard-prompt').inputValue()).includes('<script>'));
 assert.equal(await page.locator('#history script').count(),0);
 await page.locator('#clue-word').fill('lekkość');
 await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('Denied'))});
 await page.getByRole('button',{name:'Kopiuj prompt'}).click();assert.match(await page.locator('#copy-status').innerText(),/Przytrzymajcie/);
 await page.getByRole('button',{name:/Cofnij ostatni punkt/}).click();assert.equal(await page.locator('#postcard').count(),0);await complete();
 await page.locator('#history-details summary').click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:path.join(root,'..','postcard-webkit.png'),fullPage:false});
 console.log('PASS: '+engine+' complete trip and finale');
 // Offline reload includes the new app shell and preserves all clues.
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});
 await page.reload();await start();
 const shell=await page.evaluate(async()=>!!(await caches.match('./story.js'))&&!!(await caches.match('./story.css')));assert(shell);
 if(engine==='chromium'){await context.setOffline(true);await page.reload();await start()}
 assert.equal(await page.locator('#clue-count').innerText(),'5/5');assert.equal(await page.locator('#postcard-prompt').count(),1);
 await context.setOffline(false);console.log(engine==='chromium'?'PASS: offline reload':'PASS: cached app shell; offline navigation requires physical Safari verification (Windows WebKit internal error)');
 // Existing v7 saves without clues must preserve route progress and migrate safely.
 await page.evaluate(()=>localStorage.setItem(KEY,JSON.stringify({done:{f1:true,f2:true},used:[1],choices:{s6:'go'}})));
 await page.reload();await start();assert.match(await page.locator('.stop h3').innerText(),/Góra Gellerta/);assert.equal(await page.locator('#clue-count').innerText(),'0/5');
 await page.getByRole('button',{name:'Wpisz lub popraw trop'}).click();
 assert(await page.locator('#clue-word').isEnabled());await page.locator('#clue-word').fill('uzupełnione');
 // Storage errors remain visible, retry recovers.
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('quota')}});
 await page.locator('#clue-word').fill('bez utraty');assert(await page.locator('#retry-history').isVisible());
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet});
 await page.getByRole('button',{name:'Zapisz ponownie'}).click();assert(await page.locator('#retry-history').isHidden());
 await page.reload();await start();assert.equal(await page.locator('#clue-word').inputValue(),'bez utraty');
 // Corrupt old state is repaired, future stages stay locked.
 await page.evaluate(()=>localStorage.setItem(KEY,'{broken'));await page.reload();await start();assert.equal(await page.locator('#clue-count').innerText(),'0/5');
 await page.getByRole('button',{name:'Wpisz lub popraw trop'}).click();assert(await page.locator('#clue-cover').isDisabled());
 await page.setViewportSize({width:375,height:667});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:path.join(root,'..','history-webkit.png'),fullPage:true});
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'↺ Reset'}).click();await start();assert.equal(await page.locator('#clue-count').innerText(),'0/5');
 assert.deepEqual(errors,[]);
 console.log('PASS: mobile browser, countdown, all 27 points / 4 days, clue persistence, undo, skip bridge, day locks, resume, 5/5 + 100% finale, prompt escaping, clipboard fallback, cached app shell, v7 migration, storage retry, corrupt state, 375px layout, reset; no page errors.');
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1)});

