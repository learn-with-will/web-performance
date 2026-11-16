---
slug: native-lazy-loading
title: "Native Lazy Loading"
topic: media-and-fonts
kind: technique
summary: "Implementing native browser lazy loading for offscreen images and iframes to conserve user bandwidth."
tags: [lazy-loading, images, iframes, bandwidth]
related: [never-lazy-load-lcp, modern-image-formats, setting-explicit-image-dimensions]
---
> **In one line:** Add loading=lazy to below-the-fold images and iframes to defer network downloads until they near the viewport.

## The idea

A typical web page may contain 30 or 40 images across its full vertical height, but a user arriving on the page only sees the top two or three images above the fold. Downloading all offscreen images on initial load wastes mobile cellular bandwidth, monopolizes network sockets, and slows down critical scripts and fonts.

Native lazy loading via `loading="lazy"` allows the browser to defer fetching offscreen images and iframes until the user scrolls near them.

Unlike legacy JavaScript lazy-loading libraries (which required bulky scroll listeners or IntersectionObserver wrappers), native lazy loading is built directly into modern browser rendering engines with zero JavaScript overhead.

The browser engine automatically calculates a dynamic "threshold distance" based on current connection speed and device hardware. On fast Wi-Fi, the browser starts fetching images when they are a few hundred pixels from the viewport so they are ready by the time the user scrolls to them. On slow cellular connections, it expands the threshold to buffer further ahead.

## See it

```html
<!-- Below-the-fold images with native lazy loading and dimension reservation -->
<div class="product-gallery">
  <img src="/img/prod-2.avif" alt="Side view" width="600" height="400" loading="lazy">
  <img src="/img/prod-3.avif" alt="Detail view" width="600" height="400" loading="lazy">
  <img src="/img/prod-4.avif" alt="Packaging" width="600" height="400" loading="lazy">
</div>

<!-- Embedded YouTube iframe deferred until scrolled into view -->
<iframe src="https://www.youtube-nocookie.com/embed/xyz"
        title="Product Demo"
        width="560" height="315"
        loading="lazy"></iframe>
```

> **Note:** The browser automatically adjusts the scroll fetch threshold based on whether the user is on Wi-Fi or cellular.

## Go deeper
Native lazy loading via `loading="lazy"` defers the download of offscreen images and iframes until the user scrolls near them. Because native lazy loading is handled directly by the browser rendering engine, it incurs zero JavaScript overhead while saving substantial cellular bandwidth for real users.


Best practices for applying native lazy loading across page components:

| Page Location | `loading` Attribute | `fetchpriority` Attribute | Purpose |
|---|---|---|---|
| Hero LCP Image | **`loading="eager"` (or omit)** | **`fetchpriority="high"`** | Maximize initial load speed |
| Above-the-fold logo | Default (omit) | Default | Standard critical paint |
| Gallery images 3–10 | **`loading="lazy"`** | Default / Low | Defer until user scrolls |
| Offscreen video iframe | **`loading="lazy"`** | Low | Avoid downloading heavy iframe scripts |

## Watch out

- Adding loading="lazy" to the LCP hero image, which destroys LCP performance.
- Omitting width and height on lazy images, causing massive layout shifts (CLS) when scrolled into view.

## Remember

- Use loading=lazy on below-the-fold images and iframes to conserve bandwidth and network sockets.
- Native lazy loading is built into the browser engine and requires zero JavaScript libraries.
- Always pair loading=lazy with explicit width and height attributes to prevent layout shifts.
