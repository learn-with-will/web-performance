---
slug: cache-versioning-and-cleanup
title: "Cache Versioning and Cleanup"
topic: loading-strategies
kind: technique
summary: "Versioning cache names and purging obsolete caches on activation to avoid serving stale assets forever."
tags: [cache-versioning, cleanup, storage-quota, stale-cache]
related: [service-worker-lifecycle, the-cache-api, runtime-caching-strategies]
---
> **In one line:** Version your cache names and delete obsolete caches during the activate event to prevent stale code traps.

## The idea

The most hazardous pitfall in service worker development is failing to implement rigorous cache versioning and cleanup. Because the Cache API is persistent, assets stored in Cache Storage remain on the user's device indefinitely until explicitly deleted.

If an application updates its CSS from `style.v1.css` to `style.v2.css` without deleting `v1`, the old stylesheet remains in cache storage. Over time, storing successive versions of application bundles exhausts device storage quotas, triggering browser quota errors. Worse, if unversioned assets are cached under a generic name (like `my-cache`), the service worker will serve stale code forever!

The established discipline requires naming caches with semantic versions (e.g. `app-shell-v1`, `app-shell-v2`).

During the `activate` event of the new service worker, inspect all existing cache keys with `caches.keys()`, filter for any cache names that do not match the current version, and delete them using `caches.delete()`.

## See it

```javascript
// sw.js: Versioned cache declaration and automated legacy cache purging
const CURRENT_CACHE = 'app-shell-v3';

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((allCaches) => {
      return Promise.all(
        allCaches.map((cacheName) => {
          // If the cache does not match the active version, purge it immediately
          if (cacheName !== CURRENT_CACHE) {
            console.log('Purging legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

> **Watch out:** Failing to delete obsolete cache keys during the `activate` event locks users into stale assets and exhausts storage.

## Go deeper

Auditing storage quota management across browser platforms:

| Metric / Feature | Desktop Chrome | Mobile Safari (iOS) | Android Chrome |
|---|---|---|---|
| Typical Quota | Up to 80% of free disk space | Up to 1GB (strict eviction) | Up to 60% of free disk space |
| Eviction Policy | Least Recently Used (LRU) | LRU after 7 days of inactivity | LRU when disk under pressure |
| Storage Inspection | DevTools -> Application -> Storage | Safari Web Inspector -> Storage | DevTools -> Application -> Storage |

## Watch out

- Deleting caches inside the install event; active tabs currently running the old service worker will crash.
- Hardcoding static cache names without version identifiers, preventing automated cleanup on deploy.

## Remember

- Always embed explicit version strings (e.g. app-v2) in named Cache Storage identifiers.
- Purge obsolete caches during the activate event of the new service worker using caches.delete().
- Automated cache cleanup prevents device storage quota exhaustion and eliminates stale code traps.
