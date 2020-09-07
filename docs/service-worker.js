let prefix = '/kontra';

// adjust path based on location (github pages required kontra url)
if (['localhost', '127.0.0.1'].includes(self.location.hostname
)) {
  prefix = '';
}

const filesToCache = [
  // pages
  `${prefix}/`,

  // js
  `${prefix}/assets/js/kontra.js`,
  `${prefix}/assets/js/navbar.js`,
  `${prefix}/assets/js/exampleTabList.js`,

  // styles
  `${prefix}/assets/styles.css`
];

const staticCacheName = 'kontra-docs-v3';

// cache the application shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// serve files from the cache
self.addEventListener('fetch', event => {

  // respond with the cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        // progressively add new files to the cache
        return updateCache(event.request);
      })
      .catch(error => {
        // TODO 6 - Respond with custom offline page
      })
  );

  // update the cache with newest version
  event.waitUntil(updateCache(event.request));
});

function updateCache(request) {
  return fetch(request).then(response => {
    return caches.open(staticCacheName).then(cache => {
      cache.put(request.url, response.clone());
      return response;
    });
  });
}

// delete outdated caches
self.addEventListener('activate', event => {
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