---
slug: client-side-rendering
title: "Client-Side Rendering (CSR)"
topic: architecture-and-rendering
kind: concept
summary: "CSR architecture trade-offs: cheap static hosting versus large JavaScript bundles and delayed FCP/LCP."
tags: [csr, spa, rendering, javascript]
related: [server-side-rendering, the-hydration-cost, static-site-generation]
---
> **In one line:** Client-Side Rendering delivers an empty HTML shell and relies on browser JavaScript to generate DOM nodes.

## The idea

Client-Side Rendering (CSR)—the foundational architecture of traditional Single Page Applications (SPAs) built with React, Vue, or Angular—shifts the burden of generating HTML entirely from the server to the client browser.

In CSR, the server responds with an almost empty HTML skeleton (typically containing just `<div id="root"></div>`) alongside a link to a large JavaScript bundle. When the browser downloads, parses, and executes this script, the client-side framework creates DOM elements, executes API fetch requests to retrieve JSON data, and mounts the visual interface into the page.

CSR provides significant operational advantages: hosting is exceptionally cheap and scalable because servers only deliver static files from global edge CDNs without running backend application runtimes. Once the initial bundle loads, client-side route transitions can feel instant without full-page reloads.

However, CSR suffers from severe initial loading penalties: First Contentful Paint and Largest Contentful Paint are fundamentally delayed because the user stares at a blank screen until the entire JavaScript bundle downloads and executes.

## See it

```html
<!-- Typical CSR HTML document returned by the server: initially blank! -->
<!DOCTYPE html>
<html>
<head>
  <title>Single Page App</title>
  <link rel="stylesheet" href="/bundle.css">
  <script src="/bundle.js" defer></script>
</head>
<body>
  <!-- The browser paints NOTHING until bundle.js executes and creates elements -->
  <div id="root"></div>
</body>
</html>
```

> **Note:** In CSR, the initial HTML document contains no visible content; the browser must download and run JavaScript to render.

## Go deeper

Evaluating the performance trade-offs of Client-Side Rendering:

| Metric / Dimension | CSR Performance Characteristic | Architectural Cause |
|---|---|---|
| **TTFB** | **Fastest (< 100ms)** | Static HTML served directly from edge CDN cache |
| **First Contentful Paint** | **Slow (1.5s – 3.5s)** | Blocked waiting for JS download, parse, and execution |
| **Largest Contentful Paint** | **Slow (2.5s – 5.0s)** | Data fetch happens *after* JavaScript framework mounts |
| **Interaction to Next Paint** | Good for sub-pages; poor during load | Initial load locks main thread during hydration/render |
| **Hosting Infrastructure** | Low cost, serverless, highly scalable | Static bucket (S3, Cloudflare Pages, Netlify) |

## Watch out

- Using CSR for content-heavy e-commerce or blogs where early SEO crawling and fast initial LCP are critical.
- Overloading initial CSR bundles with unneeded admin routes instead of implementing route-based code splitting.

## Remember

- CSR delivers a minimal HTML shell and renders DOM nodes entirely via client-side JavaScript.
- CSR provides cheap static hosting and fast subsequent in-app route transitions.
- CSR inherently delays First Contentful Paint and LCP behind JavaScript download and execution.
