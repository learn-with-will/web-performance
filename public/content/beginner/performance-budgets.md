---
id: lesson-08
slug: performance-budgets
title: "Setting Goals and Performance Budgets"
level: beginner
order: 8
duration: 16
tags:
  - performance-budget
  - goals
  - ci
  - bundle-size
  - regression
summary: "Turning performance into an enforceable target with performance budgets — metric budgets tied to Core Web Vitals, quantity budgets for bytes and requests, how to set realistic limits, and how to enforce them automatically in CI so speed doesn't decay."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define a **performance budget** and why it matters.
- Distinguish **metric**, **quantity/resource**, and **rule/score** budgets.
- Set **realistic** budgets anchored to Core Web Vitals and your current numbers.
- Enforce budgets automatically in **CI** so regressions fail the build.
- Use the budget as a **decision tool** for "is this feature worth its cost?"

# Why It Matters

Performance decays quietly. Every sprint adds a feature, a script, a font, a tracker — each small, none the
obvious culprit — until the site is slow and nobody can say when it happened. A **performance budget** turns
speed into an explicit, shared limit that a build can enforce, so regressions get caught in a pull request
instead of in production weeks later. It's how good teams keep a fast site fast.

# Concept Explanation

### What a performance budget is

A **performance budget** is a limit you agree not to exceed — a line in the sand for how slow or how heavy
the site may get. Like a financial budget, it forces trade-offs: if adding a feature would blow the budget,
you either optimize elsewhere or decide it isn't worth it.

### Three kinds of budget

- **Metric budgets** — limits on user-centric timings, ideally the Core Web Vitals: e.g. **LCP ≤ 2.5 s** and
  **INP ≤ 200 ms** at mobile p75, **CLS ≤ 0.1**, or a **TTFB** ceiling. These map directly to user
  experience.
- **Quantity / resource budgets** — limits on what you ship: **total JavaScript ≤ 170 KB compressed**,
  **images ≤ 500 KB**, **≤ 50 requests**, **≤ 2 web fonts**. Bytes and request counts are easy to measure
  and to enforce in a build.
- **Rule / score budgets** — a minimum tool score, e.g. **Lighthouse Performance ≥ 90**. Simple to state,
  but remember it's a lab proxy.

The most robust setups combine them: a metric budget for the outcome and a quantity budget for the inputs
(because bytes are what you control directly in a PR).

### Setting realistic numbers

Start from the **Core Web Vitals "good" thresholds**, then look at your **current** field numbers and your
**competitors**. Set a target that's a bit better than today and **ratchet** it tighter over time. A budget
you blow every week gets ignored — pick limits the team can actually hold, then improve them.

As guidance "as of writing," web.dev has suggested keeping JavaScript in the rough neighborhood of
**~150–170 KB compressed** for a fast experience on mid-range mobile — treat that as a starting point to
calibrate, not a universal law.

### Enforcing budgets automatically

A budget only works if a machine checks it. Common approaches:

- **Lighthouse CI** with a `budget.json` (or assertions) that **fails the build** when a metric or resource
  count exceeds the limit.
- **Bundle-size checks** (tools like `size-limit`) that fail a PR when the JavaScript bundle grows past its
  limit.
- **DevTools Coverage** to find unused CSS/JS that's inflating the budget.

### Budgets as a conversation

Beyond CI, a budget is a **decision tool**. "This carousel library adds 45 KB of JavaScript — is the
carousel worth 45 KB of our budget?" reframes performance from an afterthought into a normal part of
planning.

# Key Terminology

- **Performance budget** — an agreed limit on metrics and/or resource sizes.
- **Metric budget** — a limit on a timing (LCP, INP, CLS, TTFB…).
- **Quantity / resource budget** — a limit on bytes or request counts.
- **Rule / score budget** — a minimum tool score (e.g. Lighthouse ≥ 90).
- **Lighthouse CI** — tooling that runs Lighthouse and asserts budgets in CI.
- **Regression** — an unintended slowdown introduced by a change.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Budget type | Metric only | Quantity only | Use **both**: metrics for the outcome, quantities for what a PR directly controls. |
| Strictness | Aspirational (often blown) | Realistic + ratcheted | Pick limits you can hold now, then tighten — an ignored budget is useless. |
| Total vs per-type bytes | Budget total size only | Budget **JavaScript** separately | JS costs more per byte (parse/compile/execute), so give it its own limit. |
| CI behavior | Warn only | **Fail** the build on breach | Fail for hard limits; warn for softer targets you're ratcheting toward. |

# Worked Example

A small budget expressed as data (this is the shape Lighthouse CI's `budget.json` uses):

```text
[
  {
    "path": "/*",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 170 },
      { "resourceType": "image",  "budget": 500 },
      { "resourceType": "total",  "budget": 900 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 10 }
    ]
  }
]

(sizes in KB, timings in ms) — if a build exceeds any line, CI fails the check.
```

Enforced in a pipeline:

```bash
# Run Lighthouse CI, which asserts the budget above and fails the build on a breach.
npx @lhci/cli autorun
```

Now a pull request that adds a heavy library and pushes `script` past 170 KB **fails** before it merges —
the regression is caught at review time, not in the field.

# Real World Analogy

A performance budget is a **calorie or money budget**. You decide the limit up front, track what each choice
"costs," and when something would push you over, you make a conscious trade — skip it, or cut elsewhere.
Without a budget you don't notice the daily little extras until the end of the month; with one, every
addition is a deliberate decision.

# Examples

## Example 1 — Basic: a metric budget

The team sets **"LCP ≤ 2.5 s at mobile p75"** as the headline goal. It's anchored to the Core Web Vitals
"good" bar and measured in the field, so it directly reflects user experience.

**Why this works:** a metric budget ties the goal to what users feel, not to an internal proxy.

## Example 2 — Real-world: CI catches a heavy dependency

A pull request adds a date-picker library. The bundle-size check fails: JavaScript would jump from 150 KB to
210 KB, over the 170 KB budget. The developer swaps in a 6 KB alternative and the check passes.

**Why this works:** the budget turned an invisible 60 KB regression into a blocked PR with a clear number to
beat.

## Example 3 — Pitfall: a budget nobody can meet

A team sets "Lighthouse 100 on every page" but routinely ships at 75. Because it's never met, everyone
ignores the red check, and it stops meaning anything.

**Why this bites:** an unrealistic budget is worse than none — it trains the team to ignore failing checks.
Set a holdable limit and ratchet it.

# Common Mistakes

- **No budget at all**, so performance decays silently over months.
- **A vanity budget** nobody enforces — an ignored red check is meaningless.
- **Budgeting only total bytes**, missing that **JavaScript** is the most expensive kind.
- **Ignoring mobile / field p75**, budgeting against a fast desktop instead.

# Best Practices

- Set **both** a metric budget (CWV) and a **quantity** budget (bytes/requests), with JS budgeted
  separately.
- Anchor to the **"good" CWV thresholds** and your **current** numbers; **ratchet** over time.
- **Enforce in CI** so breaches fail a pull request, not production.
- Use the budget as a **planning conversation**: weigh each feature against its cost.

# Summary

- A **performance budget** is an enforceable limit that stops speed from decaying.
- Use **metric** budgets (Core Web Vitals), **quantity** budgets (bytes/requests), and optionally **score**
  budgets — combine them.
- Set **realistic** numbers anchored to the "good" thresholds and your current field data, then tighten.
- **Enforce automatically** with Lighthouse CI / bundle-size checks that fail the build.
- Treat the budget as a **decision tool** — every addition is weighed against its cost.

# Flash Cards

Q: What is a performance budget?
A: An agreed limit — on metrics and/or resource sizes — that the team commits not to exceed, so performance regressions are caught deliberately instead of accumulating silently.

Q: Name the three kinds of performance budget.
A: Metric budgets (timings like LCP/INP/CLS), quantity/resource budgets (bytes and request counts), and rule/score budgets (e.g. a minimum Lighthouse score).

Q: Why budget JavaScript separately from total bytes?
A: JavaScript is the most expensive kind of byte — it must be downloaded, parsed, compiled, and executed on the main thread — so it deserves its own, tighter limit.

Q: How do you make a performance budget actually stick?
A: Enforce it automatically in CI (e.g. Lighthouse CI or a bundle-size check) so a pull request that exceeds a limit fails the build before merging.

Q: Why is an unrealistic budget worse than none?
A: If the budget is never met, the failing check gets ignored and loses all meaning; set a limit the team can hold now and ratchet it tighter over time.

Q: How should you choose the initial numbers for a budget?
A: Start from the Core Web Vitals "good" thresholds, compare with your current field numbers and competitors, and set a target slightly better than today that you can realistically hold.

# Exercises

### Easy
Write a three-line performance budget for a project you know: one metric limit (a Core Web Vital), one JS
byte limit, and one request-count limit. Justify each number.

### Medium
Open a page in DevTools, note its current total JavaScript (Transferred) and request count, then set a
quantity budget 10–20% tighter. Describe what would have to change to meet it.

### Challenging
Design how you'd enforce your budget in CI: which tool, which limits fail vs warn, and how you'd "ratchet"
the numbers over three months. Explain how this prevents the slow, silent decay described in this lesson.

# Further Reading

- web.dev — *Performance budgets 101*: <https://web.dev/articles/performance-budgets-101>
- web.dev — *Using bundlesize / budgets in CI*: <https://web.dev/articles/incorporate-performance-budgets-into-your-build-tools>
- Chrome for Developers — *Lighthouse CI*: <https://github.com/GoogleChrome/lighthouse-ci>
- web.dev — *Your first performance budget*: <https://web.dev/articles/your-first-performance-budget>
