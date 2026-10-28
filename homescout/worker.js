/**
 * HomeScout API for Cloudflare Workers
 * Runtime secrets: NOTION_TOKEN, SITE_KEY. Neither is ever returned to a browser.
 * Notion data source: Mieszkania Gdańsk — baza ofert.
 * Routes: GET /health, GET /offers, PATCH /offers/:id.
 */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DS_DEFAULT='1616d3a7-735d-4361-839c-73cad6fbc0c9';
const allowedValues={bartek:['Tak','Może','Nie','Brak'],martyna:['Tak','Może','Nie','Brak'],decision:['Nowe','Podoba się','Do rozważenia','Odrzucone','Archiwum']};
const fields={bartek:'Ocena Bartek',martyna:'Ocena Martyna',decision:'Status decyzji',noteBartek:'Uwagi Bartek',noteMartyna:'Uwagi Martyna',noteTogether:'Opinia wspólna',photo:'Zdjęcie główne URL'};
const t=(p)=>p?.rich_text?.map(x=>x.plain_text||x.text?.content||'').join('')||'';
const title=(p)=>p?.title?.map(x=>x.plain_text||x.text?.content||'').join('')||'';
const value=(p,name)=>p[name];
const num=(p,name)=>value(p,name)?.number??null;
const sel=(p,name)=>value(p,name)?.select?.name||'';
const checkbox=(p,name)=>Boolean(value(p,name)?.checkbox);
export function mapPage(page){
 const p=page.properties||{},price=num(p,'Cena lokalu PLN')||0, extras=(num(p,'Garaż PLN')||0)+(num(p,'Komórka PLN')||0)+(num(p,'Inne obowiązkowe PLN')||0);
 return {id:page.id,title:title(p['Mieszkanie']),district:t(p['Dzielnica']),address:t(p['Adres']),area:num(p,'Powierzchnia m2')||0,rooms:num(p,'Pokoje')||0,floor:num(p,'Piętro')??0,floors:num(p,'Pięter w budynku')??0,year:num(p,'Rok budowy'),price,extras,total:num(p,'Cena kompletna PLN')??(price+extras),balcony:num(p,'Balkon taras m2'),status:sel(p,'Status ogłoszenia')||'Niezweryfikowane',decision:sel(p,'Status decyzji')||'Nowe',bartek:sel(p,'Ocena Bartek')||'Brak',martyna:sel(p,'Ocena Martyna')||'Brak',noteBartek:t(p['Uwagi Bartek']),noteMartyna:t(p['Uwagi Martyna']),noteTogether:t(p['Opinia wspólna']),plus:t(p['Największy plus']),minus:t(p['Największy minus']),kitchen:t(p['Kuchnia uwagi']),lift:checkbox(p,'Winda'),garage:checkbox(p,'Hala'),storage:checkbox(p,'Komórka'),duplex:checkbox(p,'Dwupoziomowe'),link:p['Link główny']?.url||'',photo:p['Zdjęcie główne URL']?.url||'',notion:page.url||''};
}
const j=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
function allow(origin,env){const configured=env.ALLOWED_ORIGIN||'';if(configured)return origin===configured?configured:'';return origin||'*';}
function cors(origin){return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET,PATCH,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-HomeScout-Key','Vary':'Origin'};}
function validKey(req,env){const actual=req.headers.get('X-HomeScout-Key')||'';const expected=env.SITE_KEY||'';if(!expected||!actual||actual.length!==expected.length)return false;let mismatch=0;for(let i=0;i<expected.length;i++)mismatch|=expected.charCodeAt(i)^actual.charCodeAt(i);return mismatch===0;}
async function notion(path,env,method='GET',body){if(!env.NOTION_TOKEN)throw new Error('Brak konfiguracji NOTION_TOKEN');
 const r=await fetch('https://api.notion.com/v1'+path,{method,headers:{'Authorization':'Bearer '+env.NOTION_TOKEN,'Notion-Version':'2025-09-03','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const payload=await r.json();if(!r.ok){throw new Error('Notion HTTP '+r.status+': '+(payload.message||'błąd API'));}return payload;}
async function listOffers(env){const id=env.NOTION_DATA_SOURCE_ID||DS_DEFAULT;const result=[];let cursor=null;
 do{const body={page_size:100};if(cursor)body.start_cursor=cursor;const data=await notion('/data_sources/'+encodeURIComponent(id)+'/query',env,'POST',body);result.push(...data.results.map(mapPage));cursor=data.has_more?data.next_cursor:null;if(result.length>=1000)throw new Error('Przekroczono limit 1000 ofert');}while(cursor);
 return result;}
function notionPatch(input){if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Nieprawidłowe dane.');const entries=Object.entries(input);if(!entries.length||entries.length>7)throw new Error('Pusty lub zbyt duży zapis.');const properties={};
 for(const [key,val] of entries){if(!(key in fields))throw new Error('Niedozwolone pole: '+key);
  if(key in allowedValues){if(!allowedValues[key].includes(val))throw new Error('Nieprawidłowa wartość '+key);properties[fields[key]]={select:{name:val}};}
  else if(key==='photo'){if(typeof val!=='string'||val.length>2000||val&&(!/^https:\/\//i.test(val)))throw new Error('Nieprawidłowy adres zdjęcia.');properties[fields[key]]={url:val||null};}
  else{if(typeof val!=='string'||val.length>1950)throw new Error('Zbyt długa lub nieprawidłowa notatka.');properties[fields[key]]={rich_text:val?[{type:'text',text:{content:val}}]:[]};}
 }
 return {properties};}
export default {async fetch(req,env){
 const url=new URL(req.url),origin=req.headers.get('Origin')||'',permitted=allow(origin,env),headers=cors(permitted||'null');
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(origin&&!permitted)return j({error:'Origin niedozwolony'},403,headers);
 if(url.pathname==='/health'&&req.method==='GET')return j({ok:true,service:'HomeScout API',notionConfigured:!!env.NOTION_TOKEN},200,headers);
 if(!validKey(req,env))return j({error:'Brak autoryzacji'},401,headers);
 try{
  if(url.pathname==='/offers'&&req.method==='GET')return j({offers:await listOffers(env),source:'Notion',refreshedAt:new Date().toISOString()},200,headers);
  const match=url.pathname.match(/^\/offers\/([a-fA-F0-9-]+)$/);
  if(match&&req.method==='PATCH'){
   if(!UUID.test(match[1]))return j({error:'Nieprawidłowy ID oferty'},400,headers);
   const raw=await req.text();if(raw.length>10000)return j({error:'Za duży payload'},413,headers);
   let patch;try{patch=JSON.parse(raw)}catch{return j({error:'Nieprawidłowy JSON'},400,headers);}
   let formatted;try{formatted=notionPatch(patch)}catch(e){return j({error:e.message},400,headers);}
   const updated=await notion('/pages/'+match[1],env,'PATCH',formatted);
   return j({ok:true,offer:mapPage(updated)},200,headers);
  }
  return j({error:'Nieznany endpoint'},404,headers);
 }catch(e){return j({error:'Błąd serwera API',detail:String(e.message||e).slice(0,250)},502,headers);}
 }};
