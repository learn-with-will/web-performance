---
id: lesson-16
slug: render-blocking-resources
title: "Eliminating Render-Blocking Resources"
level: intermediate
order: 16
duration: 18
tags:
  - render-blocking
  - critical-css
  - css
  - defer
  - first-paint
summary: "Clearing CSS and JavaScript off the critical path — inlining critical CSS and loading the rest asynchronously, scoping stylesheets with the media attribute, and deferring scripts — so the first paint (and LCP) happen sooner."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Identify **render-blocking** CSS and JavaScript on a page.
- **Inline critical CSS** and load the rest **without blocking**.
- Scope stylesheets with the **`media`** attribute so non-matching CSS doesn't block.
- Apply **`defer`/`async`** to keep scripts off the critical path.
- Measure the effect on **FCP** and **LCP**.

# Why It Matters

From the critical-rendering-path lesson: **CSS blocks the first paint** and a **synchronous script blocks the
parser**. Those blocking resources are the "element render delay" phase of LCP and the main reason a page
sits blank longer than it needs to. Clearing them off the critical path is often the single biggest first-paint
win available.

# Concept Explanation

### Find the blockers

Lighthouse's **"Eliminate render-blocking resources"** audit lists them directly; you can also spot them in
the **waterfall** (they load early and gate the first paint) and use **DevTools Coverage** to see how much of
each stylesheet is actually used above the fold.

### Critical CSS: inline what's needed, defer the rest

The browser blocks rendering until it has the full CSSOM. The fix is to give it just the **critical**
(above-the-fold) CSS inline, and load the rest **without blocking**:

```html
<head>
  <!-- 1. Inline the small critical CSS so first paint doesn't wait on a request. -->
  <style>/* above-the-fold styles: header, hero, layout */</style>

  <!-- 2. Load the full stylesheet without blocking: it applies once loaded. -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/styles.css" /></noscript>
</head>
```

An alternative non-blocking trick uses the **`media`** attribute: a stylesheet with a non-matching media
doesn't block rendering, then you flip it to `all` once loaded:

```html
<link rel="stylesheet" href="/styles.css" media="print" onload="this.media='all'" />
```

### Use `media` for genuinely conditional CSS

CSS that doesn't apply to the current context **shouldn't block**. Mark print styles and breakpoint-specific
styles with `media` so the browser downloads them without blocking the first paint:

```html
<link rel="stylesheet" href="/print.css" media="print" />
<link rel="stylesheet" href="/wide.css" media="(min-width: 1024px)" />
```

### JavaScript: keep it off the critical path

Recall from Lesson 3: a plain `<script>` in the `<head>` is parser-blocking. Use **`defer`** for app scripts
(runs after parse, in order) and **`async`** for independent third-party scripts. Better still, ship **less**
JavaScript for content that doesn't need it.

### Don't over-inline

Inlining **too much** CSS bloats every HTML response and can't be cached separately — you re-send it on every
navigation. The balance: inline the **small** critical set, keep the bulk in a cacheable external file loaded
asynchronously. Tools can extract critical CSS automatically.

# Key Terminology

- **Render-blocking resource** — CSS (or a sync script) that delays the first paint.
- **Critical CSS** — the minimal above-the-fold styles, inlined to unblock first paint.
- **`media` attribute** — scopes a stylesheet; a non-matching one doesn't block rendering.
- **Async CSS** — loading a stylesheet without blocking (preload + swap, or the media trick).
- **`defer` / `async`** — script attributes that keep JavaScript off the critical path.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Critical CSS | Inline all CSS | Inline critical, async the rest | Inline only the small above-the-fold set; keep the bulk external and cacheable. |
| Async stylesheet | `preload` + swap to `stylesheet` | `media="print"` + swap to `all` | Either works; preload also warms the fetch. Provide a `<noscript>` fallback. |
| Conditional CSS | One big blocking file | Split with `media` | Scope print/breakpoint CSS with `media` so it doesn't block. |
| Scripts | Sync in `<head>` | `defer`/`async` | Never block the parser with `<head>` scripts; `defer` app code, `async` independents. |

# Worked Example

Before — a blocking stylesheet and a blocking script gate the first paint:

```html
<head>
  <link rel="stylesheet" href="/styles.css" />   <!-- render-blocking -->
  <script src="/app.js"></script>                 <!-- parser-blocking -->
</head>
```

After — critical CSS inlined, full CSS async, script deferred:

```html
<head>
  <style>/* critical above-the-fold CSS (small) */</style>
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/styles.css" /></noscript>
  <script src="/app.js" defer></script>
</head>
```

Now the browser paints the above-the-fold content using the inline critical CSS — without waiting for the full
stylesheet or the script to download — so **FCP** and **LCP** happen sooner.

# Real World Analogy

Render-blocking CSS is like a **doorman who won't seat anyone until he's finished reading the entire rulebook**
aloud. If the rulebook is long, the whole restaurant waits at the door. Instead, hand him a **single index
card** with the rules he needs to seat the first guests (critical CSS), and let him read the full rulebook in
the back afterward (async CSS). The room fills immediately, and the complete rules still arrive — just not on
the critical path.

# Examples

## Example 1 — Basic: make print CSS non-blocking

```html
<!-- Print styles never affect the screen render, so they shouldn't block it -->
<link rel="stylesheet" href="/print.css" media="print" />
```

**Why this works:** a stylesheet whose `media` doesn't match the current context is fetched at low priority
and doesn't block the first paint.

## Example 2 — Real-world: inline critical + defer the app

A marketing page inlined ~8 KB of critical CSS, loaded its 120 KB stylesheet asynchronously, and switched its
`<head>` script to `defer`. First paint stopped waiting on two large blocking downloads; FCP and LCP both
improved on mobile.

**Why this works:** the browser had exactly what it needed to paint the top of the page immediately, and the
rest arrived off the critical path.

## Example 3 — Pitfall: inlining the entire stylesheet

To "avoid a request," a team inlined all 120 KB of CSS into the HTML. Now every page response is 120 KB
heavier, uncacheable, and re-sent on every navigation — slower overall, especially for multi-page visits.

**Why this bites:** inline only the **small** critical set; the bulk belongs in a cacheable external file.

# Common Mistakes

- **Leaving a big stylesheet render-blocking** when only a little of it is needed above the fold.
- **Inlining all CSS**, bloating HTML and losing caching.
- **Blocking scripts in the `<head>`** without `defer`/`async`.
- **Not scoping conditional CSS** with `media`, so print/breakpoint styles block the first paint.

# Best Practices

- **Inline critical CSS**; load the full stylesheet **asynchronously** (with a `<noscript>` fallback).
- Scope print/breakpoint CSS with the **`media`** attribute.
- **`defer`** app scripts, **`async`** independent ones; keep the `<head>` free of blocking scripts.
- Keep the critical set **small** and the bulk **external and cacheable**; measure FCP/LCP after.

# Summary

- **CSS blocks first paint** and **sync scripts block the parser** — these are the render-blocking resources.
- **Inline critical CSS** and load the rest **async** (preload + swap, or the `media` trick).
- Scope conditional CSS with **`media`** so it doesn't block.
- Keep JavaScript off the critical path with **`defer`/`async`** and by shipping less of it.
- Don't **over-inline**; keep the critical set small and the bulk cacheable — then verify FCP/LCP improved.

# Flash Cards

Q: What are the two kinds of render-blocking resources?
A: Render-blocking CSS (the browser won't paint until the CSSOM is built) and parser-blocking synchronous scripts (they pause DOM construction).

Q: What is "critical CSS" and how is it used?
A: The minimal set of above-the-fold styles, inlined in a `<style>` in the head so the first paint doesn't wait on a stylesheet request; the full stylesheet is then loaded asynchronously.

Q: How does the `media` attribute help with render-blocking?
A: A stylesheet whose `media` doesn't match the current context (e.g. `media="print"`) is downloaded without blocking the first paint; you can flip it to `all` on load to apply it.

Q: Name a way to load a stylesheet without blocking rendering.
A: Use `<link rel="preload" as="style" onload="this.rel='stylesheet'">`, or `<link rel="stylesheet" media="print" onload="this.media='all'">` — with a `<noscript>` fallback.

Q: Why is inlining ALL of your CSS a bad idea?
A: It bloats every HTML response, can't be cached separately, and is re-sent on every navigation — inline only the small critical set and keep the bulk external and cacheable.

Q: How do you keep JavaScript from blocking the first paint?
A: Use `defer` for app scripts and `async` for independent ones (never a plain sync `<script>` in the head), and ship less JavaScript overall.

# Exercises

### Easy
Run Lighthouse on a page and open the **"Eliminate render-blocking resources"** audit. List the blocking
resources it finds and their estimated savings.

### Medium
Take a page with one blocking stylesheet. Inline a small critical-CSS block and load the full stylesheet with
the preload+swap pattern (plus a `<noscript>` fallback). Measure FCP before and after.

### Challenging
For a page with print styles, breakpoint styles, and an app script in the `<head>`, rewrite the `<head>` to
remove all render-blocking: scope conditional CSS with `media`, inline critical CSS, async the rest, and defer
the script. Explain what now blocks the first paint (ideally nothing).

# Further Reading

- web.dev — *Eliminate render-blocking resources*: <https://web.dev/articles/render-blocking-resources>
- web.dev — *Defer non-critical CSS*: <https://web.dev/articles/defer-non-critical-css>
- web.dev — *Extract and inline critical CSS*: <https://web.dev/articles/extract-critical-css>
- MDN — *`<link>` `media` attribute*: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#media>
