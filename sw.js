/* Service worker: offline cache for the park. Bump VERSION on every push. */
var VERSION = 'dlday-v9-2026-10-09a';
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
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(PRECACHE.map(function(u){ return new Request(u, {cache:'reload'}); })); }));
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
  // Big static files (map, fonts, icons, leaflet): cache first
  var big = /\.(webp|jpg|png|ttf)$/.test(url.pathname) || /leaflet\./.test(url.pathname);
  if (big){
    e.respondWith(
      caches.match(req, { ignoreSearch:true }).then(function(hit){
        return hit || fetch(req).then(function(res){
          if (res && res.ok){ var copy = res.clone(); caches.open(VERSION).then(function(c){ c.put(req, copy); }); }
          return res;
        });
      })
    );
    return;
  }
  // App code and plan data: network first so edits show up, cache fallback offline
  e.respondWith(
    fetch(new Request(req.url, {cache:'no-cache'})).then(function(res){
      if (res && res.ok){ var copy = res.clone(); caches.open(VERSION).then(function(c){ c.put(req, copy); }); }
      return res;
    }).catch(function(){ return caches.match(req, { ignoreSearch:true }); })
  );
});
