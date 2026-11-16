---
slug: inlining-critical-css
title: "Inlining Critical CSS"
topic: rendering-path
kind: technique
summary: "Extracting and inlining above-the-fold CSS directly into the HTML document to achieve instant first paint."
tags: [critical-css, inlining, above-the-fold, optimization]
related: [identifying-render-blockers, async-non-critical-css, critical-path-metrics]
---
> **In one line:** Inline above-the-fold critical CSS directly into an HTML <style> tag to unblock rendering on the initial round trip.

## The idea

The most effective way to eliminate render-blocking CSS is to separate your styles into two tiers: critical CSS and non-critical CSS.

Critical CSS consists of the minimal set of CSS rules required to style the "above-the-fold" content—the visible portion of the page that appears in the viewport before the user scrolls. By extracting these rules and inlining them directly into a `<style>` tag inside the HTML `<head>`, the browser can construct the CSSOM and render the visible screen immediately upon receiving the initial HTML payload.

The remaining non-critical styles (styling below-the-fold content, footers, modals, and auxiliary pages) are loaded asynchronously in the background. Because the inlined styles render the initial viewport without waiting for external network requests, First Contentful Paint and Largest Contentful Paint improve substantially, especially on mobile connections. Modern build tooling—such as Critters or Beasties in Webpack, Vite, and Next.js—automates critical CSS extraction during production builds.

## See it

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Fast Page</title>
  <!-- Inlined Critical CSS: styles above-the-fold content instantly -->
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; color: #1a202c; }
    .hero { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
    .btn-primary { background: #0a7a44; color: #fff; padding: 12px 24px; border-radius: 6px; }
  </style>

  <!-- Non-critical CSS loaded asynchronously without blocking render -->
  <link rel="preload" href="/css/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/non-critical.css"></noscript>
</head>
<body>
  <div class="hero"><button class="btn-primary">Get Started</button></div>
</body>
</html>
```

> **Tip:** Ensure the HTML document including inlined critical styles remains under ~14 KB to fit inside the initial TCP packet.

## Go deeper

Balancing inlined critical CSS versus external cached stylesheets:

| Approach | First Visit Performance | Repeat Visit Performance | Maintenance Overhead |
|---|---|---|---|
| External CSS Only | Slower: requires extra round-trip | Fast: cached in browser storage | Low: single bundle |
| Inlined Everything | Fast first paint: no extra requests | Slower: cannot cache CSS separately | High: HTML payload bloats |
| **Split Critical + Async** | **Optimal: zero-RTT first paint** | **Optimal: non-critical cached** | **Automated via build tools** |

## Watch out

- Inlining massive multi-megabyte stylesheets into HTML, destroying HTML streaming and inflating page weight.
- Forgetting to include a <noscript> fallback link for users or web crawlers with JavaScript disabled.

## Remember

- Critical CSS styles above-the-fold content and is inlined directly in the HTML <head>.
- Inlining critical CSS enables the browser to render pixels without waiting for external stylesheets.
- Load the remaining non-critical CSS asynchronously and use build tools to automate extraction.
