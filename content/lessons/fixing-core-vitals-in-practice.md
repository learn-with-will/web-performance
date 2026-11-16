---
slug: fixing-core-vitals-in-practice
title: "Fixing Core Vitals in Practice"
topic: monitoring-and-auditing
kind: technique
summary: "Hands-on remediation of LCP hero images, CLS dimension shifts, and INP main-thread yielding."
tags: [core-web-vitals, remediation, lcp-fix, cls-fix, inp-fix]
related: [the-audit-workflow-overview, prioritizing-the-lcp-resource, setting-explicit-image-dimensions]
---
> **In one line:** Fix Core Web Vitals in practice: optimize LCP hero images, reserve CLS layout space, and yield for INP.

## The idea

With the critical rendering path secured, the second phase of remediation tackles the three official Core Web Vitals directly: LCP, CLS, and INP.

Practical Remediation Playbook:

1. Fixing Largest Contentful Paint (LCP ≤ 2.5s):
   - Identify the LCP element (e.g. hero image).
   - Ensure the image is declared directly in initial HTML (not injected by JS or CSS).
   - Remove `loading="lazy"` and add `fetchpriority="high"` and `decoding="async"`.
   - Compress to modern AVIF/WebP formats and serve responsive sizes via `srcset`.

2. Fixing Cumulative Layout Shift (CLS ≤ 0.1):
   - Audit every `<img>`, `<video>`, and `<iframe>`; add explicit `width` and `height` attributes or CSS `aspect-ratio`.
   - Set `min-height` placeholders for dynamic ad slots, embeds, and cookie banners.
   - Use `font-display: optional` or CSS font metric overrides (`size-adjust`) to eliminate font reflows.

3. Fixing Interaction to Next Paint (INP ≤ 200ms):
   - Break up tasks exceeding 50ms using `scheduler.yield()` or `setTimeout`.
   - Provide immediate visual feedback in click handlers; defer heavy secondary calculations.
   - Keep the DOM tree lean (< 1,400 nodes) to prevent presentation delays.

## See it

```html
<!-- Production Best-Practice LCP Hero Image Implementation -->
<link rel="preload"
      as="image"
      href="/images/hero-800.avif"
      imagesrcset="/images/hero-400.avif 400w, /images/hero-800.avif 800w, /images/hero-1200.avif 1200w"
      imagesizes="(max-width: 768px) 100vw, 800px"
      fetchpriority="high">

<img src="/images/hero-800.avif"
     srcset="/images/hero-400.avif 400w, /images/hero-800.avif 800w, /images/hero-1200.avif 1200w"
     sizes="(max-width: 768px) 100vw, 800px"
     alt="Primary product showcase"
     width="800"
     height="500"
     fetchpriority="high"
     decoding="async">
```

> **Tip:** The triad of Core Web Vitals fixes: `fetchpriority="high"` for LCP, explicit dimensions for CLS, and yielding for INP.

## Go deeper

Core Web Vitals remediation cheatsheet for production engineers:

| Core Web Vital | High-ROI Practical Fix #1 | High-ROI Practical Fix #2 | High-ROI Practical Fix #3 |
|---|---|---|---|
| **LCP** | Add `fetchpriority="high"` | Convert image to AVIF/WebP | Preload with `<link rel="preload">` |
| **CLS** | Set `width` and `height` on all `<img>` | Pre-allocate ad containers with `min-height` | Use `font-display: optional` |
| **INP** | Chunk long tasks with `scheduler.yield()` | Provide instant visual feedback in handlers | Virtualize huge DOM lists |

## Watch out

- Applying fetchpriority="high" to more than one image; it dilutes network scheduling benefits.
- Fixing CLS on desktop without testing mobile responsive breakpoints where different shifting elements appear.

## Remember

- Accelerate LCP by prioritizing hero images with fetchpriority=high and modern AVIF compression.
- Eliminate CLS by setting explicit dimensions on all media and reserving space for dynamic content.
- Tame INP by breaking long tasks with scheduler.yield() and minimizing event handler processing time.
