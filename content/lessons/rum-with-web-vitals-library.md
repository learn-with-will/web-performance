---
slug: rum-with-web-vitals-library
title: "RUM with the web-vitals Library"
topic: monitoring-and-auditing
kind: technique
summary: "Capturing real-user LCP, INP, and CLS in production using Google's official web-vitals JavaScript library."
tags: [web-vitals, rum, telemetry, analytics]
related: [field-data-and-rum, chrome-ux-report-crux, debugging-with-attribution-data]
---
> **In one line:** Use Google's official web-vitals JavaScript library to capture real-user LCP, INP, and CLS in production.

## The idea

While Google's CrUX dataset provides high-level 28-day rolling field data, it does not provide real-time debugging telemetry or custom user segmentation. To monitor field performance live, teams deploy Real User Monitoring (RUM) using Google's official `web-vitals` JavaScript library.

The `web-vitals` library is a tiny (< 2 KB), zero-dependency library that encapsulates all the nuances, edge cases, and browser quirks of the underlying Performance APIs (including PerformanceObserver, Layout Instability, and Event Timing).

It provides standardized methods for observing every Core Web Vital:
- `onLCP(callback)`: Fires when the final LCP element is identified.
- `onINP(callback)`: Observes all user interactions throughout the session and reports the definitive INP latency.
- `onCLS(callback)`: Calculates the maximum session window shift score across the full page visit.

Captured metrics should be beaconed back to your analytics endpoint using `navigator.sendBeacon()`, ensuring data transfers reliably even as the user closes the tab or navigates away.

## See it

```javascript
// Integrating the official web-vitals library for production RUM telemetry
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const payload = JSON.stringify({
    name: metric.name,
    value: Math.round(metric.value * 100) / 100,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: Math.round(metric.delta * 100) / 100,
    id: metric.id,
    page: window.location.pathname
  });

  // navigator.sendBeacon guarantees transmission even during page unload
  navigator.sendBeacon('/api/telemetry/vitals', payload);
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

> **Tip:** Use `navigator.sendBeacon` to transmit telemetry reliably during page unloading without delaying navigation.

## Go deeper

Key attributes reported by the `web-vitals` metric payload object:

| Metric Object Property | Data Type | Meaning |
|---|---|---|
| `name` | String | The metric identifier (`'LCP'`, `'INP'`, `'CLS'`, `'FCP'`, `'TTFB'`) |
| `value` | Number | Current measured value in milliseconds (or unitless for CLS) |
| `rating` | String | Qualitative threshold rating: `'good'`, `'needs-improvement'`, or `'poor'` |
| `delta` | Number | The incremental change since the last reported callback |
| `id` | String | Unique random ID representing the metric instance on this page load |

## Watch out

- Using synchronous XMLHttpRequest to send telemetry on page unload, which freezes the browser and hurts INP.
- Reporting LCP prematurely before the page has finished loading or before user interaction occurs.

## Remember

- Google's official web-vitals library provides standard, production-ready measurement for all Web Vitals.
- The library abstracts complex PerformanceObserver quirks into clean onLCP, onINP, and onCLS hooks.
- Transmit telemetry data using navigator.sendBeacon to ensure delivery without blocking navigation.
