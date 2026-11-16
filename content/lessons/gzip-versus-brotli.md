---
slug: gzip-versus-brotli
title: "Gzip versus Brotli Compression"
topic: caching-and-compression
kind: concept
summary: "Comparing Brotli (br) against gzip algorithms for text-based asset compression over HTTP."
tags: [brotli, gzip, compression, accept-encoding]
related: [build-time-minification, static-versus-dynamic-compression, what-not-to-compress]
---
> **In one line:** Brotli (br) achieves 15-25% smaller file sizes than gzip on text assets and is universally supported.

## The idea

While minification cleans the source text, HTTP compression shrinks the actual byte payload transferred over the physical network socket.

When a browser initiates an HTTP request, it advertises the compression algorithms it supports via the `Accept-Encoding` request header:
```text
Accept-Encoding: gzip, deflate, br, zstd
```
The server selects the most efficient supported algorithm, compresses the payload, and declares the algorithm in the `Content-Encoding` response header (e.g. `Content-Encoding: br`).

Two primary compression algorithms power the web:
1. Gzip: The traditional workhorse, based on the DEFLATE algorithm (LZ77 and Huffman coding). Supported universally across all web clients.
2. Brotli (`br`): Developed by Google specifically for web text assets. Brotli incorporates an extensive built-in static dictionary of common HTML, CSS, and JavaScript keywords and patterns. Because the dictionary already contains words like `function`, `display`, and `undefined`, Brotli does not need to waste bytes encoding them.

On JavaScript and CSS bundles, Brotli achieves 15% to 25% smaller payloads than gzip at equivalent decompression speeds.

## See it

```bash
# Comparing payload sizes between gzip and Brotli on a production bundle
curl -H "Accept-Encoding: gzip" -I https://example.com/assets/app.js
# Content-Encoding: gzip | Transferred: 84.2 KB

curl -H "Accept-Encoding: br" -I https://example.com/assets/app.js
# Content-Encoding: br   | Transferred: 67.8 KB (19.5% smaller!)
```

> **Tip:** Brotli (`br`) beats gzip by 15–25% on JavaScript, CSS, and HTML text assets with zero decompression penalty.

## Go deeper
Brotli (`br`) outperforms gzip by 15% to 25% on web text assets due to its specialized built-in static dictionary containing common HTML, CSS, and JavaScript tokens. Brotli is universally supported over HTTPS across all modern browsers and decompresses at speeds equivalent to or faster than gzip.


Comparing Gzip and Brotli compression across technical characteristics:

| Attribute | Gzip (`gzip`) | Brotli (`br`) | Emerging Zstandard (`zstd`) |
|---|---|---|---|
| Algorithm | DEFLATE (LZ77 + Huffman) | LZ77 + Static Web Dictionary | Finite State Entropy (FSE) |
| Relative Compression | Baseline | **15–25% smaller than gzip** | Comparable to Brotli |
| Decompression Speed | Fast | **Equally fast / faster** | Extremely fast |
| Modern Browser Support | Universal (100%) | Universal (> 97%, requires HTTPS) | Emerging in Chromium/Firefox |


Because Brotli levels 10 and 11 require significant CPU time, production servers apply dynamic Brotli at lower levels (such as 4 to 6) during real-time HTTP compression, reserving maximum compression levels for ahead-of-time build artifacts deployed to static CDNs.

## Watch out

- Running high Brotli compression levels (10 or 11) dynamically on the fly; high levels are slow and spike server CPU.
- Serving Brotli over insecure plain HTTP; browsers strictly mandate HTTPS to negotiate Content-Encoding: br.

## Remember

- Network compression is negotiated via Accept-Encoding and declared with Content-Encoding.
- Brotli (br) outperforms gzip by 15–25% on web text files due to its built-in web dictionary.
- Brotli requires HTTPS and is supported across virtually all modern web browsers.
