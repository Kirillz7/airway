const CACHE_NAME = 'airway-v3'; // Поменяли v2 на v3
const ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/screens.css',
  './css/animations.css',
  './js/app.js',
  './js/firebase.js',
  './js/game.js',
  './js/ui/auth.js',
  './js/ui/profile.js',
  './js/ui/screens.js?v=6',
  './js/utils/i18n.js',
  './js/utils/theme.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Принудительно применяем обновления
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)) // Удаляем старый кеш
    ))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});