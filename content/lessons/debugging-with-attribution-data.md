---
slug: debugging-with-attribution-data
title: "Debugging with Attribution Data"
topic: monitoring-and-auditing
kind: technique
summary: "Pinpointing root causes using the web-vitals attribution build to inspect target elements and interaction IDs."
tags: [attribution, web-vitals, debugging, root-cause]
related: [rum-with-web-vitals-library, identifying-the-lcp-element, anatomy-of-an-interaction]
---
> **In one line:** Use the web-vitals attribution build to capture the exact DOM selector, interaction target, and timing phases.

## The idea

Knowing that your website's 75th-percentile INP is 420 milliseconds tells you that users are experiencing laggy interactions, but it does not tell you *which* button is lagging or *why*.

To bridge the gap between knowing *that* a metric failed and understanding *how* to fix it, Google provides the Attribution Build of the `web-vitals` library (`web-vitals/attribution`).

When you import from the attribution entrypoint, each metric callback object includes an `attribution` property containing detailed diagnostic forensics:
- For LCP: Reports the exact DOM selector of the LCP element (`element`), the image URL (`url`), and a precise breakdown of the four LCP sub-phases (TTFB, load delay, load duration, render delay).
- For INP: Reports the exact HTML element that was clicked or tapped (`interactionTarget`), the event type (`interactionType`), the interaction ID, and the duration of Input Delay, Processing Duration, and Presentation Delay.
- For CLS: Reports the largest shifting element's DOM selector (`largestShiftTarget`) and shift value.

## See it

```javascript
// Using the web-vitals Attribution build to pinpoint root causes in production
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';

onLCP((metric) => {
  console.log('LCP Element:', metric.attribution.element);
  console.log('LCP Phase TTFB:', metric.attribution.timeToFirstByte);
  console.log('LCP Load Delay:', metric.attribution.resourceLoadDelay);
  console.log('LCP Load Time:', metric.attribution.resourceLoadDuration);
});

onINP((metric) => {
  console.log('Laggy Element:', metric.attribution.interactionTarget);
  console.log('Event Type:', metric.attribution.interactionType);
  console.log('Input Delay:', metric.attribution.inputDelay);
  console.log('Processing Time:', metric.attribution.processingDuration);
  console.log('Presentation Delay:', metric.attribution.presentationDelay);
});
```

> **Tip:** The attribution build reveals the exact button and timing phase responsible for high INP in production.

## Go deeper

Forensic data provided by the `web-vitals/attribution` build:

| Metric | Attribution Field | What It Reveals |
|---|---|---|
| **LCP** | `element` / `url` | Exact DOM selector and image file winning the LCP election |
| **LCP** | `timeToFirstByte` / `resourceLoadDelay` | Sub-timing values pin down which phase took the longest |
| **INP** | `interactionTarget` | Exact CSS selector of the button or input clicked |
| **INP** | `inputDelay` / `presentationDelay` | Pinpoints whether lag was main-thread wait or render delay |
| **CLS** | `largestShiftTarget` | Exact CSS selector of the element that moved and caused shift |

## Watch out

- Sending full raw DOM element nodes to analytics backends; serialize to CSS selector strings instead.
- Relying on local manual testing to identify slow buttons instead of inspecting real-user attribution data.

## Remember

- The web-vitals attribution build attaches actionable diagnostic forensics to every metric report.
- LCP attribution breaks down exact element selectors, image URLs, and the four LCP sub-phases.
- INP attribution exposes the exact clicked element, interaction type, and input/processing delays.
