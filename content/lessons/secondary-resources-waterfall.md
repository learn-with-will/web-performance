---
slug: secondary-resources-waterfall
title: "Secondary Resources and Waterfalls"
topic: network-and-browsers
kind: technique
summary: "How browsers discover and prioritize secondary sub-resources through HTML streaming and preload scanners."
tags: [waterfall, preload-scanner, discovery, subresources]
related: [anatomy-of-a-navigation, ttfb-and-first-byte, dom-construction]
---
> **In one line:** The browser's speculative preload scanner discovers sub-resources in HTML to fetch stylesheets and scripts in parallel.

## The idea

Receiving the HTML response is only the opening step of page loading. A typical modern web page requires dozens of secondary sub-resources: external stylesheets, client-side JavaScript bundles, custom web fonts, hero images, and analytics trackers.

To prevent loading these assets in an agonizingly slow serial sequence, all modern browser rendering engines include a lightweight secondary parser known as the speculative preload scanner. While the main HTML parser pauses whenever it encounters synchronous scripts or stylesheet dependencies, the preload scanner races ahead through the raw HTML stream looking for `<link>`, `<script>`, and `<img>` tags.

When the preload scanner discovers asset URLs, it immediately dispatches asynchronous fetch requests with appropriate initial priorities. However, the preload scanner cannot discover assets hidden behind CSS `@import` rules, referenced inside CSS `background-image` declarations, or dynamically injected via JavaScript. Keeping critical sub-resource URLs declared directly in the initial HTML markup is essential for early parallel downloading.

## See it

```html
<!-- Anti-pattern: Hidden asset discovered late by CSS parser -->
<!-- style.css contains: @import url("font.css"); and background: url("hero.jpg"); -->
<link rel="stylesheet" href="/style.css">

<!-- Best Practice: Explicit declarations visible to preload scanner -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/images/hero.avif" as="image" fetchpriority="high">
<link rel="stylesheet" href="/style.css">
```

> **Note:** The preload scanner parses raw HTML tokens ahead of DOM construction to initiate high-priority network downloads immediately.

## Go deeper
The speculative preload scanner is sensitive to document structure and tokenization order. Placing high-priority stylesheets and font preloads at the very top of `<head>` ensures the preload scanner discovers and dispatches them in the earliest possible network packet. Avoid wrapping critical resource declarations inside conditional JavaScript comments or client-rendered templates.


How resource discovery mechanisms compare in the browser loading waterfall:

| Discovery Method | Discovery Timing | Waterfall Impact |
|---|---|---|
| Direct HTML `<link>` / `<img>` | Immediate via Preload Scanner | Fast parallel network downloads |
| CSS `@import` rule | Discovered only after parent CSS downloads | Late serial request chain (staircase) |
| CSS `background-image` | Discovered after CSSOM and Layout tree match | Delayed until rendering pipeline starts |
| JavaScript dynamic import | Discovered after script downloads and runs | Deeply delayed waterfall chain |

## Watch out

- Hiding the hero LCP image inside an external CSS file, preventing the preload scanner from discovering it early.
- Using CSS @import rules inside stylesheets, which creates cascading sequential network round trips.

## Remember

- The preload scanner inspects HTML streams ahead of DOM creation to download sub-resources in parallel.
- Assets declared in external CSS or injected via JavaScript remain invisible to the preload scanner.
- Expose critical fonts, styles, and hero images directly in the initial HTML document.
