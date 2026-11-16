---
slug: cache-control-fundamentals
title: "Cache-Control Fundamentals"
topic: caching-and-compression
kind: concept
summary: "Mastering HTTP Cache-Control directives: max-age, public, private, and s-maxage across caching layers."
tags: [caching, cache-control, http-headers, networking]
related: [no-cache-versus-no-store, validation-with-etags, the-immutable-cache-pattern]
---
> **In one line:** The HTTP Cache-Control header dictates whether, where, and for how long responses can be stored and reused.

## The idea

The fastest, cheapest, and most scalable network request is the one that never touches the network at all. HTTP caching allows client browsers and intermediate proxies to store previously downloaded responses and reuse them for subsequent requests.

The primary mechanism governing HTTP caching is the `Cache-Control` header (defined in RFC 9111). It consists of comma-separated directives that instruct caching mechanisms across the delivery chain:
- `max-age=<seconds>`: Defines the maximum duration (in seconds) that a cached response is considered "fresh". While fresh, the browser serves the asset directly from disk or memory cache with zero network round trips.
- `public`: Permits any cache—including intermediate proxy servers, corporate gateways, and edge CDNs—to store and serve the response to multiple users.
- `private`: Restricts caching strictly to the end user's individual browser. Shared caches and CDNs must not store it (vital for user-specific data or authenticated account screens).
- `s-maxage=<seconds>`: Overrides `max-age` specifically for shared caches (such as edge CDNs), leaving the browser's local duration unchanged.

## See it

```text
// Standard HTTP Cache-Control Response Headers
HTTP/2 200 OK
Content-Type: application/javascript; charset=UTF-8
Content-Encoding: br
Cache-Control: public, max-age=31536000, immutable
```

```bash
# Inspecting Cache-Control headers using curl
curl -I https://example.com/assets/app.1a2b3c.js
```

> **Note:** Directives like `max-age` specify freshness duration in seconds; `31536000` represents 365 days (one full year).

## Go deeper
HTTP `Cache-Control` headers govern whether, where, and for how long assets are stored across browser and proxy caches. Using `max-age` specifies freshness durations in seconds, while `public` permits shared edge CDN caching and `private` restricts storage strictly to the end user's individual browser.


Comparing primary `Cache-Control` scope and freshness directives:

| Directive | Target Cache Tier | Effect on Caching Behavior |
|---|---|---|
| `public` | All caches (Browser, CDN, Proxies) | Response may be shared across multiple users |
| `private` | Browser cache only | Shared CDNs/proxies forbidden from storing response |
| `max-age=N` | All caches (unless `s-maxage` present) | Resource considered fresh for N seconds |
| `s-maxage=N` | Shared edge CDNs and proxies only | Controls edge CDN TTL independently of browser TTL |


When configuring multi-tier caching architectures, ensure edge CDNs respect the s-maxage directive while browsers observe max-age. This enables short client caching for rapid updates while maintaining longer shared cache retention at regional edge nodes to protect origin servers from sudden traffic spikes.

## Watch out

- Using the legacy Expires or Pragma headers; Cache-Control is the modern authoritative standard.
- Setting Cache-Control: public on authenticated API endpoints that return user-specific private data.

## Remember

- HTTP caching eliminates network requests by reusing stored responses from memory or disk.
- Cache-Control directives dictate freshness duration (max-age) and caching scope (public vs private).
- s-maxage allows setting longer caching durations on edge CDNs than on user browsers.
