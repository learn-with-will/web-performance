---
slug: static-versus-dynamic-compression
title: "Static versus Dynamic Compression"
topic: caching-and-compression
kind: technique
summary: "Pre-compressing static assets during production builds versus on-the-fly server compression."
tags: [brotli, gzip, static-compression, build-pipeline]
related: [gzip-versus-brotli, build-time-minification, what-not-to-compress]
---
> **In one line:** Pre-compress static assets at build time using maximum Brotli quality (level 11) to avoid server CPU overhead.

## The idea

HTTP compression can be performed in two distinct operational modes: dynamic compression (on-the-fly) and static pre-compression (ahead-of-time).

Dynamic compression occurs when the web server compresses the HTTP response in real time as it is generated (essential for dynamic HTML and API JSON responses). Because the server CPU must compress the response before sending it, compression levels must be kept low (typically Brotli level 4 or gzip level 6) to avoid introducing hundreds of milliseconds of server latency.

Static pre-compression is the vastly superior strategy for static production assets (JavaScript, CSS, SVG, and static HTML). During your production build step, you pre-generate `.br` and `.gz` files alongside your uncompressed files using the absolute maximum compression settings (Brotli quality level 11).

Because this computation runs once during CI/CD, you pay zero runtime CPU cost! Web servers like NGINX (with `gzip_static` and `brotli_static`) or edge CDNs simply stream the pre-compressed bytes directly from disk.

## See it

```bash
# Build step: Pre-compressing static assets using maximum Brotli level 11
brotli --best --keep ./dist/assets/*.js ./dist/assets/*.css

# Resulting directory output:
# app.8f3a.js      (240 KB uncompressed)
# app.8f3a.js.br   ( 58 KB pre-compressed at maximum level 11!)
```

```text
# NGINX configuration serving pre-compressed files directly from disk
brotli_static on;
gzip_static on;
```

> **Tip:** Pre-compress static assets at Brotli level 11 during build; use level 4 for on-the-fly dynamic compression.

## Go deeper
Pre-compressing static production assets at build time using maximum Brotli quality (level 11) eliminates runtime server CPU overhead. Web servers can stream pre-generated `.br` files directly from disk, reserving dynamic on-the-fly compression strictly for personalized HTML and real-time API responses.


Comparing static pre-compression against dynamic on-the-fly compression:

| Feature | Static Pre-Compression | Dynamic On-The-Fly Compression |
|---|---|---|
| Execution Timing | Once during build / CI pipeline | On every HTTP request at runtime |
| Compression Level | **Maximum (Brotli level 11)** | Moderate (Brotli level 4–5, gzip 6) |
| Server CPU Cost | **Zero at runtime** | High under heavy traffic loads |
| Best Used For | JS bundles, CSS, static SVG, fonts | Dynamic HTML, personalized REST APIs |


For immutable static production assets like JavaScript and CSS bundles, pre-compressing with Brotli at maximum level 11 during the build process maximizes byte savings. This eliminates runtime CPU compression overhead while delivering the smallest possible transfer sizes to clients.

## Watch out

- Configuring web servers to dynamically compress static assets on every request, wasting massive CPU cycles.
- Forgetting to upload pre-compressed .br and .gz files when deploying static artifacts to cloud buckets.

## Remember

- Static pre-compression generates .br and .gz files at build time with maximum compression level 11.
- Pre-compression eliminates runtime CPU overhead, allowing servers to stream bytes instantly.
- Reserve dynamic on-the-fly compression strictly for dynamic HTML documents and real-time APIs.
