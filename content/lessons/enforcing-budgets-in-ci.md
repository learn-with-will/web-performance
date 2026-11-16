---
slug: enforcing-budgets-in-ci
title: "Enforcing Budgets in CI"
topic: monitoring-and-auditing
kind: tool
summary: "Automating performance budget enforcement in CI pipelines using bundlesize, size-limit, and Lighthouse CI."
tags: [ci-cd, bundlesize, lhci, automation]
related: [performance-budget-types, preventing-performance-regressions, running-lighthouse]
---
> **In one line:** Enforce performance budgets in CI/CD pipelines to fail pull requests that introduce size or speed regressions.

## The idea

Performance budgets documented in an internal wiki or design document are rarely honored during high-pressure sprint deadlines. The only way to guarantee that performance budgets remain inviolable is to automate their enforcement directly in Continuous Integration (CI/CD) pipelines.

Two primary tools automate budget enforcement in pull requests:
1. Bundle Size Checkers (e.g. `bundlesize` or `size-limit`): Runs during the build step. It measures the gzipped/Brotli transfer sizes of production chunks and compares them against declared limits. If a developer imports a heavy package that pushes `app.js` over its 180 KB budget, the CI test fails immediately, blocking the merge.
2. Lighthouse CI (LHCI): Spins up a headless Chrome instance inside the CI runner, builds and serves the pull request, and executes multiple synthetic audits. LHCI asserts that scores and timings meet strict assertions (e.g. `categories:performance >= 0.9`, `first-contentful-paint <= 1800`).

## See it

```json
// .size-limit.json: Asserting strict bundle size limits in pull requests
[
  {
    "path": "dist/assets/app-*.js",
    "limit": "150 KB",
    "brotli": true
  },
  {
    "path": "dist/assets/vendor-*.js",
    "limit": "80 KB",
    "brotli": true
  }
]
```

```text
# GitHub Actions workflow running Lighthouse CI on every Pull Request
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
```

> **Tip:** Integrate `size-limit` into GitHub Actions to print bundle size differentials directly into pull request comments.

## Go deeper

Auditing CI budget enforcement tooling:

| CI Tool | What It Tests | Execution Duration | When to Run |
|---|---|---|---|
| **`size-limit`** | Production bundle bytes (gzip/br) | Fast (10–30 seconds) | On every git push / PR commit |
| **Lighthouse CI** | Synthetic CWV timings & scores | Moderate (2–4 minutes) | On PR opening and merge to main |
| **BundleDiff Bot** | Size delta (+2.4 KB) comment in PR | Fast | Integrated with GitHub Actions |

## Watch out

- Configuring CI assertions with 'warn' only; warnings are ignored and regressions slip into production.
- Running Lighthouse CI on variable, noisy public runners without setting run counts to 3+ to average medians.

## Remember

- Automated CI enforcement is required to prevent accidental performance and bundle regressions.
- Tools like size-limit fail pull requests immediately if bundle sizes exceed defined limits.
- Lighthouse CI tests synthetic timings and performance scores against budget assertions before merge.
