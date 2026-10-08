/* Service worker: offline cache for the park. Bump VERSION on every push. */
var VERSION = 'dlday-v5-2026-10-08b';
var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/app.css',
  './assets/app.js',
  './assets/data.js',
  './assets/leaflet.css',
  './assets/leaflet.js',
  './assets/resort_map.webp',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/fonts/fredoka/Fredoka-600.ttf',
  './assets/fonts/fredoka/Fredoka-700.ttf',
  './assets/fonts/nunito/Nunito-400.ttf',
  './assets/fonts/nunito/Nunito-600.ttf',
  './assets/fonts/nunito/Nunito-700.ttf'
];
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(PRECACHE); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Pages: network first (fresh when online), cache fallback (offline at the park)
  if (req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(VERSION).then(function(c){ c.put('./index.html', copy); });
        return res;
      }).catch(function(){
        return caches.match('./index.html', { ignoreSearch:true }).then(function(r){ return r || caches.match('./'); });
      })
    );
    return;
  }
  // Assets: cache first, then network (and store)
  e.respondWith(
    caches.match(req, { ignoreSearch:true }).then(function(hit){
      if (hit) return hit;
      return fetch(req).then(function(res){
        if (res && res.ok){ var copy = res.clone(); caches.open(VERSION).then(function(c){ c.put(req, copy); }); }
        return res;
      });
    })
  );
});
