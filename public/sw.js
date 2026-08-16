// Simple Service Worker for ZapZap PWA
const CACHE_NAME = 'zapzap-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network first strategy
  if (event.request.method !== 'GET' || event.request.url.includes('/api/') || event.request.url.includes('/ws')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
