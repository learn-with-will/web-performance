---
slug: prioritizing-the-lcp-resource
title: "Prioritizing the LCP Resource"
topic: optimizing-vitals
kind: technique
summary: "Elevating the LCP image fetch using link rel=preload and the fetchpriority=high attribute."
tags: [fetchpriority, preload, lcp, hero-image]
related: [the-four-phases-of-lcp, never-lazy-load-lcp, identifying-the-lcp-element]
---
> **In one line:** Prioritize the LCP resource by declaring it in HTML markup with fetchpriority=high to eliminate load delay.

## The idea

When the LCP element is an image, the browser must discover its URL, assign it high download priority, and fetch it across the network as early as possible. If the image is declared normally, the browser may treat it as a secondary asset and queue it behind less important scripts and stylesheets.

To eliminate Resource Load Delay, two markup optimizations should be applied:
1. Direct HTML declaration: Ensure the `<img>` tag is present directly in the server-rendered HTML document, rather than being injected dynamically by client-side JavaScript or hidden inside external CSS.
2. `fetchpriority="high"`: Adding the `fetchpriority="high"` attribute directly onto the LCP `<img>` tag instructs Chrome's networking engine to boost its priority immediately to "High" or "Highest". This ensures the browser requests the image concurrently with critical CSS, ahead of other images and deferred scripts.

For maximum speed on responsive layouts, pair this with a `<link rel="preload">` in `<head>` containing `imagesrcset` and `imagesizes` attributes.

## See it

```html
<!-- In HTML <head>: Preload the responsive hero image with high priority -->
<link rel="preload" as="image" href="/images/hero-800.avif"
      imagesrcset="/images/hero-400.avif 400w, /images/hero-800.avif 800w, /images/hero-1200.avif 1200w"
      imagesizes="(max-width: 768px) 100vw, 800px"
      fetchpriority="high">

<!-- In HTML <body>: The matching LCP image element -->
<img src="/images/hero-800.avif" alt="Hero product"
     srcset="/images/hero-400.avif 400w, /images/hero-800.avif 800w, /images/hero-1200.avif 1200w"
     sizes="(max-width: 768px) 100vw, 800px"
     width="800" height="450"
     fetchpriority="high">
```

> **Tip:** Add `fetchpriority="high"` to the LCP image to instruct the browser scheduler to fetch it immediately.

## Go deeper
Declaring the LCP image directly in HTML markup and tagging it with `fetchpriority="high"` ensures the browser requests the asset concurrently with critical stylesheets. Pairing this with a responsive `<link rel="preload">` in `<head>` eliminates resource load delay, allowing the image to begin downloading on the very first round trip.


How resource priority adjustments impact LCP fetch timing:

| Markup Strategy | Discovery Mechanism | Network Priority | Load Delay |
|---|---|---|---|
| CSS `background-image` | Discovered after CSSOM + Layout | Low | 1,000 ms – 2,500 ms (Severe) |
| Standard `<img>` tag | Discovered by Preload Scanner | Low / Medium | 300 ms – 800 ms |
| `<img>` with `fetchpriority="high"` | Discovered by Preload Scanner | **High / Highest** | **50 ms – 150 ms (Optimal)** |
| `<link rel="preload">` in `<head>` | Discovered immediately at doc start | **Highest** | **0 ms – 50 ms (Instant)** |

## Watch out

- Adding fetchpriority="high" to multiple images on the same page, which causes bandwidth contention.
- Preloading an image URL that does not match the exact srcset/sizes selected by the <img> tag.

## Remember

- Expose the LCP image directly in initial HTML markup rather than injecting it via client scripts.
- Add fetchpriority=high directly to the LCP <img> element to boost its network scheduler queue position.
- Use link rel=preload with imagesrcset in <head> for instant speculative discovery of responsive images.
