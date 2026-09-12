---
id: lesson-24
slug: performance-audit-capstone
title: "Capstone: Auditing and Optimizing a Page"
level: advanced
order: 24
duration: 24
tags:
  - capstone
  - audit
  - workflow
  - core-web-vitals
  - optimization
summary: "A repeatable end-to-end workflow that ties the whole course together — set goals, measure field then lab, triage by user impact, fix across every layer (critical path, LCP/CLS/INP, assets, JavaScript, architecture), verify, and guard with a budget and monitoring."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Run a **full performance audit** using a repeatable workflow.
- **Triage** findings by user impact and fix the **biggest bottleneck first**.
- Apply the right fix from each earlier lesson to the right problem.
- **Verify** improvements in lab and confirm them in the field.
- **Guard** the result with a budget in CI and ongoing monitoring.

# Why It Matters

You now know the individual techniques. Real optimization is knowing **which one to apply, in what order, on
a given page** — and proving it worked. This capstone turns the course into a process you can repeat on any
site: measure, diagnose, fix the highest-impact problem, verify, and lock in the win so it doesn't regress.

# Concept Explanation

### The audit workflow

```text
1. Goals    -> 2. Measure -> 3. Triage -> 4. Fix (biggest first) -> 5. Verify -> 6. Guard
   (budget)     (field,        (rank by     (right fix per            (lab before/    (CI budget
                then lab)       impact)       finding)                 after; field)   + RUM)
```

### 1. Set goals and a budget

Start from the **Core Web Vitals "good" bars** — **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1** at mobile **p75** —
plus quantity budgets (e.g. JS ≤ ~170 KB). Decide **who** you're optimizing for (a realistic mid-range phone
on a mobile network), as in Lessons 1 and 8.

### 2. Measure — field first, then lab

Look at **field data** (CrUX / your RUM) to see what real users actually hit at p75, segmented by device and
route. Then use **lab** tools (Lighthouse, the DevTools Performance and Network panels) to **reproduce and
diagnose** the causes. Field tells you *what* and *how bad*; lab tells you *why* (Lessons 5–7).

### 3. Triage by impact

Rank problems by **user impact × reach**, not by how easy they are. A failing **LCP** or **INP** at p75 on
your most-visited template beats a 5 KB saving on an obscure page. Fix the **biggest bottleneck first**, then
re-measure — the bottleneck often moves.

### 4. Fix across the layers

Map each finding to the technique that addresses it:

```text
Finding                                  Fix (lesson)
--------------------------------------   ------------------------------------------------------
Slow TTFB / far origin                   CDN, caching, preconnect                         (2, 14, 20)
Render-blocking CSS/JS delays paint      Inline critical CSS, defer/async JS              (3, 16)
LCP image discovered late / low priority Put in HTML, preload, fetchpriority=high         (9, 19)
LCP image too big                        AVIF/WebP, responsive srcset, compress           (12, 15)
Content jumps (CLS)                      Dimensions, reserved space, font metrics         (10, 13)
Sluggish taps (INP)                      Break up long tasks, less JS, yield              (11, 17, 18)
Too much JavaScript                      Code-split, tree-shake, drop polyfills           (17)
Fonts blocking/shifting text             WOFF2, subset, font-display, preload             (13)
Repeat visits re-download everything     Fingerprint + immutable, no-cache HTML           (14)
Text assets uncompressed                 Brotli/gzip + minify                             (15)
Empty shell / heavy hydration            Reconsider rendering strategy                    (21, 22)
```

### 5. Verify

Re-run the **lab** test to confirm a **before/after** improvement in the metric you targeted (compare medians
of several runs, not one). Then watch the **field** data over the following days/weeks to confirm real users
benefited — lab and field must agree over time (Lessons 5–6).

### 6. Guard against regression

Lock in the win: add or tighten a **performance budget** enforced by **Lighthouse CI** (Lesson 8) and keep
**RUM** running with alerts (Lesson 23). Otherwise the next feature quietly erases your gains.

# Key Terminology

- **Audit** — a structured pass to find and prioritize performance problems.
- **Triage** — ranking issues by user impact so you fix the most important first.
- **Bottleneck** — the current biggest limiter of a metric; fix it, then re-measure.
- **Before/after** — comparing a metric across a change to prove the effect.
- **Regression guard** — a CI budget + monitoring that keeps a fix from being undone.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Where to start | Easiest fix | **Biggest-impact** fix | Prioritize by user impact × reach; re-measure since the bottleneck moves. |
| What to trust | A single lab score | **Field p75**, lab to diagnose | Judge with field; use lab to find causes and iterate fast. |
| Quick wins vs architecture | Only quick wins | Quick wins **and** architecture | Ship quick wins now; plan bigger changes (rendering strategy, CDN) when they're the real ceiling. |
| Done? | Metrics look good once | Good **and** guarded | Add a budget + monitoring, or the win regresses. |

# Worked Example

An end-to-end audit of a fictional `shop.example.com` product page:

```text
1. GOALS:  mobile p75 LCP <= 2.5s, INP <= 200ms, CLS <= 0.1; JS <= 170KB.

2. MEASURE:
   Field (CrUX p75, mobile):  LCP 4.3s (poor), INP 260ms (needs work), CLS 0.05 (good)
   Lab (Lighthouse, throttled): score 62; render-blocking CSS + a 2.1MB hero PNG;
                                TBT 480ms from a 340KB JS bundle; hero is a CSS background.

3. TRIAGE (by impact):
   #1 LCP (poor, affects everyone)   #2 INP (needs work)   CLS already good.

4. FIX (biggest first):
   LCP:  - convert hero PNG -> AVIF/WebP, responsive srcset            (12, 15)
         - move hero from CSS background to <img> in HTML, preload,
           fetchpriority=high (was discovered late)                    (9, 19)
         - inline critical CSS, load the rest async                    (16)
         - serve assets via CDN, immutable caching                     (14, 20)
   INP:  - code-split the 340KB bundle; defer non-critical JS          (16, 17)
         - break up the long task in the "add to cart" handler; yield  (11, 18)

5. VERIFY:
   Lab re-run: score 94; LCP 2.2s; TBT 150ms. (median of 3 runs)

6. GUARD:
   Lighthouse CI budget: LCP <= 2500ms, script <= 170KB -> fails the PR if exceeded.
   RUM (web-vitals) keeps reporting p75 by device; confirm CrUX recovers over ~4 weeks.
```

Notice the order: the **poor LCP** with the widest reach came first, each finding mapped to a specific
technique, and the result was **verified and guarded** — not just changed and hoped.

# Real World Analogy

A performance audit is a **doctor's full workup**. You take the patient's **vitals** from daily life (field
RUM), run **controlled tests** to find the cause (lab), and **diagnose**. You treat the **most serious issue
first** (triage), not the easiest, using the right treatment for each problem. Then you **follow up** to
confirm the patient improved (verify) and set up **regular check-ups** so it doesn't recur (budget +
monitoring). One symptom-driven guess without tests — or no follow-up — is how problems get missed.

# Examples

## Example 1 — Basic: one high-impact fix

A site's only real problem was a 3 MB hero PNG that was the LCP element. Converting it to a responsive AVIF and
preloading it dropped LCP from 4.5 s to 2.3 s — one targeted fix, measured before and after, no scattershot
changes.

**Why this works:** it attacked the single biggest bottleneck for the metric that was failing.

## Example 2 — Real-world: the ordered plan

The `shop.example.com` audit above shows the full loop: measure field + lab, triage LCP over INP by impact,
apply the mapped fixes, verify a 62 → 94 lab jump and confirm the field, then guard with a CI budget. Each
change was deliberate and traceable to a finding.

**Why this works:** a process — not a checklist run top-to-bottom — fixes the right things in the right order
and proves it.

## Example 3 — Pitfall: micro-optimizing without measuring

A developer spent a day shaving a few KB off a rarely-used script and "optimizing" a fast function, while the
actual bottleneck — a render-blocking font and a huge hero — went untouched. The metrics barely moved.

**Why this bites:** effort not guided by measurement and triage lands on things that don't matter to users.

# Common Mistakes

- **Optimizing without measuring**, so effort misses the real bottleneck.
- **Fixing the easy thing** instead of the highest-impact one.
- **Not verifying** — assuming a change helped without a before/after.
- **Skipping the guard** — a budget and monitoring, so the win regresses.

# Best Practices

- Follow the loop: **goals → measure (field then lab) → triage → fix biggest → verify → guard.**
- **Prioritize by user impact × reach**; re-measure after each fix (the bottleneck moves).
- Map each **finding to the specific technique** from the course, across all layers.
- **Verify** in lab and confirm in the field; then **lock it in** with a CI budget and RUM.

# Summary

- Real optimization is a **repeatable workflow**, not a checklist: goals → measure → triage → fix → verify →
  guard.
- Measure **field first** (what/how bad), then **lab** (why); fix the **biggest-impact** bottleneck first.
- Map each **finding** to the right technique — critical path, LCP/CLS/INP, images, fonts, caching,
  compression, JavaScript, protocol/CDN, rendering strategy.
- **Verify** before/after in lab and confirm in the field.
- **Guard** the result with a **performance budget in CI** and ongoing **RUM** — congratulations, that's the
  whole course applied end to end.

# Flash Cards

Q: What are the six steps of the audit workflow?
A: Set goals/budget, measure (field then lab), triage by impact, fix the biggest bottleneck first, verify (before/after in lab and confirm in field), and guard with a CI budget plus monitoring.

Q: Why measure field data before lab data in an audit?
A: Field data (p75, segmented) tells you what real users actually experience and how bad it is; lab tools are then used to reproduce and diagnose the cause. Field says what, lab says why.

Q: How should you decide what to fix first?
A: By user impact × reach — the failing vital on your most-used template beats an easy saving on a minor page. Fix the biggest bottleneck, then re-measure because it moves.

Q: After making a change, how do you know it worked?
A: Verify a before/after in the lab (median of several runs, not one), then confirm the improvement in the field over the following days/weeks — lab and field should agree over time.

Q: Why isn't the audit finished once the metrics look good?
A: Without a regression guard — a performance budget in CI plus ongoing RUM — the next feature or third-party script can quietly erase the gains.

Q: Give an example of mapping a finding to a fix.
A: A late-discovered, oversized LCP image → move it to an <img> in the HTML, preload it with fetchpriority=high, and serve it as a responsive AVIF/WebP (Lessons 9, 12, 19).

# Exercises

### Easy
Pick a real page and run the first two steps: write its goals (CWV good bars, mobile p75) and gather its field
(PageSpeed Insights) and lab (Lighthouse) numbers. Which vital is worst?

### Medium
For that page, triage: list the top three issues ranked by user impact, and map each to the specific technique
(and lesson) that addresses it. Which would you do first, and why?

### Challenging
Do a full mini-audit end to end: measure, fix the single biggest bottleneck, verify a before/after in a
throttled Lighthouse run, and write the performance budget (metric + JS bytes) you'd enforce in CI to keep the
improvement from regressing.

# Further Reading

- web.dev — *Learn Performance* (the full course): <https://web.dev/learn/performance>
- web.dev — *Optimize LCP / CLS / INP*: <https://web.dev/explore/learn-core-web-vitals>
- Chrome for Developers — *Analyze runtime performance (DevTools)*: <https://developer.chrome.com/docs/devtools/performance>
- web.dev — *Fast load times* (techniques index): <https://web.dev/explore/fast-load-times>
