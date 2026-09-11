---
id: lesson-09
slug: optimizing-lcp
title: "Optimizing Largest Contentful Paint"
level: intermediate
order: 9
duration: 20
tags:
  - lcp
  - images
  - preload
  - fetchpriority
  - ttfb
summary: "A systematic way to improve LCP by breaking it into four phases — TTFB, resource load delay, resource load time, and element render delay — and applying the right fix to each, including preloading the LCP image, fetchpriority, and never lazy-loading it."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Identify a page's **LCP element**.
- Break LCP into its **four phases** and know which fix targets each.
- Make the LCP resource **discoverable early** and raise its priority.
- Use **`fetchpriority="high"`** and **preload** correctly for the LCP image.
- Avoid the classic LCP mistakes — especially **lazy-loading the LCP image**.

# Why It Matters

LCP is the **loading** Core Web Vital: when does the biggest, most important piece of content appear? A slow
LCP is the difference between a page that feels ready and one that keeps users staring at empty space. The
good news is that LCP breaks cleanly into four phases — and once you know which phase is slow, the fix is
usually obvious and targeted.

# Concept Explanation

### First, find the LCP element

LCP is the render time of the **largest content element in the viewport** — often a hero image, a video
poster, a CSS `background-image`, or a large text block. DevTools (Performance panel) and the web-vitals
library both tell you *which* element it is. You can't fix LCP until you know what it is.

### The four phases of LCP

Every LCP breaks into four consecutive parts (per web.dev's "Optimize LCP"):

```text
[  TTFB  ][ Resource load delay ][ Resource load time ][ Element render delay ]
   ^          ^                       ^                     ^
   server     time before the LCP     how long the LCP      time from "loaded"
   + network  resource STARTS loading resource downloads    to actually painted
```

1. **TTFB** — time to the first byte of the document (Lesson 2).
2. **Resource load delay** — the gap between TTFB and when the LCP resource *starts* downloading. Ideally
   near zero; it's large when the resource is discovered late (injected by JavaScript, hidden in CSS, or
   low priority).
3. **Resource load time** — how long the LCP resource itself takes to download.
4. **Element render delay** — the gap between the resource finishing and the element painting, usually
   caused by **render-blocking CSS/JS** still in the way.

Diagnose which phase dominates, then apply the matching fix:

| Slow phase | Fix |
| ---------- | --- |
| TTFB | Use a CDN, cache HTML/at the edge, speed up the server, cut redirects. |
| Resource load delay | Put the LCP `<img>` **in the initial HTML**, **preload** it, add **`fetchpriority="high"`**. |
| Resource load time | Optimize the image: modern format, right dimensions, compression, responsive `srcset`. |
| Element render delay | Cut **render-blocking** CSS/JS; inline critical CSS; load the right font fast. |

### Make the LCP resource discoverable and prioritized

The browser can only download what it has **discovered**. If your hero is a CSS `background-image` or is
injected by JavaScript, the browser finds it late — a big **load delay**. Prefer a real `<img>` in the HTML
so the preload scanner finds it immediately, and nudge its priority:

- **`fetchpriority="high"`** on the LCP `<img>` tells the browser it's important.
- **`<link rel="preload" as="image">`** starts the download even earlier (useful when the image is set via
  CSS or discovered late).

### Never lazy-load the LCP image

`loading="lazy"` is great for below-the-fold images, but on the LCP image it **delays the very thing LCP
measures**, making the metric worse. The LCP image should load **eagerly** and, ideally, at high priority.

### If the LCP element is text

Then the resource is effectively the **font and CSS**: a slow web font or render-blocking CSS delays the
text. The fixes live in the fonts and render-blocking lessons — but the phase model still applies (it's
render delay).

# Key Terminology

- **LCP element** — the largest content element in the viewport that LCP measures.
- **Resource load delay** — time between TTFB and the LCP resource starting to load.
- **Resource load time** — how long the LCP resource takes to download.
- **Element render delay** — time from resource loaded to element painted.
- **`fetchpriority`** — a hint (`high`/`low`/`auto`) that changes a fetch's priority.
- **preload** — `<link rel="preload">` to start fetching a critical resource early.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Prioritize LCP image | `fetchpriority="high"` on the `<img>` | `<link rel="preload" as="image">` | Use `fetchpriority` when the `<img>` is in the HTML; add `preload` when it's discovered late (CSS/JS). |
| Hero delivery | CSS `background-image` | Real `<img>` in HTML | Prefer `<img>` — the preload scanner discovers it immediately. |
| Below-the-fold images | `loading="lazy"` | Eager | Lazy for below-the-fold; **eager** (never lazy) for the LCP image. |
| Fixing TTFB | Optimize server code | Add a CDN + edge cache | If TTFB is network/distance, a CDN helps more than code. |

# Worked Example

Before — the hero is discovered late and not prioritized:

```html
<!-- Hero set via CSS background: the browser can't preload-scan it, so it starts late -->
<div class="hero"></div>
<style>.hero { background-image: url('/img/hero.jpg'); height: 60vh; }</style>
```

After — a real `<img>`, eager, high priority, with a preload as backup:

```html
<head>
  <link rel="preload" as="image" href="/img/hero.avif" fetchpriority="high" />
</head>
<body>
  <!-- In the HTML (discoverable), eager, high priority, and correctly sized to avoid CLS -->
  <img src="/img/hero.avif" alt="Product" width="1200" height="675"
       fetchpriority="high" decoding="async" />
</body>
```

Now the LCP image is discovered immediately, prioritized, and started early — shrinking the **resource load
delay** phase, which is the most common LCP culprit.

# Real World Analogy

LCP is the time until the **headline act walks on stage**. **TTFB** is the venue unlocking its doors.
**Resource load delay** is how long the act waits backstage before starting to walk on. **Resource load
time** is their walk to center stage. **Element render delay** is the spotlight finally switching on. If the
crowd is waiting, you don't just make the act walk faster (load time) — you check *which* step is slow. Often
the act was simply told to wait backstage too long (load delay).

# Examples

## Example 1 — Basic: prioritize the hero image

```html
<img src="/hero.avif" alt="" width="1200" height="600" fetchpriority="high" />
```

**Why this works:** `fetchpriority="high"` tells the browser this image matters more than other resources,
so it isn't queued behind less important downloads.

## Example 2 — Real-world: LCP image was a late CSS background

A landing page's LCP was a `background-image` applied by a stylesheet that itself loaded late, so the image
wasn't discovered until well after TTFB (a big **load delay**). Moving it to an `<img>` in the HTML and
adding a `preload` cut LCP by over a second — the download simply started much earlier.

**Why this matters:** the fix wasn't a smaller image; it was making the image **discoverable early**.

## Example 3 — Pitfall: lazy-loading the hero

A team added `loading="lazy"` to *all* images "to be safe." The hero — the LCP element — now waited for lazy
loading to trigger, so LCP got **worse**. Removing `lazy` from the hero (and keeping it on below-the-fold
images) fixed it.

**Why this bites:** `loading="lazy"` on the LCP image delays exactly what LCP measures.

# Common Mistakes

- **Lazy-loading the LCP image**, delaying the metric's own target.
- **Hiding the LCP image in CSS or injecting it with JavaScript**, so it's discovered late.
- **Optimizing the wrong phase** — shrinking an image when the real problem was load *delay* or render
  *delay*.
- **Ignoring TTFB** when the server/distance is the bottleneck.

# Best Practices

- **Identify the LCP element**, then find which of the **four phases** dominates.
- Put the LCP image in the **HTML**, load it **eagerly**, and mark it **`fetchpriority="high"`** (preload if
  discovered late).
- Optimize the image's **format and size**, and cut **render-blocking** resources for render delay.
- Improve **TTFB** with a CDN and caching when the network/server is the bottleneck.

# Summary

- LCP breaks into **TTFB → resource load delay → resource load time → element render delay**; fix the phase
  that dominates.
- The most common culprit is **load delay** from a **late-discovered** LCP resource — make it discoverable
  in the HTML and prioritize it.
- Use **`fetchpriority="high"`** and **preload**; optimize the image's **format/size**; cut render-blocking
  resources.
- **Never lazy-load the LCP image.**
- If the LCP element is **text**, the blocker is usually the **font or render-blocking CSS**.

# Flash Cards

Q: What are the four phases of LCP?
A: TTFB, resource load delay (time before the LCP resource starts loading), resource load time (its download), and element render delay (time from loaded to painted).

Q: Which LCP phase is most commonly the problem, and why?
A: Resource load delay — the LCP resource is discovered late (a CSS background, injected by JavaScript, or low priority), so it starts downloading long after TTFB.

Q: Why should you never lazy-load the LCP image?
A: `loading="lazy"` delays the image until it's about to enter the viewport, but the LCP image should load immediately — lazy-loading it makes LCP worse.

Q: How do you make the LCP image start downloading as early as possible?
A: Put it as a real `<img>` in the initial HTML (so the preload scanner finds it), add `fetchpriority="high"`, and optionally a `<link rel="preload" as="image">`.

Q: If the LCP element is a block of text, what usually delays it?
A: A slow-loading web font and/or render-blocking CSS — the fixes are font-loading strategy and removing render-blocking resources.

Q: Which fix helps a slow TTFB the most when the cause is distance?
A: Serving from a CDN with edge caching, which cuts round-trip time — more effective than optimizing server code when the network is the bottleneck.

# Exercises

### Easy
On a page you control, find the LCP element (DevTools Performance panel). Is it an image, a background, or
text? If it's an image, confirm it is **not** `loading="lazy"`.

### Medium
Add `fetchpriority="high"` to a hero image (and a matching `preload`). Measure LCP before and after in a
throttled Lighthouse run and note which phase shrank.

### Challenging
Take a page whose LCP is a CSS `background-image` injected by a late stylesheet. Rework it to a discoverable
`<img>` in the HTML with a preload, and explain which LCP phase you're attacking and why the download now
starts earlier.

# Further Reading

- web.dev — *Optimize Largest Contentful Paint*: <https://web.dev/articles/optimize-lcp>
- web.dev — *Largest Contentful Paint (LCP)*: <https://web.dev/articles/lcp>
- web.dev — *`fetchpriority` / Optimize resource loading with priority hints*: <https://web.dev/articles/fetch-priority>
- MDN — *`<link rel="preload">`*: <https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload>
