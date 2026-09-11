---
id: lesson-12
slug: image-optimization
title: "Image Optimization"
level: intermediate
order: 12
duration: 21
tags:
  - images
  - avif-webp
  - responsive-images
  - lazy-loading
  - srcset
summary: "Cutting image weight — the biggest payload on most pages — with modern formats (AVIF, WebP), responsive srcset/sizes and the picture element, always-set dimensions, native lazy loading, and the right priority and decoding hints."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Choose an appropriate **image format** (AVIF, WebP, JPEG, PNG, SVG).
- Serve **responsive** images with **`srcset`/`sizes`** and **`<picture>`**.
- Always set **dimensions** to prevent layout shift.
- Use **`loading="lazy"`**, **`decoding="async"`**, and **`fetchpriority`** correctly.
- Avoid the common image pitfalls that bloat pages.

# Why It Matters

Images are usually the **heaviest** thing a page loads — often more bytes than everything else combined. That
makes them the highest-leverage, lowest-risk optimization: a right-sized, well-compressed, modern-format
image can be a fraction of the size with no visible quality loss. Get images right and LCP, total bytes, and
data usage all improve at once.

# Concept Explanation

### Pick the right format

- **AVIF** — usually the **smallest** for photos (AV1-based). Support is broad in current browsers *as of
  writing*; still provide a fallback.
- **WebP** — great compression, **very widely supported**; a safe modern default.
- **JPEG** — the universal fallback for photos.
- **PNG** — lossless, supports transparency; larger — use for graphics needing transparency, not photos.
- **SVG** — vector; perfect for icons, logos, and simple graphics that must stay crisp at any size.
- **Animated GIF** — avoid; use a **video** (`<video>` with MP4/WebM) instead — far smaller.

Serve modern formats with a fallback using `<picture>` and `<source type>`.

### Serve the right size (responsive images)

Sending a 3000px-wide image into a 400px slot wastes bytes. Let the browser choose with **`srcset`** (width
descriptors) and **`sizes`** (how wide the image will display):

```html
<img
  src="/img/photo-800.jpg"
  srcset="/img/photo-400.jpg 400w, /img/photo-800.jpg 800w, /img/photo-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="800" height="533" alt="A mountain lake at dawn" />
```

The browser picks the smallest source that fills the slot on that device and DPR. Use **`<picture>`** when
you need **format fallback** or **art direction** (a different crop per breakpoint).

### Always set dimensions

Set **`width`/`height`** (or CSS `aspect-ratio`) on every image so the browser reserves space and avoids
layout shift (Lesson 10). Keep `img { max-width: 100%; height: auto; }` for responsiveness.

### Lazy load below the fold — but not the LCP image

Add **`loading="lazy"`** to images **below the fold** so they load only as the user approaches them. Do
**not** lazy-load above-the-fold or LCP images (Lesson 9) — those should load eagerly, and the LCP image
should get **`fetchpriority="high"`**. Use **`decoding="async"`** so decoding doesn't block the main thread.

```html
<!-- Below the fold: defer until near the viewport -->
<img src="/gallery/07.avif" loading="lazy" decoding="async"
     width="600" height="400" alt="Gallery photo 7" />
```

### Compress sensibly

Export at a reasonable **quality** (often 60–80 for photos) and let build tools or an image CDN handle
resizing and format conversion. **Don't** try to compress already-compressed formats again (Lesson 15) — and
never gzip/Brotli your JPEGs/WebP/AVIF; they're already compressed.

# Key Terminology

- **AVIF / WebP** — modern, highly compressed raster formats (with JPEG/PNG fallbacks).
- **`srcset`** — a list of image sources with width (or density) descriptors.
- **`sizes`** — tells the browser how wide the image will render, so it can pick from `srcset`.
- **`<picture>`** — element for format fallback and art direction via `<source>`.
- **`loading="lazy"`** — defer loading an image until it's near the viewport.
- **`decoding="async"`** — decode the image off the critical path.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Format | AVIF | WebP / JPEG | AVIF is usually smallest; provide WebP/JPEG fallback via `<picture>` for full support. |
| Responsive | `srcset` + `sizes` | `<picture>` | `srcset` for same image at different sizes; `<picture>` for format fallback or different crops. |
| Loading | `loading="lazy"` | Eager | Lazy below the fold; eager (never lazy) for above-the-fold and the LCP image. |
| Icon/logo | PNG | SVG | SVG stays crisp at any size and is tiny for simple shapes. |
| Animation | GIF | `<video>` (MP4/WebM) | Video is dramatically smaller than an equivalent GIF. |

# Worked Example

A hero and a gallery image, each done well:

```html
<!-- LCP hero: modern format with fallback, eager, high priority, sized -->
<picture>
  <source type="image/avif" srcset="/hero-1600.avif 1600w, /hero-800.avif 800w" sizes="100vw" />
  <source type="image/webp" srcset="/hero-1600.webp 1600w, /hero-800.webp 800w" sizes="100vw" />
  <img src="/hero-800.jpg" width="1600" height="900" alt="Product hero"
       fetchpriority="high" decoding="async" />
</picture>

<!-- Below-the-fold gallery image: lazy + async decode, still sized -->
<img src="/g-07.avif" srcset="/g-07-400.avif 400w, /g-07-800.avif 800w"
     sizes="(max-width: 600px) 100vw, 400px"
     width="800" height="600" loading="lazy" decoding="async" alt="Trail marker" />
```

The hero loads early and prioritized in the best format each browser supports; the gallery image waits until
the user scrolls near it. Both reserve space, so neither shifts the layout.

# Real World Analogy

Serving images is like **mailing photo prints**. You wouldn't post a billboard-sized print to someone who
only has a wallet frame (over-sized image), nor a blurry thumbnail to fill a poster frame (under-sized). You
pick the **right print size** for the frame (`srcset`/`sizes`), use the **most efficient paper** (AVIF/WebP),
and only print the photos the person will actually look at (lazy load) — while still leaving the right-sized
gap on the wall so the room's layout doesn't change when they arrive.

# Examples

## Example 1 — Basic: responsive sizes with srcset

Providing 400/800/1600px versions with `srcset` and a `sizes` hint lets a phone download the 400px file
while a desktop grabs 1600px — the same markup serves each device the right bytes.

**Why this works:** the browser picks the smallest source that still looks sharp for the device's size and
pixel density.

## Example 2 — Real-world: AVIF with a fallback

A photo-heavy page switches its `<img>` to a `<picture>` offering AVIF, then WebP, then JPEG. Modern
browsers download the AVIF (often less than half the JPEG's size); older ones fall back gracefully. Total
image bytes drop sharply with no visible quality change.

**Why this works:** `<picture>`/`<source type>` serves the best format each browser supports without breaking
anyone.

## Example 3 — Pitfall: a giant PNG photo

A hero photo is exported as a multi-megabyte PNG. PNG is lossless and terrible for photographs; converting to
AVIF/WebP (or even JPEG) at quality ~75 cuts it by an order of magnitude with no perceptible difference.

**Why this bites:** using PNG for photos ships huge files; PNG is for graphics/transparency, not photographs.

# Common Mistakes

- **Serving one huge image to all devices** instead of responsive `srcset` sizes.
- **Using PNG for photographs**, producing enormous files.
- **Lazy-loading the LCP/above-the-fold image**, delaying LCP.
- **Omitting `width`/`height`**, causing layout shift when images load.

# Best Practices

- Use **AVIF/WebP** with a **`<picture>`** fallback; JPEG for photos, SVG for icons, video instead of GIF.
- Serve **responsive sizes** with `srcset`/`sizes`; never ship more pixels than the slot needs.
- Always set **dimensions**; **lazy-load below the fold**; keep the LCP image **eager + high priority**.
- Compress to a sensible quality; let a build step or image CDN handle formats/sizes.

# Summary

- Images are usually the **heaviest** payload — the highest-leverage optimization.
- Prefer **AVIF/WebP** with a fallback; **SVG** for icons; **video** instead of animated GIF.
- Serve **responsive sizes** (`srcset`/`sizes`, `<picture>`), and always set **dimensions**.
- **Lazy-load below the fold**, but keep the **LCP image eager and high priority**.
- **Compress** sensibly; don't re-compress already-compressed formats.

# Flash Cards

Q: Which image formats should you prefer for photos, and how do you keep older browsers working?
A: Prefer AVIF (smallest) then WebP, with a JPEG fallback — serve them via a `<picture>` element with `<source type>` so each browser gets the best format it supports.

Q: What do `srcset` and `sizes` do together?
A: `srcset` lists image sources with width descriptors; `sizes` tells the browser how wide the image will display, so it can pick the smallest source that still looks sharp for that device and pixel density.

Q: When should you use `loading="lazy"` and when should you not?
A: Use it for below-the-fold images so they load as the user approaches them; do NOT use it for above-the-fold or the LCP image, which should load eagerly.

Q: Why is PNG a poor choice for photographs?
A: PNG is lossless and produces very large files for photos; it's meant for graphics needing transparency or crisp edges. Photos should use AVIF/WebP/JPEG.

Q: What element do you use for format fallback or art direction (different crops per breakpoint)?
A: The `<picture>` element with multiple `<source>` entries (by `type` for format, or `media` for art direction) and an `<img>` fallback.

Q: Why set `width` and `height` on images even when they're responsive?
A: So the browser reserves the correct space (aspect ratio) before the image loads, preventing layout shift; keep `height: auto` in CSS so they still scale responsively.

# Exercises

### Easy
Find a large `<img>` on a page. Check its intrinsic size vs its displayed size in DevTools. Is it far bigger
than needed? Propose `srcset` sizes that would fit.

### Medium
Convert a JPEG hero to a `<picture>` with AVIF and WebP sources plus a JPEG fallback, keeping `width`/`height`
and `fetchpriority="high"`. Compare the transferred bytes before and after in the Network panel.

### Challenging
Audit a gallery page: which images should be lazy-loaded and which must stay eager (LCP/above-the-fold)?
Implement the split, add responsive `srcset`/`sizes`, and explain how each change affects LCP and total
bytes.

# Further Reading

- web.dev — *Use modern image formats (AVIF/WebP)* & *Optimize images*: <https://web.dev/learn/performance/optimize-your-images>
- MDN — *Responsive images*: <https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images>
- MDN — *`<picture>`*: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture>
- web.dev — *Browser-level image lazy loading*: <https://web.dev/articles/browser-level-image-lazy-loading>
