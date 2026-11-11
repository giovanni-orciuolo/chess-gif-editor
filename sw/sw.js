// The build replaces __PRECACHE__ with every file it emits, so one online visit makes the app work offline.
const precache = self.__PRECACHE__;
const cacheName = `chess-gif-editor-${self.__BUILD__}`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precache)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((name) => name !== cacheName).map((name) => caches.delete(name)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Pages go to the network first so a new deploy shows up; hashed assets never change.
  const response = request.mode === 'navigate' ? networkFirst(request) : cacheFirst(request);
  event.respondWith(response);
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && new URL(request.url).pathname === '/') await (await caches.open(cacheName)).put('/', response.clone());
    return response;
  } catch {
    return (await caches.match('/')) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
  return response;
}
