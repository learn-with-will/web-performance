---
id: lesson-03
slug: the-critical-rendering-path
title: "The Critical Rendering Path"
level: beginner
order: 3
duration: 19
tags:
  - critical-rendering-path
  - dom
  - cssom
  - render-blocking
  - layout
summary: "How the browser turns HTML, CSS, and JavaScript into pixels — building the DOM and CSSOM, the render tree, layout, paint, and compositing — and why CSS is render-blocking while synchronous scripts are parser-blocking."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Describe the **critical rendering path**: DOM → CSSOM → render tree → layout → paint → composite.
- Explain why **CSS is render-blocking** and a synchronous **`<script>` is parser-blocking**.
- Predict how **`defer`**, **`async`**, and **`type="module"`** change when a script runs.
- Explain what "**critical resources**" are and why fewer/smaller ones mean a faster first paint.
- Tell apart **layout (reflow)**, **paint**, and **composite**.

# Why It Matters

Between "the HTML arrived" and "the user sees content" there's a fixed sequence of steps. Anything that
blocks that sequence — a big stylesheet, a script in the `<head>` — pushes back the first paint and your
**Largest Contentful Paint**. Once you can see the path, optimizing loading stops being guesswork: you're
removing or deferring whatever stands between the browser and the first frame.

# Concept Explanation

### Building the DOM from HTML

The browser reads HTML and builds the **DOM (Document Object Model)** — a tree of nodes representing the
page's structure. This is **incremental**: the parser can build the DOM as bytes stream in, which is why
well-structured HTML lets the browser start early.

### Building the CSSOM from CSS — and why CSS blocks rendering

CSS is parsed into the **CSSOM (CSS Object Model)** — the tree of styles. Here's the key fact: **CSS is
render-blocking**. The browser will not paint content until it has built the CSSOM, because rendering
half-styled content and then restyling it would cause an ugly flash (a **FOUC**, flash of unstyled
content). So a large or slow stylesheet delays the *entire* first paint, even for content that doesn't use
those styles.

### JavaScript can block the parser

A plain `<script>` (no attributes) is **parser-blocking**: when the parser hits it, it **stops building
the DOM**, downloads the script (if external), and runs it before continuing — because scripts might modify
the DOM. Worse, since a script can *read* styles, the browser must also finish any **CSS that appears
before the script** before running it. So a stylesheet in the `<head>` can delay a script, which delays
the DOM. Placement and attributes matter:

- **`<script>`** (sync) — blocks parsing while it fetches and runs. Avoid in the `<head>` for non-critical
  code.
- **`<script defer>`** — downloads in parallel, runs **after** parsing finishes, **in document order**,
  just before `DOMContentLoaded`. Great default for scripts that need the DOM.
- **`<script async>`** — downloads in parallel, runs **as soon as it's ready**, order **not guaranteed**.
  Good for independent third-party scripts (e.g. analytics).
- **`<script type="module">`** — **deferred by default**.

### Render tree, layout, paint, composite

Once the DOM and CSSOM exist, the browser combines them:

- **Render tree** — the visible nodes plus their computed styles. Nodes with `display: none` are excluded
  (they take no space); `visibility: hidden` nodes are *kept* (they still take space).
- **Layout (reflow)** — compute the geometry: exact size and position of every box. Changing something
  that affects geometry (width, adding a node) triggers layout again.
- **Paint** — fill in pixels: text, colors, borders, images, shadows.
- **Composite** — the page is drawn in layers that are combined (often on the GPU). Some changes
  (`transform`, `opacity`) can be done at the composite step **without** re-running layout or paint, which
  is why they're cheap to animate.

### The "critical" part

The **critical rendering path** is this whole sequence for the **first** render, and **critical resources**
are the ones that block it: the HTML, render-blocking CSS, and parser-blocking JS. The goal of loading
optimization is to **minimize the number and size of critical resources** and **shorten the path** — so the
browser reaches that first paint sooner.

# Key Terminology

- **DOM** — the tree the browser builds from HTML.
- **CSSOM** — the tree the browser builds from CSS.
- **Render tree** — visible DOM nodes combined with their computed styles.
- **Layout / reflow** — computing the size and position of every box.
- **Paint** — filling in pixels (text, colors, images).
- **Composite** — combining painted layers into the final frame.
- **Render-blocking** — resources (CSS) that prevent the first paint until they're processed.
- **Parser-blocking** — a synchronous script that pauses DOM construction.
- **FOUC** — flash of unstyled content, which render-blocking CSS prevents.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Script loading | Sync `<script>` in `<head>` | `defer` (or `async`) | Prefer `defer` for app code, `async` for independent scripts; avoid blocking `<head>` scripts. |
| CSS delivery | One big blocking stylesheet | Inline critical CSS, load the rest async | Inlining the above-the-fold CSS speeds first paint; do it when TTFB/first paint matters most. |
| Animating movement | Animate `top`/`left`/`width` | Animate `transform`/`opacity` | `transform`/`opacity` can skip layout/paint (composite only), so they stay smooth. |
| Non-critical CSS | Block on it | Split by `media`/route | CSS that doesn't apply now (print, other breakpoints) shouldn't block the first paint. |

# Worked Example

The pipeline, and how a blocking script hurts it:

```text
HTML bytes ─► [parse] ─► DOM ─┐
                              ├─► Render Tree ─► Layout ─► Paint ─► Composite ─► pixels
CSS bytes  ─► [parse] ─► CSSOM┘
        (CSS is render-blocking: no paint until CSSOM is ready)

A synchronous <script> in the middle STOPS DOM construction until it downloads and runs.
```

Before — a blocking script pauses parsing:

```html
<head>
  <link rel="stylesheet" href="/styles.css" />
  <!-- Parser stops here, downloads app.js, runs it, THEN resumes building the page -->
  <script src="/app.js"></script>
</head>
<body>
  <h1>Products</h1>
</body>
```

After — `defer` lets the DOM finish first, script runs after in order:

```html
<head>
  <link rel="stylesheet" href="/styles.css" />
  <script src="/app.js" defer></script>
</head>
<body>
  <h1>Products</h1>
</body>
```

The `<h1>` can now be parsed and painted without waiting for `app.js` to download and execute.

# Real World Analogy

Rendering a page is like **producing a printed newspaper**. First you gather all the articles and their
structure (**DOM**). You also need the **style guide** — fonts, column widths, colors (**CSSOM**) — before
you can decide how anything looks. Only then can editors **lay out** the pages (layout), the press
**prints** them (paint), and the sections are **collated** into the final paper (composite). A late-arriving
style guide holds up the whole print run — exactly like render-blocking CSS.

# Examples

## Example 1 — Basic: display:none vs visibility:hidden in the render tree

```css
.removed  { display: none; }     /* excluded from the render tree — takes no space */
.hidden   { visibility: hidden; } /* kept in the render tree — still takes up space */
```

**Why this matters:** the render tree contains only what's visible *as a box*. `display: none` elements
don't participate in layout at all, while `visibility: hidden` elements still occupy their space.

## Example 2 — Real-world: async for an independent third-party script

```html
<!-- Analytics doesn't touch page content and has no ordering needs, so let it run
     whenever it's ready without blocking parsing. -->
<script src="https://analytics.example.com/tag.js" async></script>
```

**Why this works:** `async` keeps the parser moving and runs the script opportunistically; it's ideal for
self-contained scripts that don't depend on (or block) the rest of the page.

## Example 3 — Pitfall: a synchronous third-party script in the head

A marketing tag added as a plain `<script src="…">` high in the `<head>` blocks DOM construction while it
downloads over a fresh connection. The whole page waits on a script the user never sees. Switching it to
`async` (or `defer`) unblocks the parser.

**Why this bites:** a single blocking script in the `<head>` can delay the first paint of the entire page.

# Common Mistakes

- **Putting non-critical `<script>` tags in the `<head>` without `defer`/`async`.** They block DOM
  construction.
- **Shipping one giant render-blocking stylesheet.** All of it must load before the first paint, even
  unused rules.
- **Animating layout-triggering properties** (`width`, `top`) instead of `transform`/`opacity`, causing
  reflows.
- **Forgetting CSS can block JS.** A stylesheet before a script delays that script from running.

# Best Practices

- Use **`defer`** for app scripts and **`async`** for independent ones; keep the `<head>` light.
- **Inline critical CSS** and load the rest without blocking (covered later in the course).
- Reduce the **number and size** of render-blocking resources on the critical path.
- Prefer **`transform`/`opacity`** for animation so the browser can skip layout and paint.

# Summary

- The **critical rendering path** is DOM → CSSOM → render tree → **layout → paint → composite**.
- **CSS is render-blocking**: no first paint until the CSSOM is built.
- A synchronous **`<script>` is parser-blocking**; **`defer`** runs after parsing in order, **`async`** runs
  as soon as it's ready, and **modules** are deferred by default.
- The **render tree** holds only visible nodes; **layout** computes geometry, **paint** fills pixels,
  **composite** combines layers.
- Speed up the first paint by **minimizing and deferring critical resources**.

# Flash Cards

Q: What are the main steps of the critical rendering path, in order?
A: Build the DOM (from HTML) and CSSOM (from CSS), combine them into the render tree, then layout (geometry), paint (pixels), and composite (combine layers).

Q: Why is CSS called "render-blocking"?
A: The browser won't paint any content until it has built the CSSOM, because rendering unstyled content and then restyling would cause a flash of unstyled content (FOUC).

Q: How does a plain synchronous `<script>` affect HTML parsing?
A: It is parser-blocking: the browser stops building the DOM to download and run the script, then resumes — so it delays everything after it.

Q: What is the difference between `defer` and `async` on a script?
A: `defer` downloads in parallel and runs after parsing finishes, in document order, before DOMContentLoaded; `async` runs as soon as it's downloaded, with no guaranteed order.

Q: Which nodes are excluded from the render tree?
A: Nodes that aren't visible as a box, such as those with `display: none`. Note `visibility: hidden` elements are kept because they still take up space.

Q: Why are `transform` and `opacity` cheaper to animate than `width` or `top`?
A: They can often be handled at the composite step on the GPU without re-running layout or paint, so they stay smooth.

# Exercises

### Easy
Take a small HTML page with a `<script>` in the `<head>`. Add `defer` to it and describe (or test in
DevTools) how the order of "DOM built" vs "script ran" changes.

### Medium
In DevTools' **Performance** panel, record a page load and find the **Layout**, **Paint**, and
**Composite** events. Which parts of the page triggered layout? Try changing an element's `transform` vs
its `top` and compare what the browser has to redo.

### Challenging
Given a page with one large blocking stylesheet, sketch a plan to inline the above-the-fold ("critical")
CSS and load the rest without blocking. Explain how this shortens the critical rendering path and what could
go wrong if you inline too much.

# Further Reading

- web.dev — *Understanding the critical path*: <https://web.dev/learn/performance/understanding-the-critical-path>
- MDN — *Critical rendering path*: <https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path>
- web.dev — *Render-blocking resources*: <https://web.dev/articles/render-blocking-resources>
- WHATWG HTML — *Scripting: `defer` and `async`*: <https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer>
