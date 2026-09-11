---
id: lesson-10
slug: optimizing-cls
title: "Optimizing Cumulative Layout Shift"
level: intermediate
order: 10
duration: 18
tags:
  - cls
  - layout-shift
  - aspect-ratio
  - images
  - fonts
summary: "Why content jumps around and how to stop it — setting image and video dimensions, reserving space for ads and embeds, avoiding content injected above existing content, and taming font-swap reflow — to keep Cumulative Layout Shift under 0.1."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Name the main **causes** of layout shift.
- Reserve space with **`width`/`height` attributes** and CSS **`aspect-ratio`**.
- Reserve space for **ads, embeds, and iframes** so they don't push content.
- Avoid inserting content **above** existing content, and know the **`hadRecentInput`** exception.
- Reduce **font-swap** layout shift.

# Why It Matters

Nothing feels cheaper than a page where the text jumps just as you go to tap a button — and you hit the
wrong thing. **Cumulative Layout Shift (CLS)** measures exactly that unexpected movement, and it's a Core
Web Vital with a "good" bar of **≤ 0.1**. The causes are well understood and the fixes are mostly about one
idea: **reserve the space before the content arrives.**

# Concept Explanation

### What counts as a shift

CLS sums the scores of **unexpected** layout shifts — visible elements moving between frames — within the
worst **session window**. Crucially, shifts within **500 ms of a user interaction** are treated as
*expected* (`hadRecentInput`) and don't count: opening an accordion you clicked is fine; content lurching on
its own is not.

### The main causes (and their fixes)

**1. Images and videos without dimensions.** If the browser doesn't know an image's size, it reserves no
space; when the image loads, everything below jumps down. The fix is to always give the browser the aspect
ratio up front:

```html
<!-- Set width & height attributes; the browser reserves the right space before loading. -->
<img src="/photo.jpg" alt="" width="800" height="450" />
```

```css
/* Responsive images stay fluid but keep the reserved ratio thanks to the attributes above. */
img { max-width: 100%; height: auto; }

/* For elements without intrinsic size, reserve space with aspect-ratio. */
.video-embed { aspect-ratio: 16 / 9; width: 100%; }
```

**2. Ads, embeds, and iframes without reserved space.** A slot that starts at 0 height and then fills in
shoves everything down. Reserve a **`min-height`** (or a fixed box) matching the expected size.

**3. Content injected above existing content.** A banner, notification, or "related items" block inserted at
the top pushes everything below it. Either **reserve space** for it, insert it **below the fold**, or only
inject in **response to a user interaction** (which the 500 ms rule then excuses).

**4. Web fonts causing reflow.** When a fallback font is swapped for a web font of different metrics, text
reflows (a **FOUT**-driven shift). Reduce it by matching fallback metrics with `size-adjust` /
`ascent-override` (see the fonts lesson) or `font-display: optional`.

**5. Actions that wait on the network.** Updating layout only after a fetch returns can shift content.
Reserve space or show a **skeleton** placeholder of the right size.

### Animate without shifting

Animating **`transform`** and **`opacity`** does **not** cause layout shifts, because it doesn't change the
layout of other elements. Animating `top`/`height`/`margin` can. Prefer transforms for motion.

# Key Terminology

- **Layout shift** — a visible element changing position between two frames.
- **CLS** — the summed score of unexpected shifts in the worst session window (good ≤ 0.1).
- **`aspect-ratio`** — a CSS property that reserves space in a given width:height ratio.
- **Reserved space** — space set aside for content before it arrives, preventing a shift.
- **FOUT** — flash of unstyled text; the font swap can reflow text.
- **`hadRecentInput`** — flag that excludes shifts within 500 ms of a user interaction.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Image sizing | `width`/`height` attributes | CSS `aspect-ratio` | Use attributes on `<img>`; use `aspect-ratio` for boxes without intrinsic size (embeds). |
| Dynamic slot | Let it grow from 0 | Reserve `min-height` | Reserve space sized to the expected content to avoid a jump. |
| New banner | Insert at top on load | Insert below / on interaction | Top-on-load shifts everything; below-the-fold or interaction-triggered doesn't count. |
| Motion | Animate `top`/`height` | Animate `transform` | `transform` doesn't move other content, so it produces no layout shift. |

# Worked Example

Before — an unsized image shifts the text when it loads:

```html
<h1>Trip report</h1>
<img src="/map.jpg" alt="Route map" />   <!-- no dimensions: text below jumps when it loads -->
<p>We started at dawn…</p>
```

After — the space is reserved, so nothing moves:

```html
<h1>Trip report</h1>
<img src="/map.jpg" alt="Route map" width="1200" height="800" />
<p>We started at dawn…</p>
```

```css
img { max-width: 100%; height: auto; } /* stays responsive, ratio preserved from attributes */
```

The `width`/`height` attributes give the browser the **aspect ratio**, so it reserves a correctly sized box
*before* the image downloads. The paragraph never jumps — CLS stays near zero.

# Real World Analogy

Preventing layout shift is like **reserving seats before an event**. If seating is a free-for-all,
latecomers squeeze in and everyone already seated gets shuffled down a row mid-show — jarring and
disruptive. If every seat is reserved in advance (space reserved for each image, ad, and embed), people
arrive and sit in their spot without disturbing anyone. The content still "arrives late"; it just doesn't
push others around.

# Examples

## Example 1 — Basic: dimensions stop the jump

Adding `width` and `height` to every `<img>` (with `height: auto` in CSS for responsiveness) lets the
browser reserve the right space, so images "pop in" without shoving text.

**Why this works:** the aspect ratio is known before the image loads, so the layout is correct from the
first frame.

## Example 2 — Real-world: a top-of-page cookie banner

A consent banner injected at the very top on load pushed the entire page down 60px the moment it appeared —
a big CLS hit. The fix: render it as a **fixed overlay** (out of normal flow) or reserve its height in the
initial layout so nothing below moves.

**Why this works:** taking the banner out of the document flow (or reserving its space) means it no longer
displaces the content beneath it.

## Example 3 — Pitfall: font swap reflow

A page loads a web font with very different metrics from its fallback. When the web font swaps in, every
line of text re-wraps and shifts. Matching the fallback's metrics (`size-adjust`) or using
`font-display: optional` removes the visible reflow.

**Why this bites:** even text-only pages can fail CLS if a late font swap reflows the whole layout.

# Common Mistakes

- **Omitting `width`/`height` on images**, so text jumps when they load.
- **Letting ad/embed slots grow from zero** instead of reserving space.
- **Injecting banners above existing content** on load, pushing everything down.
- **Ignoring font-swap reflow**, which can shift an entire text layout.

# Best Practices

- Always set **`width`/`height`** on images/videos (or `aspect-ratio` on boxes); keep `height: auto` for
  responsiveness.
- **Reserve space** for ads, embeds, and anything loaded async (skeletons, `min-height`).
- Don't insert content **above** existing content on load; do it below or on **interaction**.
- Animate with **`transform`/`opacity`**, and tame **font-swap** shifts with metric overrides.

# Summary

- **CLS** measures unexpected content movement; good is **≤ 0.1**, and shifts within 500 ms of interaction
  don't count.
- The biggest fixes are about **reserving space**: `width`/`height` and `aspect-ratio` for media, `min-height`
  for slots.
- Don't inject content **above** existing content on load; prefer below-the-fold or interaction-triggered.
- Reduce **font-swap** reflow with metric overrides or `font-display: optional`.
- Animate with **`transform`/`opacity`** to avoid shifts.

# Flash Cards

Q: What is the single most effective way to prevent image-caused layout shift?
A: Give every image its `width` and `height` attributes (or a CSS `aspect-ratio`), so the browser reserves the correct space before the image loads. Keep `height: auto` in CSS for responsiveness.

Q: Which layout shifts do NOT count toward CLS?
A: Shifts that occur within 500 ms of a user interaction (flagged `hadRecentInput`) — for example, expanding a section you just clicked — are considered expected and excluded.

Q: Why does inserting a banner at the top of the page on load hurt CLS?
A: It pushes all the content below it down, causing a large unexpected shift. Reserve its space, insert it below the fold, or render it as an overlay outside the normal flow.

Q: How can web fonts cause layout shift, and how do you reduce it?
A: When a fallback font is swapped for a web font with different metrics, text reflows. Match the fallback's metrics with `size-adjust`/`ascent-override` or use `font-display: optional`.

Q: Why do `transform` and `opacity` animations not cause layout shift?
A: They don't change the layout position of other elements, so surrounding content doesn't move — unlike animating `top`, `height`, or `margin`.

Q: What should you do about an ad or embed slot whose size isn't known until it loads?
A: Reserve space for it with a `min-height` or fixed box sized to the expected content, so it fills in without pushing other content down.

# Exercises

### Easy
Find an `<img>` on a page that has no `width`/`height`. Add them (matching the real aspect ratio) plus
`height: auto` in CSS, and confirm in DevTools that the layout no longer shifts when the image loads.

### Medium
Use DevTools' Performance panel (or the Layout Shift regions overlay) to record a page load and identify one
element that shifts. Determine its cause (unsized media, injected content, font swap) and propose the fix.

### Challenging
Reproduce a font-swap CLS: load a web font whose metrics differ from the fallback, observe the reflow, then
reduce it using either `font-display: optional` or fallback metric overrides. Explain the trade-off of each.

# Further Reading

- web.dev — *Optimize Cumulative Layout Shift*: <https://web.dev/articles/optimize-cls>
- web.dev — *Cumulative Layout Shift (CLS)*: <https://web.dev/articles/cls>
- MDN — *`aspect-ratio`*: <https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio>
- web.dev — *Setting height and width on images*: <https://web.dev/articles/optimize-cls#images-without-dimensions>
