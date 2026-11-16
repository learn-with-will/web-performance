---
slug: recording-network-traces
title: "Recording Network Traces"
topic: measurement-and-tooling
kind: tool
summary: "Capturing clean network traces in Chrome DevTools using disabled cache and connection throttling."
tags: [devtools, network-panel, traces, recording]
related: [network-panel-columns, reading-the-waterfall, spotting-loading-bottlenecks]
---
> **In one line:** Record network activity in Chrome DevTools with Disable Cache checked and throttling active for realistic traces.

## The idea

The Network panel in Chrome DevTools is the primary instrument for inspecting how the browser requests, prioritizes, and receives network assets over HTTP.

To capture an accurate, diagnostic network trace:
1. Open DevTools (`F12` or `Cmd+Option+I`) and switch to the "Network" tab.
2. Check the "Disable cache" checkbox. With DevTools open, this ensures every page reload simulates a cold, first-time visit without local HTTP disk caching.
3. Select an appropriate throttling profile from the Throttling dropdown. Testing on "Fast 4G" or "Slow 4G" exposes latency bottlenecks that remain completely invisible on zero-latency localhost connections.
4. Check "Preserve log" if you need to trace network requests across multiple HTTP redirects or multi-page checkout flows.
5. Click the "Clear" button to wipe previous requests, then reload the page (`Cmd+R` or `Ctrl+F5`).

You can export the completed trace by right-clicking anywhere in the request list and selecting "Save all as HAR with content" to share the network profile with teammates.

## See it

```text
// Chrome DevTools Network Panel Toolbar Configuration
[ x ] Record Network Log  (Red circle active)
[   ] Clear
[ x ] Disable cache       (Forces cold load testing)
[ Throttling: Fast 4G ]   (Simulates realistic mobile latency and bandwidth)
[ Filter: All | Fetch/XHR | JS | CSS | Img | Media | Font | Doc | WS ]
```

> **Tip:** Export network captures as HAR files (HTTP Archive) to inspect, compare, and debug waterfalls asynchronously.

## Go deeper
Capturing network traces under throttled profiles reveals resource contention and blocking dependency chains that remain invisible on fast local development servers. Simulating Fast 4G or Slow 4G latency highlights how sequential request chains delay rendering, allowing developers to restructure markup and preloads for parallel asset delivery.


DevTools Network toolbar controls and their diagnostic utility:

| Control | State / Setting | Diagnostic Value |
|---|---|---|
| **Disable Cache** | Checked | Simulates fresh first-time visitor experience |
| **Throttling** | Fast 4G / Slow 4G | Reveals latency sensitivity, round trips, and blocking chains |
| **Preserve Log** | Checked | Retains request history across HTTP redirects and page hops |
| **Capture Screenshots** | Checked | Visually aligns waterfall requests with progressive frame renders |


Recording a Chrome DevTools performance trace while simulating mobile CPU throttling reveals real-world main thread bottlenecks. Examining the bottom-up call tree highlights specific script functions and long tasks that cause input delays and layout recalculation pauses.

## Watch out

- Forgetting to check 'Disable cache', causing all subsequent test reloads to load instantly from browser disk cache.
- Analyzing network waterfalls on unthrottled fiber, hiding critical request serialization issues.

## Remember

- The Network panel provides a comprehensive view of every HTTP asset requested by the browser.
- Check 'Disable cache' to simulate first-time visits and enable throttling for realistic testing.
- Save traces as HAR files to archive and compare loading waterfalls across builds.
