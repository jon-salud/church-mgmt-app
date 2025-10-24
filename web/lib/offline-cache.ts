'use client';

type OfflineSnapshotKey = 'announcements' | 'events';

const DATA_CACHE_NAME = 'acc-console-data-v1';
const OFFLINE_DATA_PREFIX = '/offline-data/';

export type OfflineSnapshotPayloads = {
  announcements: { announcements: unknown; groups: unknown };
  events: { events: unknown; members: unknown; groups: unknown };
};

export async function persistOfflineSnapshot<K extends OfflineSnapshotKey>(
  key: K,
  payload: OfflineSnapshotPayloads[K]
) {
  if (typeof window === 'undefined') {
    return;
  }

  const body = JSON.stringify({ payload, timestamp: Date.now() });

  if ('caches' in window) {
    try {
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put(
        new Request(`${OFFLINE_DATA_PREFIX}${key}`),
        new Response(body, { headers: { 'Content-Type': 'application/json' } })
      );
    } catch (error) {
      console.warn('Failed to persist offline snapshot in cache', error);
    }
  }

  if ('serviceWorker' in navigator) {
    const message = { type: 'CACHE_DATA', key, payload, timestamp: Date.now() };
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    } else {
      navigator.serviceWorker.ready
        .then(registration => {
          registration.active?.postMessage(message);
        })
        .catch(() => {
          // Ignore; cache write already attempted above.
        });
    }
  }
}

export async function loadOfflineSnapshot<K extends OfflineSnapshotKey>(
  key: K
): Promise<OfflineSnapshotPayloads[K] | null> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return null;
  }

  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const match = await cache.match(new Request(`${OFFLINE_DATA_PREFIX}${key}`));
    if (!match) {
      return null;
    }
    const data = await match.json();
    return (data?.payload ?? null) as OfflineSnapshotPayloads[K] | null;
  } catch (error) {
    console.warn('Failed to load offline snapshot from cache', error);
    return null;
  }
}
