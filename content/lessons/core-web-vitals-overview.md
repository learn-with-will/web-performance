---
slug: core-web-vitals-overview
title: "Core Web Vitals Overview"
topic: core-web-vitals
kind: concept
summary: "Google's user-centric metrics for loading, interactivity, and stability assessed at the 75th percentile."
tags: [core-web-vitals, metrics, cwv, thresholds]
related: [largest-contentful-paint-metric, interaction-to-next-paint-metric, cumulative-layout-shift-metric]
---
> **In one line:** The three Core Web Vitals measure loading (LCP), responsiveness (INP), and visual stability (CLS) at the 75th percentile.

## The idea

The Core Web Vitals are a curated set of three standardized, user-centric metrics defined by Google to quantify essential facets of real-world web user experience: loading performance, interactive responsiveness, and visual stability.

The three current Core Web Vitals are:
1. Largest Contentful Paint (LCP): Quantifies perceived loading speed by recording when the main content of a page is likely visible.
2. Interaction to Next Paint (INP): Quantifies page responsiveness by assessing the latency of every click, tap, and keypress interaction throughout the visit.
3. Cumulative Layout Shift (CLS): Quantifies visual stability by measuring unexpected layout jumps that disrupt reading or cause accidental clicks.

To reflect real user experience accurately, Google evaluates sites at the 75th percentile (p75) of real-world visits over a rolling 28-day window, segmented by mobile and desktop devices. Achieving a "Good" rating requires that at least 75% of page loads meet the strict threshold across all three vitals.

## See it

```javascript
// Capturing Core Web Vitals using the official web-vitals JavaScript library
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(`${metric.name}: ${metric.value} (Rating: ${metric.rating})`);
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

> **Note:** The Core Web Vitals are assessed strictly at the 75th percentile of real-world visits, split between mobile and desktop devices.

## Go deeper
Google's Core Web Vitals represent a paradigm shift in performance engineering: shifting focus away from technical server-side milestones toward actual user-perceived milestones. By evaluating real-world field metrics at the 75th percentile across mobile and desktop devices, the vitals ensure that optimizations translate directly into improved customer satisfaction and retention.


The exact official thresholds and assessment criteria for the Core Web Vitals:

| Metric | Measures | Good (Passing) | Needs Improvement | Poor |
|---|---|---|---|---|
| **LCP** | Perceived Loading | **≤ 2.5 s** | 2.5 s – 4.0 s | > 4.0 s |
| **INP** | Interactive Responsiveness | **≤ 200 ms** | 200 ms – 500 ms | > 500 ms |
| **CLS** | Visual Stability | **≤ 0.1** | 0.1 – 0.25 | > 0.25 (unitless) |


Core Web Vitals represent user-centric quality signals that reflect real-world user experiences across mobile and desktop devices. Monitoring 75th percentile measurements across varied networks and device tiers ensures that optimization efforts meaningfully benefit the majority of your actual audience.

## Watch out

- Quoting First Input Delay (FID) as a Core Web Vital; FID was permanently retired in favor of INP on March 12, 2024.
- Assuming a good score on desktop guarantees passing field thresholds on mobile devices.

## Remember

- The three Core Web Vitals are Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift.
- Metrics are evaluated at the 75th percentile of real user visits from field data (CrUX).
- Good thresholds: LCP ≤ 2.5s, INP ≤ 200ms, and CLS ≤ 0.1.
