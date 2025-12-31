// ==============================
//  Service Worker
// ==============================
const CACHE_NAME = "acc-pwa-v1.6.0";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// ---------- INSTALL ----------
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ---------- ACTIVATE ----------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// ---------- FETCH ----------
self.addEventListener("fetch", event => {
  const req = event.request;

  // ไม่ cache request ที่ไม่ใช่ GET
  if (req.method !== "GET") return;

  // HTML → network first
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Static files → cache first
  event.respondWith(
    caches.match(req).then(cache => {
      return (
        cache ||
        fetch(req).then(res => {
          if (!res || res.status !== 200) return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
      );
    })
  );
});

// ---------- FORCE UPDATE ----------
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
