---
slug: running-lighthouse
title: "Running Lighthouse"
topic: measurement-and-tooling
kind: tool
summary: "Executing Lighthouse via DevTools and CLI with simulated mobile throttling to audit performance."
tags: [lighthouse, devtools, cli, throttling]
related: [lighthouse-score-weights, opportunities-vs-diagnostics, lab-data-characteristics]
---
> **In one line:** Run Lighthouse in Chrome DevTools or via the CLI in incognito mode with mobile throttling to simulate user conditions.

## The idea

Google Lighthouse is an open-source, automated auditing tool for measuring web page quality, including performance, accessibility, SEO, and best practices.

There are three primary ways to run Lighthouse:
1. Chrome DevTools: Open DevTools, switch to the "Lighthouse" tab, select "Navigation" mode, choose "Mobile" or "Desktop", and click "Analyze page load".
2. Command Line Interface (CLI): Ideal for automated scripts and local development audits.
3. Continuous Integration: Integrated via Lighthouse CI (LHCI) into GitHub Actions or GitLab pipelines to block pull requests that degrade performance.

To obtain accurate, uncontaminated results, always run Lighthouse in an Incognito window with browser extensions disabled. Active browser extensions often inject foreign scripts, modify CSS, and burn CPU cycles, heavily skewing performance scores. By default, Lighthouse applies simulated mobile network throttling (150ms RTT, 1.6 Mbps download) and CPU throttling (4x slowdown) to mimic a mid-tier mobile phone.

## See it

```bash
# Installing and executing Lighthouse CLI in headless Chrome
npm install -g lighthouse

# Running a mobile performance audit and saving an HTML report
lighthouse https://example.com \
  --only-categories=performance \
  --preset=desktop \
  --output=html \
  --output-path=./report.html
```

> **Tip:** Always run Lighthouse in an incognito window with extensions disabled to prevent external scripts from skewing scores.

## Go deeper
Running Lighthouse in an isolated, extension-free environment is critical for obtaining clean diagnostic data. Browser extensions often inject third-party scripts, alter the DOM, and consume CPU cycles on the main thread, artificially suppressing performance scores. Always execute audits in Chrome Incognito mode or via automated Lighthouse CI runners for clean results.


Comparing different Lighthouse execution environments and workflows:

| Execution Method | Best Used For | Key Strengths |
|---|---|---|
| **Chrome DevTools** | Ad-hoc interactive debugging | Fast UI, integrates with DevTools Performance panel |
| **Lighthouse CLI** | Local script automation | Headless execution, flexible JSON/HTML output |
| **Lighthouse CI (LHCI)** | Pull Request gating in CI/CD | Asserts performance budgets, catches regressions |
| **PageSpeed Insights** | Web-based external audits | Runs on Google servers; pairs with CrUX field data |


Running Lighthouse audits inside an incognito window eliminates interference from installed browser extensions, which often inject scripts and inflate task execution times. For reliable benchmarks, run multiple audit passes and average the resulting scores across runs.

## Watch out

- Running Lighthouse in standard browser windows where ad blockers and password managers skew performance timings.
- Benchmarking only desktop profiles while the majority of consumer traffic arrives on mobile devices.

## Remember

- Lighthouse audits performance, accessibility, SEO, and best practices across mobile and desktop profiles.
- Always audit in incognito mode with extensions disabled to avoid CPU and network interference.
- Integrate Lighthouse CI into pull request pipelines to prevent performance regressions from merging.
