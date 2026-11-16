---
slug: server-side-rendering
title: "Server-Side Rendering (SSR)"
topic: architecture-and-rendering
kind: concept
summary: "SSR architecture trade-offs: fast initial HTML paint versus server compute cost and TTFB variability."
tags: [ssr, server-rendering, fcp, ttfb]
related: [client-side-rendering, the-hydration-cost, static-site-generation]
---
> **In one line:** Server-Side Rendering generates full HTML on the server on each request, accelerating FCP and LCP.

## The idea

Server-Side Rendering (SSR) inverts the CSR model: instead of sending an empty HTML shell, the server executes application code, queries databases, renders components into complete HTML text strings, and streams the finished HTML document to the client.

SSR provides immediate performance advantages for initial page delivery:
1. Fast First Contentful Paint (FCP): The browser receives meaningful HTML markup immediately. The browser's native C++ HTML parser renders headlines, paragraphs, and images progressively without waiting for JavaScript.
2. Fast Largest Contentful Paint (LCP): Because image tags and text elements exist directly in the initial HTML document, the speculative preload scanner discovers and fetches them immediately.
3. Optimal SEO: Search engine crawlers receive complete, semantic HTML without relying on client-side script execution.

However, SSR introduces distinct trade-offs: every request requires server CPU compute time to query data and render HTML, which can introduce server processing delays and elevate Time to First Byte (TTFB).

## See it

```javascript
// Minimal Node.js Server-Side Rendering (SSR) endpoint handler
import express from 'express';
import { renderToString } from 'react-dom/server';
import App from './App.js';

const app = express();

app.get('/', async (req, res) => {
  // 1. Fetch data on server
  const products = await db.query('SELECT * FROM products LIMIT 10');

  // 2. Render components into full HTML string
  const htmlContent = renderToString(<App products={products} />);

  // 3. Send full HTML document to client immediately
  res.send(`<!DOCTYPE html><html><body><div id="root">${htmlContent}</div><script src="/client.js" defer></script></body></html>`);
});
```

> **Tip:** SSR delivers fully-formed HTML on initial load, allowing the browser to paint visible content before JavaScript runs.

## Go deeper
Server-Side Rendering (SSR) generates full HTML on the server on each request. The browser receives meaningful markup immediately, accelerating First Contentful Paint and Largest Contentful Paint. However, SSR requires active server compute and necessitates a client-side hydration phase to achieve interactivity.


Comparing Server-Side Rendering against Client-Side Rendering:

| Dimension | Server-Side Rendering (SSR) | Client-Side Rendering (CSR) |
|---|---|---|
| Initial HTML Document | Fully populated with content | Empty skeleton (`<div id="root">`) |
| First Contentful Paint | **Fast (< 1.5s)** | Slower (waits for JS) |
| Time to First Byte (TTFB) | Slower (server compute required) | **Faster (static edge delivery)** |
| Search Engine Crawling | Seamless & reliable | Requires crawler JS execution |
| Server Infrastructure Cost | Higher (requires active Node/Edge runtimes) | Low (pure static file hosting) |

## Watch out

- Failing to cache SSR HTML responses, causing origin database bottlenecks under sudden traffic spikes.
- Performing heavy, blocking database calls synchronously inside SSR request handlers, inflating TTFB.

## Remember

- SSR renders full HTML on the server on each request, accelerating initial FCP and LCP.
- SSR enables the browser to paint content progressively before JavaScript downloads or executes.
- SSR increases server infrastructure cost and can elevate TTFB if backend queries are slow.
