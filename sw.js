// 🔔 เปลี่ยนชื่อตรงนี้ทุกครั้งที่มีอัปเดต
const CACHE = "acc-pwa-v1.5.1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// ===== INSTALL =====
self.addEventListener("install", event => {
  self.skipWaiting(); // บังคับใช้ตัวใหม่ทันที
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

// ===== ACTIVATE =====
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // คุมหน้าเว็บทันที
});

// ===== FETCH =====
// ใช้ network ก่อน → fallback เป็น cache
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache =>
          cache.put(event.request, copy)
        );
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
