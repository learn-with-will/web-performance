---
slug: runtime-caching-strategies
title: "Runtime Caching Strategies"
topic: loading-strategies
kind: pattern
summary: "Implementing cache-first, network-first, and stale-while-revalidate caching patterns in service workers."
tags: [runtime-caching, stale-while-revalidate, cache-first, network-first]
related: [the-cache-api, service-worker-lifecycle, cache-versioning-and-cleanup]
---
> **In one line:** Select the right runtime strategy: Cache-First for static assets, Network-First for dynamic data, Stale-While-Revalidate for feeds.

## The idea

When a service worker intercepts a request via the `fetch` event, it must decide how to balance speed, freshness, and offline availability. Three standard runtime caching patterns cover virtually all web application needs:

1. Cache-First (Cache Falling Back to Network): Checks the cache first. If found, serves the cached asset immediately with zero network latency. If missing, fetches from the network, caches the response, and returns it. Best for: Content-hashed immutable static assets (JS, CSS, fonts, images).
2. Network-First (Network Falling Back to Cache): Attempts to fetch the newest data from the network. If the user is offline or the request times out, it falls back to the cached copy. Best for: Real-time dynamic APIs and frequently changing data (e.g. stock prices, account balances).
3. Stale-While-Revalidate: Serves the cached ("stale") version immediately so the user experiences instant loading, while simultaneously dispatching a background network fetch to update ("revalidate") the cache for next time. Best for: User feeds, avatars, and non-critical content.

## See it

```javascript
// Implementing the Stale-While-Revalidate strategy in sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open('dynamic-images').then(async (cache) => {
        const cachedResponse = await cache.match(event.request);

        // Background revalidation fetch updates the cache for next time
        const networkFetch = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Serve cached version immediately if available, else wait for network
        return cachedResponse || networkFetch;
      })
    );
  }
});
```

> **Tip:** Stale-While-Revalidate delivers instant cached loading while keeping the local cache updated in the background.

## Go deeper

Matching runtime caching strategies to specific resource categories:

| Runtime Strategy | First-Visit Speed | Repeat-Visit Speed | Freshness Guarantee | Best Used For |
|---|---|---|---|---|
| **Cache-First** | Network speed | **Instant (0ms)** | Stale until purged | Static hashed JS, CSS, fonts, icons |
| **Network-First** | Network speed | Network speed (unless offline) | **Guaranteed fresh** | Checkout, banking, live inventory |
| **Stale-While-Revalidate** | Network speed | **Instant (0ms)** | Fresh on *subsequent* visit | News feeds, user profiles, avatars |
| **Network-Only** | Network speed | Network speed | Always fresh | Non-cacheable mutations (POST/PUT) |

## Watch out

- Using Cache-First on unhashed HTML files; users will remain trapped on outdated application code.
- Using Network-First without a timeout; slow networks make the user wait indefinitely before showing cached data.

## Remember

- Cache-First delivers instant performance for immutable content-hashed static assets.
- Network-First guarantees fresh data, using the local cache purely as an offline fallback.
- Stale-While-Revalidate serves instant cached data while updating the cache in the background.
