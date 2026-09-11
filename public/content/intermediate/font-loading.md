---
id: lesson-13
slug: font-loading
title: "Font Loading Strategy"
level: intermediate
order: 13
duration: 19
tags:
  - fonts
  - font-display
  - woff2
  - preload
  - subsetting
summary: "Loading web fonts without blocking or shifting text — using WOFF2, choosing a font-display strategy, preloading critical fonts with crossorigin, subsetting to ship fewer glyphs, and matching fallback metrics to cut swap-driven layout shift."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Use **WOFF2** and understand why it's the format to ship.
- Choose a **`font-display`** value and explain **FOIT** vs **FOUT**.
- **Preload** a critical font correctly — including the required **`crossorigin`**.
- **Subset** fonts to ship only the glyphs you need.
- Reduce **font-swap layout shift** with metric overrides or a matched fallback.

# Why It Matters

Web fonts are a double performance risk: while a font downloads, text may be **invisible** or render in a
**fallback** that then **reflows** when the real font swaps in — hurting both the perceived speed of text
(and text LCP) and **CLS**. Fonts are also real bytes. A deliberate font strategy keeps text readable
immediately and stable, without shipping more than you need.

# Concept Explanation

### Ship WOFF2

**WOFF2** is the most compressed web font format and is supported everywhere modern. Use it as your primary
(you rarely need other formats anymore). Serve it with a long cache lifetime (Lesson 14).

### `font-display`: what to show while the font loads

The `@font-face` **`font-display`** descriptor controls the tradeoff between invisible text and reflow:

- **`block`** — hide text for a short "block period" (~3 s) waiting for the font (**FOIT**, flash of
  invisible text), then swap. Risky: users may see nothing.
- **`swap`** — show the **fallback immediately**, then swap to the web font when it loads (**FOUT**, flash of
  unstyled text). No invisible text, but the swap can cause a layout shift.
- **`fallback`** — a very short block, a short swap window, otherwise keep the fallback for the page load. A
  compromise.
- **`optional`** — short block; if the font isn't ready, keep the **fallback** for this load (fetch it for
  next time). **Best for CLS** — no swap shift — at the cost of maybe not using the web font on a slow first
  visit.

**FOIT** = flash of invisible text; **FOUT** = flash of fallback text. `swap` avoids invisible text;
`optional` avoids the shift.

### Preload the critical font — with `crossorigin`

Fonts are discovered late (the browser must parse CSS, build the CSSOM, and find which text needs them). For
the one or two fonts used in above-the-fold text, **preload** them:

```html
<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin />
```

The **`crossorigin`** attribute is **mandatory** here: fonts are always fetched in **anonymous CORS mode**, so
a preload without `crossorigin` doesn't match the real request and you get a **wasted, duplicated** download.

### Subset to ship fewer glyphs

A full font may contain thousands of glyphs for many languages. **Subsetting** ships only what you use — e.g.
the Latin range — via `unicode-range`, so the browser downloads a subset only when a character in that range
appears:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+0000-00FF; /* basic Latin + Latin-1 supplement */
}
```

### Cut swap-driven layout shift

When a fallback of different metrics swaps to the web font, text reflows (a CLS hit). Reduce it by **matching
the fallback's metrics** to the web font with `size-adjust`, `ascent-override`, `descent-override`, and
`line-gap-override` on a fallback `@font-face` — or by using `font-display: optional`.

### Self-host vs third-party, and system fonts

**Self-hosting** fonts avoids a separate origin's DNS + TLS and gives you caching control; if you use a font
host, at least **`preconnect`** to it. (As of writing, browsers no longer share the font cache across sites,
so third-party font CDNs lost their old "already cached elsewhere" advantage.) And remember the cheapest font
is **no download**: a **system font stack** costs zero bytes when the brand allows it.

# Key Terminology

- **WOFF2** — the compressed web font format to ship.
- **`@font-face`** — the CSS rule that declares a custom font.
- **`font-display`** — controls what shows while the font loads (block/swap/fallback/optional).
- **FOIT / FOUT** — flash of invisible text / flash of unstyled (fallback) text.
- **Subsetting** — shipping only the glyphs you need (via `unicode-range`).
- **`size-adjust`** — scales a fallback font's glyphs to match metrics and reduce swap shift.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| `font-display` | `swap` (no invisible text) | `optional` (no shift) | `swap` when the brand font matters; `optional` when CLS/stability matters most. |
| Delivery | Self-host WOFF2 | Third-party font CDN | Self-host to drop an origin and control caching; `preconnect` if you use a CDN. |
| Weights | Several static files | One variable font | A variable font can be efficient if you use many weights/styles. |
| Brand vs speed | Web font | System font stack | System stack ships zero bytes; use it where brand identity allows. |

# Worked Example

Declaring, subsetting, preloading, and stabilizing a font:

```html
<head>
  <!-- Preload the critical above-the-fold font. crossorigin is REQUIRED for fonts. -->
  <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin />
</head>
```

```css
/* The web font, Latin subset, shown with a fallback until it loads. */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin.woff2') format('woff2');
  font-weight: 400 700;              /* variable font weight range */
  font-display: swap;
  unicode-range: U+0000-00FF;
}

/* A metric-adjusted fallback so the swap from system font causes little/no reflow. */
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107%;                 /* tune so line lengths match 'Inter' */
  ascent-override: 90%;
}

body { font-family: 'Inter', 'Inter Fallback', system-ui, sans-serif; }
```

Text is readable immediately (fallback), the real font is fetched early (preload), only Latin glyphs ship
(subset), and the swap barely moves the layout (matched metrics).

# Real World Analogy

A web font is a **special typeface arriving by courier**. While it's in transit you must decide what the sign
in your shop window says. **`block`/FOIT**: leave the sign **blank** until it arrives — clean but the window
is empty and confusing. **`swap`/FOUT**: put up a **temporary sign** now and replace it when the courier
arrives — always readable, but the swap can jostle the display. **`optional`**: use the temporary sign, and
if the courier is slow, just **keep it** for today. **Preloading** is calling the courier the moment you open,
so the typeface is on its way early.

# Examples

## Example 1 — Basic: swap so text is never invisible

Setting `font-display: swap` shows the fallback font immediately and swaps in the web font when it arrives, so
users never stare at blank space waiting for a font.

**Why this works:** it eliminates FOIT; the cost is a possible reflow, which metric matching can minimize.

## Example 2 — Real-world: preload + subset the one critical font

A site used four font files but only one appeared above the fold. Subsetting that one to Latin and preloading
it (with `crossorigin`) made headline text render quickly, while the other weights loaded lazily as needed.

**Why this works:** preloading targets the font that gates visible text; subsetting shrinks it; the rest
doesn't block.

## Example 3 — Pitfall: preload without crossorigin

A `preload` for a font was written without `crossorigin`. Because fonts fetch in anonymous CORS mode, the
preload didn't match the real request, so the font downloaded **twice** — slower than no preload at all.

**Why this bites:** a font `preload` **must** include `crossorigin`, or it's wasted (and doubles the download).

# Common Mistakes

- **Using `font-display: block`** (or default), leaving text invisible while the font loads.
- **Preloading a font without `crossorigin`**, causing a duplicate download.
- **Shipping the full font** when a Latin subset would do.
- **Ignoring swap reflow**, letting the font swap shift the whole text layout (CLS).

# Best Practices

- Ship **WOFF2**; **subset** to the glyphs you actually use.
- Choose **`font-display: swap`** (readable) or **`optional`** (stable) deliberately.
- **Preload** the one or two critical fonts **with `crossorigin`**.
- Match **fallback metrics** (`size-adjust`) to reduce swap CLS; consider **self-hosting** or a **system
  stack**.

# Summary

- Fonts can make text **invisible** (FOIT) or **reflow** (FOUT/CLS); a strategy avoids both.
- Ship **WOFF2**, **subset** it, and choose **`font-display`**: `swap` (no invisible text) or `optional` (no
  shift).
- **Preload** critical fonts — always **with `crossorigin`**.
- Reduce swap shift with **matched fallback metrics** (`size-adjust`).
- Consider **self-hosting** (drop an origin) or a **system font stack** (zero bytes).

# Flash Cards

Q: What is the difference between FOIT and FOUT?
A: FOIT (flash of invisible text) hides text while the font loads (font-display: block); FOUT (flash of unstyled text) shows a fallback immediately and swaps to the web font (font-display: swap).

Q: Which `font-display` value is best for avoiding layout shift, and what's its trade-off?
A: `optional` — it shows the fallback and, if the web font isn't ready quickly, keeps the fallback for that page load (no swap shift). The trade-off is that the web font may not appear on a slow first visit.

Q: Why must a font `preload` include the `crossorigin` attribute?
A: Fonts are always fetched in anonymous CORS mode, so a preload without `crossorigin` doesn't match the real request — the font ends up downloaded twice, making it slower than no preload.

Q: What is font subsetting and why does it help?
A: Subsetting ships only the glyphs you actually use (e.g. the Latin range via unicode-range), shrinking the font file and the download.

Q: Which font format should you ship, and why?
A: WOFF2 — it has the best compression and is supported in all modern browsers, so you rarely need other formats.

Q: How do you reduce the layout shift caused by a font swap?
A: Match the fallback font's metrics to the web font using size-adjust/ascent-override/descent-override (a fallback @font-face), or use font-display: optional to avoid the swap entirely.

# Exercises

### Easy
Find a site's `@font-face` rules (DevTools → Sources or Network). What `font-display` value is used? Would
`swap` or `optional` suit its content better, and why?

### Medium
Add a correct `preload` (with `crossorigin`) for the font used in a page's headline, and confirm in the
Network panel that it loads earlier and only once.

### Challenging
Reproduce a font-swap layout shift, then reduce it two ways: (1) `font-display: optional`, and (2) a
metric-matched fallback with `size-adjust`. Compare the CLS and the visual result of each approach.

# Further Reading

- web.dev — *Best practices for fonts*: <https://web.dev/articles/font-best-practices>
- MDN — *`font-display`*: <https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display>
- MDN — *`@font-face`*: <https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face>
- web.dev — *Prevent layout shifts with the CSS `size-adjust` font descriptor*: <https://developer.chrome.com/blog/font-fallbacks>
