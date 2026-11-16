---
slug: the-audit-workflow-overview
title: "The Performance Audit Workflow"
topic: monitoring-and-auditing
kind: pattern
summary: "The 5-stage auditing methodology: goal setting, field & lab measurement, triage, fixing, and guarding."
tags: [audit-workflow, capstone, methodology, optimization]
related: [triage-by-user-impact, fixing-the-critical-path-in-practice, verifying-and-measuring-gains]
---
> **In one line:** Execute a structured audit workflow: Set Goals -> Measure -> Triage -> Fix -> Verify & Guard.

## The idea

Approaching web performance without a structured methodology leads to wasted engineering effort: developers spend days rewriting micro-components or optimizing backend queries that have zero measurable impact on user experience.

A professional web performance audit follows a rigorous, repeatable five-stage workflow:

1. Set Goals & Budget: Define explicit business targets and technical thresholds anchored to the Core Web Vitals (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75).
2. Measure: Collect data from the outside in. Start with field data (CrUX / RUM) to identify which URLs and user cohorts are suffering. Then reproduce the issues in lab tools (DevTools Network and Performance panels).
3. Triage by Impact: Prioritize issues using an ROI matrix: rank bottlenecks by user volume affected and effort to resolve.
4. Fix Across the Layers: Implement systematic code fixes—addressing the critical rendering path, Core Web Vitals, asset formats, and JavaScript execution.
5. Verify & Guard: Validate the wins under identical lab profiles, monitor field rollout over the 28-day CrUX window, and lock in budgets in CI to guard against regression.

## See it

```text
// The 5-Stage Performance Audit Methodology
[ 1. Set Goals ]   --> Anchor to CWV p75 thresholds and business KPIs
        |
[ 2. Measure ]     --> Field data first (CrUX/RUM), then reproduce in Lab (DevTools)
        |
[ 3. Triage ]      --> Rank bottlenecks by User Impact and Engineering ROI
        |
[ 4. Fix ]         --> Remediate Critical Path, LCP, CLS, INP, and JS bloat
        |
[ 5. Verify/Guard] --> Validate in lab, monitor field rollout, lock in CI budgets
```

> **Note:** Always start an audit with real-user field data to identify which pages fail before diving into lab profiling.

## Go deeper
A structured performance audit executes five systematic stages: Set Goals, Measure (field data first, then lab reproduction), Triage by impact vs effort, Fix across the technical layers, and Verify wins under controlled profiles while guarding gains with CI budgets.


Detailed operational activities across the five audit workflow phases:

| Audit Phase | Primary Activities | Key Deliverables |
|---|---|---|
| **1. Set Goals** | Benchmark competitors; establish target percentiles | Written Performance Budget |
| **2. Measure** | Audit CrUX, PageSpeed Insights, DevTools Network/Perf | Trace recordings and baseline metrics |
| **3. Triage** | Categorize issues by LCP / CLS / INP impact | Prioritized remediation backlog |
| **4. Fix** | Implement preloading, responsive images, code splitting | Pull requests with code optimizations |
| **5. Verify & Guard** | Compare lab before/after; monitor RUM; set CI gates | Verification report and locked CI budgets |

## Watch out

- Jumping directly into code optimization before collecting baseline field and lab measurements.
- Fixing issues haphazardly based on personal developer preference rather than user impact triage.

## Remember

- Follow a structured 5-stage workflow: Set Goals, Measure, Triage, Fix, and Verify & Guard.
- Measure field data first to establish user reality, then use lab profiling to diagnose mechanics.
- Always verify optimizations with before/after comparisons and guard gains with CI budgets.
