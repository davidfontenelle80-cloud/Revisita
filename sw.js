const APP_BUILD = '1.4.8';
const CACHE_PREFIX = 'revisita-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-v20-view-reminder`;
const TILE_CACHE = 'revisita-tiles-v1';
// Areas the user saved on purpose with "Guardar zona"; never trimmed, survives shell updates.
const ZONE_CACHE = 'revisita-zones-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css?v=1.4.8',
  './js/app.js?v=1.4.8',
  './js/map.js?v=1.4.8',
  './js/map-utils.js?v=1.4.8',
  './js/storage.js?v=1.4.8',
  './js/schedule-utils.js?v=1.4.8',
  './js/i18n.js?v=1.4.8',
  './js/visit-tools.js?v=1.4.8',
  './js/cloud-sync.js?v=1.4.8',
  './js/push.js?v=1.4.8',
  './js/visit-time.js?v=1.4.8',
  './icons/icon-72.png?v=1.4.8',
  './icons/icon-192.png?v=1.4.8',
  './icons/icon-512.png?v=1.4.8',
  './icons/icon-192-maskable.png?v=1.4.8',
  './icons/icon-512-maskable.png?v=1.4.8',
  './icons/apple-touch-icon.png?v=1.4.8',
  './icons/favicon.png?v=1.4.8'
];

function pathFor(value) {
  return new URL(value, self.location.href).pathname;
}

function isShellPath(url) {
  return PRECACHE_URLS.some((path) => pathFor(path) === url.pathname);
}

function isDocumentRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

async function cacheShellResponse(request, response) {
  if (response && response.ok && response.type === 'basic') {
    const cache = await caches.open(SHELL_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function shellFallback(request) {
  const cache = await caches.open(SHELL_CACHE);
  return (
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true })) ||
    Response.error()
  );
}

async function documentFallback(request) {
  const cache = await caches.open(SHELL_CACHE);
  return (
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true })) ||
    (await cache.match('./index.html')) ||
    (await cache.match('./')) ||
    Response.error()
  );
}

async function networkFirstDocument(request) {
  try {
    return await cacheShellResponse(request, await fetch(request, { cache: 'no-store' }));
  } catch {
    return documentFallback(request);
  }
}

async function networkFirstAsset(request) {
  try {
    return await cacheShellResponse(request, await fetch(request, { cache: 'no-store' }));
  } catch {
    return shellFallback(request);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Revisita SW] Atomic shell install failed:', error);
        throw error;
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== SHELL_CACHE &&
                key !== TILE_CACHE &&
                key !== ZONE_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'RELOAD_READY', build: APP_BUILD })
        );
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', (event) => {
  let data={};try{data=event.data?.json()||{};}catch{}
  event.waitUntil(self.registration.showNotification('Revisita',{
    body:String(data.body||'Tienes una revisita pronto.').slice(0,120),
    icon:'./icons/icon-192.png',badge:'./icons/icon-72.png',
    tag:`revisita-${data.sourceId||'reminder'}`,
    data:{url:'./'},
  }));
});

self.addEventListener('notificationclick',(event)=>{
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
    const existing=clients.find(client=>new URL(client.url).pathname.startsWith(new URL('./',self.location).pathname));
    if(existing)return existing.focus();
    return self.clients.openWindow('./');
  }));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(tile(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (isDocumentRequest(request)) {
    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (isShellPath(url)) {
    event.respondWith(networkFirstAsset(request));
  }
});

async function tile(request) {
  const cache = await caches.open(TILE_CACHE);
  const hit = (await cache.match(request)) || (await (await caches.open(ZONE_CACHE)).match(request.url));
  if (hit) return hit;

  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      eventlessCachePut(cache, request, response.clone());
      trimTiles(220);
    }
    return response;
  } catch {
    return Response.error();
  }
}

function eventlessCachePut(cache, request, response) {
  cache.put(request, response).catch(() => {});
}

async function trimTiles(maxEntries) {
  const cache = await caches.open(TILE_CACHE);
  const keys = await cache.keys();
  const extra = keys.length - maxEntries;
  if (extra > 0) {
    await Promise.all(keys.slice(0, extra).map((key) => cache.delete(key)));
  }
}
