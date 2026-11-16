---
slug: what-not-to-compress
title: "What Not to Compress"
topic: caching-and-compression
kind: pitfall
summary: "Avoiding the common mistake of re-compressing already-compressed binary files like AVIF, WebP, and WOFF2."
tags: [compression, pitfalls, cpu-waste, binary-formats]
related: [gzip-versus-brotli, static-versus-dynamic-compression, modern-image-formats]
---
> **In one line:** Never re-compress already-compressed binary files (AVIF, WebP, JPEG, PNG, WOFF2, MP4); it wastes CPU.

## The idea

A pervasive server misconfiguration is enabling gzip or Brotli compression globally across all file types indiscriminately.

Network compression algorithms like gzip and Brotli work by finding repetitive patterns and redundancy in text. However, modern binary multimedia formats—including AVIF, WebP, JPEG, PNG, WOFF2, and MP4—are already heavily compressed using domain-specific mathematical algorithms. Their binary byte streams have near-maximum entropy, meaning there is virtually zero repeating redundancy for a general-purpose text compressor to exploit.

Attempting to compress an AVIF image or WOFF2 font with gzip or Brotli achieves zero byte reduction. In fact, it often makes the file slightly larger because of the added compression header metadata! Furthermore, the web server burns valuable CPU cycles performing futile mathematical transformations on every request, creating unnecessary server latency.

Strictly configure your compression middleware to target text-based MIME types only.

## See it

```text
# NGINX Configuration: Compress text-based MIME types ONLY
gzip_types
  text/plain
  text/css
  text/javascript
  application/javascript
  application/json
  application/xml
  image/svg+xml;

# DO NOT include: image/jpeg, image/png, image/webp, image/avif, font/woff2
```

> **Watch out:** Compressing AVIF, WebP, or WOFF2 files wastes server CPU and can actually increase file sizes.

## Go deeper
Enabling network compression on already-compressed binary files—such as AVIF, WebP, JPEG, and WOFF2—wastes server CPU cycles and can increase total payload size due to compression header overhead. Restrict gzip and Brotli compression strictly to text-based MIME types.


Categorizing file formats by whether network compression should be applied:

| File Format | Compressed by Gzip/Brotli? | Reason / Explanation |
|---|---|---|
| **HTML, CSS, JavaScript** | **YES** | Highly repetitive text tokens; 70–80% byte reduction |
| **SVG Images** | **YES** | Plain text XML markup; compresses dramatically |
| **JSON & XML Data** | **YES** | Repetitive key-value strings; highly compressible |
| **AVIF, WebP, JPEG, PNG** | **NO** | Already compressed with image codecs; zero reduction |
| **WOFF2 Fonts** | **NO** | Already incorporates internal Brotli compression |
| **MP4 / WebM Video** | **NO** | Already compressed with video codecs |


Applying gzip or Brotli compression to already compressed binary assets—such as AVIF, WebP, or WOFF2 files—actually wastes server processing time and can increase response payload sizes due to wrapper framing overhead. Always verify web server MIME-type compression rules.

## Watch out

- Including image/svg+xml under 'do not compress' rules; SVGs are plain XML text and compress massively.
- Enabling generic cloud proxy compression without verifying that binary file types are explicitly excluded.

## Remember

- Network compression (gzip/Brotli) is designed strictly for text-based resources.
- Never compress binary media formats like AVIF, WebP, JPEG, WOFF2, or MP4.
- Re-compressing already-compressed binary files wastes CPU and can increase total payload size.
