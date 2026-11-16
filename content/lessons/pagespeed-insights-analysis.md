---
slug: pagespeed-insights-analysis
title: "PageSpeed Insights Analysis"
topic: measurement-and-tooling
kind: tool
summary: "Reading PageSpeed Insights to analyze real-user field data side-by-side with lab diagnostics."
tags: [pagespeed-insights, crux, lighthouse, audits]
related: [field-data-and-rum, why-lab-and-field-differ, running-lighthouse]
---
> **In one line:** PageSpeed Insights displays real-user CrUX field data at the top and synthetic Lighthouse lab diagnostics below.

## The idea

Google PageSpeed Insights (PSI) is the industry standard tool for evaluating web performance because it presents both field data and lab data in a unified report.

When you audit a URL on PageSpeed Insights, the report is divided into two distinct sections:
1. "Discover what your real users are experiencing" (Field Data): Sourced directly from the Chrome User Experience Report (CrUX), this section shows the 75th-percentile performance across LCP, INP, CLS, FCP, and TTFB over the previous 28 days. It provides tabs for Mobile and Desktop, and indicates whether the page passes the Core Web Vitals assessment.
2. "Diagnose performance issues" (Lab Data): Below the field section, PSI runs an automated Lighthouse test on an emulated mobile or desktop environment, generating the 0–100 Performance score, Opportunities for byte reduction, and diagnostic audits.

Always inspect the field section first to establish whether the page is passing for real users. If the field metrics fail, scroll down to the lab diagnostics to identify the code-level causes.

## See it

```bash
# Querying PageSpeed Insights API via curl to inspect field and lab metrics programmatically
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&strategy=mobile"
```

> **Note:** The top section of PageSpeed Insights represents real user field data from CrUX; the bottom section is synthetic Lighthouse lab data.

## Go deeper
PageSpeed Insights provides an indispensable dual-perspective audit. The top section presents real-world CrUX field data over a 28-day rolling window, revealing whether your site passes Google's Core Web Vitals assessment. The bottom section runs an on-demand synthetic Lighthouse lab test, offering granular opportunities and diagnostics to guide technical remediation.


Navigating the two core sections of a PageSpeed Insights report:

| PSI Report Section | Data Origin | What It Tells You | How to Act |
|---|---|---|---|
| **Real User Experience** | CrUX (28-day p75) | Real-world Core Web Vitals compliance | Determines passing/failing status |
| **Origin Summary** | CrUX (domain level) | Site-wide aggregate performance health | Useful for low-traffic sub-pages |
| **Performance Score** | Lighthouse (Lab) | Synthetic lab score (0–100) | Debugging benchmark, not the goal |
| **Opportunities** | Lighthouse (Lab) | Estimated byte and millisecond savings | Concrete code optimizations to implement |


PageSpeed Insights provides an invaluable perspective by displaying both lab Lighthouse diagnostics and real-world CrUX field data side by side. Evaluating the CrUX 75th percentile metrics ensures your optimizations translate directly into measurable improvements for actual visitors.

## Watch out

- Overlooking the Mobile vs Desktop toggle; mobile field performance is typically much slower than desktop.
- Relying solely on the Origin Summary for high-traffic individual landing pages with distinct layouts.

## Remember

- PageSpeed Insights combines real-user CrUX field data with synthetic Lighthouse lab diagnostics.
- The Core Web Vitals assessment banner is governed entirely by the field data section.
- Use field metrics to identify failing thresholds, and lab audits to discover actionable code remedies.
