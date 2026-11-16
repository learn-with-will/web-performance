---
slug: triage-by-user-impact
title: "Triage by User Impact"
topic: monitoring-and-auditing
kind: technique
summary: "Prioritizing optimizations by affected user volume, Core Web Vitals weight, and engineering effort."
tags: [triage, prioritization, roi, impact]
related: [the-audit-workflow-overview, fixing-core-vitals-in-practice, business-and-human-impact]
---
> **In one line:** Prioritize optimizations by calculating Impact vs Effort: focus on high-traffic templates and Core Web Vitals.

## The idea

A comprehensive performance audit often uncovers dozens of potential issues: unminified stylesheets, uncompressed images, long tasks, missing preconnects, and bloated third-party scripts. Attempting to fix everything simultaneously leads to project paralysis.

Triage by User Impact is the practice of evaluating and ranking performance findings according to an Objective ROI Matrix:

$$\text{Priority Score} = \frac{\text{User Volume} \times \text{Performance Impact}}{\text{Engineering Effort}}$$

1. User Traffic Volume: A 500ms LCP win on your primary product landing page (which receives 70% of all site visits) is worth 100x more to the business than a 1-second win on a rarely visited settings page. Focus on high-traffic templates first.
2. Core Web Vitals Severity: Prioritize issues that directly cause URLs to fail Google's Core Web Vitals assessment (e.g. LCP > 2.5s or CLS > 0.1).
3. Engineering Effort: Identify quick wins (e.g. adding `fetchpriority="high"`, removing `loading="lazy"` from the hero image, or adding explicit `width` and `height`) that require minimal code changes but deliver immediate metric leaps.

## See it

```text
// Impact vs Effort Prioritization Matrix
High Impact, Low Effort (DO FIRST!) :
  - Add fetchpriority="high" to LCP image
  - Set width/height on unsized images (fixes CLS)
  - Preload primary WOFF2 web font

High Impact, High Effort (PLAN SPRINT) :
  - Implement route-based code splitting
  - Migrate from SSR monolithic hydration to Islands
  - Edge CDN migration

Low Impact, Low Effort (QUICK POLISH) :
  - Add preconnect to secondary API origin
  - Remove unused polyfill from package.json

Low Impact, High Effort (DE-PRIORITIZE) :
  - Micro-optimizing pure CSS animations on internal admin screens
```

> **Tip:** Triage fixes into High-Impact/Low-Effort quick wins first to generate immediate momentum and measurable results.

## Go deeper

Prioritization scoring model for performance audit issues:

| Issue Found | Traffic Impact | Metric Impact | Effort Required | Priority Rank |
|---|---|---|---|---|
| Hero image has `loading="lazy"` | High (Homepage) | High (Recovers 1.2s LCP) | Low (1 line change) | **#1 (Immediate)** |
| Missing image dimensions | High (Catalog) | High (Reduces CLS by 0.15) | Low (Add HTML attributes) | **#2 (Immediate)** |
| Huge 800 KB JS bundle | High (All pages) | High (Slashes TBT by 400ms) | High (Requires code splitting) | **#3 (Sprint project)** |
| Slow icon font on admin page | Low (< 2% traffic) | Low | Low | **#4 (Backlog)** |

## Watch out

- Spending weeks on complex architectural refactors before harvesting high-impact, low-effort markup quick wins.
- Prioritizing desktop-only optimizations when field telemetry indicates mobile users suffer the worst delays.

## Remember

- Rank audit findings by multiplying user traffic volume and metric impact, divided by effort.
- Target High-Impact, Low-Effort quick wins first (such as fixing LCP image markup and sizing).
- Focus optimization work on high-traffic templates that drive core business conversion.
