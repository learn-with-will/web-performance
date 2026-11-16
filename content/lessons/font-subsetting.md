---
slug: font-subsetting
title: "Font Subsetting and Unicode-Range"
topic: media-and-fonts
kind: technique
summary: "Stripping unused glyphs and leveraging unicode-range to cut font file sizes by up to 80%."
tags: [fonts, subsetting, unicode-range, glyph-reduction]
related: [shipping-woff2, font-fallback-metric-overrides, preloading-critical-fonts]
---
> **In one line:** Strip unused glyphs with font subsetting and declare unicode-range to cut font payload sizes by up to 80%.

## The idea

A standard full-coverage commercial font often contains thousands of glyphs supporting multiple writing systems: Latin, Cyrillic, Greek, Hebrew, mathematical operators, and esoteric currency symbols. As a result, an un-subset font file can easily weigh 150 KB to 300 KB.

If your website is written in English or Spanish, your users will never need Cyrillic or Greek glyphs. Font subsetting is the process of stripping out unused glyph tables, keeping only the exact characters your audience reads. Subsetting an English font down to the Latin character set typically slashes file size from 200 KB to under 25 KB—an 85% byte reduction!

Tools like Python's `fonttools` (`pyftsubset`) or Glyphhanger automate subsetting.

In CSS, pair your subset fonts with the `unicode-range` descriptor. `unicode-range` informs the browser which Unicode code points the font file contains. The browser will only download the font file if text on the page actually contains characters within that defined range.

## See it

```bash
# Subsetting a TTF into a lean Latin-only WOFF2 font using pyftsubset
pyftsubset Inter.ttf \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" \
  --flavor=woff2 \
  --output-file=inter-latin.woff2
```

```css
/* CSS declaration matching the subsetted unicode-range */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153; /* Latin characters only */
}
```

> **Tip:** Use `unicode-range` to split languages into separate files; browsers only download subsets that match visible page text.

## Go deeper
Full international fonts contain thousands of unused glyphs that inflate file sizes over 100 KB. Subsetting strips out unused character sets, reducing typical WOFF2 font payloads down to 15–25 KB. Declaring `unicode-range` in CSS ensures browsers only download font subsets when visible text requires them.


Typical file size savings achieved through font subsetting:

| Font Variant | Full Character Set | Subsetting Strategy | Resulting WOFF2 Size | Byte Savings |
|---|---|---|---|---|
| Inter Regular | 2,548 glyphs | Full international font | ~110 KB | Baseline |
| Inter Regular | 218 glyphs | Latin Basic Subset | **18 KB** | **83% smaller** |
| Roboto Bold | 1,290 glyphs | Full Cyrillic + Latin | ~85 KB | Baseline |
| Roboto Bold | 165 glyphs | English Alphabet + Numerals | **12 KB** | **85% smaller** |

## Watch out

- Subsetting too aggressively and accidentally stripping essential punctuation, accents, or currency symbols ($/€/£).
- Forgetting to test fallback fonts when users input special characters outside the defined unicode-range.

## Remember

- Full fonts contain thousands of unused glyphs that bloat file sizes over 100 KB.
- Subsetting removes unused characters, reducing typical WOFF2 file sizes down to 15–25 KB.
- unicode-range allows browsers to fetch additional character subsets only when text on the page requires them.
