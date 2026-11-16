---
slug: font-display-strategies
title: "Font-Display Strategies"
topic: media-and-fonts
kind: concept
summary: "Balancing font-display swap, optional, block, and fallback trade-offs to manage FOUT versus FOIT."
tags: [fonts, font-display, fout, foit]
related: [shipping-woff2, preloading-critical-fonts, font-fallback-metric-overrides]
---
> **In one line:** Choose font-display: swap to guarantee immediate text visibility, or font-display: optional for zero layout shift.

## The idea

When a web page references custom web fonts, the browser must decide what to show the user during the initial seconds while the font file is still downloading across the network. The CSS `font-display` descriptor gives you explicit control over this behavior.

A font download lifecycle consists of three periods:
1. Block Period: The browser hides text completely, waiting for the web font.
2. Swap Period: The browser renders text using a system fallback font, but swaps in the custom web font the moment it arrives.
3. Failure Period: The browser permanently gives up and uses the fallback font.

The four primary `font-display` values configure these periods differently:
- `font-display: swap`: Zero block period, infinite swap period. Text renders immediately using a system fallback font, then swaps. Prevents Flash of Invisible Text (FOIT), but can cause Flash of Unstyled Text (FOUT) and layout shifts.
- `font-display: optional`: Tiny block period (~100ms), zero swap period. If the font arrives within 100ms, it is used; otherwise, the system fallback is used permanently for the visit. Ideal for performance and zero layout shift.
- `font-display: block`: 3-second block period. Causes invisible text (FOIT); avoid for body content.

## See it

```css
/* Strategy 1: Guaranteed text visibility (best for readable articles and blogs) */
@font-face {
  font-family: 'Merriweather';
  src: url('/fonts/merriweather.woff2') format('woff2');
  font-display: swap; /* Immediate fallback; swaps when loaded */
}

/* Strategy 2: Maximum performance & zero layout shift (best for SaaS & apps) */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: optional; /* If slow, skips webfont on first visit, caches for second */
}
```

> **Tip:** `font-display: optional` is the gold standard for performance: it eliminates FOIT and completely prevents layout shift.

## Go deeper

Comparing `font-display` descriptor values and their user experience trade-offs:

| `font-display` Value | Block Period | Swap Period | User Experience | Performance Impact |
|---|---|---|---|---|
| **`block`** | Short (~3s) | Infinite | Blank text (FOIT) | **Bad for LCP (text invisible)** |
| **`swap`** | Zero (0s) | Infinite | Instant text (FOUT) | **Fast LCP; risk of CLS shift** |
| **`fallback`** | Tiny (~100ms) | Short (~3s) | Brief blank, brief swap | Balanced compromise |
| **`optional`** | Tiny (~100ms) | Zero (0s) | **No FOIT, no shift** | **Best for CLS and Core Web Vitals** |

## Watch out

- Leaving font-display undeclared, which defaults to block in many browsers, causing 3s of invisible text.
- Using font-display: swap without tuning fallback font metrics, causing noticeable layout jumps on font load.

## Remember

- font-display controls browser text visibility behavior while custom web fonts download.
- font-display: swap prevents invisible text by showing fallback fonts immediately, but risks layout shift.
- font-display: optional provides the best Core Web Vitals score by guaranteeing zero layout shift.
