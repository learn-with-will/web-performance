---
slug: service-worker-lifecycle
title: "The Service Worker Lifecycle"
topic: loading-strategies
kind: concept
summary: "Managing service worker install, activate, and fetch events with skipWaiting and clients.claim."
tags: [service-workers, lifecycle, skipWaiting, clients-claim]
related: [service-worker-architecture, cache-versioning-and-cleanup, the-cache-api]
---
> **In one line:** The service worker lifecycle progresses through Registration, Installation, Activation, and Fetch interception.

## The idea

To ensure that updates to your web application occur reliably without breaking active user sessions, service workers follow a strict, multi-stage lifecycle:

1. Registration: The main thread calls `navigator.serviceWorker.register('/sw.js')`.
2. Installation (`install` event): The browser fetches and compiles the service worker script. This phase is typically used to pre-cache the critical "application shell" (HTML shell, CSS, and core JS). If any asset in `cache.addAll()` fails to download, the entire installation fails and the old service worker remains active.
3. Waiting: Once installed, if an older version of the service worker is currently controlling open tabs, the new worker enters a "waiting" state to avoid corrupting active sessions. Calling `self.skipWaiting()` forces the new worker to bypass waiting and take over immediately.
4. Activation (`activate` event): The new worker takes active control. This phase is dedicated to cache hygiene: iterating through local Cache Storage and deleting obsolete caches from previous versions.
5. Fetch (`fetch` event): The active worker now intercepts all network requests matching its scope.

## See it

```javascript
// sw.js: Managing install, activate, and cache cleanup
const CACHE_NAME = 'app-shell-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/', '/style.css', '/app.js']);
    }).then(() => self.skipWaiting()) // Activates immediately
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim()) // Takes control of open tabs immediately
  );
});
```

> **Tip:** Use `self.skipWaiting()` on install and `self.clients.claim()` on activate to take control of open tabs immediately.

## Go deeper

The five phases of the Service Worker lifecycle:

| Lifecycle Phase | Event Triggered | Core Engineering Responsibility |
|---|---|---|
| **Registration** | (Main thread method) | Browser discovers worker script URL and scope |
| **Installation** | `install` event | Pre-caches core application shell assets |
| **Waiting** | (Worker state) | Waits for active tabs running old worker to close |
| **Activation** | `activate` event | Purges obsolete caches from previous app versions |
| **Active / Control** | `fetch` event | Intercepts HTTP requests and applies caching strategies |

## Watch out

- Failing to purge old cache keys during the activate event, resulting in storage bloat that exceeds device limits.
- Calling skipWaiting() on applications where HTML and JS chunks must remain tightly version-locked.

## Remember

- The service worker lifecycle advances through Install, Waiting, Activate, and Fetch states.
- Pre-cache the application shell during the install event using event.waitUntil().
- Purge obsolete cache storage keys during the activate event to prevent stale asset bugs.
