---
slug: identifying-the-lcp-element
title: "Identifying the LCP Element"
topic: optimizing-vitals
kind: technique
summary: "Locating the exact Largest Contentful Paint candidate in Chrome DevTools and the Performance panel."
tags: [lcp, devtools, performance-panel, hero-element]
related: [largest-contentful-paint-metric, the-four-phases-of-lcp, prioritizing-the-lcp-resource]
---
> **In one line:** Locate the page's LCP element using the DevTools Performance panel or Lighthouse to identify what to optimize.

## The idea

Before you can optimize Largest Contentful Paint, you must know with absolute certainty which DOM element is currently winning the LCP election. Optimizing the wrong image or refactoring text styles that do not constitute the LCP element will produce zero improvement in your Core Web Vitals score.

To find the LCP element in Chrome DevTools:
1. Open DevTools and switch to the "Performance" panel.
2. Ensure "Screenshots" is checked, click the "Record and reload" button, and allow the profile to finish.
3. In the "Timings" track, locate the badge labeled "LCP".
4. Click on the LCP marker. In the "Summary" tab at the bottom, DevTools will display the exact DOM node (e.g. `div.hero-banner > img.cover`), its render timestamp, load duration, and dimensions.
5. Hovering over the node link in the Summary tab visually highlights the element directly on the page.

Alternatively, Lighthouse lists the exact node under the "Largest Contentful Paint element" diagnostic, showing both the HTML snippet and image URL.

## See it

```javascript
// Dynamically highlighting the current LCP element directly on the page in console
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const last = entries[entries.length - 1];
  console.log('LCP Element:', last.element);
  if (last.element) {
    last.element.style.outline = '4px solid #0CCE6B';
  }
});
observer.observe({ type: 'largest-contentful-paint', buffered: true });
```

> **Tip:** In the DevTools Performance panel, clicking the LCP marker reveals the exact DOM element and its timing breakdown.

## Go deeper
Chrome DevTools Performance panel allows developers to inspect the exact DOM element winning the LCP election. Clicking the LCP timing marker displays the element's bounding box, render timestamp, and load duration in the Summary tab, ensuring that optimization efforts target the exact node that determines the site's LCP score.


Common element candidates and how viewport sizing affects LCP leadership:

| Page Type | Typical LCP Element | Why It Dominates |
|---|---|---|
| E-Commerce Product Page | Main product photograph (`<img>`) | Occupies the largest visual viewport surface area |
| Blog / Article Page | Post headline (`<h1>`) or hero graphic | Headline text block or top featured banner image |
| SaaS Landing Page | Hero graphic or video poster | Large visual above the primary call-to-action button |
| Marketing Splash | CSS `background-image` on container | Expands across full viewport width and height |

## Watch out

- Assuming the LCP element on desktop is the same on mobile; layout differences often change the winning node.
- Optimizing a secondary carousel slide that renders offscreen, leaving the true LCP element untouched.

## Remember

- Always inspect DevTools Performance panel or Lighthouse to confirm the exact active LCP element.
- The LCP element can differ significantly between mobile viewports and desktop resolutions.
- Only optimizations targeted directly at the winning LCP element will improve your LCP metric.
