// Service Worker for Spelling Trainer PWA
// Strategy:
// - Network-first for page navigations (avoids stale hashed asset references)
// - Cache-first for static assets and local data

const CACHE_NAME = "spelling-trainer-v1";

// Derive base path from where the SW script is served
// e.g. https://user.github.io/spelling_bee/sw.js → /spelling_bee/
const BASE = new URL("./", self.location).pathname;

const ASSETS_TO_CACHE = [
  BASE,
  `${BASE}data/wordlists.json`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
  `${BASE}tts/manifest.json`,
  `${BASE}tts/README.md`,
  `${BASE}tts/onnx/README.md`,
  `${BASE}tts/piper/runtime/piper_phonemize.wasm`,
  `${BASE}tts/piper/runtime/piper_phonemize.data`,
  `${BASE}tts/piper/models/en_US-hfc_female-medium.onnx`,
  `${BASE}tts/piper/models/en_US-hfc_female-medium.onnx.json`,
  `${BASE}tts/piper/models/en_US-lessac-high.onnx`,
  `${BASE}tts/piper/models/en_US-lessac-high.onnx.json`,
  `${BASE}tts/kokoro/models/onnx-community/Kokoro-82M-v1.0-ONNX/README.md`,
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

// Fetch:
// - Navigations: network-first, fallback to cached app shell
// - Other same-origin GETs: cache-first
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) {
    return;
  }

  // Keep document requests fresh so they always point to current hashed assets.
  const isNavigation =
    event.request.mode === "navigate" ||
    event.request.destination === "document" ||
    url.pathname === BASE ||
    url.pathname === `${BASE}index.html`;

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match(BASE)))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (response.ok) {
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
