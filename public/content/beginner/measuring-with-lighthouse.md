---
id: lesson-06
slug: measuring-with-lighthouse
title: "Measuring with Lighthouse"
level: beginner
order: 6
duration: 18
tags:
  - lighthouse
  - performance-score
  - tbt
  - audits
  - throttling
summary: "How to run Lighthouse and read its performance report — the five lab metrics and their weights, the 0–100 score bands, opportunities versus diagnostics, simulated throttling, and why the score is a debugging aid, not the goal."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Run **Lighthouse** three ways: DevTools, the CLI, and PageSpeed Insights.
- Name the **five metrics** in the performance score and their **weights** (as of writing).
- Read the **score bands** and the **Opportunities / Diagnostics** sections.
- Explain **simulated throttling** and the mobile vs desktop configuration.
- Explain why the **score is a means, not the end** — and why a 100 doesn't guarantee good field vitals.

# Why It Matters

Lighthouse is the performance tool most developers reach for first. But a single number invites bad habits:
chasing a green score without knowing *which metric* drives it, or "optimizing" in ways that help the lab
score yet hurt real users. Reading the report properly — what's weighted heavily, what's an estimate, what
throttling was applied — turns Lighthouse from a vanity number into a genuine diagnostic.

# Concept Explanation

### What Lighthouse is and how to run it

**Lighthouse** is an open-source tool that audits a page across categories — **Performance**, Accessibility,
Best Practices, SEO — and reports scores and specific findings. For performance you can run it:

- In **Chrome DevTools** → the **Lighthouse** tab → "Analyze page load."
- From the **command line**: `npx lighthouse <url>`.
- Via **PageSpeed Insights**, which runs Lighthouse for you on Google's servers (and also shows CrUX field
  data).

By default it emulates a **mid-tier mobile device** and applies **simulated throttling** (a slower CPU and
network) so results reflect a typical phone, not your fast machine. You can switch to a desktop
configuration.

### The performance score is a weighted average

The **performance score (0–100)** is a weighted average of five **lab** metrics. As of writing (Lighthouse
10/11), the weights are:

```text
Metric                          Weight
------------------------------  ------
First Contentful Paint (FCP)     10%
Speed Index (SI)                 10%
Largest Contentful Paint (LCP)   25%
Total Blocking Time (TBT)        30%   <- the biggest single weight
Cumulative Layout Shift (CLS)    25%
------------------------------  ------
                                100%
```

Weights **change between Lighthouse versions**, so always check the current scoring docs and say "as of
writing." Notice **TBT carries the most weight** — it's the lab **proxy for responsiveness (INP)**, so heavy
JavaScript that blocks the main thread hurts the score hard. Each metric is scored 0–100 against a
log-normal curve built from real-site data, then combined.

### Score bands

```text
0–49    Red     (poor)
50–89   Orange  (needs improvement)
90–100  Green   (good)
```

### Opportunities, Diagnostics, and passed audits

Below the metrics, the report lists:

- **Opportunities** — suggested fixes with an **estimated** time saving (e.g. "properly size images"). The
  savings are *estimates*, not guarantees.
- **Diagnostics** — extra information about the page (main-thread work, DOM size, third-party cost).
- **Passed audits** — what you're already doing well.

Use these to find *where* to look, then confirm real improvements with metrics and field data.

### The score is not the goal

Two honesty rules. First, Lighthouse is **lab** data — it does **not measure INP** (it uses TBT). Second, a
perfect **100 does not guarantee good field Core Web Vitals**, because your real users differ from the test
profile. Chase the **metric that reflects user pain**, not the number itself — and never "optimize" in a way
that helps the lab score but harms real users.

# Key Terminology

- **Lighthouse** — an automated auditing tool (performance, a11y, best practices, SEO).
- **Performance score** — a 0–100 weighted average of five lab metrics.
- **Total Blocking Time (TBT)** — lab metric for main-thread blocking; the proxy for INP.
- **Speed Index** — how quickly the visible page fills in during load.
- **Simulated throttling** — Lighthouse's default: emulate a slower CPU/network to mimic mobile.
- **Opportunities / Diagnostics** — suggested fixes (with estimated savings) and supporting info.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| How to run | DevTools (interactive) | CLI / CI (automatable) | DevTools to explore; CLI in CI to block regressions. |
| Config | Mobile (default) | Desktop | Test mobile first — it's the harder, more representative case. |
| Reading results | Chase the overall score | Fix the heaviest-weighted failing metric | Target TBT/LCP/CLS by weight and user impact, not the round number. |
| Score vs field | Trust the 100 | Confirm with CrUX/RUM | The score is lab; verify real UX (especially INP) in the field. |

# Worked Example

A trimmed Lighthouse performance report and how to read it:

```text
Performance score: 74  (orange / needs improvement)

  Metric                         Value     Rough contribution
  First Contentful Paint          1.4 s     good
  Speed Index                     3.1 s     ok
  Largest Contentful Paint        3.9 s     weak   (25% weight)
  Total Blocking Time             520 ms    poor   (30% weight)  <- hurting the score most
  Cumulative Layout Shift         0.02      good

  Opportunities
    - Reduce unused JavaScript ......... est. -0.7 s
    - Properly size images ............. est. -0.4 s
  Diagnostics
    - Minimize main-thread work ........ 3.8 s
    - Reduce third-party impact ........ 1.2 s

Read it: TBT (30% weight) and LCP (25%) are dragging the score. The Opportunities point at
too much JavaScript and oversized images. Fix those, re-run, and confirm INP in the field —
don't just watch the 74 tick upward.
```

# Real World Analogy

Lighthouse is like a **car's inspection report**. It runs a standard checklist on a standard rig and prints
a score with notes ("brake pads worn," "tire pressure low"). That's genuinely useful for finding problems —
but the number on the sheet isn't the point; how the car drives on real roads (the field) is. And you'd
never "pass inspection" by disabling the warning light — the equivalent of gaming the score while the real
experience gets worse.

# Examples

## Example 1 — Basic: a repeatable run in DevTools

```bash
# CLI equivalent of the DevTools Lighthouse tab, mobile by default:
npx lighthouse https://example.com --view
# Desktop preset:
npx lighthouse https://example.com --preset=desktop --view
```

**Why this works:** you get the same audit interactively (DevTools) or automatably (CLI), with the throttling
and device clearly stated in the report.

## Example 2 — Real-world: TBT dominates the score

A team's score is stuck at 70 despite a fast LCP. Because **TBT is weighted 30%**, their large JavaScript
bundle — which blocks the main thread — is the biggest drag. Code-splitting and deferring non-critical
scripts lifts both TBT (lab) and INP (field).

**Why this matters:** knowing the weights tells you the highest-leverage fix; here it's main-thread
JavaScript, not images.

## Example 3 — Pitfall: gaming the score, hurting users

To make an "unsized image" warning disappear, someone adds `loading="lazy"` to *every* image — including the
LCP hero. The lab score nudges up, but real **LCP gets worse** because the most important image now loads
late.

**Why this bites:** optimizing for the audit instead of the user can regress the real metric. Never
lazy-load the LCP image.

# Common Mistakes

- **Chasing 100.** The score is a proxy; a 100 doesn't guarantee good field vitals.
- **Ignoring the weights.** Not knowing TBT is 30% means missing the highest-leverage fix.
- **Treating "estimated savings" as guaranteed.** Opportunities are estimates; verify after fixing.
- **Comparing runs under different conditions.** Different throttling/device makes scores incomparable.

# Best Practices

- Run **mobile** first with default throttling; keep conditions consistent across runs.
- Read the **metrics and weights**, not just the number; fix the heaviest failing metric.
- Use **Opportunities/Diagnostics** to locate causes, then confirm the metric actually moved.
- Automate Lighthouse in **CI** to catch regressions, and confirm **INP** in the **field**.

# Summary

- **Lighthouse** runs from DevTools, the CLI, or PageSpeed Insights, emulating a throttled mobile device by
  default.
- The performance score is a weighted average: as of writing, **FCP 10 · SI 10 · LCP 25 · TBT 30 · CLS 25**.
- Bands: **0–49 red, 50–89 orange, 90–100 green**; weights vary by version.
- **Opportunities** (estimated savings) and **Diagnostics** point you to causes.
- It's **lab** data (no INP; TBT is the proxy) — a **100 isn't a guarantee**; fix the metric, not the number.

# Flash Cards

Q: What five metrics make up the Lighthouse performance score, and which is weighted most (as of writing)?
A: FCP (10%), Speed Index (10%), LCP (25%), Total Blocking Time (30%), and CLS (25%). TBT carries the most weight and is the lab proxy for INP.

Q: What are the Lighthouse score bands?
A: 0–49 is red (poor), 50–89 is orange (needs improvement), and 90–100 is green (good).

Q: What does Lighthouse do by default about device and network?
A: It emulates a mid-tier mobile device and applies simulated throttling (slower CPU and network) so results reflect a typical phone rather than your fast machine.

Q: What's the difference between Opportunities and Diagnostics in the report?
A: Opportunities are suggested fixes with estimated savings; Diagnostics are supporting information (like main-thread work or third-party cost). Savings are estimates, not guarantees.

Q: Why doesn't a Lighthouse score of 100 guarantee good Core Web Vitals?
A: Lighthouse is a lab test on one profile and doesn't measure INP (it uses TBT); real users differ, so field data must confirm the experience.

Q: Why is it a mistake to lazy-load every image to clear a Lighthouse warning?
A: If you lazy-load the LCP image, it loads late and real LCP gets worse — you'd be gaming the audit while hurting the user-facing metric.

# Exercises

### Easy
Run Lighthouse (DevTools or `npx lighthouse`) on a site. Note the overall score and each of the five
metrics. Which metric is furthest from "good"?

### Medium
Run the same page as **mobile** and then **desktop**. Compare the scores and TBT. Explain why the mobile
run is usually harsher.

### Challenging
Take a report where TBT is high. Using the Opportunities and Diagnostics, list the two changes you'd try
first (with reasoning based on the metric weights), predict the effect, then re-run to check whether your
prediction held.

# Further Reading

- Chrome for Developers — *Lighthouse performance scoring*: <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring>
- web.dev — *Total Blocking Time (TBT)*: <https://web.dev/articles/tbt>
- Chrome for Developers — *Get started with Lighthouse in DevTools*: <https://developer.chrome.com/docs/lighthouse/overview>
- web.dev — *Speed Index*: <https://web.dev/articles/speed-index>
