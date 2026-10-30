const VERSION='tracker-5';
const CORE=["./", "adhkar.json", "amiri-400.woff2", "amiri-700.woff2", "apple-touch-icon.png", "figtree-400.woff2", "figtree-500.woff2", "figtree-600.woff2", "figtree-700.woff2", "hadith-meta.json", "hafs.ttf", "icon-192.png", "icon-512.png", "icon-maskable.png", "index.html", "lwa.json", "manifest.webmanifest", "manzil.json", "newsreader-400i.woff2", "newsreader-500.woff2", "newsreader-600.woff2", "quran.json", "hizb-index.json", "hadith-sanad.json"];
const LATER=["hadith-01.json", "hadith-02.json", "hadith-03.json", "hadith-04.json", "hadith-05.json", "hadith-06.json", "hadith-07.json", "hadith-08.json", "hadith-09.json", "hadith-10.json", "hadith-11.json", "hadith-12.json", "hizb-sat.bin", "hizb-sun.bin", "hizb-mon.bin", "hizb-tue.bin", "hizb-wed.bin", "hizb-thu.bin", "hizb-fri.bin"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k!==VERSION) await caches.delete(k);
  await self.clients.claim();
  const c=await caches.open(VERSION);
  for(const f of LATER){ if(!(await c.match(f))) { try{ await c.add(f) }catch(err){} } }
})())});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  e.respondWith((async()=>{
    const c=await caches.open(VERSION);
    const hit=await c.match(e.request,{ignoreSearch:true});
    if(hit) return hit;
    try{ const r=await fetch(e.request); if(r.ok) c.put(e.request,r.clone()); return r }
    catch(err){ return (await c.match('./'))||Response.error() }
  })());
});
