---
slug: why-lab-and-field-differ
title: "Why Lab and Field Data Differ"
topic: measurement-and-tooling
kind: concept
summary: "Understanding the legitimate reasons why synthetic lab scores and real-world field metrics disagree."
tags: [lab-vs-field, discrepancies, debugging, crux]
related: [lab-data-characteristics, field-data-and-rum, pagespeed-insights-analysis]
---
> **In one line:** Lab and field data frequently disagree because lab tests use fixed conditions, while field data reflects real-world variety.

## The idea

Developers are frequently puzzled when their website scores a flawless 98 on Lighthouse in the lab, yet PageSpeed Insights flags the site with failing Core Web Vitals in the field (or vice versa). This discrepancy is normal, expected, and mathematically explainable.

First, user demographics matter. A lab test simulates a specific Moto G4 smartphone operating on a throttled 4G network. If 80% of your real audience visits your site on modern iPhone hardware using high-speed home Wi-Fi, your field data will look substantially better than the lab score. Conversely, if your audience is primarily international mobile users on budget handsets, field data will be far worse than the lab baseline.

Second, user interactions diverge. A lab test visits a page once, waits for initial paint, and immediately stops without clicking anything. In the field, users interact continuously: they open complex menus, submit interactive forms, trigger client-side filtering, and scroll through deep product catalogs. Lab tests cannot measure INP because nobody is actually clicking or typing.

## See it

```text
// Discrepancy Breakdown: Why Lab and Field Diverge
Scenario A: Lab Score: 95 (Fast)  | Field Data: Poor (Failing INP)
  -> Cause: Heavy JavaScript event handlers lag on real user taps; lab test clicked nothing.

Scenario B: Lab Score: 45 (Slow)  | Field Data: Good (Passing LCP)
  -> Cause: Lab throttles to mid-tier 4G; real audience uses high-end phones on broadband.
```

> **Tip:** Never treat lab and field disagreement as an error; use lab tests to debug mechanisms, and field data to track user reality.

## Go deeper
Understanding why lab and field data differ prevents engineering teams from chasing phantom bugs. A site tested in the lab under simulated mobile 4G conditions may score a 65 on Lighthouse, while real-world users on fast corporate Wi-Fi experience an effortless 1.2s LCP. Both data points are valid; use lab profiles for debugging and field distributions for business decisions.


Key structural factors driving variance between lab and field metrics:

| Factor | Lab Environment | Real-World Field Conditions |
|---|---|---|
| Cache State | Typically cold cache on each run | Mix of cold, warm, and HTTP 304 cached visits |
| Device Spectrum | Single emulated CPU throttle profile | Wide spectrum from $50 smartphones to flagship chips |
| User Interaction | Passive, scripted, or non-existent | Continuous clicking, typing, accordion expanding |
| Personalization | Generic logged-out HTML state | Logged-in state with customized feeds and data fetches |

## Watch out

- Assuming a 100 Lighthouse lab score guarantees real-world users are having a fast, error-free experience.
- Discounting field data failures because 'it works fast on my local development machine'.

## Remember

- Disagreements between lab and field data are expected and reflect differences in conditions.
- Lab data measures synthetic potential; field data measures actual human user experience.
- Use lab tools for controlled debugging and regression detection; use field metrics as your source of truth.
