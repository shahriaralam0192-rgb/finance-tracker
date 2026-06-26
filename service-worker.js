// ── Cache version — bump this string any time you deploy a new index.html ──
const CACHE_NAME = 'fintracker-v5'; // <-- was v1/v2/v3/v4, now v5 forces full refresh

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-180.png'
];

// Install: pre-cache all assets
self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately, don't wait for old SW to die
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: delete ALL old caches that don't match current version
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // take control of all open tabs immediately
  );
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache fresh copies of same-origin requests
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, clone)
          );
        }
        return response;
      });
    })
  );
});
