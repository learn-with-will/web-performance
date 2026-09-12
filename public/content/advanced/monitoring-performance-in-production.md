---
id: lesson-23
slug: monitoring-performance-in-production
title: "Monitoring Performance in Production"
level: advanced
order: 23
duration: 19
tags:
  - rum
  - web-vitals
  - monitoring
  - ci
  - crux
summary: "Keeping a site fast over time — collecting real-user field data with the web-vitals library, using CrUX for context, segmenting by device and route, adding attribution to debug, and gating regressions with Lighthouse CI so performance doesn't quietly decay."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Collect **field data (RUM)** with the **web-vitals** library and report it.
- Use **CrUX** for population context and know its limits.
- **Segment** metrics by device, connection, and route to find hidden problems.
- Use **attribution** to turn a slow metric into an actionable cause.
- Gate **regressions** with **Lighthouse CI** and a performance budget.

# Why It Matters

Performance is never "done." Code, content, and third parties change; a fast launch quietly decays. And your
own device tells you almost nothing about the person on a three-year-old phone. **Continuous monitoring** —
real-user field data plus a CI gate — is how you keep the promise you made at launch, catch regressions early,
and fix the *right* thing based on evidence rather than guesswork.

# Concept Explanation

### Real-user monitoring with the web-vitals library

The **web-vitals** JavaScript library measures the Core Web Vitals (and FCP/TTFB) in **real sessions** and
calls you back with each final value. You send those to your analytics endpoint:

```javascript
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics(metric) {
  // metric: { name, value, rating, id, ... }. Use sendBeacon so it survives the page unloading.
  const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, id: metric.id });
  (navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
    fetch('/analytics', { body, method: 'POST', keepalive: true });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

These callbacks fire when a metric is **final** (for example, INP and CLS finalize as the page is hidden/
unloaded), which is why `sendBeacon`/`keepalive` matters — a normal request might be cancelled on unload.

### CrUX for context (and its limits)

**CrUX (Chrome UX Report)** gives you the **p75 field** numbers for many origins/pages, powering PageSpeed
Insights and the page-experience assessment. It's great for **benchmarking** and trends — but it's
**Chrome-only**, a **28-day rolling** window (so it lags), and only covers pages with **enough traffic**. Your
own **RUM** fills those gaps: every page, every browser, in real time, sliced how you like.

### Segment, don't average

A healthy **overall p75** can hide a broken segment. Slice your RUM by **device type** (low-end Android vs
desktop), **connection**, **country**, and **route/template**. A metric that's fine on average may be **poor**
for the group you most need to serve. Always reason in **percentiles** (p75/p95), never averages — averages
hide the slow tail.

### Attribution turns numbers into fixes

Knowing "INP is 400 ms at p75" isn't actionable on its own. The web-vitals **attribution** build adds the
*why*: the **LCP element**, the element behind the largest **layout shift**, or the **interaction target** and
phase driving INP. That's what lets you jump from "it's slow" to "this handler on this button is the problem."

### Gate regressions with CI

Field data tells you what already shipped; **Lighthouse CI** in your pipeline catches lab regressions **before**
they ship, asserting the **performance budget** from Lesson 8 (fail the build if LCP or a byte limit is
exceeded). Together they form a loop: **CI blocks regressions → field data confirms real impact → attribution
guides fixes.**

```bash
# Run Lighthouse CI in the pipeline; it asserts your budget and fails on a breach.
npx @lhci/cli autorun
```

# Key Terminology

- **RUM (Real User Monitoring)** — measuring performance from real users' sessions.
- **web-vitals** — the JS library that measures LCP/INP/CLS (and FCP/TTFB) in the field.
- **`navigator.sendBeacon`** — reliably sends analytics data as the page unloads.
- **CrUX** — Google's public p75 field dataset (Chrome-only, 28-day, traffic-gated).
- **Attribution** — extra detail on *why* a metric was slow (element, target, phase).
- **Lighthouse CI** — runs Lighthouse in the pipeline to assert budgets and catch regressions.

# Options and Trade-offs

| Question | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Field source | CrUX only | CrUX + own RUM | Own RUM covers every page/browser and custom segments; CrUX gives public benchmarks. |
| Reporting | Sample a fraction | Report all sessions | Sample high-traffic sites to control cost; report all when volume is low. |
| Reasoning | Averages | **Percentiles + segments** | Percentiles and segments reveal the slow tail that averages hide. |
| Regressions | Manual checks | **Lighthouse CI** budget gate | Automate the gate so regressions fail a PR, not production. |

# Worked Example

The full monitoring loop for a team:

```text
1. RUM: web-vitals reports LCP/INP/CLS from real users to /analytics (sendBeacon).
2. Dashboard: view p75 by route and device type (not averages).
   -> INP is good overall, but POOR on low-end Android for the product page.
3. Attribution: the web-vitals attribution build names the interaction target
   -> the "Add to cart" handler runs a long task on tap.
4. Fix: break up / defer that handler's work (Lesson 11).
5. Guard: a Lighthouse CI budget (TBT + JS bytes) fails any PR that regresses it.
6. Confirm: field p75 for that segment recovers over the next weeks in CrUX/RUM.
```

Every step is evidence-driven: the field found it, attribution explained it, CI prevents its return, and the
field confirms the fix.

# Real World Analogy

Monitoring is a **fitness tracker for your site**. **RUM** is the continuous heart-rate and step data from your
actual daily activity — the real story, not a one-off. **CrUX** is the **population benchmark** that tells you
how you compare to others. **Attribution** is the tracker flagging *which* activity spiked your heart rate.
And **CI** is the **pre-flight checkup before each change** — you don't wait for a heart attack (a production
incident) to notice a problem. One annual physical (a launch-day Lighthouse score) isn't enough; you watch the
**trend**.

# Examples

## Example 1 — Basic: wire up field reporting

Adding the web-vitals snippet and a small `/analytics` endpoint gives you real LCP/INP/CLS from actual visits
within days — the ground truth your lab runs only approximate.

**Why this works:** you finally see what real users experience, across the devices and networks you don't own.

## Example 2 — Real-world: a segment hides a failure

A dashboard's INP looked "good" at the overall p75, but segmenting by device revealed it was **poor on low-end
Android**. Attribution pointed at one heavy interaction handler; fixing it lifted the failing segment without
touching the already-fine desktop experience.

**Why this works:** segmentation surfaced a real failure that the blended number masked.

## Example 3 — Pitfall: a launch-day score, then silence

A team hit Lighthouse 95 at launch and stopped watching. Months later, added marketing scripts had pushed
field LCP into "poor," but with no monitoring nobody noticed until users complained.

**Why this bites:** performance decays; a single launch score with no ongoing field monitoring or CI gate lets
regressions ship unseen.

# Common Mistakes

- **Measuring once at launch** and never watching the field again.
- **Reasoning with averages** instead of percentiles and segments, hiding the slow tail.
- **Relying only on CrUX**, missing low-traffic pages, non-Chrome users, and recent changes.
- **No CI gate**, so regressions ship and are only caught by users.

# Best Practices

- Collect **RUM** with **web-vitals**, reporting via **`sendBeacon`**; keep the **attribution** detail.
- Judge with **percentiles (p75)** and **segment** by device/connection/route.
- Use **CrUX** for benchmarks and trends, but rely on **your own RUM** for coverage.
- Gate regressions with **Lighthouse CI** and a **budget**; close the measure → fix → confirm loop.

# Summary

- Performance **decays**; keep watching with **real-user monitoring**, not just launch-day lab runs.
- The **web-vitals** library measures LCP/INP/CLS in the field; report with **`sendBeacon`**.
- **CrUX** gives p75 benchmarks (Chrome-only, 28-day, traffic-gated); **your RUM** fills the gaps.
- **Segment** and use **percentiles** — averages hide broken groups; **attribution** explains the cause.
- Gate regressions with **Lighthouse CI + a budget**, forming a measure → fix → confirm loop.

# Flash Cards

Q: What does the web-vitals library do, and how should you send its data?
A: It measures the Core Web Vitals (LCP/INP/CLS, plus FCP/TTFB) in real user sessions and calls back with final values; send them with `navigator.sendBeacon` (or `fetch` with `keepalive`) so the report survives the page unloading.

Q: What are CrUX's main limitations?
A: It's Chrome-only, a 28-day rolling window (so it lags recent changes), reports at p75, and only covers pages with enough traffic — so your own RUM is needed for full coverage.

Q: Why segment metrics instead of looking only at the overall p75?
A: A healthy overall number can hide a badly failing segment (e.g. low-end Android or a specific route); segmentation reveals the group that's actually suffering.

Q: What does "attribution" add to field metrics?
A: The cause — the LCP element, the element behind the largest layout shift, or the interaction target/phase driving INP — turning "it's slow" into "this specific thing is the problem."

Q: What role does Lighthouse CI play in monitoring?
A: It runs in the pipeline to catch lab regressions before they ship, asserting a performance budget so a PR that exceeds a limit fails the build.

Q: Why isn't a single launch-day Lighthouse score enough?
A: Performance decays as code, content, and third parties change; without ongoing field monitoring and a CI gate, regressions ship unnoticed until users complain.

# Exercises

### Easy
Add the web-vitals snippet to a page (log to the console instead of a server). Interact with the page, then
background it — observe the LCP, INP, and CLS values reported.

### Medium
Take a set of (real or made-up) RUM values and compute the p75. Then split them by device type and compute p75
per group. Does a segment fail even though the overall number passes?

### Challenging
Design a monitoring plan for a production app: what you'd collect with RUM (and how you'd report it), which
segments you'd track, which CrUX metrics you'd benchmark, and the Lighthouse CI budget you'd enforce to close
the loop.

# Further Reading

- web.dev — *The web-vitals JavaScript library*: <https://github.com/GoogleChrome/web-vitals>
- web.dev — *Debug performance in the field (attribution)*: <https://web.dev/articles/debug-performance-in-the-field>
- Chrome for Developers — *CrUX*: <https://developer.chrome.com/docs/crux>
- web.dev — *Measure and monitor performance*: <https://web.dev/learn/performance/monitor-your-performance>
