---
slug: optimizing-for-real-users
title: "Optimizing for Real Users"
topic: foundations
kind: technique
summary: "Optimize for the 75th percentile of real users operating on mid-tier mobile hardware and variable networks."
tags: [real-users, percentiles, mobile, crux]
related: [business-and-human-impact, what-web-performance-means, rail-model]
---
> **In one line:** Benchmark and optimize for the 75th percentile of real users on real mobile devices rather than idealized local averages.

## The idea

A pervasive mistake in web engineering is testing applications exclusively on high-end developer workstations attached to gigabit fiber connections. A site that loads in 400 milliseconds under such conditions can easily take 8 seconds on an entry-level smartphone navigating a crowded cellular network.

Performance is not a single number; it is a statistical distribution across thousands of unique device models, browser engines, operating systems, and network conditions. Relying on arithmetic averages is misleading because extreme outliers distort the calculation. A few lightning-fast page loads on fast desktop machines can mask an unacceptable experience suffered by the majority of mobile visitors.

For this reason, standard web performance methodologies—including Google's Core Web Vitals assessment—evaluate user experiences at the 75th percentile (p75). Meeting the p75 standard means that at least 75% of your actual page visits meet or exceed the performance threshold. When planning performance budgets and architecture, you must design for the lower-quartile user: mid-tier mobile CPUs, throttled 4G or 3G bandwidth, and high-latency round trips.

## See it

```bash
# Emulating a mid-tier mobile device and throttled 4G connection using Chrome headless CLI
google-chrome --headless --dump-dom \
  --user-agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Mobile Safari/537.36" \
  --throttling-profile="Regular 4G" \
  https://example.com
```

> **Tip:** Always inspect the 75th percentile in field data tools like PageSpeed Insights and Chrome User Experience Report (CrUX).

## Go deeper
Analyzing the 75th percentile of real-user field data requires understanding device hardware diversity. A mid-tier Android phone frequently features CPU clock speeds and thermal throttling limits that differ radically from developer workstations. Designing for p75 guarantees that your site remains fast for the vast majority of paying customers, not just those with high-end hardware.


Comparing different statistical metrics illustrates why percentiles provide true visibility into user health:

| Metric Type | Characteristic | Reliability for Performance |
|---|---|---|
| **Average (Mean)** | Heavily distorted by fast local tests and slow outliers | Poor: hides severe mobile degradation |
| **Median (p50)** | Represents the exact midpoint user experience | Moderate: ignores 50% of your visitors |
| **75th Percentile (p75)** | Standard CWV threshold; covers 3 out of 4 users | Excellent: balances realism with high quality |
| **95th Percentile (p95)** | Captures worst-case tail latencies and edge failures | Vital for mission-critical infrastructure |

## Watch out

- Benchmarking speed on local dev servers without CPU and network throttling active.
- Celebrating passing scores on developer laptops while field data shows failing Core Web Vitals on mobile.

## Remember

- Performance is a distribution across devices and networks, never a single static number.
- The web standard assesses user experience at the 75th percentile (p75) of visits.
- Prioritize optimizations for mid-tier mobile hardware and realistic mobile latency.
