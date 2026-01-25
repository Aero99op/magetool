
const CACHE_NAME = 'magetool-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through for now to avoid breaking things with aggressive caching
    // We can add offline capabilities later if requested
    event.respondWith(fetch(event.request));
});
