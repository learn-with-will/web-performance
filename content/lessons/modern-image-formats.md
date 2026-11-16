---
slug: modern-image-formats
title: "Modern Image Formats: AVIF and WebP"
topic: media-and-fonts
kind: concept
summary: "Cutting image payload size using modern AVIF and WebP formats compared to legacy JPEG and PNG."
tags: [images, avif, webp, compression]
related: [responsive-images-srcset-sizes, the-picture-element-art-direction, image-decoding-and-compression]
---
> **In one line:** Use AVIF and WebP for dramatically smaller image payloads while maintaining high visual quality.

## The idea

Images account for over 50% of the total byte weight transferred to a typical web page. Consequently, modernizing image formats is the single most effective way to slash page weight and accelerate loading.

Legacy formats—JPEG (standardized in 1992) and PNG (standardized in 1996)—lack the advanced compression algorithms of modern video codecs. Today, two modern formats dominate web performance:

1. WebP: Developed by Google, WebP provides both lossy and lossless compression with full alpha transparency. WebP typically produces files 25% to 35% smaller than comparable JPEGs and PNGs, and is supported across virtually 100% of modern web browsers.
2. AVIF (AV1 Image File Format): Derived from the open-source AV1 video codec, AVIF represents the current state of the art. AVIF typically achieves 50% smaller file sizes than JPEG and 20% smaller than WebP at identical visual fidelity, offering superior color accuracy and HDR support.

Best practice is to serve AVIF first, fall back to WebP for older browsers, and maintain legacy JPEG/PNG fallbacks where necessary.

## See it

```html
<!-- Serving AVIF with WebP and JPEG fallbacks via the picture element -->
<picture>
  <source srcset="/images/hero.avif" type="image/avif">
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="City skyline at dusk" width="1200" height="600" decoding="async">
</picture>
```

> **Tip:** AVIF typically reduces image payload by ~50% compared to legacy JPEG while preserving crisp visual details.

## Go deeper
Modern formats like AVIF and WebP deliver superior compression efficiency compared to legacy JPEG and PNG formats. AVIF leverages advanced intra-frame prediction from the AV1 video codec to achieve roughly 50% byte savings over JPEG at identical perceptual quality, drastically reducing page payload size and accelerating LCP.


Comparing web image formats across compression, features, and browser support:

| Format | Codec Heritage | Compression Efficiency | Transparency | Browser Support |
|---|---|---|---|---|
| **JPEG** | DCT (1992) | Baseline reference | No | Universal (100%) |
| **PNG** | DEFLATE (1996) | Poor for photos; lossless for diagrams | Yes | Universal (100%) |
| **WebP** | VP8 (2010) | ~30% smaller than JPEG | Yes | Universal (> 97%) |
| **AVIF** | AV1 (2019) | **~50% smaller than JPEG** | Yes | Broad (> 93%) |


AVIF delivers superior compression at high compression settings compared to WebP, particularly for photos with rich textures and gradients. Evaluating both formats in an automated image pipeline ensures you serve the smallest possible byte payload supported by the client browser.

## Watch out

- Serving high-resolution PNGs for photographic content; photographic PNGs are frequently 5x larger than AVIF.
- Over-compressing AVIF images below quality 50, which can introduce subtle blocky color artifacts.

## Remember

- AVIF and WebP offer dramatically superior compression compared to legacy JPEG and PNG formats.
- AVIF achieves roughly 50% byte savings over JPEG at equivalent perceptual quality.
- Use the <picture> element to negotiate next-gen formats with backward-compatible fallbacks.
