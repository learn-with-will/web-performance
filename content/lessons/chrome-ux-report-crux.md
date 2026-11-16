---
slug: chrome-ux-report-crux
title: "The Chrome UX Report (CrUX)"
topic: monitoring-and-auditing
kind: tool
summary: "Leveraging the CrUX public dataset across 28-day rolling windows for competitive field benchmarking."
tags: [crux, chrome-ux-report, field-data, benchmarking]
related: [rum-with-web-vitals-library, segmenting-field-data, pagespeed-insights-analysis]
---
> **In one line:** CrUX is Google's public dataset of real-user Core Web Vitals metrics aggregated over a rolling 28-day window.

## The idea

The Chrome User Experience Report (CrUX) is a massive, publicly accessible repository of real-world user performance data gathered from millions of consenting Chrome users visiting millions of websites across the globe.

CrUX is the official dataset that powers Google Search's Page Experience ranking evaluation, PageSpeed Insights, and the Google Search Console Core Web Vitals report.

CrUX operates with explicit constraints:
1. Rolling 28-Day Window: CrUX data represents an aggregated distribution over the preceding 28 days. A performance improvement shipped today will not fully reflect in CrUX until 28 days of new visitor data have diluted the old historical metrics.
2. 75th Percentile Evaluation: CrUX assesses compliance at the 75th percentile of all qualifying visits.
3. Traffic Thresholds: Only publicly discoverable URLs with sufficient user traffic volume generate individual page-level CrUX reports; lower-traffic pages inherit origin-level domain aggregates.

You can query CrUX programmatically via the CrUX API, query historical trends using Google BigQuery, or visualize performance distributions in Google Looker Studio.

## See it

```bash
# Querying CrUX API for origin-level 75th-percentile field metrics
curl -X POST "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "https://example.com",
    "formFactor": "PHONE"
  }'
```

> **Note:** CrUX aggregates field data across a 28-day rolling window; code changes take time to shift CrUX scores.

## Go deeper
The Chrome User Experience Report (CrUX) aggregates real-world Core Web Vitals metrics from millions of Chrome users over a rolling 28-day window. CrUX evaluates compliance at the 75th percentile and directly powers Google Search's Page Experience ranking signals.


The four primary interfaces for accessing and analyzing CrUX data:

| CrUX Access Tool | Latency / Frequency | Best Used For |
|---|---|---|
| **PageSpeed Insights** | Real-time (28-day rolling) | Quick URL-level inspection and passing/failing status |
| **CrUX API** | Programmatic REST query | Automated weekly dashboards and competitive tracking |
| **Search Console CWV Report** | Weekly aggregated groups | Identifying clusters of failing URLs across an entire domain |
| **BigQuery CrUX Dataset** | Monthly historical snapshot | Multi-year industry trend analysis and deep demographic queries |

## Watch out

- Expecting newly launched websites or staging environments to appear in CrUX; traffic thresholds must be met.
- Comparing CrUX phone distributions directly to desktop distributions; mobile scores are almost always lower.

## Remember

- CrUX provides real-world field metrics that directly govern Google Search Page Experience evaluation.
- Metrics are aggregated over a 28-day rolling window and evaluated at the 75th percentile.
- Use the CrUX API or BigQuery to benchmark your performance against competitors and historical baselines.
