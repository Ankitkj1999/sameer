const staticCacheName = 'site-static-v8';
const dynamicCacheName = 'site-dynamic-v10 ';
const assets = [
  '/',
  '/index.html',
  '/js/app.js',
  '/mus/1.mp3',
  'home.png',
  '/form-submission-handler.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/fallback.html',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/5.jpg',
  '/images/10i.jpeg',
  '/images/11.jpeg',
  '/images/12.jpeg',
  '/images/13.jpeg',
  '/images/15.jpeg',
  '/images/21.jpeg',
  '/images/33.jpg',
  '/images/212.jpg',
  '/images/a1.jpg',
  '/images/a2.jpg',
  '/images/a3.jpg',
  '/images/c1.jpg',
  '/images/certificate.png',
  '/images/eco-friendly.png',
  '/images/icon-74.png',
  '/images/icon-96.png',
  '/images/icon-128.png',
  '/images/icon-144.png',
  '/images/icon-150.png',
  '/images/icon-180.png',
  '/images/icon-192.png',
  '/images/icon-384.png',
  '/images/icon-512.png',
  '/images/icon-513.png',
  '/images/icon-513.svg',
  '/images/icon.png',
  '/images/Group 2.png',
  '/images/h1.jpg',
  '/images/i1.jpg',
  '/images/i2.jpg',
  '/images/icon.png',
  '/images/icon_CE.png',
  '/images/icon_ISI.png',
  '/images/isi.png',
  '/images/location.png',
  '/images/mad.png',
  '/images/mail.png',
  '/images/own.png',
  '/images/pgone.png',
  '/images/sameer.png',
  '/images/whatsapp.png',
  '/form-submission-handler.js',



];


// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};


// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  //console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 150);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1){
          return caches.match('/fallback.html');
        } 
      })
    );
  }
});