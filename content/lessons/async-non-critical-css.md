---
slug: async-non-critical-css
title: "Loading Non-Critical CSS Asynchronously"
topic: rendering-path
kind: technique
summary: "Asynchronous stylesheet loading patterns using preload, media swapping, and onload events."
tags: [async-css, preload, onload, stylesheets]
related: [inlining-critical-css, media-queries-for-stylesheets, defer-and-async-scripts]
---
> **In one line:** Load non-critical stylesheets asynchronously using the rel=preload onload swap pattern to prevent render blocking.

## The idea

Once above-the-fold styles are inlined, the remaining non-critical CSS must be loaded without reinstating a render-blocking pause. By default, any standard `<link rel="stylesheet">` tag blocks the renderer. To circumvent this, developers use established asynchronous loading patterns.

The most widely adopted technique leverages `<link rel="preload">`. Preloading informs the browser's networking stack to download the stylesheet at high priority in the background without applying it to the document or blocking rendering. When the file finishes downloading, the `onload` event handler dynamically changes the link's `rel` attribute from `preload` to `stylesheet`, prompting the browser engine to parse the CSSOM and apply the styles immediately.

An alternative pure-CSS trick involves setting `media="print"`. Because print stylesheets do not apply to screen rendering, the browser downloads the file asynchronously at low priority without blocking paint. When the file loads, the `onload` handler switches the `media` attribute to `all`. Always include a standard `<noscript>` block to ensure search engines and non-JS clients still receive styling.

## See it

```html
<!-- Pattern 1: The rel="preload" with onload swap -->
<link rel="preload" href="/css/remaining.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- Pattern 2: The media="print" trick -->
<link rel="stylesheet" href="/css/remaining.css" media="print" onload="this.media='all'">

<!-- Fallback for clients without JavaScript -->
<noscript>
  <link rel="stylesheet" href="/css/remaining.css">
</noscript>
```

> **Note:** Nullifying `this.onload=null` prevents infinite event loops in older browser engines when `rel` changes.

## Go deeper
When loading non-critical stylesheets asynchronously, ensure that the asynchronous swap does not trigger noticeable layout shifts. If the deferred stylesheet introduces major structural changes to typography or box dimensions, users may observe visual jumps. Reserve asynchronous loading for below-the-fold components, modals, and auxiliary themes to maintain visual stability.


Comparing asynchronous stylesheet loading patterns:

| Pattern | Browser Support | Priority Assigned | Notes |
|---|---|---|---|
| `preload` + `onload` | Excellent (all modern) | High priority background fetch | Cleanest approach; requires JS to apply |
| `media="print"` + `onload` | Universal | Low priority background fetch | Safe; gentle on mobile bandwidth |
| Vanilla `<link rel="stylesheet">` | Universal | **Highest (render-blocking)** | Avoid for non-critical assets |


In high-traffic production environments, monitor layout stability metrics closely after adopting asynchronous stylesheet loading. Combining critical CSS inlining with async non-critical styles provides the fastest possible paint times while avoiding layout shifts, ensuring that secondary styles apply smoothly without interrupting user interactions.

## Watch out

- Forgetting to set as="style" when using link rel="preload", causing the browser to ignore or mishandle the fetch.
- Omitting the noscript tag, which leaves users who have disabled JavaScript with completely broken styles.

## Remember

- Standard link stylesheet tags are render-blocking; asynchronous patterns bypass this pause.
- Use link rel=preload with an onload swap to download non-critical styles without blocking render.
- Always provide a noscript fallback containing standard stylesheet links for non-JS clients.
