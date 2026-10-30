// Tracker offline support.
// Every update downloads fresh copies (never the phone's short-term web cache),
// and the app page plus its small data files are always checked online first.
const VERSION='tracker-6';
const CORE=["./", "adhkar.json", "amiri-400.woff2", "amiri-700.woff2", "apple-touch-icon.png", "figtree-400.woff2", "figtree-500.woff2", "figtree-600.woff2", "figtree-700.woff2", "hadith-meta.json", "hafs.ttf", "icon-192.png", "icon-512.png", "icon-maskable.png", "index.html", "lwa.json", "manifest.webmanifest", "manzil.json", "newsreader-400i.woff2", "newsreader-500.woff2", "newsreader-600.woff2", "quran.json", "hizb-index.json", "hadith-sanad.json"];
const LATER=["hadith-01.json", "hadith-02.json", "hadith-03.json", "hadith-04.json", "hadith-05.json", "hadith-06.json", "hadith-07.json", "hadith-08.json", "hadith-09.json", "hadith-10.json", "hadith-11.json", "hadith-12.json", "hizb-sat.bin", "hizb-sun.bin", "hizb-mon.bin", "hizb-tue.bin", "hizb-wed.bin", "hizb-thu.bin", "hizb-fri.bin"];
const FRESH_FIRST=["./", "index.html", "adhkar.json", "hadith-meta.json", "hadith-sanad.json", "hizb-index.json", "manzil.json", "lwa.json", "manifest.webmanifest"];
const fresh=u=>fetch(new Request(u,{cache:'reload'}));
async function store(c,u){const r=await fresh(u);if(!r.ok)throw new Error(u);await c.put(u,r)}
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(VERSION);
  for(const f of CORE) await store(c,f);
  await self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k!==VERSION) await caches.delete(k);
  await self.clients.claim();
  const c=await caches.open(VERSION);
  for(const f of LATER){ if(!(await c.match(f))) { try{ await store(c,f) }catch(err){} } }
})())});
function key(req){const u=new URL(req.url);let p=u.pathname.split('/').pop();return p===''?'./':p}
self.addEventListener('fetch',e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=='GET'||u.origin!==location.origin) return;
  const k=req.mode==='navigate'?'./':key(req);
  e.respondWith((async()=>{
    const c=await caches.open(VERSION);
    if(FRESH_FIRST.includes(k)){
      try{
        const r=await Promise.race([fetch(req.mode==='navigate'?new Request('./',{cache:'no-cache'}):new Request(req,{cache:'no-cache'})),new Promise((_,x)=>setTimeout(()=>x(new Error('slow')),4000))]);
        if(r.ok){c.put(k,r.clone());return r}
      }catch(err){}
      return (await c.match(k))||(await c.match(req,{ignoreSearch:true}))||Response.error();
    }
    const hit=await c.match(req,{ignoreSearch:true});
    if(hit) return hit;
    try{const r=await fresh(req.url);if(r.ok)c.put(req,r.clone());return r}
    catch(err){return (await c.match('./'))||Response.error()}
  })());
});
