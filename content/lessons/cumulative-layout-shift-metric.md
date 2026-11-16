---
slug: cumulative-layout-shift-metric
title: "Cumulative Layout Shift (CLS)"
topic: core-web-vitals
kind: concept
summary: "CLS measures unexpected visual layout jumps using session windows, targeting a score ≤ 0.1."
tags: [cls, core-web-vitals, layout-shift, stability]
related: [core-web-vitals-overview, anatomy-of-a-layout-shift, setting-explicit-image-dimensions]
---
> **In one line:** CLS measures unexpected visual shifts of visible elements during a page visit, targeting a score ≤ 0.1.

## The idea

Cumulative Layout Shift (CLS) is the Core Web Vital that quantifies visual stability. It measures unexpected movement of visible elements as they shift positions across the viewport during page loading and interaction.

Unexpected layout shifts are deeply frustrating for users. A reader might be halfway through an article when an unsized banner loads above the fold, throwing the text down several paragraphs. Worse, a user might intend to click a "Cancel" button, only for a dynamically injected element to shift the buttons downwards so they click "Submit Payment" instead.

CLS is calculated by multiplying two fractions for each shifting element: the Impact Fraction (the percentage of the viewport area affected by the movement) and the Distance Fraction (the greatest distance the element moved relative to the viewport).

To avoid penalizing long-lived sessions, CLS groups shifts into "session windows" (maximum window duration of 5 seconds, separated by at least 1 second of quiet time). The reported CLS score is the maximum sum of layout shifts within any single session window. Crucially, shifts occurring within 500 milliseconds of user input (`hadRecentInput`) are excluded. The passing target is 0.1 or lower.

## See it

```javascript
// Tracking layout shifts and excluding expected user-initiated shifts
let clsScore = 0;
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Only count unexpected shifts (not within 500ms of user input)
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
      console.log('Unexpected layout shift:', entry.value, 'Total CLS:', clsScore);
    }
  }
});
observer.observe({ type: 'layout-shift', buffered: true });
```

> **Tip:** Layout shifts occurring within 500ms of user input set `hadRecentInput: true` and are excluded from CLS.

## Go deeper

How the mathematical formula for Cumulative Layout Shift computes shift severity:

| Factor | Definition | Calculation |
|---|---|---|
| **Impact Fraction** | Union of visible areas before and after shift | Percentage of viewport area occupied |
| **Distance Fraction** | Greatest horizontal or vertical distance moved | Pixels moved ÷ Viewport dimension |
| **Shift Score** | Mathematical product of both fractions | `Impact Fraction × Distance Fraction` |
| **Session Window** | Continuous window of shifts | Max 5s window with 1s gap between shifts |

## Watch out

- Inserting banners, ads, or cookie notices above existing content without pre-allocating layout space.
- Using CSS transitions on properties like top or margin that trigger layout recalculations instead of transform.

## Remember

- CLS measures unexpected visual layout jumps of visible content within the viewport.
- The official passing threshold for CLS is a score of 0.1 or lower at the 75th percentile.
- Shifts occurring within 500ms of a user interaction are designated as expected and excluded.
