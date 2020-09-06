let prefix = '/kontra';

// adjust path based on location (github pages required kontra url)
if (['localhost', '127.0.0.1'].includes(self.location.hostname
)) {
  prefix = '';
}

const filesToCache = [
  // pages (only font caching api docs as others are not as important)
  `${prefix}/`,
  `${prefix}/api/animation`,
  `${prefix}/api/assets`,
  `${prefix}/api/button`,
  `${prefix}/api/core`,
  `${prefix}/api/events`,
  `${prefix}/api/gameLoop`,
  `${prefix}/api/gameObject`,
  `${prefix}/api/grid`,
  `${prefix}/api/helpers`,
  `${prefix}/api/keyboard`,
  `${prefix}/api/plugin`,
  `${prefix}/api/pointer`,
  `${prefix}/api/pool`,
  `${prefix}/api/quadtree`,
  `${prefix}/api/scene`,
  `${prefix}/api/sprite`,
  `${prefix}/api/spriteSheet`,
  `${prefix}/api/text`,
  `${prefix}/api/tileEngine`,
  `${prefix}/api/vector`,

  // js
  `${prefix}/assets/js/kontra.js`,
  `${prefix}/assets/js/navbar.js`,
  `${prefix}/assets/js/exampleTabList.js`,

  // styles
  `${prefix}/assets/styles.css`
];

const staticCacheName = 'kontra-docs-v1';

// cache the application shell
self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// serve files from the cache
self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request.url);

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }

        console.log('Network request for ', event.request.url);

        return fetch(event.request).then(response => {
          return caches.open(staticCacheName).then(cache => {

            console.log('Added to cache ', event.request.url);
            cache.put(event.request.url, response.clone());
            return response;
          });
        });
      })
      .catch(error => {
        // TODO 6 - Respond with custom offline page
      })
  );
});

// delete outdated caches
self.addEventListener('activate', event => {
  console.log('Activating new service worker...');

  const cacheAllowlist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});