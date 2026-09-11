---
id: lesson-04
slug: core-web-vitals
title: "Meet the Core Web Vitals"
level: beginner
order: 4
duration: 19
tags:
  - core-web-vitals
  - lcp
  - inp
  - cls
  - thresholds
summary: "The three Core Web Vitals — Largest Contentful Paint (loading), Interaction to Next Paint (responsiveness), and Cumulative Layout Shift (visual stability) — with their exact good/poor thresholds, the 75th-percentile rule, and why INP replaced FID."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Name the **three Core Web Vitals** and what each measures.
- State the exact **good / needs-improvement / poor** thresholds for LCP, INP, and CLS.
- Explain the **75th-percentile** rule and why metrics are split by device.
- Know that **INP replaced FID** as a Core Web Vital (in March 2024).
- Distinguish Core Web Vitals from related metrics like **FCP** and **TTFB**.

# Why It Matters

"Is this page fast?" needs a shared, measurable answer. **Core Web Vitals (CWV)** are Google's three
user-centric metrics that give one — covering how fast the main content loads, how responsive the page is,
and how stable it looks. They're the common vocabulary teams use to set goals and track regressions, and
they factor into Google's page-experience signals. Get these definitions exactly right: they anchor every
optimization lesson that follows.

# Concept Explanation

### The three vitals

The **Web Vitals** program defines several metrics; the **Core** Web Vitals are the three headline ones,
each covering a different part of the experience:

- **Largest Contentful Paint (LCP)** — **loading**. When does the largest piece of content in the viewport
  appear?
- **Interaction to Next Paint (INP)** — **responsiveness**. How quickly does the page visually respond to
  interactions?
- **Cumulative Layout Shift (CLS)** — **visual stability**. How much does content unexpectedly move around?

### LCP — Largest Contentful Paint (loading)

LCP is the **render time of the largest content element visible in the viewport** — usually a big image, a
video's poster frame, a CSS `background-image`, or a block of text. It answers "when did the main thing
show up?"

| LCP | Rating |
| --- | ------ |
| ≤ **2.5 s** | Good |
| ≤ 4.0 s | Needs improvement |
| > 4.0 s | Poor |

### INP — Interaction to Next Paint (responsiveness)

INP measures how long the page takes to **visually respond** to a user interaction. It observes **all**
qualifying interactions during the visit — **clicks, taps, and keyboard** input (not scrolling or hover) —
and reports a value at (close to) the **worst** one. Each interaction's latency is **input delay +
processing time + presentation delay**.

| INP | Rating |
| --- | ------ |
| ≤ **200 ms** | Good |
| ≤ 500 ms | Needs improvement |
| > 500 ms | Poor |

**INP replaced First Input Delay (FID)** as a Core Web Vital on **March 12, 2024**. FID only measured the
*delay* of the *first* interaction; INP is stricter — it looks at the full latency of interactions
throughout the visit. Treat **FID as retired**.

### CLS — Cumulative Layout Shift (visual stability)

CLS measures **unexpected** movement of visible content. It's a **unitless** score: each shift counts as
*impact fraction × distance fraction*, and CLS sums the shifts within the worst **session window**. Shifts
that happen within **500 ms of a user interaction** are considered expected and don't count.

| CLS | Rating |
| --- | ------ |
| ≤ **0.1** | Good |
| ≤ 0.25 | Needs improvement |
| > 0.25 | Poor |

### The 75th percentile

A page is assessed at the **75th percentile** of real page loads (or interactions), measured **separately
for mobile and desktop**. In plain terms: **75% of visits must hit the "good" threshold**. A page has
"good Core Web Vitals" only when **all three** are in the good band at p75. Optimizing for the median (50th)
isn't enough — the goal is that the slower quarter is still acceptable.

### Related metrics that are *not* Core Web Vitals

- **First Contentful Paint (FCP)** — when *any* content first paints (good ≤ **1.8 s**). A diagnostic, not
  a Core Web Vital.
- **Time to First Byte (TTFB)** — feeds into LCP (aim under ~0.8 s), also not a Core Web Vital.
- **Total Blocking Time (TBT)** — a **lab** metric that approximates responsiveness; it's the lab proxy for
  INP.

# Key Terminology

- **Core Web Vitals (CWV)** — the three headline metrics: LCP, INP, CLS.
- **LCP** — render time of the largest content element in the viewport (loading).
- **INP** — latency of the page's interactions, near the worst one (responsiveness).
- **CLS** — a unitless score of unexpected layout movement (visual stability).
- **FID (retired)** — First Input Delay, the metric INP replaced in March 2024.
- **75th percentile (p75)** — the value 75% of visits do better than; how CWV are judged.
- **FCP / TTFB / TBT** — related metrics that are *not* Core Web Vitals.

# Options and Trade-offs

| Question | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Which metric first? | Whichever is easiest | Whichever is failing at p75 in the **field** | Fix the vital your real users actually fail, not the convenient one. |
| Measuring INP | Trust a lab tool | Use **field data** (real interactions) | INP needs real interaction; lab tools estimate it with TBT. |
| Success bar | Median (p50) is fine | Target **p75** | CWV are judged at p75, so tuning only the median leaves a quarter of users behind. |
| FID vs INP | Keep tracking FID | Track **INP** | FID is retired; INP is the current responsiveness vital. |

# Worked Example

The three vitals and their "good" bars at a glance:

```text
Metric  Measures            Good        Needs work     Poor
------  -----------------   ---------   -----------    -------
LCP     loading             <= 2.5 s     <= 4.0 s       > 4.0 s
INP     responsiveness      <= 200 ms    <= 500 ms      > 500 ms
CLS     visual stability    <= 0.1       <= 0.25        > 0.25

All judged at the 75th percentile of real visits, mobile and desktop separately.
"Good Core Web Vitals" = all three in the good band at p75.
```

You can watch LCP being reported in the browser using the built-in Performance API:

```javascript
// The browser reports LCP "candidates" as bigger content appears; the last one wins.
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lcp = entries[entries.length - 1];
  console.log('LCP candidate at', Math.round(lcp.startTime), 'ms:', lcp.element);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

For real projects, the **web-vitals** JavaScript library is the recommended way to capture the *final* LCP,
INP, and CLS values correctly and send them to analytics (covered in the monitoring lesson).

# Real World Analogy

Think of a **restaurant review with three scores**. **LCP** is how long until your main dish actually
arrives — the thing you came for. **INP** is how quickly a server reacts when you wave for something: a
snappy place responds at once, a slow one leaves your hand in the air. **CLS** is whether the table is
stable: a good restaurant's table stays put, while a bad one wobbles and your glass slides just as you
reach for it. A great meal needs all three — and the review reflects the *typical rough night* (the 75th
percentile), not the one perfect evening.

# Examples

## Example 1 — Basic: which element is the LCP?

On a typical article page the LCP element is often the **hero image** or the large **headline** — whichever
covers the most of the viewport when it renders. On a text-only page it might be the first big paragraph
block. Identifying it tells you exactly what to make load faster.

**Why this matters:** you can't optimize LCP until you know *which* element it is; DevTools and web-vitals
both report it.

## Example 2 — Real-world: good LCP, bad INP

A shop's product page shows its hero fast (**LCP 2.1 s — good**) but a heavy JavaScript bundle keeps the
main thread busy, so tapping "Add to cart" takes 400 ms to visibly respond (**INP 400 ms — needs
improvement**). The page *looks* fast but *feels* sluggish. LCP and INP are independent — passing one
doesn't pass the other.

**Why this matters:** the vitals cover different phases; a page must satisfy each one on its own.

## Example 3 — Pitfall: chasing a lab score, still failing in the field

A team celebrates a great Lighthouse score, but Lighthouse's lab run **doesn't measure INP** (it uses TBT
as a proxy), and real users on phones hit slow interactions. Field data shows INP failing at p75.

**Why this bites:** a lab score is an estimate; responsiveness (INP) must be confirmed with real interaction
data.

# Common Mistakes

- **Calling FID a current Core Web Vital.** It was retired in March 2024 and replaced by **INP**.
- **Adding units to CLS.** CLS is **unitless** — it's a score, not milliseconds or pixels.
- **Optimizing for the median.** CWV are assessed at the **75th percentile**.
- **Assuming a good lab score means good vitals.** Lab tools don't measure INP directly; confirm in the
  field.

# Best Practices

- Memorize the three good bars: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1** at p75.
- Track **all three** — fixing loading doesn't fix responsiveness or stability.
- Use **field data** for INP and CLS; use lab tools to *debug*.
- Judge success at **p75**, mobile and desktop separately.

# Summary

- The three **Core Web Vitals** are **LCP** (loading), **INP** (responsiveness), and **CLS** (visual
  stability).
- Good thresholds: **LCP ≤ 2.5 s**, **INP ≤ 200 ms**, **CLS ≤ 0.1** — at the **75th percentile**, per
  device.
- **INP replaced FID** in March 2024; FID is retired.
- **CLS is unitless**; **FCP** and **TTFB** are related but **not** Core Web Vitals.
- A page has "good Core Web Vitals" only when **all three** pass at p75.

# Flash Cards

Q: What are the three Core Web Vitals and what does each measure?
A: LCP (Largest Contentful Paint) measures loading, INP (Interaction to Next Paint) measures responsiveness, and CLS (Cumulative Layout Shift) measures visual stability.

Q: What are the "good" thresholds for LCP, INP, and CLS?
A: LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1 — each measured at the 75th percentile of real visits.

Q: Which metric replaced FID as a Core Web Vital, and when?
A: INP (Interaction to Next Paint) replaced First Input Delay on March 12, 2024. FID is retired.

Q: At what percentile are Core Web Vitals assessed, and why does it matter?
A: The 75th percentile (mobile and desktop separately) — so 75% of visits must meet the threshold; optimizing only the median leaves a quarter of users behind.

Q: What does CLS's value represent, and what are its units?
A: It's the sum of unexpected layout shift scores in the worst session window — impact fraction × distance fraction. It is unitless (not seconds or pixels).

Q: Are FCP and TTFB Core Web Vitals?
A: No. They're useful related metrics (FCP good ≤ 1.8 s; TTFB feeds LCP), but the Core Web Vitals are only LCP, INP, and CLS.

# Exercises

### Easy
Write down the three Core Web Vitals, what each measures, and its "good" threshold from memory. Then check
yourself against the table in this lesson.

### Medium
Open a page and paste the LCP `PerformanceObserver` snippet into the console. Note the LCP time and which
element it reports. Reload and see whether the LCP element changes as content loads.

### Challenging
Find a page's Core Web Vitals field data (e.g. via PageSpeed Insights, covered next lesson). It reports p75
values. For each vital, state whether the page is good/needs-improvement/poor, and which single vital you'd
prioritize and why.

# Further Reading

- web.dev — *Web Vitals*: <https://web.dev/articles/vitals>
- web.dev — *Largest Contentful Paint (LCP)*: <https://web.dev/articles/lcp>
- web.dev — *Interaction to Next Paint (INP)*: <https://web.dev/articles/inp>
- web.dev — *Cumulative Layout Shift (CLS)*: <https://web.dev/articles/cls>
