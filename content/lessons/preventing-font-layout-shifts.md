---
slug: preventing-font-layout-shifts
title: "Preventing Font Layout Shifts"
topic: optimizing-vitals
kind: technique
summary: "Eliminating font-swap layout shifts using font-display: optional and CSS font metric override descriptors."
tags: [fonts, cls, metric-overrides, font-display]
related: [font-display-strategies, font-fallback-metric-overrides, anatomy-of-a-layout-shift]
---
> **In one line:** Prevent font-swap layout shifts using font-display: optional or metric override descriptors (size-adjust).

## The idea

When a web font loads with `font-display: swap`, the browser renders text immediately using a fallback system font (such as Arial or Times New Roman). When the custom web font file finishes downloading, the browser swaps out the system font and redraws the text.

While this eliminates invisible text, it introduces a significant risk of layout shifts. Different typefaces have different character widths, x-heights, and vertical metrics. If the custom web font is wider than the fallback font, paragraphs expand, causing headlines to wrap onto new lines and pushing all downstream content downward.

Two modern techniques eliminate font-swap layout shifts entirely:
1. `font-display: optional`: If the web font is not available within a tiny initial window (~100ms), the browser permanently commits to the fallback font for the current page view, preventing any subsequent layout shift.
2. CSS Font Metric Overrides: Using `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` on the fallback `@font-face` declaration to stretch or shrink the system fallback font so it matches the custom web font's exact physical footprint.

## See it

```css
/* Overriding system font metrics to match the custom web font's exact footprint */
@font-face {
  font-family: 'FallbackArial';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 105%; /* Matches Inter's character width to prevent text reflow */
}

body {
  font-family: 'Inter', 'FallbackArial', sans-serif;
}
```

> **Tip:** Use `size-adjust` and `ascent-override` on fallback fonts to eliminate layout shift when web fonts swap.

## Go deeper
Font swaps induce layout shifts when the glyph dimensions of fallback system fonts mismatch the custom web font. Using CSS font metric overrides (`size-adjust`, `ascent-override`, `descent-override`) scales the fallback font horizontally and vertically, ensuring that line boxes remain identical before and after the font swaps in.


CSS `@font-face` metric override descriptors:

| Descriptor | What It Controls | How It Eliminates Layout Shift |
|---|---|---|
| `size-adjust` | Scale factor applied to glyph outlines | Equalizes character width and tracking |
| `ascent-override` | Height above the baseline | Matches baseline spacing to prevent line-height jumps |
| `descent-override` | Depth below the baseline | Aligns bottom bounds of text boxes |
| `line-gap-override` | Recommended line gap between rows | Standardizes paragraph line spacing |

## Watch out

- Using font-display: swap on dense multi-column layouts without tuning fallback font metrics.
- Applying metric overrides to the custom web font instead of the fallback @font-face definition.

## Remember

- Font swaps cause layout shifts when custom fonts have different glyph dimensions than fallbacks.
- font-display: optional prevents layout shifts by sticking with the fallback if the font is slow.
- Use size-adjust and metric overrides on fallback fonts to mirror custom font typography footprints.
