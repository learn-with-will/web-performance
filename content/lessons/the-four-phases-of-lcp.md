---
slug: the-four-phases-of-lcp
title: "The Four Phases of LCP"
topic: optimizing-vitals
kind: concept
summary: "Breaking down LCP into TTFB, resource load delay, resource load duration, and element render delay."
tags: [lcp, phases, breakdown, diagnostics]
related: [identifying-the-lcp-element, prioritizing-the-lcp-resource, ttfb-and-first-byte]
---
> **In one line:** LCP is comprised of four phases: TTFB, Resource Load Delay, Resource Load Duration, and Element Render Delay.

## The idea

To optimize Largest Contentful Paint systematically, Google breaks the total LCP duration into four distinct sub-parts:

1. Time to First Byte (TTFB): The time elapsed from navigation start until the browser receives the first byte of HTML. Ideally represents ≤ 40% of total LCP budget (~0.8s).
2. Resource Load Delay: The delta between receiving the first byte of HTML and when the browser actually initiates the network request for the LCP resource. In an optimized page, this delay should be virtually zero (≤ 10%).
3. Resource Load Duration: The time required to download the LCP asset bytes across the wire. Directly governed by asset file size, compression format, and available bandwidth (≤ 40%).
4. Element Render Delay: The delta between when the LCP resource finishes downloading and when the browser actually renders and paints the element on screen (≤ 10%).

By categorizing where time is being lost, you can apply the exact engineering remedy: backend caching for TTFB, preloading for Load Delay, modern image compression for Load Duration, and unblocking the main thread for Render Delay.

## See it

```text
// The Four Phases of LCP Timeline
|--- TTFB ---|--- Load Delay ---|--- Load Duration ---|--- Render Delay ---|
[ Navigation ] -> [ HTML Byte ] -> [ Start Image Fetch ] -> [ Image Arrives ] -> [ LCP Paint ]
  Target:           Target:            Target:                  Target:
  < 800 ms          < 100 ms           < 1,000 ms               < 100 ms
```

> **Note:** The ideal budget breakdown for LCP: TTFB (~40%), Load Delay (<10%), Load Duration (~40%), Render Delay (<10%).

## Go deeper
Decomposing Largest Contentful Paint into its four constituent phases—TTFB, Resource Load Delay, Resource Load Duration, and Element Render Delay—allows teams to pinpoint the exact technical root cause of slow loading. Applying targeted fixes to each phase systematically drives overall LCP well under the 2.5-second Good threshold.


Root causes and engineering solutions for each of the four LCP sub-phases:

| LCP Sub-Phase | Primary Bottleneck | Targeted Engineering Fix |
|---|---|---|
| **TTFB** | Slow origin database queries or network latency | Deploy edge CDN caching and optimize backend queries |
| **Resource Load Delay** | Image discovered late in CSS or JS | Use `<link rel="preload">` and `fetchpriority="high"` |
| **Resource Load Duration** | Massive image file size or slow connection | Convert to AVIF/WebP, compress, use responsive `srcset` |
| **Element Render Delay** | Render-blocking CSS or main-thread JS lock | Inline critical CSS, remove blocking scripts |

## Watch out

- Spending weeks optimizing image compression (Load Duration) when TTFB alone is consuming 2.2 seconds.
- Preloading an image but leaving render-blocking CSS that delays the final paint (Render Delay).

## Remember

- LCP breaks down into TTFB, Resource Load Delay, Resource Load Duration, and Element Render Delay.
- Diagnosing the dominant phase pinpoints whether the fix requires backend, markup, or CSS optimization.
- Keep Resource Load Delay and Element Render Delay under 100ms through preloading and unblocking.
