---
slug: field-data-and-rum
title: "Field Data and RUM"
topic: measurement-and-tooling
kind: concept
summary: "Real User Monitoring (RUM) and CrUX capture actual performance experienced by real users in the field."
tags: [field-data, rum, crux, analytics]
related: [lab-data-characteristics, why-lab-and-field-differ, pagespeed-insights-analysis]
---
> **In one line:** Field data captures the actual performance real users experience across diverse devices, networks, and viewports.

## The idea

Field data—also known as Real User Monitoring (RUM)—measures the actual performance experienced by real human beings visiting your website in the real world. Every time a user opens a page on your site, telemetry scripts capture precise performance timings from the browser's Performance APIs and send them back to an analytics backend.

The Chrome User Experience Report (CrUX) is Google's public dataset of real-user field data. CrUX collects anonymized Core Web Vitals measurements from millions of consenting Chrome users across millions of websites. This dataset directly powers Google Search's Page Experience ranking evaluation and PageSpeed Insights reports.

Field data reflects reality: it encompasses users on ten-year-old budget smartphones, commuters traveling through cellular dead zones on trains, users with dozens of background tabs open, and users running resource-heavy browser extensions. Because field data reflects actual user journeys across diverse viewports and geographic regions, it is the ultimate measure of true performance health.

## See it

```javascript
// Emitting real user monitoring (RUM) field data via navigator.sendBeacon
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendRUMBeacon(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    url: window.location.href,
    userAgent: navigator.userAgent
  });
  navigator.sendBeacon('/analytics/rum', body);
}

onLCP(sendRUMBeacon);
onINP(sendRUMBeacon);
onCLS(sendRUMBeacon);
```

> **Note:** CrUX aggregates field data across a 28-day rolling window; code changes deployed today take time to shift CrUX scores.

## Go deeper

Comparing Real User Monitoring (Field) and Synthetic Testing (Lab):

| Dimension | Field Data (RUM / CrUX) | Lab Data (Lighthouse / DevTools) |
|---|---|---|
| Source | Actual human visits | Automated synthetic runners |
| Device Diversity | Thousands of physical hardware models | Single configured test device profile |
| Metric Types | Real LCP, real INP, real CLS | FCP, LCP, TBT, Speed Index, CLS |
| Deployment Timing | Aggregates historical visits (e.g. 28 days) | Instantaneous feedback on unreleased code |

## Watch out

- Expecting CrUX field data to update immediately after deploying a performance fix; it aggregates over 28 days.
- Discarding low-volume field anomalies that indicate critical bugs on specific mobile browser versions.

## Remember

- Field data reflects what real users actually experience across diverse hardware, networks, and browsers.
- The Chrome User Experience Report (CrUX) provides real-world field metrics that power search ranking.
- RUM tracks actual user interactions and captures full-session INP values that lab tests cannot see.
