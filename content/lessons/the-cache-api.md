---
slug: the-cache-api
title: "The Cache API"
topic: loading-strategies
kind: api
summary: "Storing and retrieving Request/Response objects programmatically using CacheStorage and Cache."
tags: [cache-api, cache-storage, service-workers, storage]
related: [service-worker-architecture, runtime-caching-strategies, cache-versioning-and-cleanup]
---
> **In one line:** The Cache API stores paired HTTP Request and Response objects programmatically in persistent browser storage.

## The idea

The Cache API (accessible via `caches` in window and worker contexts) provides programmatic, fine-grained storage for network request and response pairs. It operates independently of the standard HTTP browser disk cache.

While the standard HTTP cache is automatic and governed by server headers, the Cache API is completely under JavaScript developer control. You choose exactly which requests to store, when to update them, and when to delete them.

Key methods on the global `caches` (CacheStorage) interface:
- `caches.open(cacheName)`: Opens or creates a named cache instance returning a `Cache` object.
- `caches.has(cacheName)`: Checks if a named cache exists.
- `caches.delete(cacheName)`: Deletes an entire named cache (essential for version migration).

Key methods on an individual `Cache` instance:
- `cache.put(request, response)`: Manually stores a Request/Response pair.
- `cache.match(request)`: Searches the cache for a matching stored response.
- `cache.addAll(requests)`: Fetches an array of URLs and stores all responses atomically.

## See it

```javascript
// Using Cache API to store and retrieve assets programmatically
async function cacheExample() {
  const cache = await caches.open('v1-assets');

  // Storing assets
  await cache.addAll(['/style.css', '/logo.svg']);

  // Retrieving cached response
  const match = await cache.match('/style.css');
  if (match) {
    const cssText = await match.text();
    console.log('Retrieved cached CSS:', cssText.length, 'bytes');
  }
}
```

> **Note:** The Cache API stores Request and Response objects directly, allowing offline retrieval without network access.

## Go deeper
The Cache API provides persistent, programmatic storage for paired HTTP Request and Response objects. Unlike the automatic browser disk cache, the Cache API gives developers total control over storing, matching, and invalidating assets, enabling reliable offline application experiences.


Comparing the Cache API against standard HTTP Browser Cache and IndexedDB:

| Storage System | Managed By | What It Stores | Offline Capable? |
|---|---|---|---|
| **Cache API** | **JavaScript developer** | **Paired HTTP Request / Response objects** | **Yes** |
| HTTP Browser Cache | Browser heuristics & headers | Raw response payloads keyed by URL | Limited |
| IndexedDB | JavaScript developer | Structured JSON data, objects, Blobs | Yes |
| localStorage | JavaScript developer | Synchronous strings (max 5MB) | Yes |

## Watch out

- Storing opaque responses (type: 'opaque' from no-cors requests), which consume up to 7MB of quota padding per asset.
- Attempting to read response.body twice; Response streams are single-use and must be cloned before caching.

## Remember

- The Cache API stores paired Request and Response objects in persistent, scriptable storage.
- Use cache.addAll() during service worker installation to pre-cache the application shell atomically.
- Clone responses using response.clone() before passing them to cache.put() if they must also be returned.
