---
slug: html-caching-rules
title: "HTML Caching Rules"
topic: caching-and-compression
kind: technique
summary: "Why HTML documents must never be aggressively cached with long max-age and should use no-cache instead."
tags: [html-caching, no-cache, deployment, stale-cache]
related: [the-immutable-cache-pattern, no-cache-versus-no-store, cache-control-fundamentals]
---
> **In one line:** Never cache HTML documents with long max-age; always serve HTML with Cache-Control: no-cache.

## The idea

The Immutable Cache Pattern relies on a fundamental prerequisite: the HTML document must always be fresh so it can point to the newest content-hashed asset URLs.

If you mistakenly configure your web server or CDN to cache HTML with a long duration—such as `Cache-Control: public, max-age=86400` (24 hours)—disaster strikes upon deployment. When you ship a bug fix or new feature, returning users will continue loading their cached HTML file from yesterday. That stale HTML references old JavaScript and CSS hashes that may no longer exist on your origin server, resulting in 404 errors and completely broken user interfaces.

The immutable rule for HTML documents is:
```text
Cache-Control: no-cache
```

Serving HTML with `no-cache` guarantees that every navigation performs a quick, lightweight conditional request (ETag / `304 Not Modified`). If no new deployment has occurred, the 304 response unblocks rendering almost instantly. The moment you deploy new code, the server replies with the fresh `200 OK` HTML referencing the new hashed bundles, ensuring seamless, instantaneous updates.

## See it

```text
// Server configuration for HTML files (e.g. in NGINX, Cloudflare, or Vercel)
# NGINX Configuration Rule for HTML documents
location ~* .html$ {
  add_header Cache-Control "no-cache";
  add_header X-Content-Type-Options "nosniff";
}

# NGINX Configuration Rule for hashed static assets
location ~* .(js|css|avif|webp|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

> **Watch out:** Never set `max-age` on HTML documents; a stale HTML file locks users out of receiving new deployments.

## Go deeper
HTML documents must never be cached with long max-age headers. Stale HTML locks users into outdated JavaScript and CSS bundle hashes, resulting in broken user interfaces. Serving HTML with `Cache-Control: no-cache` ensures users immediately receive new deployments while enabling fast 304 revalidations when unchanged.


How HTML caching strategies impact production deployments:

| HTML Cache Configuration | Deployment Pickup | Risk of Broken Asset 404s | Revisit Speed |
|---|---|---|---|
| `max-age=86400` (1 day) | Delayed by 24 hours | **Severe: users trapped on old hashes** | Fast, but broken |
| `no-store` | Instant | Zero | Slowest: transfers full HTML body every visit |
| **`no-cache` + ETag** | **Instantaneous on new deploy** | **Zero: always points to live hashes** | **Fast: instant 304 Not Modified** |

## Watch out

- Configuring edge CDNs with default global caching that caches HTML pages for hours without purging.
- Assuming service workers bypass HTML caching; service workers still follow HTTP cache rules on update.

## Remember

- HTML documents must never be cached with a long max-age to prevent stale deployment lock-in.
- Serve all HTML with Cache-Control: no-cache to enforce conditional revalidation on every navigation.
- Pairing no-cache HTML with immutable static assets provides safe, instantaneous production updates.
