---
slug: interaction-to-next-paint-metric
title: "Interaction to Next Paint (INP)"
topic: core-web-vitals
kind: concept
summary: "INP measures runtime responsiveness by observing all clicks, taps, and keypresses across the page visit."
tags: [inp, core-web-vitals, responsiveness, interactivity]
related: [core-web-vitals-overview, anatomy-of-an-interaction, reducing-input-delay]
---
> **In one line:** INP measures page responsiveness across all qualifying interactions throughout a visit, targeting ≤ 200ms.

## The idea

Interaction to Next Paint (INP) is the Core Web Vital that quantifies the overall interactive responsiveness of a page throughout its entire lifespan—from initial load until the user closes the tab. On March 12, 2024, INP officially replaced the legacy First Input Delay (FID) metric.

While FID only measured the input delay of the very first user interaction, INP observes all qualifying interactions that occur during the visit. Qualifying interactions include mouse clicks, touchscreen taps, and keyboard presses. Continuous gestures like scrolling and hovering do not count toward INP directly, although scrolling during an active interaction can compound delay.

For each interaction, INP measures the total elapsed latency from the moment the user initiates the action until the browser paints the next visible frame showing updated feedback. The page's reported INP value is typically the single worst interaction latency observed (or a high percentile for pages with exceptionally high interaction volumes). The target threshold for a "Good" rating is 200 milliseconds or less.

## See it

```javascript
// Observing interaction latency using the Event Timing API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.interactionId) {
      console.log(`Interaction ${entry.name}: ${Math.round(entry.duration)}ms`);
    }
  }
});
observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
```

> **Note:** INP replaced FID as an official Core Web Vital on March 12, 2024; FID is permanently retired.

## Go deeper
Interaction to Next Paint evaluates responsiveness across the entire lifespan of a page visit. While First Input Delay only measured the initial click, INP assesses all clicks, taps, and keypresses. An e-commerce page that loads fast but freezes when adding an item to the shopping cart will fail INP, directly highlighting the necessity of keeping the main thread responsive throughout user sessions.


The three cumulative components that constitute total INP interaction latency:

| Interaction Phase | What Transpires | Common Bottleneck |
|---|---|---|
| **Input Delay** | Time waiting for main thread to become idle | Long tasks running from earlier scripts |
| **Processing Duration** | Time spent executing event listener callbacks | Heavy synchronous calculations or filtering |
| **Presentation Delay** | Time spent recalculating layout, painting frame | Complex DOM updates and large render trees |

## Watch out

- Believing FID still measures responsiveness; FID only tracked input delay on the first click and is now deprecated.
- Assuming hover states and page scrolling count toward INP; only clicks, taps, and keyboard inputs qualify.

## Remember

- INP evaluates all qualifying clicks, taps, and keypresses across the full duration of a visit.
- The good threshold for INP is 200 milliseconds or less at the 75th percentile.
- Total latency equals Input Delay + Processing Duration + Presentation Delay.
