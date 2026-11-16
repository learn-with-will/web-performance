---
slug: font-fallback-metric-overrides
title: "Font Fallback Metric Overrides"
topic: media-and-fonts
kind: technique
summary: "Matching system fallback fonts to web fonts using size-adjust, ascent-override, and descent-override."
tags: [fonts, metric-overrides, size-adjust, cls]
related: [preventing-font-layout-shifts, font-display-strategies, shipping-woff2]
---
> **In one line:** Match fallback font geometry to custom web fonts using size-adjust and metric overrides to eliminate FOUT shifts.

## The idea

When using `font-display: swap`, text renders immediately using a local system fallback font (such as Arial or Georgia). When the custom web font arrives, the browser swaps out the fallback. Because Arial and your web font have different intrinsic glyph widths and baseline heights, this swap triggers an abrupt layout shift (FOUT), damaging your CLS score.

Modern CSS provides four font metric override descriptors within `@font-face` to solve this:
- `size-adjust`: Adjusts the glyph outline scaling factor (as a percentage), allowing you to shrink or expand the fallback font's character widths so words occupy the exact same horizontal space.
- `ascent-override`: Overrides the font's ascent height above the baseline.
- `descent-override`: Overrides the font's descent depth below the baseline.
- `line-gap-override`: Standardizes vertical line spacing.

By defining a dedicated local fallback `@font-face` with calculated override metrics, the system font visually mirrors the incoming web font's exact line boxes. When the web font swaps in, the text characters change shape, but the bounding boxes and line breaks do not move a single pixel!

## See it

```css
/* Adjusted system fallback font that matches the custom 'Poppins' geometry */
@font-face {
  font-family: 'Poppins-Fallback';
  src: local('Arial');
  size-adjust: 92%;           /* Compresses Arial horizontally to match Poppins width */
  ascent-override: 105%;      /* Aligns top line box height */
  descent-override: 35%;      /* Aligns bottom line box depth */
  line-gap-override: 0%;
}

h1.hero-title {
  /* When Poppins loads, it swaps smoothly over Poppins-Fallback with ZERO layout shift */
  font-family: 'Poppins', 'Poppins-Fallback', sans-serif;
}
```

> **Tip:** Free tools like Next.js font optimization or online font-style-matchers automatically compute exact override percentages.

## Go deeper

How metric overrides eliminate font-swap layout reflows:

| Layout Characteristic | Default System Fallback Swap | Override-Tuned Fallback Swap |
|---|---|---|
| Horizontal Word Width | Mismatched (causes lines to wrap) | **Exact match: identical line wraps** |
| Vertical Line Height | Differs by 3–8px per line | **Exact match: identical paragraph height** |
| Cumulative Layout Shift | Typically 0.05 – 0.15 (High) | **Reduced to 0.000 (Shift-free)** |
| User Visual Experience | Jarring text reflow jump | Smooth, subtle glyph transition |

## Watch out

- Declaring metric overrides inside the custom web font declaration rather than the local fallback definition.
- Testing overrides only on Mac (where Helvetica/San Francisco rules) while Windows users see untuned Arial.

## Remember

- Font metric overrides allow system fallback fonts to match the exact physical geometry of custom web fonts.
- size-adjust scales character widths to preserve exact word lengths and prevent line wraps.
- Combining font-display: swap with tuned metric overrides delivers instant text with zero layout shift.
