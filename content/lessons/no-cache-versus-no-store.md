---
slug: no-cache-versus-no-store
title: "no-cache versus no-store"
topic: caching-and-compression
kind: concept
summary: "The critical distinction between no-cache (must revalidate before reuse) and no-store (never save to disk)."
tags: [caching, no-cache, no-store, security]
related: [cache-control-fundamentals, validation-with-etags, html-caching-rules]
---
> **In one line:** no-cache permits caching but requires revalidation before reuse; no-store strictly forbids saving anything to disk.

## The idea

One of the most widespread misunderstandings in web performance is the difference between `Cache-Control: no-cache` and `Cache-Control: no-store`. Despite their names, they have vastly different operational behaviors.

`Cache-Control: no-cache` does **not** mean "do not cache." In reality, `no-cache` instructs the browser: "You may cache this response locally, but you must **never reuse it** without first revalidating it with the origin server (using ETag or Last-Modified)."

When a browser encounters a cached `no-cache` asset, it sends a lightweight conditional HTTP request to the server. If the asset has not changed, the server replies with a tiny `304 Not Modified` response (zero payload bytes), and the browser uses its local cached copy. `no-cache` is the standard best practice for HTML documents!

In contrast, `Cache-Control: no-store` strictly commands: "Do not write this response to disk or cache storage under any circumstances." Every single request must download the full payload from the server. `no-store` should be reserved exclusively for sensitive personal data (e.g. banking records or checkout credit card tokens).

## See it

```text
// Scenario A: HTML document (Fast revalidation, saves bandwidth)
Cache-Control: no-cache
ETag: "v123"
// Browser stores on disk; checks "If-None-Match: v123" on revisit -> Receives instant 304 Not Modified

// Scenario B: Sensitive banking API (Security-critical)
Cache-Control: no-store, private
// Browser strictly refuses to save bytes to disk; zero caching permitted
```

> **Watch out:** `no-cache` allows local storage and fast 304 revalidation; use `no-store` only for sensitive private data.

## Go deeper
`Cache-Control: no-cache` allows browsers to store responses locally while requiring conditional revalidation with the server before reuse. `Cache-Control: no-store` strictly forbids saving responses to disk under any circumstances. HTML documents should use `no-cache` to ensure instant updates while benefiting from 304 revalidations.


Comparing `no-cache` versus `no-store` characteristics:

| Directive | Can Browser Store Response? | What Happens on Revisit? | Ideal Resource Type |
|---|---|---|---|
| **`no-cache`** | **Yes (saved to local cache)** | Sends conditional request (304 check) | **HTML documents, dynamic APIs** |
| **`no-store`** | **No (never saved anywhere)** | Full download from server every time | **Financial data, private medical records** |
| `max-age=0` | Yes (expires immediately) | Revalidates (similar to no-cache) | Transitional legacy configs |


Choosing between no-cache and no-store is critical for data privacy and security. While no-cache allows caching with conditional validation, no-store forbids saving any byte to disk or memory, making it mandatory for sensitive personal information and authenticated banking endpoints.

## Watch out

- Using no-store on HTML documents, which forces a full re-download on every navigation and breaks browser back-forward cache.
- Assuming no-cache prevents browser disk storage; use no-store when data security forbids saving to disk.

## Remember

- Cache-Control: no-cache allows storing assets, but mandates server revalidation before reuse.
- Cache-Control: no-store strictly forbids saving the response to any persistent cache or disk.
- HTML documents should use no-cache to allow instant deployment updates paired with 304 revalidation.
