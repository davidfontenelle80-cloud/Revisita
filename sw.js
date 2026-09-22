const CACHE_VERSION = 'v2';
const CACHE_PREFIX = 'revisita-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${CACHE_VERSION}`;
const TILE_CACHE = `${CACHE_PREFIX}tiles-${CACHE_VERSION}`;
const REQUIRED_SHELL = [
  './','./index.html','./css/main.css','./js/app.js','./js/map.js','./js/map-utils.js','./js/storage.js','./js/schedule-utils.js','./manifest.json',
  './icons/icon-72.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-192-maskable.png','./icons/icon-512-maskable.png','./icons/apple-touch-icon.png','./icons/favicon.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(SHELL_CACHE).then(c=>c.addAll(REQUIRED_SHELL))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith(CACHE_PREFIX)&&![SHELL_CACHE,TILE_CACHE].includes(n)).map(n=>caches.delete(n)));await self.clients.claim();})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.hostname==='tile.openstreetmap.org'){e.respondWith(tile(r));return;}if(u.origin!==self.location.origin)return;if(r.mode==='navigate'){e.respondWith(doc(r));return;}e.respondWith(asset(r));});
async function doc(r){try{const x=await fetch(r);if(x.ok)(await caches.open(SHELL_CACHE)).put('./index.html',x.clone());return x;}catch{return(await caches.match('./index.html'))||Response.error();}}
async function asset(r){const c=await caches.match(r);if(c)return c;const x=await fetch(r);if(x.ok)(await caches.open(SHELL_CACHE)).put(r,x.clone());return x;}
async function tile(r){const c=await caches.open(TILE_CACHE),hit=await c.match(r);if(hit)return hit;try{const x=await fetch(r);if(x.ok||x.type==='opaque'){c.put(r,x.clone());trim(TILE_CACHE,220);}return x;}catch{return Response.error();}}
async function trim(n,m){const c=await caches.open(n),k=await c.keys(),e=k.length-m;if(e>0)await Promise.all(k.slice(0,e).map(x=>c.delete(x)));}