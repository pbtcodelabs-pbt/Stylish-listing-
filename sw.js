// سروس ورکر — آف لائن/آن لائن دونوں طرح ایپ چلانے کے لیے
const CACHE_VERSION = 'SL005th0644';
const CACHE_NAME = 'saman-list-cache-' + CACHE_VERSION;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key.indexOf('saman-list-cache-') === 0 && key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// کیش-فرسٹ حکمت عملی، انٹرنیٹ نہ ہونے پر بھی ایپ کھلتی رہے گی
self.addEventListener('fetch', function(event){
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      if (cached) return cached;
      return fetch(event.request).then(function(response){
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
        }
        return response;
      }).catch(function(){
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
