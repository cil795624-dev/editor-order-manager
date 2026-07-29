const EDITOR_CACHE = "editor-order-manager-ios-20260729-leadweekend";
const EDITOR_ASSETS = [
  "editor-order-manager.html",
  "editor-manifest.webmanifest",
  "editor-icon-180.png",
  "editor-icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(EDITOR_CACHE).then(function (cache) {
      return cache.addAll(EDITOR_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== EDITOR_CACHE && key.indexOf("editor-order-manager-ios-") === 0) {
          return caches.delete(key);
        }
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const assetName = url.pathname.split("/").pop();
  if (!EDITOR_ASSETS.includes(assetName)) return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).then(function (response) {
        const copy = response.clone();
        caches.open(EDITOR_CACHE).then(function (cache) {
          cache.put(event.request, copy);
        });
        return response;
      });
    })
  );
});
