---
slug: critical-path-metrics
title: "Critical Path Metrics"
topic: rendering-path
kind: technique
summary: "Measuring critical path length, critical bytes, and critical resources to optimize initial paint time."
tags: [critical-path, metrics, optimization, fcp]
related: [render-tree-layout-paint, identifying-render-blockers, inlining-critical-css]
---
> **In one line:** Optimize the Critical Rendering Path by reducing the number of critical resources, critical bytes, and round-trip length.

## The idea

The Critical Rendering Path (CRP) encompasses the entire chain of network events and browser processing steps that must complete before the browser can perform its very first visual paint (First Contentful Paint).

To optimize this path effectively, engineers evaluate three fundamental dimensions:
1. Critical Resources: The count of resources (HTML document, external stylesheets, synchronous scripts) that can block the initial rendering of the page.
2. Critical Bytes: The total transfer payload size across all critical resources that must travel across the network before pixels appear.
3. Critical Path Length: The minimum number of sequential network Round-Trip Times (RTTs) required to fetch all critical resources.

Because TCP connection ramp-up (slow start) restricts the amount of data transferred in the very first network round trip (typically ~14 KB), keeping total critical bytes under 14 KB allows the entire critical rendering path to resolve in a single round trip once the connection is established. Every additional critical dependency adds round trips and delays First Contentful Paint.

## See it

```html
<!-- Measuring First Contentful Paint (FCP) programmatically via PerformanceObserver -->
<script>
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntriesByName('first-contentful-paint')) {
      console.log('FCP elapsed time:', Math.round(entry.startTime), 'ms');
    }
  });
  observer.observe({ type: 'paint', buffered: true });
</script>
```

> **Tip:** Keep the initial HTML document and critical CSS combined under 14 KB to deliver the first paint within the initial TCP window.

## Go deeper
Tracking the Critical Rendering Path requires monitoring both the number of critical assets and the cumulative transfer payload. By inlining above-the-fold critical CSS, deferring non-critical scripts, and preloading critical web fonts, the critical path length can be reduced to a single network round trip, enabling First Contentful Paint to occur on the very first data packet.


How architectural changes improve the three core Critical Path dimensions:

| Architecture | Critical Resources | Critical Path Length | First Paint Impact |
|---|---|---|---|
| Unoptimized (3 sync CSS, 2 sync JS) | 6 resources | 3+ RTTs | High latency, long blank screen |
| Deferred Scripts (3 sync CSS, 2 defer JS) | 4 resources | 2 RTTs | Better, but CSS still blocks |
| Inlined Critical CSS + Defer Scripts | 1 resource (HTML) | **1 RTT** | **Optimal: paints on initial TCP packet** |

## Watch out

- Exceeding the ~14 KB initial TCP congestion window with bloated HTML or excessive inlined SVG data.
- Treating analytics trackers and non-critical widget scripts as critical blocking dependencies.

## Remember

- The Critical Rendering Path covers all resources and steps required before the initial screen paint.
- Minimize critical resources, critical bytes, and round-trip length to accelerate First Contentful Paint.
- Delivering critical HTML and CSS within the initial 14 KB TCP window enables single-RTT first paint.
