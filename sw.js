// sw.js - Service Worker mejorado
const CACHE_NAME = 'iglesia-scs-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

// Estrategia: Stale-While-Revalidate para la mayoría de recursos
// pero excluimos Firebase y OneSignal
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Excluir Firebase y OneSignal de la caché
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('onesignal.com') ||
      url.hostname.includes('gstatic.com')) {
    // Estrategia: Network Only para Firebase
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para recursos locales: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Actualizar caché en segundo plano
          fetch(event.request)
            .then(newResponse => {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, newResponse));
            })
            .catch(() => {});
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            // Guardar en caché si es exitoso
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(error => {
            console.log('Fetch falló:', error);
            // Podrías devolver una página offline aquí
          });
      })
  );
});