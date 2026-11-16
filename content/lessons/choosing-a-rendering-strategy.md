---
slug: choosing-a-rendering-strategy
title: "Choosing a Rendering Strategy"
topic: architecture-and-rendering
kind: technique
summary: "Evaluating content dynamism, user authentication, and Core Web Vitals trade-offs to select an architecture."
tags: [architecture, trade-offs, rendering-decision, cwv]
related: [client-side-rendering, server-side-rendering, static-site-generation]
---
> **In one line:** Choose your rendering strategy by balancing content dynamism, auth requirements, and Core Web Vitals priorities.

## The idea

There is no single "best" rendering strategy on the modern web. Every architecture—CSR, SSR, SSG, Streaming SSR, and Islands—represents a conscious set of engineering trade-offs between Time to First Byte, initial render speed, interactive responsiveness, infrastructure complexity, and hosting costs.

To select the optimal rendering pattern, evaluate four core criteria:
1. Content Dynamism: Does the content change per second (stock ticker), per deploy (blog post), or per user session (bank balance)?
2. Personalization & Auth: Is the content identical for all visitors, or tailored to a logged-in identity?
3. Core Web Vitals Sensitivity: Does the page rely on Google Search organic discovery (where LCP and CLS matter immensely), or is it behind a corporate authentication gate?
4. Team & Infrastructure Budget: Can the organization manage and scale Node.js/Edge server fleets, or is a zero-maintenance static CDN preferred?

## See it

```text
// Decision Flowchart for Selecting a Rendering Strategy
Is content personalized per request?
  +-- NO  --> Does content change frequently?
  |             +-- NO  --> [ Static Site Generation (SSG) / Islands ]
  |             +-- YES --> [ Incremental Static Regeneration (ISR) ]
  |
  +-- YES --> Is initial SEO and fast FCP critical?
                +-- YES --> [ Streaming SSR or Islands ]
                +-- NO  --> [ Client-Side Rendering (CSR) behind login ]
```

> **Note:** Performance is about selecting the right trade-off: balance TTFB, initial paint speed, and JavaScript cost.

## Go deeper
Selecting a rendering strategy requires balancing content dynamism, SEO requirements, authentication, and Core Web Vitals targets. Use SSG or Islands for public content where fast TTFB, LCP, and minimal JavaScript drive conversion; use CSR for authenticated, app-like experiences.


Architecture selection matrix across common web application archetypes:

| Application Archetype | Recommended Strategy | Primary Rationale |
|---|---|---|
| Marketing Landing Page | **SSG / Islands** | Instant TTFB (<50ms), optimal LCP, zero client JS |
| E-Commerce Product Page | **Streaming SSR / Islands** | Fast LCP for hero product, dynamic inventory stream |
| Documentation / Blog | **SSG (Astro / Hugo)** | 100% static, perfect SEO, zero hosting infrastructure |
| Authenticated SaaS Dashboard | **CSR (Vite / React SPA)** | Complex interactive state; behind auth; fast sub-routes |
| Social Media Feed | **Streaming SSR + Hydration** | Dynamic personalized feed with fast first paint |

## Watch out

- Defaulting to full CSR for public marketing sites where initial load and search ranking drive business value.
- Over-engineering a simple internal dashboard with complex streaming SSR when a basic SPA suffices.

## Remember

- There is no universally superior rendering architecture; every pattern trades off TTFB vs interactivity.
- Use SSG or Islands for public content where fast TTFB, LCP, and zero JavaScript drive conversion.
- Use CSR for authenticated, app-like experiences where subsequent client-side navigation dominates.
