---
id: lesson-19
slug: resource-hints-and-priorities
title: "Resource Hints and Priorities"
level: advanced
order: 19
duration: 19
tags:
  - resource-hints
  - preload
  - preconnect
  - prefetch
  - priority-hints
summary: "Steering the browser's loading with hints — preconnect and dns-prefetch to warm connections, preload and fetchpriority to pull critical resources forward, and prefetch and the Speculation Rules API to prepare future navigations — without over-hinting."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Distinguish the resource hints and when to use each.
- Warm connections with **`preconnect`** and **`dns-prefetch`**.
- Pull critical resources forward with **`preload`** and **`fetchpriority`**.
- Prepare **future navigations** with **`prefetch`** and the **Speculation Rules API**.
- Avoid **over-hinting**, which starves the resources that matter.

# Why It Matters

The browser guesses at what to fetch and in what order. Usually its guesses are good — but you know things it
doesn't: which image is the LCP, which origin you'll call next, which page the user will probably visit.
**Resource hints** let you share that knowledge to start work sooner. Used precisely they're powerful; used
carelessly they waste bandwidth and *demote* the very resources you care about.

# Concept Explanation

### Two families of hints

- **Current-page hints** make *this* page faster (connect early, fetch a critical resource sooner).
- **Future-navigation hints** make the *next* page faster (fetch or even render it in advance).

### Connection hints: `preconnect` and `dns-prefetch`

Talking to a new origin costs DNS + TCP + TLS (Lesson 2). Warm it up ahead of time:

- **`preconnect`** — do the **full** connection setup (DNS + TCP + TLS) to an origin you'll use **very soon**
  (a font host, your API, a critical CDN). It's not free, so limit it to a **few** critical origins.
- **`dns-prefetch`** — resolve **DNS only** — cheaper and more widely supported; good for origins used a
  little later, or as a companion to `preconnect`.

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
<link rel="dns-prefetch" href="https://cdn.example.com" />
```

### Fetch hints for the current page: `preload`, `modulepreload`, `fetchpriority`

- **`preload`** — `<link rel="preload" as="...">` fetches a **critical current-page** resource early that the
  browser would otherwise discover late (an LCP image, a font, a critical script/stylesheet). Set the correct
  **`as`**, and **`crossorigin`** for fonts. Preload **sparingly** — only genuinely critical resources.
- **`modulepreload`** — preloads an ES module (and lets the browser also fetch its dependencies).
- **`fetchpriority`** — `high`/`low`/`auto` nudges the priority of a fetch: `high` on the LCP image, `low` on
  below-the-fold or non-critical fetches.

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<img src="/hero.avif" fetchpriority="high" width="1200" height="675" alt="" />
```

### Future navigations: `prefetch` and Speculation Rules

- **`prefetch`** — `<link rel="prefetch">` fetches a resource or page you'll **probably need next** at low
  priority, so it's cached when the user navigates.
- **Speculation Rules API** — a `<script type="speculationrules">` block that tells the browser to
  **prefetch** or even **prerender** likely next pages. Prerendering renders the whole next page in the
  background so navigation is near-instant. It's Chromium and **emerging** as of writing, with an
  **`eagerness`** control to balance benefit against wasted work:

```html
<script type="speculationrules">
{
  "prerender": [
    { "where": { "href_matches": "/product/*" }, "eagerness": "moderate" }
  ]
}
</script>
```

### The priority budget

The browser assigns each fetch a priority and downloads accordingly. Hints **adjust** that. If you `preload`
or mark a dozen things `high`, you flatten the priority order and can **delay the real LCP resource** — the
opposite of what you wanted. Hints are a scalpel, not a firehose.

# Key Terminology

- **`preconnect`** — perform DNS + TCP + TLS to an origin in advance.
- **`dns-prefetch`** — resolve an origin's DNS in advance (cheaper than preconnect).
- **`preload`** — fetch a critical current-page resource early (`as` required; `crossorigin` for fonts).
- **`modulepreload`** — preload an ES module and its dependencies.
- **`fetchpriority`** — hint a fetch's priority (`high`/`low`/`auto`).
- **`prefetch` / Speculation Rules** — prepare a future navigation (fetch, or prerender the page).

# Options and Trade-offs

| Goal | Option A | Option B | How to choose |
| ---- | -------- | -------- | ------------- |
| Warm an origin | `preconnect` (full setup) | `dns-prefetch` (DNS only) | `preconnect` for a few critical origins used immediately; `dns-prefetch` is cheaper/wider for the rest. |
| Speed the LCP image | `fetchpriority="high"` | `preload as="image"` | `fetchpriority` when it's in the HTML; `preload` when it's discovered late (CSS/JS). |
| Prepare next page | `prefetch` (fetch it) | Speculation Rules **prerender** | Prefetch caches resources; prerender renders the page for near-instant nav — at more cost if unused. |
| How many hints | Many "high"/preloads | A few precise ones | Few and precise; over-hinting flattens priorities and hurts the critical resource. |

# Worked Example

A focused set of hints for a product page whose users often click into a product:

```html
<head>
  <!-- Warm the connection to the image/API origin we'll use immediately -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin />

  <!-- Preload the critical font (crossorigin required for fonts) -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

  <!-- Prepare the likely next navigation (prerender product pages, moderately) -->
  <script type="speculationrules">
  { "prerender": [ { "where": { "href_matches": "/product/*" }, "eagerness": "moderate" } ] }
  </script>
</head>
<body>
  <!-- The LCP hero, prioritized and sized -->
  <img src="https://cdn.example.com/hero.avif" fetchpriority="high" width="1200" height="675" alt="" />
</body>
```

Each hint is deliberate: one connection warmed, one font preloaded, the LCP image prioritized, and the likely
next page prerendered — nothing scattershot.

# Real World Analogy

Resource hints are like **briefing a delivery service on your plans**. **`preconnect`** is "have a truck warmed
up and waiting at that warehouse." **`preload`/`fetchpriority: high`** is "grab *this* specific package first."
**`prefetch`/prerender** is "pre-position tomorrow's likely order so it's ready the moment I ask." But if you
stamp **every** package "URGENT," the label stops meaning anything and the truly urgent one waits behind the
rest — which is exactly what over-preloading does.

# Examples

## Example 1 — Basic: preconnect to a critical origin

Adding `preconnect` to the CDN that serves the hero image starts DNS+TCP+TLS immediately, so when the image
request comes it doesn't pay setup time. One line, meaningful LCP win when the origin is on the critical path.

**Why this works:** the expensive connection setup overlaps with parsing instead of delaying the image.

## Example 2 — Real-world: prerender the likely next page

A docs site added Speculation Rules to **prerender** the "next" page in a tutorial series. When users clicked
"Next," the page appeared essentially instantly because it was already rendered in the background.

**Why this works:** the next navigation's work happened ahead of time; the click just swaps in the ready page.

## Example 3 — Pitfall: preloading everything

A team preloaded ten resources "to be fast." Because preloads compete at high priority, the actual LCP image
was **delayed** behind less important preloads, and LCP got worse. Trimming to just the LCP image and the
critical font fixed it.

**Why this bites:** preload/`high` is a relative priority; marking many things important demotes the one that
truly is.

# Common Mistakes

- **Over-preloading**, flattening priorities and delaying the real critical resource.
- **`preload` without correct `as`** (or without `crossorigin` for fonts), so it's wasted or duplicated.
- **`preconnect` to many origins**, spending connection setup you don't recoup.
- **Confusing `preload` (this page) with `prefetch` (next page).**

# Best Practices

- **`preconnect`** a *few* critical origins used immediately; **`dns-prefetch`** the rest.
- **`preload`** only genuinely critical, late-discovered resources (correct `as`, `crossorigin` for fonts).
- Use **`fetchpriority="high"`** for the LCP image and **`low`** for non-critical fetches.
- Prepare likely next pages with **`prefetch`** or **Speculation Rules**, tuning **`eagerness`**; keep hints
  **few and precise**.

# Summary

- Hints split into **current-page** (connect/fetch sooner) and **future-navigation** (prepare the next page).
- **`preconnect`** = DNS+TCP+TLS; **`dns-prefetch`** = DNS only.
- **`preload`** pulls a critical resource forward (right `as`, `crossorigin` for fonts); **`fetchpriority`**
  nudges priority.
- **`prefetch`** and the **Speculation Rules API** (prefetch/**prerender**) prepare future navigations.
- **Over-hinting backfires** — keep hints few and precise so the critical resource stays first.

# Flash Cards

Q: What's the difference between `preconnect` and `dns-prefetch`?
A: `preconnect` performs the full connection setup (DNS + TCP + TLS) to an origin you'll use very soon; `dns-prefetch` only resolves the DNS, which is cheaper and more widely supported.

Q: When do you use `preload` vs `prefetch`?
A: `preload` fetches a critical resource for the CURRENT page early; `prefetch` fetches a resource/page you'll likely need on a FUTURE navigation, at low priority.

Q: Why must a font `preload` include `crossorigin`, and what else must be correct?
A: Fonts are fetched anonymously (CORS), so without `crossorigin` the preload doesn't match and is wasted/duplicated; you must also set the correct `as` (e.g. `as="font"`).

Q: What does the Speculation Rules API let you do beyond `prefetch`?
A: It can prerender an entire likely-next page in the background (not just fetch resources), so navigating to it is near-instant — with an `eagerness` setting to balance benefit vs wasted work. (Chromium, emerging.)

Q: Why can preloading many resources make LCP worse?
A: Preload and `fetchpriority: high` are relative priorities; marking many resources high flattens the order and can delay the actual LCP resource behind less important ones.

Q: What does `fetchpriority` do?
A: It hints the relative priority of a fetch (`high`/`low`/`auto`) — e.g. `high` on the LCP image, `low` on below-the-fold or non-critical requests.

# Exercises

### Easy
Look at a site's `<head>` (View Source). Find any `preconnect`, `preload`, or `prefetch` hints. What is each
one targeting, and does it look justified?

### Medium
On a page with a cross-origin hero image, add a `preconnect` to that origin and `fetchpriority="high"` to the
image. Measure LCP before and after in a throttled run.

### Challenging
For a multi-step flow (checkout, tutorial), add Speculation Rules to prerender the likely next page and pick
an appropriate `eagerness`. Explain the trade-off if the user doesn't actually go there.

# Further Reading

- web.dev — *Establish network connections early with `preconnect`/`dns-prefetch`*: <https://web.dev/articles/preconnect-and-dns-prefetch>
- web.dev — *Preload critical assets*: <https://web.dev/articles/preload-critical-assets>
- web.dev — *Prerender pages / Speculation Rules*: <https://developer.chrome.com/docs/web-platform/prerender-pages>
- MDN — *`fetchpriority`*: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link#fetchpriority>
