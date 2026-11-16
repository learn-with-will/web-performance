---
slug: shipping-woff2
title: "Shipping WOFF2 Fonts"
topic: media-and-fonts
kind: concept
summary: "Standardizing on WOFF2 with Brotli compression as the single universal web font format."
tags: [fonts, woff2, typography, compression]
related: [font-display-strategies, preloading-critical-fonts, font-subsetting]
---
> **In one line:** Standardize exclusively on WOFF2; modern browser support is universal and its built-in Brotli saves ~30% over WOFF.

## The idea

Historically, delivering custom web typography required declaring an exhaustive list of legacy font formats inside CSS `@font-face` rules: Embedded OpenType (EOT for IE), TrueType (TTF), SVG fonts, and WOFF.

Today, this entire complex legacy stack is obsolete. The Web Open Font Format 2.0 (WOFF2) is universally supported across 100% of modern web browsers.

WOFF2 applies custom Brotli compression directly to the underlying OpenType/TrueType font tables, achieving roughly 30% smaller file sizes than original WOFF files and up to 50% smaller than raw TTF or OTF fonts.

You can safely delete all legacy EOT, TTF, and SVG font declarations from your stylesheets. A modern `@font-face` declaration requires only a single `src` rule specifying `format('woff2')`. Dropping legacy font files simplifies build configurations, cuts repository bloat, and guarantees that every user downloads the most compressed font format available.

## See it

```css
/* Clean, modern @font-face rule shipping exclusively WOFF2 */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-regular.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153; /* Latin subset */
}
```

> **Note:** WOFF2 incorporates Brotli compression at the format level and is universally supported across all modern browsers.

## Go deeper
Standardizing exclusively on the WOFF2 format modernizes typography delivery. WOFF2 incorporates custom Brotli compression directly into font tables, saving roughly 30% in byte size compared to original WOFF files while enjoying universal support across 100% of modern web browsers, rendering legacy EOT and TTF formats obsolete.


Comparing font formats across compression algorithms and browser support:

| Font Format | Compression Used | File Size Efficiency | Modern Browser Support |
|---|---|---|---|
| **WOFF2** | Custom Brotli algorithm | **Highest (~30% smaller than WOFF)** | **Universal (100%)** |
| **WOFF** | Standard zlib / gzip | Moderate | Universal (Legacy fallback) |
| **TTF / OTF** | None (uncompressed binary) | Poor (huge payloads) | Deprecated for web |
| **EOT** | MicroType Express (LZ77) | Poor | Obsolete (IE only) |


Modern web browsers support WOFF2 natively, providing superior Brotli-based font compression without requiring legacy TTF, EOT, or WOFF format fallbacks. Removing legacy @font-face formats simplifies stylesheet maintenance and eliminates superfluous network asset definitions.

## Watch out

- Serving raw TTF or OTF files over the web, transferring hundreds of kilobytes of uncompressed font tables.
- Keeping legacy EOT and SVG font rules in stylesheets, adding clutter with zero real-world benefit.

## Remember

- WOFF2 is universally supported across all modern browsers; retire legacy EOT, TTF, and WOFF formats.
- WOFF2 features built-in Brotli compression, saving roughly 30% in byte size over WOFF.
- A single format('woff2') source declaration is all that is required for modern @font-face rules.
