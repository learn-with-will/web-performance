---
slug: priority-budget-and-over-hinting
title: "Priority Budgets and Over-Hinting"
topic: loading-strategies
kind: pitfall
summary: "Avoiding hint congestion and bandwidth starvation caused by over-preloading and excessive hints."
tags: [priority-budget, over-hinting, bandwidth-contention, anti-patterns]
related: [preloading-critical-assets, fetchpriority-attribute, connection-hints-dns-and-preconnect]
---
> **In one line:** When everything is prioritized, nothing is prioritized; over-hinting starves critical assets of bandwidth.

## The idea

Resource hints—such as `preload`, `preconnect`, and `fetchpriority="high"`—are powerful steering wheels for the browser's loading engine. However, when applied indiscriminately, they create a catastrophic condition known as "Priority Congestion" or over-hinting.

Physical network bandwidth is strictly finite. If a mobile phone has a 5 Mbps connection and the developer declares `<link rel="preload">` on three custom fonts, two CSS files, three hero carousel images, and an analytics bundle, all while setting `fetchpriority="high"` on everything, what happens?

The browser obediently queues all these assets with Highest priority simultaneously. Instead of the single critical hero image downloading swiftly over the full bandwidth, the network pipe is divided across ten competing streams. The hero image finishes later than it would have without any hints!

To prevent over-hinting, adhere to a strict Priority Budget:
- Preload at most 1–2 critical assets (typically the LCP image and the primary headline font).
- Preconnect to at most 2–4 critical cross-origin hosts.
- Apply `fetchpriority="high"` to exactly one image: the LCP candidate.

## See it

```html
<!-- ANTI-PATTERN: Over-hinting congestion! Starves critical CSS and hero image -->
<link rel="preconnect" href="https://fonts.com">
<link rel="preconnect" href="https://api.com">
<link rel="preconnect" href="https://cdn.com">
<link rel="preconnect" href="https://tracker.com">
<link rel="preload" href="/font1.woff2" as="font" crossorigin>
<link rel="preload" href="/font2.woff2" as="font" crossorigin>
<link rel="preload" href="/hero.jpg" as="image" fetchpriority="high">
<link rel="preload" href="/banner2.jpg" as="image" fetchpriority="high">

<!-- BEST PRACTICE: Disciplined priority budget -->
<link rel="preconnect" href="https://cdn.example.com">
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin>
<img src="/hero.avif" alt="Hero" fetchpriority="high">
```

> **Watch out:** Preloading too many resources congests the network pipe and delays the very assets you intended to speed up.

## Go deeper
Resource hints must adhere to a strict Priority Budget. Preloading too many assets congests available network bandwidth, dividing the connection across competing streams and delaying the critical hero image. Limit preloads to the single critical headline font and primary LCP hero image.


Auditing priority budgets across page asset categories:

| Asset Category | Maximum Recommended Hints | Target Asset |
|---|---|---|
| `preconnect` | 2 to 4 origins | Primary image CDN, critical API origin |
| `preload` (Fonts) | 1 font file | Main headline or body WOFF2 font |
| `preload` (Images) | 1 image file | Above-the-fold LCP hero element |
| `fetchpriority="high"` | 1 image element | Primary LCP image only |

## Watch out

- Preloading every font weight in a design system; users download 300 KB of unused bold/italic font binaries.
- Preconnecting to third-party ad networks that are not requested until 10 seconds into the session.

## Remember

- Network bandwidth is finite; prioritizing too many resources congests the connection queue.
- Limit preloading to the single critical headline font and the single primary LCP hero image.
- Reserve fetchpriority=high exclusively for the LCP candidate element to prevent bandwidth dilution.
