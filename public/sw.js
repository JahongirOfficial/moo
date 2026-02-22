const CACHE_NAME = 'mukammal-ota-ona-v2';
const VIDEO_CACHE_NAME = 'mukammal-videos-v1';
const MAX_VIDEOS = 5; // Oxirgi 5 ta video saqlanadi

const urlsToCache = [
  '/',
  '/index.html',
  '/uploads/logo/pwa.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== VIDEO_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Video cache tozalash - faqat oxirgi MAX_VIDEOS ta qoladi
async function cleanVideoCache() {
  const cache = await caches.open(VIDEO_CACHE_NAME);
  const keys = await cache.keys();
  
  if (keys.length > MAX_VIDEOS) {
    // Eng eski videolarni o'chirish
    const toDelete = keys.slice(0, keys.length - MAX_VIDEOS);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

// Video so'rovlarini boshqarish
async function handleVideoRequest(request) {
  const cache = await caches.open(VIDEO_CACHE_NAME);
  
  // Avval cache'dan tekshirish
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('Video cache\'dan yuklandi:', request.url);
    return cachedResponse;
  }
  
  // Cache'da yo'q - serverdan yuklash
  try {
    const response = await fetch(request);
    
    // Faqat muvaffaqiyatli javoblarni cache'lash
    if (response.ok || response.status === 206) {
      // Range request bo'lmasa, to'liq videoni cache'lash
      if (!request.headers.get('range')) {
        const responseClone = response.clone();
        cache.put(request, responseClone);
        cleanVideoCache(); // Eski videolarni tozalash
        console.log('Video cache\'ga saqlandi:', request.url);
      }
    }
    
    return response;
  } catch (error) {
    console.error('Video yuklashda xatolik:', error);
    throw error;
  }
}

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Video so'rovlari - alohida cache
  if (url.pathname.includes('/api/videos/') && url.pathname.endsWith('.mp4')) {
    event.respondWith(handleVideoRequest(event.request));
    return;
  }
  
  // Boshqa API so'rovlari - cache qilmaslik
  if (url.pathname.includes('/api/')) {
    return;
  }

  // Oddiy resurslar - Network first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, responseClone);
            }
          });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
