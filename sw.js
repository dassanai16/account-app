const CACHE_NAME = "acc-pwa-v2.0";
const BASE = self.registration.scope;

const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          return r;
        })
        .catch(() => caches.match(BASE + "index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(res =>
      res || fetch(e.request)
    )
  );
});
