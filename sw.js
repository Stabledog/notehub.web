// Service worker for notehub.web PWA
// Strategy: cache-first for app shell + veditor, network-first for API calls

const CACHE_NAME = 'notehub-v1';

// App shell files to precache on install.
// Vite hashes asset filenames, so we cache the entry point and let runtime
// caching pick up the hashed chunks on first load.
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
];

// Patterns that should always go to the network (API calls, auth)
const NETWORK_ONLY = [
  /\/api\//,
  /api\.github\.com/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Evict old caches when a new version deploys
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Network-only for API calls
  if (NETWORK_ONLY.some((re) => re.test(request.url))) return;

  // For everything else (app shell, JS bundles, veditor imports): stale-while-revalidate
  // Serve from cache immediately, fetch update in background for next time
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetched = fetch(request).then((response) => {
          // Only cache successful same-origin or CORS responses
          if (response.ok || response.type === 'opaque') {
            cache.put(request, response.clone());
          }
          return response;
        });
        return cached || fetched;
      })
    )
  );
});
