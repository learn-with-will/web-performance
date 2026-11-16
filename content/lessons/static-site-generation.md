---
slug: static-site-generation
title: "Static Site Generation (SSG)"
topic: architecture-and-rendering
kind: concept
summary: "Pre-rendering HTML at build time for instant CDN delivery, zero server runtime overhead, and optimal speed."
tags: [ssg, jamstack, edge-caching, build-time]
related: [server-side-rendering, client-side-rendering, choosing-a-rendering-strategy]
---
> **In one line:** Static Site Generation pre-renders all HTML pages at build time, enabling instant global CDN delivery.

## The idea

Static Site Generation (SSG)—popularized by Jamstack frameworks like Astro, Next.js, Hugo, and Gatsby—combines the lightning-fast delivery of static files with the developer ergonomics of modern component-based frameworks.

In SSG, the rendering process occurs exactly once: during your production build pipeline in CI/CD. The build tool queries your headless CMS or database, renders every route into pre-built static HTML, CSS, and JavaScript files, and deploys the entire directory to a global edge CDN.

Because the HTML is already fully formed on disk before any user visits, SSG delivers the best possible performance profile:
1. Instantaneous TTFB: Edge CDNs serve cached static HTML in 10 to 30 milliseconds from local PoPs.
2. Rapid FCP and LCP: The browser paints content on the very first round trip.
3. Unmatched Scalability: Traffic spikes of millions of concurrent users hit static CDN cache without touching a database or crashing origin servers.

The primary limitation of SSG is build time: sites with hundreds of thousands of dynamic pages require long build steps or hybrid incremental static regeneration (ISR).

## See it

```javascript
// Next.js Static Site Generation (SSG) example using getStaticProps
export async function getStaticProps() {
  // Runs strictly at BUILD time on CI/CD; never runs on user requests!
  const res = await fetch('https://api.example.com/blog/posts');
  const posts = await res.json();

  return {
    props: { posts },
  };
}

export default function BlogList({ posts }) {
  return (
    <div>
      <h1>Latest Posts</h1>
      {posts.map(p => <article key={p.id}><h2>{p.title}</h2></article>)}
    </div>
  );
}
```

> **Tip:** SSG delivers near-instant TTFB (< 50ms) because fully-rendered HTML is served directly from edge CDN storage.

## Go deeper

Comparing Static Site Generation (SSG) against dynamic SSR:

| Architectural Metric | Static Site Generation (SSG) | Dynamic Server-Side Rendering (SSR) |
|---|---|---|
| When HTML is Built | **Ahead-of-time (Build / CI)** | On-demand (User request time) |
| Time to First Byte (TTFB) | **Optimal (10 ms – 50 ms)** | Moderate (150 ms – 600 ms) |
| Scalability Under Load | Virtually infinite (CDN edge cached) | Bound by origin CPU and database pool |
| Data Freshness | Content baked in until next build/ISR | Always live and instantaneous |
| Ideal Use Case | Documentation, marketing, blogs | Personalized dashboards, real-time feeds |

## Watch out

- Using pure SSG for large e-commerce platforms with 500,000 SKUs, resulting in 4-hour CI build times.
- Relying on client-side fetch after SSG load for basic text that could have been pre-rendered at build time.

## Remember

- SSG renders all HTML pages ahead-of-time during build and deploys them to global edge CDNs.
- SSG delivers the fastest possible TTFB, FCP, and LCP with zero server runtime overhead.
- SSG is the optimal architecture for marketing sites, blogs, and documentation portals.
