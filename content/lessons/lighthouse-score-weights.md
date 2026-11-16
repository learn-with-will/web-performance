---
slug: lighthouse-score-weights
title: "Lighthouse Score Weights"
topic: measurement-and-tooling
kind: concept
summary: "The mathematical formula and weighted average behind the 0-100 Lighthouse Performance score."
tags: [lighthouse, scoring, weights, tbt]
related: [running-lighthouse, opportunities-vs-diagnostics, lighthouse-score-traps]
---
> **In one line:** The Lighthouse 10/11 Performance score is a weighted average of FCP (10%), SI (10%), LCP (25%), TBT (30%), and CLS (25%).

## The idea

The headline 0–100 Performance score in Lighthouse is not an arbitrary grade; it is a calculated, weighted average of five distinct synthetic lab metrics. Understanding how these metrics are weighted allows you to focus your optimization efforts on the levers that move the needle most.

As of Lighthouse 10 and 11, the performance score is calculated from the following five weighted components:
1. Total Blocking Time (TBT): 30% weight. Measures main-thread blocking between FCP and TTI (the synthetic proxy for INP).
2. Largest Contentful Paint (LCP): 25% weight. Measures perceived loading speed of the primary content.
3. Cumulative Layout Shift (CLS): 25% weight. Measures visual stability in the lab.
4. First Contentful Paint (FCP): 10% weight. Measures initial visual response.
5. Speed Index (SI): 10% weight. Measures how quickly content is visually populated.

Together, TBT, LCP, and CLS account for 80% of the entire performance score! Note that INP and FID have 0% weight in Lighthouse because they require real human interaction that does not exist in an automated lab test. Scores map to color-coded bands: 0–49 (Red / Poor), 50–89 (Orange / Needs Improvement), and 90–100 (Green / Good).

## See it

```text
// Lighthouse 10/11 Performance Score Weight Distribution
Total Blocking Time (TBT)       : [████████████] 30%
Largest Contentful Paint (LCP)   : [██████████  ] 25%
Cumulative Layout Shift (CLS)    : [██████████  ] 25%
First Contentful Paint (FCP)     : [████        ] 10%
Speed Index (SI)                 : [████        ] 10%
------------------------------------------------------
Total                            :                100%
```

> **Note:** The Lighthouse performance score does not include INP or FID; TBT serves as the primary lab proxy for responsiveness.

## Go deeper
The Lighthouse performance score heavily weights Total Blocking Time (30%), Largest Contentful Paint (25%), and Cumulative Layout Shift (25%). Together, these three metrics account for 80% of the entire score. Optimizing JavaScript execution to eliminate long tasks directly raises TBT, while prioritizing hero assets and reserving layout space secures passing marks across LCP and CLS.


The exact weights and scoring bands across current Lighthouse versions:

| Metric | Score Weight | Focus Area | Good Target (Lab) |
|---|---|---|---|
| **Total Blocking Time (TBT)** | **30%** | Main-thread responsiveness proxy | ≤ 200 ms |
| **Largest Contentful Paint (LCP)** | **25%** | Main content visual delivery | ≤ 2.5 s |
| **Cumulative Layout Shift (CLS)** | **25%** | Visual layout stability | ≤ 0.1 |
| **First Contentful Paint (FCP)** | **10%** | Early visual feedback | ≤ 1.8 s |
| **Speed Index (SI)** | **10%** | Visual progressive fill | ≤ 3.4 s |

## Watch out

- Assuming a 100 Lighthouse score implies good INP; Lighthouse cannot measure real user interactions.
- Spending weeks optimizing Speed Index (10% weight) while ignoring a bloated TBT (30% weight).

## Remember

- Lighthouse 10/11 weights: TBT (30%), LCP (25%), CLS (25%), FCP (10%), and Speed Index (10%).
- TBT, LCP, and CLS make up 80% of the entire Lighthouse Performance score.
- The Lighthouse performance score does not include real-world INP or FID measurements.
