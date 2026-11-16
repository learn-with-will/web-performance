---
slug: preventing-performance-regressions
title: "Preventing Performance Regressions"
topic: monitoring-and-auditing
kind: technique
summary: "Establishing automated alerts, tracking percentile trends, and catching performance degradations before release."
tags: [regressions, alerts, monitoring, governance]
related: [enforcing-budgets-in-ci, rum-with-web-vitals-library, the-audit-workflow-overview]
---
> **In one line:** Prevent regressions by combining CI pull request size gates with real-time field percentile alerting.

## The idea

Improving web performance is difficult; keeping a site fast over years of active development across dozens of engineers is even harder. Preventing performance regressions requires a layered defense spanning both pre-production checks and post-production monitoring.

The regression defense framework relies on three synchronized rings:
1. Pre-Commit / Build: Linters and bundle size checkers (`size-limit`) run on every pull request to catch accidental package bloat or missing image dimensions before code can merge into the `main` branch.
2. Synthetic Staging Tests: Lighthouse CI runs automated audits against preview deployments, testing realistic mobile profiles to catch script execution delays or render-blocking stylesheets.
3. Production RUM Alerting: Real User Monitoring systems track 75th-percentile trends continuously. If a newly deployed release causes p75 LCP or INP to spike by more than 15% across a 2-hour window, automated alerts notify on-call engineers to roll back the deployment.

## See it

```javascript
// Datadog / Prometheus Alert Rule Concept (Pseudo-code)
alertRule({
  name: "P75 INP Regression Alert",
  query: "p75(web_vitals.inp) by {service, version}",
  condition: "value > 200ms for 1h",
  message: "P75 INP has degraded past 200ms on version {{version}}. Review recent PRs or roll back."
});
```

> **Tip:** Set automated alerts on 75th-percentile field metrics to detect performance regressions immediately after deployments.

## Go deeper
Preventing performance regressions requires a three-tiered defense: pre-commit bundle size checks, synthetic staging audits via Lighthouse CI, and real-time production RUM alerting on 75th-percentile field metrics to detect regressions immediately after deployment.


The three-tiered performance regression prevention framework:

| Defense Tier | Environment | Trigger / Cadence | Tooling Used | Failure Action |
|---|---|---|---|---|
| **Tier 1: Pre-Merge** | Pull Request | Every commit / PR | `size-limit`, bundle analyzer | Blocks PR merge |
| **Tier 2: Staging** | Preview Deploy | Prior to production release | Lighthouse CI (LHCI) | Blocks release pipeline |
| **Tier 3: Production** | Live Real Users | Real-time continuous RUM | `web-vitals`, Datadog, Sentry | Triggers alert / rollback |


Automated performance budgets in CI/CD pipelines prevent gradual code bloat from reaching production. Establishing strict thresholds for JavaScript bundle sizes and key Core Web Vitals ensures that pull requests with unintended performance regressions are caught before deployment.


Incorporate synthetic CI runs using Lighthouse CI alongside GitHub Actions, configuring automated threshold alerts that notify engineers whenever a commit causes metrics to regress unexpectedly.

## Watch out

- Alerting on arithmetic averages, which dilutes real-world mobile regressions behind fast desktop traffic.
- Failing to correlate deployment timestamps with performance graphs, making root-cause triage slow.

## Remember

- Layer regression defenses across pre-merge checks, synthetic staging tests, and live RUM monitoring.
- Automated bundle checks in pull requests prevent dependency bloat from ever reaching production.
- Monitor 75th-percentile field trends in real time to trigger rapid rollbacks if regressions occur.
