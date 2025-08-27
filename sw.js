// Service Worker for Omniverse Geckos PWA
const CACHE_NAME = 'omniverse-geckos-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/assets/logo.jpg',
  '/assets/geckos/hero-gecko.jpg'
];

// Install service worker
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Error caching static files:', err);
      })
  );
});

// Activate service worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch strategy: Cache first, network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle different request types
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleOtherRequests(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Image fetch failed:', error);
    // Return fallback image or cached version
    return caches.match('/assets/logo.jpg') || new Response('Image not available', { status: 404 });
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network fetch failed, trying cache:', error);
  }
  
  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Ultimate fallback
  return caches.match('/index.html') || new Response('Offline - Page not available', { 
    status: 404,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Handle other requests (CSS, JS, etc.)
async function handleOtherRequests(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Request failed:', error);
    return new Response('Resource not available', { status: 404 });
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'wallet-connect') {
    event.waitUntil(syncWalletConnection());
  }
});

// Background sync for wallet connections
async function syncWalletConnection() {
  try {
    // Attempt to sync wallet connection when back online
    console.log('[SW] Syncing wallet connection...');
    // This would typically communicate with the main app
  } catch (error) {
    console.error('[SW] Wallet sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New Gecko update available!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'gecko-notification',
    actions: [
      {
        action: 'view',
        title: 'View Update'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('🦎 Omniverse Geckos', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker registered successfully');