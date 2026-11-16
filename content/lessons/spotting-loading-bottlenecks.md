---
slug: spotting-loading-bottlenecks
title: "Spotting Loading Bottlenecks"
topic: measurement-and-tooling
kind: technique
summary: "Recognizing common waterfall anti-patterns: request staircases, bandwidth starvation, and late discovery."
tags: [bottlenecks, waterfall, staircases, optimization]
related: [reading-the-waterfall, recording-network-traces, secondary-resources-waterfall]
---
> **In one line:** Spot waterfall bottlenecks by identifying sequential staircases, late asset discovery, and high TTFB green bars.

## The idea

Analyzing a network waterfall requires looking beyond individual request numbers to evaluate the holistic shape and concurrency of the loading graph. A well-optimized waterfall displays dense, parallel asset downloads occurring immediately after the HTML document arrives.

In contrast, several distinct visual anti-patterns indicate serious loading bottlenecks:
1. The Sequential Staircase: Requests cascade diagonally one after another like stairs instead of downloading in parallel. This indicates nested dependencies: asset A must download before it discovers asset B, which in turn imports asset C. Common culprits include CSS `@import` rules, sequential font stylesheets, and client-side framework chained chunk imports.
2. Late Resource Discovery: Critical assets—such as the hero LCP image or main brand font—do not begin downloading until 2 or 3 seconds into the trace. This happens when resources are buried inside external CSS files or instantiated via JavaScript.
3. Bandwidth Starvation: A sudden horizontal elongation of all active requests, indicating that dozens of low-priority images or analytics trackers are saturating the available network pipe.

## See it

```text
// Visualizing the "Sequential Staircase" Anti-pattern
index.html       [====]
  |
  +-> style.css       [=====]                (Waits for HTML)
        |
        +-> font.css         [====]          (Waits for CSS @import)
              |
              +-> font.woff2       [======]  (Waits for font.css)

// Visualizing Parallel Optimized Loading
index.html       [====]
style.css             [=====]
font.woff2            [======]               (Preloaded directly from HTML!)
hero.avif             [========]
```

> **Note:** A diagonal staircase pattern indicates sequential dependency chains that waste multiple network round trips.

## Go deeper

Recognizing and remediating classic waterfall bottleneck shapes:

| Waterfall Visual Pattern | Architectural Cause | Recommended Solution |
|---|---|---|
| **Diagonal Staircase** | CSS `@import` or nested script imports | Flatten imports; bundle or reference directly in HTML |
| **Late LCP Image Start** | Image declared in CSS background | Add `<link rel="preload" as="image" fetchpriority="high">` |
| **Connection Stampede** | 20+ distinct third-party domains | Consolidate origins; self-host fonts and scripts |
| **Bandwidth Choke** | Lazy-load images downloading early | Ensure offscreen images use `loading="lazy"` |

## Watch out

- Using @import in CSS, which forces the browser to serialize network downloads into an inefficient staircase.
- Allowing third-party tracking scripts to monopolize initial connection sockets ahead of hero images.

## Remember

- Optimized waterfalls load resources in dense, parallel waves immediately following HTML receipt.
- Sequential staircase shapes signify nested dependency chains that burn avoidable round trips.
- Preload critical fonts and hero images to pull their network start times forward in the waterfall.
