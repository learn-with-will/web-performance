---
slug: opportunities-vs-diagnostics
title: "Opportunities vs Diagnostics"
topic: measurement-and-tooling
kind: tool
summary: "Distinguishing actionable byte-saving opportunities from structural performance diagnostics in Lighthouse."
tags: [lighthouse, audits, opportunities, diagnostics]
related: [running-lighthouse, lighthouse-score-weights, identifying-render-blockers]
---
> **In one line:** Opportunities estimate potential millisecond and byte savings, while Diagnostics report structural page characteristics.

## The idea

Below the headline performance score and metric cards, Lighthouse categorizes its findings into two primary sections: Opportunities and Diagnostics. Knowing the difference between them helps prioritize engineering tasks.

Opportunities focus specifically on resource loading optimizations that can speed up page delivery. For each opportunity, Lighthouse provides an estimated time savings in milliseconds if the recommendation is executed. Common opportunities include "Eliminate render-blocking resources," "Properly size images," "Serve images in next-gen formats (AVIF/WebP)," and "Enable text compression (gzip/Brotli)." These savings are estimates based on simulation and do not directly add up arithmetically to the total score improvement.

Diagnostics, on the other hand, provide deeper architectural insight into how the page executed. Diagnostics do not report estimated millisecond savings directly; instead, they highlight structural patterns that degrade speed. Examples include "Avoid long main-thread tasks," "Ensure text remains visible during webfont load," "Minimize main-thread work," and "Avoid enormous network payloads." Use Opportunities for quick resource wins and Diagnostics for architectural fixes.

## See it

```bash
# Filtering Lighthouse JSON report to extract Opportunities and estimated savings
npx lighthouse https://example.com --output=json --output-path=report.json

# Node script reading opportunities
node -e "
  const r = require('./report.json');
  Object.values(r.audits)
    .filter(a => a.details && a.details.type === 'opportunity' && a.numericValue > 0)
    .forEach(a => console.log(a.title + ': ~' + Math.round(a.numericValue) + 'ms'));
"
```

> **Tip:** Do not expect total opportunity millisecond estimates to sum linearly; savings often overlap across the waterfall.

## Go deeper
Lighthouse Opportunities provide estimated millisecond savings for resource loading optimizations, such as converting images to next-gen formats or eliminating render-blocking CSS. Diagnostics, however, report deeper architectural characteristics—including long main-thread tasks, large DOM trees, and font loading behaviors—that guide core application refactoring.


Comparing Lighthouse Opportunities and Diagnostics sections:

| Feature | Opportunities | Diagnostics |
|---|---|---|
| Primary Focus | Asset downloading & payload size | Main-thread execution & DOM architecture |
| Quantified Metric | Estimated millisecond and byte savings | Raw counts, durations, and node sizes |
| Typical Examples | Next-gen images, unused CSS, defer scripts | Long tasks (> 50ms), DOM depth, font-display |
| Engineering Action | Compression, bundling, lazy loading | Code refactoring, web workers, yielding |


When reviewing Lighthouse audit reports, prioritize items under Opportunities for direct load-time wins, such as unused CSS and unoptimized images. Then inspect Diagnostics to identify underlying structural issues, such as third-party script bloat and excessive DOM depth.

## Watch out

- Assuming fixing an opportunity saving 500ms will automatically reduce total LCP by exactly 500ms.
- Ignoring Diagnostics because they lack millisecond savings estimates; long tasks severely harm TBT and INP.

## Remember

- Opportunities highlight actionable resource loading optimizations with estimated time savings.
- Diagnostics report underlying architectural patterns, DOM complexity, and main-thread task durations.
- Use Opportunities for immediate byte reductions and Diagnostics for deeper code refactoring.
