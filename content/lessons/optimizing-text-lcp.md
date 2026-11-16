---
slug: optimizing-text-lcp
title: "Optimizing Text LCP"
topic: optimizing-vitals
kind: technique
summary: "Accelerating text-based LCP elements by eliminating web font FOIT and using font-display swap or system fonts."
tags: [text-lcp, fonts, font-display, foit]
related: [identifying-the-lcp-element, the-four-phases-of-lcp, font-display-strategies]
---
> **In one line:** Optimize text-based LCP by using font-display: swap or optional and preloading critical web fonts to avoid invisible text.

## The idea

On many websites, the LCP element is not an image at all, but a prominent headline text block (such as an `<h1>` banner). While text bytes are lightweight, text LCP can suffer severe delays if the page relies on external web fonts.

By default, many browsers implement a 3-second "block period" when loading web fonts. If the font stylesheet or WOFF2 file is delayed, the browser renders invisible text—known as Flash of Invisible Text (FOIT). The text content has physically downloaded, but the browser refuses to paint visible glyphs until the font file arrives, causing LCP to stall.

To guarantee rapid text LCP:
1. Use `font-display: swap` or `font-display: optional`. `swap` forces the browser to render fallback system fonts immediately, swapping in the web font once loaded. `optional` is even better for LCP and CLS: if the font cannot be fetched within 100ms, the browser uses the system fallback and avoids layout shifts.
2. Preload the critical font file in HTML using `<link rel="preload" as="font" type="font/woff2" crossorigin>`.
3. Consider using modern system font stacks for content-heavy text.

## See it

```css
/* Ensuring text renders immediately using font-display: swap */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap; /* Immediately renders fallback system font */
}

h1.hero-title {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

> **Tip:** Pair `font-display: swap` with a preloaded WOFF2 font to eliminate Flash of Invisible Text (FOIT) on text LCP.

## Go deeper

How web font loading strategies affect Text LCP:

| Strategy | Text Visibility on Load | Text LCP Timing | Layout Shift Risk |
|---|---|---|---|
| Default / `font-display: block` | Invisible (FOIT up to 3s) | **Poor (delayed until font downloads)** | Low |
| `font-display: swap` | Immediate fallback font | **Fast (paints on initial layout)** | Moderate (FOUT shift) |
| `font-display: optional` | Immediate; skips font on slow net | **Fastest (zero delay)** | **Zero (no swap shift)** |
| System Font Stack | Immediate native font | **Instant (no network requests)** | **Zero** |

## Watch out

- Leaving web fonts without a font-display strategy, resulting in up to 3 seconds of invisible text during slow loads.
- Preloading five different font weights and styles, causing bandwidth contention with critical CSS.

## Remember

- Text LCP can be delayed by web font block periods that cause Flash of Invisible Text (FOIT).
- Use font-display: swap or optional to ensure text glyphs paint immediately using fallback fonts.
- Preload the single critical headline font weight using link rel=preload with the crossorigin attribute.
