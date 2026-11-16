---
slug: segmenting-field-data
title: "Segmenting Field Data"
topic: monitoring-and-auditing
kind: technique
summary: "Slicing performance metrics by device hardware, network type, geography, and page template to find bottlenecks."
tags: [segmentation, analytics, rum, device-types]
related: [rum-with-web-vitals-library, debugging-with-attribution-data, optimizing-for-real-users]
---
> **In one line:** Segment field performance data by device type, connection quality, geography, and URL route to expose hidden failures.

## The idea

Looking at a single aggregate performance number across your entire application creates an illusion of uniformity. An aggregate LCP of 2.1 seconds might look passing on a dashboard, but segmentation might reveal that desktop users experience an instant 0.9s LCP, while 40% of your mobile users suffer through a grueling 4.5s LCP!

To make performance data actionable, you must segment field telemetry across four critical dimensions:

1. Device Form Factor: Segment by Mobile, Desktop, and Tablet. Mobile devices have vastly different CPU processing power and screen geometries.
2. Network Effective Type: Segment by connection quality using the Network Information API (`navigator.connection.effectiveType`: `4g`, `3g`, `2g`).
3. Geographic Region: Segment by country or continent to identify latency bottlenecks caused by distance from your origin server.
4. Page Route / Template: Group URLs by architectural template (e.g. `/product/:id`, `/category/:id`, `/blog/:slug`) rather than treating every unique URL as an isolated case.

## See it

```javascript
// Capturing rich demographic segmentation metadata alongside Core Web Vitals
import { onLCP } from 'web-vitals';

onLCP((metric) => {
  const segmentation = {
    metric: metric.name,
    value: metric.value,
    deviceMemory: navigator.deviceMemory || 'unknown', // RAM in GB
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown', // CPU cores
    connectionType: navigator.connection?.effectiveType || 'unknown',
    isSaveData: navigator.connection?.saveData || false,
    routeTemplate: getRouteTemplate(window.location.pathname)
  };

  navigator.sendBeacon('/api/rum/segmented', JSON.stringify(segmentation));
});
```

> **Tip:** Segment performance by route template and device type; global domain averages hide severe mobile bottlenecks.

## Go deeper

Common insights discovered through dimensional field segmentation:

| Segmentation Dimension | Diagnostic Discovery | Targeted Action |
|---|---|---|
| **Device Memory (< 4GB)** | Severe INP lag on low-RAM phones | Defer non-critical scripts; reduce DOM tree depth |
| **Geography (e.g. APAC)** | High TTFB despite fast backend | Add edge CDN PoPs in regional Asian centers |
| **Connection (3G vs 4G)** | Image LCP fails only on cellular | Serve smaller AVIF resolutions; tune `sizes` |
| **Route Template** | Only `/checkout` has high CLS | Fix unsized promotional banner in payment layout |

## Watch out

- Averaging mobile and desktop visits together, creating misleading numbers that fail to reflect mobile reality.
- Collecting dozens of segmentation dimensions without indexing them in your analytics database.

## Remember

- Aggregate performance metrics hide severe bottlenecks suffered by specific user segments.
- Segment field metrics by device form factor, network connection speed, geography, and page route.
- Analyzing route templates reveals whether performance problems are systemic or isolated to specific views.
