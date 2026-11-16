---
slug: largest-contentful-paint-metric
title: "Largest Contentful Paint (LCP)"
topic: core-web-vitals
kind: concept
summary: "LCP measures perceived load speed by tracking when the largest visible element renders in the viewport."
tags: [lcp, core-web-vitals, loading, viewport]
related: [core-web-vitals-overview, identifying-the-lcp-element, the-four-phases-of-lcp]
---
> **In one line:** LCP marks when the largest text block, image, or video in the viewport finishes rendering, targeting ≤ 2.5s.

## The idea

Largest Contentful Paint (LCP) is the Core Web Vital that measures perceived loading speed. It marks the point in the page load timeline when the main content of the page has likely loaded and rendered to the user.

Historically, metrics like `DOMContentLoaded` or `loadEvent` measured technical milestones that bore little relation to what users saw. In contrast, LCP continuously observes elements as they render in the viewport and records the timestamp of the largest element by surface area.

Only specific visual elements qualify as candidate LCP elements:
- `<img>` elements and SVG images embedded via `<image>` tags.
- Video poster images or the first frame of a `<video>` element.
- Elements with a background image loaded via CSS `url()`.
- Block-level elements containing text nodes or inline text children.

The browser stops monitoring LCP candidates as soon as the user interacts with the page (via keypress, tap, or mouse scroll). A passing LCP score requires rendering the largest element within 2.5 seconds at the 75th percentile.

## See it

```javascript
// Observing the LCP candidate element via standard PerformanceObserver API
const observer = new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('Current LCP candidate:', lastEntry.element, 'Time:', lastEntry.startTime);
});
observer.observe({ type: 'largest-contentful-paint', buffered: true });
```

> **Tip:** The LCP element is determined by viewport surface area; elements extending outside the viewport are clipped for scoring.

## Go deeper
The browser continuously updates the LCP candidate as content streams into the viewport. If a large hero headline renders at 1.2 seconds, it becomes the tentative LCP element. If an even larger hero image finishes rendering at 2.1 seconds, the browser updates the LCP record to the image. Optimization requires ensuring that the final candidate element finishes rendering within 2.5 seconds.


Qualifying LCP candidate element types and how their visual area is calculated:

| Element Candidate Type | Qualifying Conditions | Area Calculation Rule |
|---|---|---|
| `<img>` Element | Rendered within viewport bounds | Visible bounding box width × height |
| Text Block (`<h1>`, `<p>`) | Contains visible inline text nodes | Smallest rectangle enclosing all text nodes |
| CSS Background Image | Loaded via CSS `background-image: url()` | Bounding box of styled element |
| `<video>` Poster Frame | Visible poster image rendered | Bounding box of video container |

## Watch out

- Assuming the LCP element is fixed; as larger images or fonts load, the LCP candidate can shift dynamically.
- Allowing offscreen carousel slides or modals to hijack LCP calculations by rendering initially in the viewport.

## Remember

- LCP measures when the largest visible content element in the viewport finishes rendering.
- The official good threshold for LCP is 2.5 seconds or faster at the 75th percentile.
- Qualifying elements include images, video posters, CSS background images, and text blocks.
