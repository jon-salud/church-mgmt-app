const APP_SHELL_CACHE = 'acc-console-shell-v2';
const DATA_CACHE = 'acc-console-data-v1';
const OFFLINE_DATA_PREFIX = '/offline-data/';
const OFFLINE_URLS = ['/dashboard', '/members', '/groups', '/events', '/announcements', '/giving'];

const APP_SHELL_FALLBACKS = [
  { match: path => path.startsWith('/announcements'), fallback: '/announcements' },
  { match: path => path.startsWith('/events'), fallback: '/events' },
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      await Promise.allSettled(
        OFFLINE_URLS.map(path => cache.add(new Request(path, { credentials: 'include' }))),
      );
      await caches.open(DATA_CACHE);
      self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== APP_SHELL_CACHE && name !== DATA_CACHE)
          .map(name => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'CACHE_DATA') {
    return;
  }
  const { key, payload, timestamp } = event.data;
  if (typeof key !== 'string') {
    return;
  }
  event.waitUntil(cacheOfflinePayload(key, payload, timestamp));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  if (url.pathname.startsWith(OFFLINE_DATA_PREFIX)) {
    event.respondWith(
      caches
        .open(DATA_CACHE)
        .then(cache => cache.match(event.request))
        .then(response =>
          response ||
          new Response(JSON.stringify({ payload: null, timestamp: null }), {
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request, url));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (shouldCacheResource(event.request, response)) {
          const cacheName = cacheNameForResponse(response);
          caches.open(cacheName).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }

        const shellCache = await caches.open(APP_SHELL_CACHE);
        for (const { match, fallback } of APP_SHELL_FALLBACKS) {
          if (match(url.pathname)) {
            const fallbackResponse = await shellCache.match(fallback);
            if (fallbackResponse) {
              return fallbackResponse;
            }
          }
        }

        const dashboard = await shellCache.match('/dashboard');
        if (dashboard) {
          return dashboard;
        }

        return Response.error();
      }),
  );
});

async function handleNavigationRequest(request, url) {
  const cache = await caches.open(APP_SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    for (const { match, fallback } of APP_SHELL_FALLBACKS) {
      if (match(url.pathname)) {
        const fallbackResponse = await cache.match(fallback);
        if (fallbackResponse) {
          return fallbackResponse;
        }
      }
    }

    const dashboard = await cache.match('/dashboard');
    if (dashboard) {
      return dashboard;
    }

    return Response.error();
  }
}

function shouldCacheResource(request, response) {
  if (!response || !response.ok) {
    return false;
  }
  if (request.method !== 'GET') {
    return false;
  }
  const destination = request.destination;
  if (!destination) {
    return false;
  }
  return ['style', 'script', 'font', 'image'].includes(destination);
}

function cacheNameForResponse(response) {
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return DATA_CACHE;
  }
  return APP_SHELL_CACHE;
}

async function cacheOfflinePayload(key, payload, timestamp) {
  const cache = await caches.open(DATA_CACHE);
  const body = JSON.stringify({ payload, timestamp: timestamp || Date.now() });
  const request = new Request(`${OFFLINE_DATA_PREFIX}${key}`);
  const response = new Response(body, {
    headers: { 'Content-Type': 'application/json' },
  });
  await cache.put(request, response);
}
