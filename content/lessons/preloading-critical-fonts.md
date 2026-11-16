---
slug: preloading-critical-fonts
title: "Preloading Critical Fonts"
topic: media-and-fonts
kind: technique
summary: "Preloading critical WOFF2 font files in HTML with the mandatory crossorigin attribute."
tags: [fonts, preload, crossorigin, critical-assets]
related: [shipping-woff2, font-display-strategies, preloading-critical-assets]
---
> **In one line:** Preload the critical body font in HTML <head> using link rel=preload, as=font, and the mandatory crossorigin attribute.

## The idea

In standard web loading, web fonts suffer from late discovery. A browser will not initiate a request for a web font when it parses the `@font-face` CSS rule. Instead, it waits until the DOM and CSSOM are merged into the Render Tree and it proves that a specific text node actually uses that font family and weight.

This means font downloads typically begin several hundred milliseconds late in the waterfall.

To eliminate this discovery delay, you can preload your primary critical font directly in the HTML `<head>` using `<link rel="preload">`. This instructs the preload scanner to fetch the WOFF2 file immediately in parallel with your CSS.

Crucially: you must always include the `crossorigin` attribute on font preloads, even if the font is hosted on the exact same origin! The web font specification requires browsers to fetch fonts anonymously via CORS. If you omit `crossorigin`, the browser will fetch the font twice: once for the preload (without credentials), and once again for the CSS usage (with CORS credentials), doubling network bandwidth!

## See it

```html
<!-- CORRECT: Preloading critical WOFF2 font with mandatory crossorigin attribute -->
<link rel="preload"
      href="/fonts/inter-bold.woff2"
      as="font"
      type="font/woff2"
      crossorigin>

<!-- In CSS: Matching @font-face definition -->
<style>
  @font-face {
    font-family: 'Inter';
    font-weight: 700;
    src: url('/fonts/inter-bold.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

> **Watch out:** Always include `crossorigin` when preloading fonts; omitting it causes the browser to download the font twice.

## Go deeper

Auditing font preloading rules and network requirements:

| Preload Attribute | Required Value | What Happens If Omitted or Misconfigured |
|---|---|---|
| `rel` | `"preload"` | Browser will not prioritize early download |
| `as` | `"font"` | Browser cannot assign font prioritization heuristics |
| `type` | `"font/woff2"` | Non-supporting browsers cannot skip the preload |
| `crossorigin` | **`""` or `"anonymous"`** | **Browser downloads font twice (double bandwidth!)** |

## Watch out

- Preloading every font weight and italic variant; only preload the 1 or 2 critical fonts needed above the fold.
- Preloading fonts that are not used on the initial screen, stealing bandwidth from critical stylesheets.

## Remember

- Preload above-the-fold fonts in HTML to eliminate late CSS render-tree discovery delays.
- The crossorigin attribute is strictly mandatory on font preloads to prevent double downloads.
- Limit preloading to the single critical headline or body font to prevent bandwidth contention.
