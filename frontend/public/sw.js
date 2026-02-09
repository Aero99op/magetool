
const CACHE_NAME = 'magetool-cache-v4';
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/logo.png',
    '/ss1.png',
    '/ss2.png'
];

// Install Event: Cache core assets (Offline Support)
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        clients.claim().then(() => {
            return caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            });
        })
    );
});

// Fetch Event: Stale-while-revalidate strategy
// Methods to exclude from caching
const EXCLUDE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

// URLs to exclude from caching
const EXCLUDE_URLS = [
    '/api/',
    'google-analytics.com',
    'googletagmanager.com',
    'pagead2.googlesyndication.com',
    'chrome-extension'
];

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Ignore non-GET requests
    if (EXCLUDE_METHODS.includes(event.request.method)) return;

    // 2. Ignore specific URLs (API, Analytics, Extensions)
    if (EXCLUDE_URLS.some(path => url.href.includes(path)) || url.protocol === 'chrome-extension:') return;

    // 3. Ignore Range requests (Critical for video/audio/large text files like ONNX)
    if (event.request.headers.has('range')) return;

    // Navigation preload response
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const preloadResponse = await event.preloadResponse;
                    if (preloadResponse) return preloadResponse;
                    return await fetch(event.request);
                } catch (error) {
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(event.request);
                    return cachedResponse || cache.match('/');
                }
            })()
        );
        return;
    }

    // Standard asset caching (Stale-while-revalidate)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // Check if valid response to cache
                    if (networkResponse &&
                        networkResponse.status === 200 &&
                        (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {

                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch((err) => {
                    // If network fails and no cache, return nothing (or fallback if needed)
                    // For dynamic imports/models, we let it fail so app handles error
                    if (cachedResponse) return cachedResponse;
                    throw err;
                });

            return cachedResponse || fetchPromise;
        })
    );
});

// Periodic Sync (Data refresh)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
}

// Background Sync (Retry failed requests)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Logic to sync data when online
    console.log('Background sync triggered');
}

// Push Notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/logo.png',
            badge: '/logo.png'
        });
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
