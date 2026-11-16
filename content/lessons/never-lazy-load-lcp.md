---
slug: never-lazy-load-lcp
title: "Never Lazy-Load the LCP Image"
topic: optimizing-vitals
kind: pitfall
summary: "Why adding loading=lazy to above-the-fold hero images severely harms Largest Contentful Paint."
tags: [lazy-loading, lcp, pitfalls, hero-image]
related: [prioritizing-the-lcp-resource, the-four-phases-of-lcp, native-lazy-loading]
---
> **In one line:** Never add loading=lazy to an above-the-fold or LCP image; it delays fetching until after layout, severely harming LCP.

## The idea

Native image lazy loading via `loading="lazy"` is one of the most powerful performance features in the web platform—when applied to below-the-fold images. However, applying `loading="lazy"` to an above-the-fold image (and especially the LCP image) is one of the most catastrophic performance mistakes in modern web development.

When a browser encounters an `<img>` with `loading="lazy"`, it intentionally postpones fetching the image. It cannot know whether the image is within the user's viewport until it finishes parsing all stylesheets, building the CSSOM, computing layout geometry, and calculating the element's physical coordinates.

As a result, the speculative preload scanner skips the image completely! The image request is delayed by hundreds or thousands of milliseconds while the browser waits for layout to complete. Google's Web Almanac consistently finds that removing `loading="lazy"` from the hero image immediately recovers 1 to 2 seconds of LCP latency.

## See it

```html
<!-- ANTI-PATTERN: Ruinous to LCP! Defers fetch until after layout calculation -->
<img src="/hero.jpg" alt="Hero" loading="lazy">

<!-- CORRECT PATTERN: Eager fetch, high priority, zero load delay -->
<img src="/hero.avif" alt="Hero" fetchpriority="high" decoding="async" width="1200" height="600">

<!-- Below-the-fold image: Perfect candidate for lazy loading -->
<img src="/footer-promo.avif" alt="Promo" loading="lazy" width="400" height="300">
```

> **Watch out:** `loading="lazy"` on an above-the-fold image disables the preload scanner and delays image fetching until after layout.

## Go deeper
Applying `loading="lazy"` to an above-the-fold hero image forces the browser to postpone downloading until stylesheet parsing, CSSOM construction, and layout calculations are complete. This completely bypasses the speculative preload scanner and introduces significant load delays, frequently causing LCP to fail by several seconds.


Comparing browser network discovery timelines for lazy vs eager hero images:

| Step | Hero Image with `loading="lazy"` | Hero Image with `fetchpriority="high"` |
|---|---|---|
| HTML Parsing Starts | Preload scanner **ignores** image | Preload scanner **starts fetch immediately** |
| Stylesheets Download | Waiting for network | Image downloading concurrently |
| CSSOM & Layout Run | Browser finally checks if image is visible | Image already finished downloading |
| Image Fetch Dispatched | **Delayed until after layout** (late!) | Already in memory cache |
| LCP Render Event | **Severely delayed (3.5s – 5s)** | **Fast (< 2.0s)** |


When an LCP candidate is marked with loading="lazy", the browser delays fetching until layout calculation confirms the image is near the viewport. This artificial delay directly inflates LCP times by hundreds of milliseconds, hurting both user experience and search ranking signals.

## Watch out

- Blindly configuring CMS or framework plugins that automatically inject loading="lazy" on all <img> tags.
- Assuming lazy loading is universally beneficial; it should be applied strictly to below-the-fold assets.

## Remember

- Never place loading=lazy on above-the-fold images or the primary LCP candidate element.
- Lazy loading prevents the preload scanner from requesting the image early during HTML parsing.
- Reserve loading=lazy strictly for images that sit below the initial viewport fold.
