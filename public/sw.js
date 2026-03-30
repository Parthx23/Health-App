// public/sw.js — Custom service worker
// @ducanh2912/next-pwa will merge this with its generated worker

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Offline fallback — serve cached pages when network is unavailable
self.addEventListener('fetch', (event) => {
  // Let next-pwa handle all caching strategies
})
