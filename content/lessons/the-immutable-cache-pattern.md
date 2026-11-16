---
slug: the-immutable-cache-pattern
title: "The Immutable Cache Pattern"
topic: caching-and-compression
kind: pattern
summary: "The canonical static asset pattern: content-hashed filenames with 1-year max-age and the immutable directive."
tags: [immutable, cache-busting, content-hashing, static-assets]
related: [cache-control-fundamentals, html-caching-rules, validation-with-etags]
---
> **In one line:** Pair content-hashed filenames with Cache-Control: public, max-age=31536000, immutable for maximum caching speed.

## The idea

The gold standard for static asset delivery on the modern web is the Immutable Cache Pattern. This pattern completely eliminates conditional requests and revalidations for all sub-resources throughout the entire year.

The pattern requires two coordinated engineering disciplines:
1. Content Hashing: Every static asset (JavaScript chunks, CSS bundles, web fonts, optimized images) includes a cryptographic hash of its file contents directly in its filename (e.g. `app.8f3a9e.js`, `main.b2c4d1.css`). If a developer changes a single character of code, the build system automatically produces a completely new filename.
2. Immutable Caching Header: Because the URL is permanently bound to that exact version of the file, the server can safely instruct caches to store it forever:
```text
Cache-Control: public, max-age=31536000, immutable
```

The `immutable` directive informs browsers that the file will never change during its lifetime. Even if the user forcefully clicks the browser "Reload" button, the browser will not send conditional 304 requests; it will serve the file instantly from disk cache.

## See it

```html
<!-- HTML references content-hashed immutable assets -->
<link rel="stylesheet" href="/assets/style.7c9e12.css">
<script src="/assets/app.3d4f5a.js" defer></script>
```

```text
// Server response headers for content-hashed assets
HTTP/2 200 OK
Cache-Control: public, max-age=31536000, immutable
Content-Type: application/javascript; charset=UTF-8
```

> **Note:** The `immutable` directive instructs browsers to serve from cache even on page reloads without sending 304 checks.

## Go deeper
The Immutable Cache Pattern pairs content-hashed filenames with `Cache-Control: public, max-age=31536000, immutable`. Because the URL changes whenever code changes, browsers can safely cache static assets for a full year, serving them instantly from local disk without sending revalidation requests.


Comparing standard caching against the Immutable Caching Pattern:

| Strategy | Cache Header | Behavior on Page Reload | Network Overhead |
|---|---|---|---|
| Unversioned Assets | `max-age=3600` | Browser sends conditional request (304) | Wastes round trips revalidating |
| Unversioned + Long TTL | `max-age=31536000` | Users stuck with stale code on updates | Catastrophic deployment bugs |
| **Content-Hashed + Immutable** | **`max-age=31536000, immutable`** | **Served 100% from disk (zero network)** | **Optimal: instant, safe updates** |


The immutable caching pattern provides the foundation for zero-downtime continuous deployment. Because content-hashed filenames guarantee uniqueness, newly deployed assets can be uploaded and cached indefinitely without risking race conditions or serving mismatched application files.

## Watch out

- Adding the immutable directive to files with unhashed names (like logo.png or main.css); users will never see updates.
- Setting query string cache busters (style.css?v=2); some intermediate proxy caches ignore query strings entirely.

## Remember

- Content hashing embeds a cryptographic hash of file contents directly into the asset filename.
- Serve content-hashed assets with Cache-Control: public, max-age=31536000, immutable.
- When code changes, the filename changes, guaranteeing instant updates without stale cache bugs.
