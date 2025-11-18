// Service Worker para Valentão Desktop
const CACHE_NAME = 'valentao-desktop-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/images/BackgroundEraser_20250411_205630024.png',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retornar resposta
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Atualizar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Notificações Push (para futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Valentão Desktop',
    icon: '/images/BackgroundEraser_20250411_205630024.png',
    badge: '/images/BackgroundEraser_20250411_205630024.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/images/BackgroundEraser_20250411_205630024.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/images/BackgroundEraser_20250411_205630024.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Valentão Desktop', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Abrir aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});