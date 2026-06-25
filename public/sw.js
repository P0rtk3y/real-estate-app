// LanScout Service Worker — Lan keeps the app fast even when connection is slow!
const CACHE_NAME = 'lanscout-v1';

// Assets to pre-cache on install
const PRE_CACHE = [
  '/',
  '/preferences',
  '/alerts',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch strategy ─────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests (except images we want cached)
  if (request.method !== 'GET') return;

  // API routes: network-first, no cache fallback (stale data is worse than error)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline — Lan is trying her best!' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // External image CDNs (Unsplash, Yelp, etc.): cache-first with network fallback
  if (
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('yelpcdn.com') ||
    url.hostname.includes('ticketm.net')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              return response;
            })
            .catch(() => new Response('', { status: 408 }))
      )
    );
    return;
  }

  // App pages & assets: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => {
            // Network failed — return offline page for navigation
            if (request.mode === 'navigate') {
              return cache.match('/offline') || new Response('Offline', { status: 503 });
            }
            return new Response('', { status: 408 });
          });

        return cached || networkFetch;
      })
    )
  );
});

// ─── Background sync placeholder ────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
