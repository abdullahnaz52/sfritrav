/**
 * SfriTrav Service Worker
 * Cache-first strategy for assets, network-first for articles/API
 */
const CACHE_VERSION = 'sfritrav-v1.2';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';
const MAX_DYNAMIC = 60;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/security.js',
  '/js/cache.js',
  '/js/app.js',
  '/pages/contact.html',
  '/pages/about.html',
  '/privacy-policy.html',
  '/terms.html',
];

/* ---- Install ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---- Activate ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ---- Fetch ---- */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and external APIs (except Unsplash images)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('unsplash') && !url.hostname.includes('fonts.googleapis')) return;

  // API calls: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: cache-first
  if (STATIC_ASSETS.some(p => url.pathname === p || url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages: stale-while-revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Images: cache-first with dynamic cache
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

/* ---- Strategies ---- */
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    await trimCache(cacheName, MAX_DYNAMIC);
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(res => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => {});
  return cached || networkPromise;
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
  }
}

/* ---- Background Sync: queue failed form submissions ---- */
self.addEventListener('sync', event => {
  if (event.tag === 'form-sync') {
    event.waitUntil(syncForms());
  }
});

async function syncForms() {
  // Retry failed formspree submissions from IndexedDB queue
  console.info('[SW] Syncing queued form submissions...');
}

/* ---- Push Notifications (future) ---- */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'SfriTrav', {
      body: data.body || 'New travel story published!',
      icon: '/images/icon-192.png',
      badge: '/images/badge-72.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
