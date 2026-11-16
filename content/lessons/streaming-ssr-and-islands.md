---
slug: streaming-ssr-and-islands
title: "Streaming SSR and Islands Architecture"
topic: architecture-and-rendering
kind: pattern
summary: "Modern hybrid architectures: streaming HTML chunks via HTTP chunked transfer and selective partial hydration."
tags: [streaming-ssr, islands-architecture, astro, partial-hydration]
related: [the-hydration-cost, server-side-rendering, choosing-a-rendering-strategy]
---
> **In one line:** Streaming SSR delivers progressive HTML chunks; Islands Architecture hydrates only interactive components.

## The idea

Modern web architecture has evolved beyond the rigid binary choice between full-page SSR and monolithic CSR. Two innovative architectural paradigms—Streaming SSR and Islands Architecture—directly solve the hydration tax.

1. Streaming SSR: Leverages HTTP/1.1 and HTTP/2 chunked transfer encoding. Instead of waiting for all slow database queries to finish before sending HTML, the server immediately streams the `<head>` and fast shell content. As slow database queries resolve, the server streams subsequent HTML chunks down the open connection, which the browser renders progressively.

2. Islands Architecture (pioneered by Astro and Fresh): Replaces monolithic full-page hydration with selective "islands" of interactivity. The page is rendered as 100% pure static HTML by default, shipping zero JavaScript to the client. Only the specific components that require interactive state—such as an image carousel or shopping cart drawer—are designated as interactive islands and hydrated independently.

By isolating hydration to micro-islands, 80% to 90% of the page ships zero JavaScript, completely eliminating the Uncanny Valley.

## See it

```html
<!-- Astro Islands Architecture: Pure static HTML with selective component hydration -->
<header>
  <!-- Pure static HTML: 0 KB JavaScript transferred! -->
  <nav><a href="/">Home</a><a href="/about">About</a></nav>
</header>

<main>
  <h1>Product Showcase</h1>
  <!-- Interactive Island: Hydrates only when visible in the viewport -->
  <ImageCarousel client:visible images={productImages} />

  <!-- Pure static text: zero JavaScript footprint -->
  <article>Detailed product descriptions and reviews...</article>
</main>
```

> **Tip:** Islands Architecture renders pages as static HTML by default, shipping JavaScript only for interactive components.

## Go deeper
Streaming SSR streams HTML chunks progressively as backend queries resolve, allowing the browser to paint visible content early. Islands Architecture serves 100% static HTML by default and selectively hydrates only explicit interactive components, eliminating 80%+ of client JavaScript weight.


Comparing traditional monolithic hydration against Islands Architecture:

| Feature | Monolithic SSR / CSR | Islands Architecture (e.g. Astro) |
|---|---|---|
| Default JavaScript Payload | 200 KB – 800 KB (Entire framework) | **0 KB (Pure static HTML)** |
| Hydration Scope | Entire DOM tree hydrated top-to-bottom | **Only explicit interactive islands** |
| Main-Thread TBT | High (locks during full-page mount) | **Minimal (< 50ms)** |
| Component Isolation | Global state cascades can trigger re-renders | Islands hydrate independently |

## Watch out

- Nesting massive state trees across islands, accidentally pulling large shared state stores into client bundles.
- Assuming streaming SSR fixes slow backend queries; slow queries still delay the streamed content chunk.

## Remember

- Streaming SSR sends HTML progressively as it is generated, accelerating First Contentful Paint.
- Islands Architecture serves static HTML by default and hydrates only interactive components.
- Selective partial hydration eliminates 80%+ of client JavaScript weight, drastically improving INP.
