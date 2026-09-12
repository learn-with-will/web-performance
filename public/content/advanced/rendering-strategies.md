---
id: lesson-21
slug: rendering-strategies
title: "Rendering Strategies"
level: advanced
order: 21
duration: 20
tags:
  - rendering
  - ssr
  - ssg
  - csr
  - hydration
summary: "Where and when HTML is generated — client-side rendering, server-side rendering, static generation, and hybrids like streaming SSR and islands — and how each trades off TTFB, first paint, JavaScript cost, and interactivity, with hydration as the hidden tax."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Describe **CSR**, **SSR**, and **SSG/prerendering** and how they differ.
- Explain **hydration** and why it can hurt **INP**.
- Map each strategy to its **TTFB / FCP / LCP / INP** trade-offs.
- Recognize **streaming SSR** and **islands / partial hydration**.
- Choose a strategy based on **content type**, knowing there's no universal winner.

# Why It Matters

*Where* and *when* your HTML is produced sets a ceiling on how fast a page can be. Ship an empty shell and make
the browser build everything, and no amount of image tuning fixes the slow first paint. Render at build time
and serve from a CDN, and you start far ahead. Rendering strategy is an architectural decision with the
biggest leverage — and the most trade-offs.

# Concept Explanation

### Client-Side Rendering (CSR)

The server sends a near-empty HTML shell plus a JavaScript bundle; the **browser** builds the UI. TTFB is low
(the shell is tiny/static), but **FCP and LCP are late** because the user sees nothing until the JS downloads,
parses, and runs — and that's a lot of JavaScript. Good for app-like, behind-login dashboards; poor for
content pages and first-paint/SEO.

### Server-Side Rendering (SSR)

The server renders **full HTML per request**. The user sees **content sooner** (it's in the HTML), improving
FCP/LCP, and it's SEO-friendly. Costs: **higher TTFB** (the server does work per request) and the need for
**hydration**.

### Hydration — the hidden tax

After SSR (or SSG) HTML arrives, a framework downloads its JavaScript and **hydrates**: it re-builds component
state and attaches event listeners to the existing DOM so the page becomes interactive. Hydration is
**main-thread work**, so a page can *look* ready while taps do nothing — hurting **INP** right after load (the
"looks interactive but isn't" gap). More components = more hydration cost.

### Static Site Generation (SSG) / prerendering

HTML is generated **at build time** and served as static files, ideally from a **CDN**. This gives the **best
TTFB and FCP** and is cheap and cacheable — but it's not suited to data that changes **per request** or
**per user**. (This very course is effectively static/SSG.) **Incremental/On-demand revalidation** (ISR) is
SSG that regenerates pages periodically or on demand to stay fresh.

### Hybrids: streaming SSR and islands

- **Streaming SSR** — the server **flushes HTML in chunks** as it's ready (rather than waiting for the whole
  page), so the browser paints the top sooner. (React streaming with Suspense is one example.)
- **Islands / partial hydration** — render mostly **static HTML** and hydrate only the interactive "islands,"
  shipping far less JavaScript (e.g. Astro). Related: **React Server Components** render on the server and
  ship no JS for those parts.

### There is no universal winner

Each strategy trades TTFB against FCP against interactivity:

```text
Strategy      TTFB     FCP/LCP        JS shipped     INP risk        Best for
-----------   ------   -----------    -----------    ------------    ------------------------------
CSR           low      late           high           high (all JS)   app-like, behind-login dashboards
SSR           higher   early          medium/high    hydration       dynamic, per-request content
SSG/prerender lowest   earliest       low–medium     low             mostly-static content (blogs, docs)
Streaming SSR higher   early (chunked) medium/high   hydration       large dynamic pages
Islands       low      early          lowest         lowest          content + a few interactive parts
```

# Key Terminology

- **CSR** — client-side rendering; the browser builds the UI from JS.
- **SSR** — server-side rendering; HTML rendered per request on the server.
- **SSG / prerendering** — HTML generated at build time, served static.
- **Hydration** — attaching JS interactivity to server-rendered HTML (main-thread cost).
- **Streaming SSR** — flushing HTML in chunks as it's ready.
- **Islands / partial hydration** — hydrate only interactive parts of an otherwise static page.

# Options and Trade-offs

| Content type | Best fit | Why |
| ------------ | -------- | --- |
| Blog, docs, marketing | **SSG/prerender** (+ CDN) | Content rarely changes; static is fastest and cheapest. |
| Per-request/personalized page | **SSR** (or streaming) | Content depends on the request; render it server-side, stream to paint sooner. |
| Highly interactive app behind login | **CSR** or **islands** | SEO/first paint matter less; interactivity dominates. |
| Mostly static + a few widgets | **Islands / partial hydration** | Ship minimal JS; hydrate only the interactive bits to protect INP. |

# Worked Example

Choosing a strategy for three surfaces of one company:

```text
Marketing site (blog + landing pages):
  Content changes rarely, SEO matters, must be fast globally.
  -> SSG/prerender, served from a CDN. Best TTFB/FCP, cheap, cacheable.

Product catalog (per-request pricing/stock):
  Data is dynamic and SEO matters.
  -> SSR (ideally streaming) so HTML has real content early; keep hydration light.

Logged-in dashboard (charts, editors):
  Behind login, highly interactive, SEO irrelevant.
  -> CSR (or islands for the static parts), code-split heavily to protect INP.
```

The same company uses **different** strategies per surface — matching how dynamic and interactive each one is.

# Real World Analogy

Rendering strategies are ways to **serve a meal**. **SSR** is **cook-to-order**: fresh and exactly right, but
the kitchen works on every order (higher TTFB). **SSG** is **ready-made meals** prepared in advance and kept on
the shelf — instant to hand over, but not customized per diner. **CSR** is handing the diner **raw ingredients
and a recipe** to assemble at the table — cheap for the kitchen, slow for a hungry guest. **Hydration** is
plating a dish in advance but **finishing the garnish at the table** — it looks served, yet isn't quite ready
to eat for a moment. **Islands** is a **buffet of mostly ready dishes** with a couple of made-to-order stations.

# Examples

## Example 1 — Basic: a blog should be static

A blog rendered client-side showed a spinner for a second on every article while the JS booted. Switching to
**SSG** (build-time HTML on a CDN) made articles appear immediately, with tiny JavaScript.

**Why this works:** static content doesn't need per-request rendering; prebuilt HTML on a CDN is the fastest,
cheapest option.

## Example 2 — Real-world: CSR SPA with slow LCP

A marketing SPA had a great TTFB but LCP around 5 s, because content only appeared after a large bundle ran.
Moving to **SSR with streaming** put real content in the initial HTML, cutting LCP sharply — while they trimmed
the bundle to keep hydration cheap.

**Why this works:** putting content in the server HTML removes the "download and run JS before anything shows"
delay.

## Example 3 — Pitfall: heavy hydration hurts INP

An SSR site looked ready instantly but ignored taps for ~800 ms after load, because hydrating a huge component
tree monopolized the main thread. Reducing client JavaScript (islands + server components) and code-splitting
brought INP back under control.

**Why this bites:** SSR fixes first paint but hydration is main-thread work — too much of it creates a page
that looks interactive before it is.

# Common Mistakes

- **Using CSR for content/SEO pages**, delaying FCP/LCP behind a big bundle.
- **Treating SSR as free** — it raises TTFB and adds hydration cost.
- **Ignoring hydration's INP cost**, shipping a huge interactive tree.
- **Rendering static content per request** instead of prebuilding it (SSG).

# Best Practices

- Match the strategy to the **content**: static → **SSG/CDN**; per-request → **SSR/streaming**; app-like →
  **CSR/islands**.
- Keep **hydration light** — ship less client JS; prefer **islands / server components** where possible.
- Use **streaming SSR** to paint sooner on large dynamic pages.
- Whatever you choose, still apply the earlier lessons (images, caching, JS cost) — strategy sets the ceiling,
  not the whole result.

# Summary

- Rendering strategy decides **where/when HTML is made**, setting the ceiling on speed.
- **CSR** (browser builds UI) is late-painting and JS-heavy; **SSR** paints early but adds TTFB and
  **hydration**; **SSG** is fastest for static content.
- **Hydration** is main-thread work that can hurt **INP** — a page can look ready before it's interactive.
- **Streaming SSR** paints sooner; **islands / partial hydration** ship the least JS.
- There's **no universal winner** — choose per content type.

# Flash Cards

Q: What is the core difference between CSR, SSR, and SSG?
A: CSR builds the UI in the browser from JavaScript; SSR renders full HTML on the server per request; SSG generates HTML at build time and serves it static. They trade TTFB, first paint, and JS cost differently.

Q: What is hydration and why can it hurt INP?
A: After server-rendered HTML arrives, the framework downloads JS and attaches interactivity (state, event listeners) to the existing DOM. That's main-thread work, so a heavily-hydrating page can look ready while taps are ignored for a moment.

Q: Which strategy is usually best for a blog or docs site, and why?
A: SSG/prerendering served from a CDN — the content rarely changes, so prebuilt static HTML gives the best TTFB and FCP at low cost, and caches well.

Q: What does streaming SSR do?
A: The server flushes HTML in chunks as each part is ready, instead of waiting for the whole page, so the browser can paint the top of the page sooner.

Q: What is the islands (partial hydration) approach?
A: Render mostly static HTML and hydrate only the interactive "islands," shipping far less JavaScript and protecting INP, while the static parts need no client JS.

Q: Is there a single best rendering strategy?
A: No — each trades TTFB, first paint, JavaScript cost, and interactivity differently, so you choose based on how dynamic and interactive the content is (and different pages can use different strategies).

# Exercises

### Easy
For three sites you use (a blog, a store, a web app), guess which rendering strategy each uses and why. Check
by viewing source: is real content in the initial HTML, or just an empty shell + script?

### Medium
Take a client-rendered page and describe what would change (TTFB, FCP/LCP, INP) if it were server-rendered
instead. What new cost (hydration) would you need to manage?

### Challenging
Design the rendering strategy for a product with a marketing site, a dynamic catalog, and a logged-in
dashboard. Justify a different choice per surface and explain how you'd keep hydration from hurting INP.

# Further Reading

- web.dev — *Rendering on the web*: <https://web.dev/articles/rendering-on-the-web>
- web.dev — *Learn Performance: rendering strategies*: <https://web.dev/learn/performance>
- Astro — *Islands architecture*: <https://docs.astro.build/en/concepts/islands/>
- React — *Server-rendering & streaming APIs*: <https://react.dev/reference/react-dom/server>
