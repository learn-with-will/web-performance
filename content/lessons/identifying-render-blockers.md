---
slug: identifying-render-blockers
title: "Identifying Render-Blocking Resources"
topic: rendering-path
kind: tool
summary: "Locating and auditing render-blocking stylesheets and synchronous scripts using DevTools and Lighthouse."
tags: [render-blocking, devtools, lighthouse, audits]
related: [critical-path-metrics, inlining-critical-css, defer-and-async-scripts]
---
> **In one line:** Identify render-blocking CSS and synchronous scripts using the Lighthouse Eliminate Render-Blocking Resources audit.

## The idea

Before optimizing a site's loading speed, you must locate the exact assets currently holding up the browser's render pipeline. Both Chrome DevTools and Google Lighthouse provide automated diagnostics to pinpoint render-blocking dependencies.

In Chrome DevTools, open the Network panel, reload the page, and inspect the Waterfall column. Right-click the table header and ensure the "Priority" column is visible. Any stylesheet or script designated with "Highest" or "High" priority that downloads before First Contentful Paint (FCP) is a candidate render blocker. Hovering over request bars shows whether the resource delayed the DOM or style pipeline.

In Lighthouse, look for the audit named "Eliminate render-blocking resources" under Opportunities. Lighthouse analyzes the request graph and flags every external stylesheet and non-deferred script referenced in `<head>` that blocked painting. For each item, Lighthouse reports the URL, transfer size, and the estimated millisecond savings achievable if the resource were inlined, deferred, or loaded asynchronously.

## See it

```bash
# Running Lighthouse via CLI to inspect render-blocking opportunities
npx lighthouse https://example.com \
  --only-categories=performance \
  --view
```

```text
// Lighthouse Output Snippet:
// Eliminate render-blocking resources
// Potential savings: 650 ms
// - /css/vendor.css (42 KB transfer)
// - /css/main.css   (18 KB transfer)
// - /js/header.js   (12 KB transfer)
```

> **Tip:** DevTools Coverage panel reveals the exact percentage of unused CSS and JS loaded on initial paint.

## Go deeper
Chrome DevTools Performance panel provides a visual flame chart illustrating how render-blocking resources delay the First Contentful Paint marker. By zooming into the early milliseconds of a page load trace, developers can inspect the exact parsing and style evaluation events, correlating stylesheet download completions directly with the first painted frame.


Auditing render blockers across different DevTools diagnostic panels:

| DevTools Panel | Metric / Feature | What It Reveals |
|---|---|---|
| **Network Panel** | Priority Column & Waterfall | Shows Highest-priority blocking downloads before FCP |
| **Performance Panel** | Timings: FCP & DCL lines | Visually aligns blocking script tasks with paint delays |
| **Coverage Panel** | Unused Byte Percentage | Flags bloated stylesheets where 80%+ of rules are unused |
| **Lighthouse** | Render-Blocking Audit | Calculates estimated millisecond savings from deferred assets |

## Watch out

- Ignoring third-party tag managers or font stylesheets that quietly inject render-blocking links into <head>.
- Blindly removing a stylesheet flagged by Lighthouse without verifying that critical styles are inlined.

## Remember

- Lighthouse explicitly flags external stylesheets and synchronous scripts that delay first paint.
- Inspect the Network panel priority column and Waterfall to spot blocking dependencies.
- Use the DevTools Coverage panel to measure what percentage of blocking code is unused on load.
