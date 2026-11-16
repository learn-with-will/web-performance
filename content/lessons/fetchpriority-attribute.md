---
slug: fetchpriority-attribute
title: "The fetchpriority Attribute"
topic: loading-strategies
kind: api
summary: "Fine-tuning browser request priorities with fetchpriority=high and fetchpriority=low across HTML elements."
tags: [fetchpriority, priority-hints, lcp, scheduler]
related: [preloading-critical-assets, prioritizing-the-lcp-resource, never-lazy-load-lcp]
---
> **In one line:** Use fetchpriority to raise or lower a resource's priority relative to the browser's default heuristics.

## The idea

The browser maintains an internal resource scheduler that assigns an initial priority (`Highest`, `High`, `Medium`, `Low`, `Lowest`) to every network request based on its resource type, position in markup, and viewport visibility.

However, browser heuristics are not clairvoyant: the browser does not know that image #1 is your primary LCP hero image, while image #2 is an offscreen thumbnail in a collapsed drawer.

The `fetchpriority` attribute provides explicit developer control over the browser's priority heuristics. It accepts three values: `high`, `low`, and `auto` (the default).

Key high-ROI applications of `fetchpriority`:
1. `fetchpriority="high"` on the LCP image: Elevates the hero image to High priority immediately during initial HTML parsing, fetching it in parallel with critical CSS.
2. `fetchpriority="low"` on non-critical scripts: Lowers priority on third-party analytics trackers, social widgets, or carousel images.
3. `fetchpriority="high"` on critical API calls: Used inside JavaScript `fetch('/api/user', { priority: 'high' })` to prioritize urgent data fetching.

## See it

```html
<!-- Elevating the LCP hero image to High priority -->
<img src="/hero.avif" alt="Featured course" width="800" height="400" fetchpriority="high">

<!-- Lowering priority on offscreen carousel images -->
<img src="/slide-2.avif" alt="Slide 2" width="800" height="400" fetchpriority="low" loading="lazy">

<!-- Lowering priority on third-party analytics script -->
<script src="/analytics.js" async fetchpriority="low"></script>
```

```javascript
// Using fetchpriority in JavaScript fetch API
fetch('/api/cart/checkout', { priority: 'high' });
```

> **Tip:** Add `fetchpriority="high"` to the LCP hero image and `fetchpriority="low"` to secondary widgets and trackers.

## Go deeper
The `fetchpriority` attribute provides explicit developer control over the browser's internal resource scheduler. Adding `fetchpriority="high"` elevates the hero LCP image to high priority concurrently with stylesheets, while `fetchpriority="low"` defers secondary scripts and offscreen images.


How `fetchpriority` influences Chrome scheduler priority buckets:

| Element & Context | Default Priority | With `fetchpriority="high"` | With `fetchpriority="low"` |
|---|---|---|---|
| Early `<img>` in HTML | Low | **High (requests concurrently with CSS)** | Lowest |
| Script with `async` | Low | High | **Lowest (defers until network quiet)** |
| Critical API `fetch()` | High | **High (immediate socket dispatch)** | Low |
| Preload link | Governed by `as` | High / Highest | Low |


Unlike preload, which requests assets ahead of natural parser discovery, fetchpriority changes the browser internal scheduling priority for already discovered elements. Applying fetchpriority="high" ensures the LCP resource gets prioritized immediately over concurrent stylesheets, scripts, and non-critical images.

## Watch out

- Adding fetchpriority="high" to multiple images on the same page, causing network queue contention.
- Using fetchpriority="high" on below-the-fold images; reserve high priority strictly for critical assets.

## Remember

- fetchpriority explicitly signals the relative importance of an asset to the browser scheduler.
- Add fetchpriority=high to the LCP image to pull its download forward in the network queue.
- Add fetchpriority=low to secondary scripts and offscreen images to conserve initial bandwidth.
