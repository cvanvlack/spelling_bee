// Service Worker for Spelling Trainer PWA
// Strategy: Cache-first for all assets

const CACHE_NAME = "spelling-trainer-v1";

// Derive base path from where the SW script is served
// e.g. https://user.github.io/spelling_bee/sw.js → /spelling_bee/
const BASE = new URL("./", self.location).pathname;

const ASSETS_TO_CACHE = [
  BASE,
  `${BASE}index.html`,
  `${BASE}data/wordlists.json`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
];

// Install: cache app shell and data
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        // Cache successful GET requests
        if (
          response.ok &&
          event.request.method === "GET" &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
