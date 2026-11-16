---
slug: performance-budget-types
title: "Performance Budget Types"
topic: monitoring-and-auditing
kind: concept
summary: "Defining metric budgets, quantity budgets, and rule-based budgets to prevent performance regression."
tags: [performance-budgets, metrics, governance, budgets]
related: [setting-realistic-targets, enforcing-budgets-in-ci, budget-governance-and-culture]
---
> **In one line:** Performance budgets establish clear limits across metric thresholds, quantity byte sizes, and architectural rules.

## The idea

Without explicit, enforceable limits, web applications experience a predictable, natural drift toward bloat over time. A new analytics tracker is added here, an uncompressed hero image is uploaded there, an un-treeshaken library is imported—and within six months, a once-fast site becomes sluggish and unresponsive.

A Performance Budget is an agreed-upon set of constraints that code and assets must not exceed.

Performance budgets generally fall into three distinct types:
1. Quantity Budgets: Physical constraints on asset sizes and network counts. Examples: total JavaScript bundle size ≤ 170 KB gzipped; total image payload ≤ 500 KB; total HTTP requests ≤ 35.
2. Metric Budgets: User-centric timing thresholds tied directly to Core Web Vitals and user milestones. Examples: LCP ≤ 2.2s at p75; INP ≤ 150ms at p75; CLS ≤ 0.05.
3. Rule-Based Budgets: Structural architectural constraints enforced via linters and audits. Examples: zero synchronous scripts in `<head>`; 100% of images must have explicit `width` and `height` attributes; zero un-subsetted web fonts.

## See it

```json
// budget.json: Defining metric and quantity budgets for automated auditing
[
  {
    "resourceSizes": [
      { "resourceType": "script", "budget": 180 },
      { "resourceType": "stylesheet", "budget": 45 },
      { "resourceType": "image", "budget": 400 },
      { "resourceType": "total", "budget": 750 }
    ],
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2200 },
      { "metric": "cumulative-layout-shift", "budget": 0.08 },
      { "metric": "total-blocking-time", "budget": 150 }
    ]
  }
]
```

> **Tip:** Combine quantity budgets (bundle KB) for pull requests with metric budgets (CWV) for production monitoring.

## Go deeper

Comparing the three primary performance budget types:

| Budget Type | What It Measures | When It Is Enforced | Tooling Used |
|---|---|---|---|
| **Quantity Budget** | Bytes, file counts, HTTP requests | Pull Request build step (CI) | bundlesize, size-limit |
| **Metric Budget** | LCP, INP, CLS, FCP, TTFB | Automated staging tests & RUM | Lighthouse CI, CrUX, Datadog |
| **Rule-Based Budget** | HTML/CSS lint rules, best practices | Editor and git pre-commit hooks | ESLint, HTMLHint, Lighthouse audits |

## Watch out

- Setting purely aspirational budgets that are repeatedly ignored when pull requests fail.
- Budgeting only total page size while allowing a single 500 KB JavaScript bundle to freeze mobile CPUs.

## Remember

- Performance budgets define strict, agreed-upon limits to prevent gradual application degradation.
- The three budget types are Quantity (bytes), Metric (CWV timings), and Rule-based (best practices).
- Enforce quantity budgets in CI pull requests and track metric budgets continuously in production.
