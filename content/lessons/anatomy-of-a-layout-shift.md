---
slug: anatomy-of-a-layout-shift
title: "Anatomy of a Layout Shift"
topic: optimizing-vitals
kind: concept
summary: "How the browser calculates Cumulative Layout Shift using impact fraction and distance fraction."
tags: [cls, layout-shift, impact-fraction, distance-fraction]
related: [cumulative-layout-shift-metric, setting-explicit-image-dimensions, reserving-space-for-dynamic-content]
---
> **In one line:** A layout shift score equals the Impact Fraction multiplied by the Distance Fraction of the unstable element.

## The idea

To fix layout instability systematically, engineers must understand the underlying mathematics of how the Layout Instability API computes shift scores.

A layout shift occurs whenever a visible DOM element changes its starting position (top/left coordinates) from one rendered frame to the next without being triggered directly by user input. The layout shift score is calculated from two components:

$$\text{Layout Shift Score} = \text{Impact Fraction} \times \text{Distance Fraction}$$

The Impact Fraction measures how unstable elements impact the viewport area between two frames. It represents the union of the visible bounding boxes of the element before and after the shift, expressed as a fraction of total viewport height and width. For example, if an element occupying 50% of the viewport shifts downward by 25%, the union occupies 75% of the viewport (Impact Fraction = 0.75).

The Distance Fraction measures the maximum horizontal or vertical distance the unstable element moved, divided by the viewport's largest dimension. In this example, moving 25% produces a Distance Fraction of 0.25. The shift score is:
$$0.75 \times 0.25 = 0.1875$$
This single shift immediately exceeds the maximum 0.1 good threshold!

## See it

```javascript
// Inspecting layout shift impact and distance fractions in DevTools console
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log('Shift Value:', entry.value);
      for (const source of entry.sources) {
        console.log('Shifting Node:', source.node);
        console.log('Previous Rect:', source.previousRect);
        console.log('Current Rect:', source.currentRect);
      }
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

> **Note:** A single large visual shift can easily score over 0.1, immediately failing your entire site's CLS assessment.

## Go deeper

Mathematical calculation of layout shift score across sample shift scenarios:

| Scenario | Element Size | Distance Moved | Impact Fraction | Distance Fraction | Total Shift Score |
|---|---|---|---|---|---|
| Unsized Banner Inserted | 50% viewport | 20% viewport | 0.70 | 0.20 | **0.140 (Failing)** |
| Small Icon Shift | 5% viewport | 5% viewport | 0.10 | 0.05 | **0.005 (Passing)** |
| Text Paragraph Reflow | 30% viewport | 10% viewport | 0.40 | 0.10 | **0.040 (Passing)** |

## Watch out

- Assuming small shifts don't matter; multiple small shifts within a session window sum into a failing score.
- Ignoring layout shifts on mobile where narrow viewports magnify the relative distance fraction moved.

## Remember

- Layout shift score is the mathematical product of the Impact Fraction and the Distance Fraction.
- Impact fraction represents the combined viewport area affected by the movement before and after.
- Distance fraction measures the greatest distance the element moved relative to viewport dimensions.
