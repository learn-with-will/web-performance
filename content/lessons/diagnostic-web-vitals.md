---
slug: diagnostic-web-vitals
title: "Diagnostic Web Vitals"
topic: core-web-vitals
kind: concept
summary: "Diagnostic metrics like FCP, TTFB, Speed Index, and TBT serve as critical stepping stones to CWV success."
tags: [fcp, ttfb, tbt, speed-index, diagnostics]
related: [core-web-vitals-overview, ttfb-and-first-byte, identifying-long-tasks]
---
> **In one line:** FCP, TTFB, Speed Index, and TBT are diagnostic Web Vitals that pinpoint root causes behind Core Web Vitals failures.

## The idea

While LCP, INP, and CLS are the only three official Core Web Vitals, they do not tell the whole story. A failing LCP or poor INP score tells you that a problem exists, but does not explain *why* it failed. Google defines a complementary suite of diagnostic Web Vitals and lab metrics to guide remediation.

First Contentful Paint (FCP) measures the exact point when the browser paints the first piece of text, image, or non-white canvas. If FCP is slow (> 1.8s), LCP is virtually guaranteed to be slow as well. Time to First Byte (TTFB) measures backend and network delivery speed; a slow TTFB pushes back FCP, LCP, and script discovery.

In the lab, Total Blocking Time (TBT) measures the total amount of time between FCP and Time to Interactive where the main thread was blocked by tasks exceeding 50ms. TBT serves as the primary synthetic lab proxy for the field-only INP metric. Speed Index measures how quickly visual content fills the screen during page load. Mastering these diagnostic indicators allows you to systematically resolve Core Web Vitals issues.

## See it

```html
<!-- Measuring First Contentful Paint (FCP) using PerformanceObserver -->
<script>
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
      console.log('FCP:', Math.round(entry.startTime), 'ms');
    }
  }).observe({ type: 'paint', buffered: true });
</script>
```

> **Note:** FCP and TTFB are diagnostic vitals; TBT and Speed Index are lab metrics that proxy field responsiveness and visual fill.

## Go deeper
Diagnostic Web Vitals provide essential context when triaging Core Web Vitals regressions. If field LCP is failing, inspecting First Contentful Paint (FCP) and Time to First Byte (TTFB) immediately indicates whether the bottleneck is network transport, server processing, or render-blocking assets. Diagnostic metrics serve as the roadmap for technical remediation.


The distinction between official Core Web Vitals and diagnostic supporting metrics:

| Metric | Category | Purpose | Good Threshold |
|---|---|---|---|
| **LCP** | Core Web Vital (Field) | Perceived loading speed | ≤ 2.5 s |
| **INP** | Core Web Vital (Field) | Interactive responsiveness | ≤ 200 ms |
| **CLS** | Core Web Vital (Field) | Visual stability | ≤ 0.1 |
| **FCP** | Diagnostic Vital | Initial visual response milestone | ≤ 1.8 s |
| **TTFB** | Diagnostic Vital | Network & server latency | ≤ 0.8 s |
| **TBT** | Lab Proxy Metric | Synthetic proxy for INP | ≤ 200 ms |

## Watch out

- Treating Total Blocking Time (TBT) as a Core Web Vital; TBT is purely a synthetic lab diagnostic.
- Optimizing FCP in isolation without verifying whether the actual LCP content element renders promptly.

## Remember

- FCP and TTFB are vital diagnostic metrics that directly dictate whether LCP can succeed.
- Total Blocking Time (TBT) is the synthetic lab proxy for Interaction to Next Paint (INP).
- Core Web Vitals determine compliance; diagnostic vitals explain where bottlenecks originate.
