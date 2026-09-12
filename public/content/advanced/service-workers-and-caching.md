---
id: lesson-22
slug: service-workers-and-caching
title: "Service Workers and the Cache API"
level: advanced
order: 22
duration: 20
tags:
  - service-workers
  - cache-api
  - offline
  - stale-while-revalidate
  - prpl
summary: "Programmable caching with service workers — a network proxy that intercepts fetches, the Cache API for storing responses, runtime strategies (cache-first, network-first, stale-while-revalidate), offline support, and the cache-versioning discipline that avoids serving stale assets forever."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what a **service worker** is: a programmable network proxy (HTTPS, no DOM).
- Use the **Cache API** to store and serve responses.
- Apply runtime strategies: **cache-first**, **network-first**, **stale-while-revalidate**.
- **Version** caches and clean them up on activate.
- Know a service worker **doesn't speed the first visit**, and recognize the **PRPL** pattern.

# Why It Matters

HTTP caching (Lesson 14) is powerful but declarative — you set headers and the browser decides. A **service
worker** gives you **programmable** control: it can serve assets instantly from a local cache, work **offline**,
and apply different strategies per request. It's how you turn repeat visits into near-instant, resilient
experiences — as long as you manage it carefully, because a mismanaged cache can serve stale content forever.

# Concept Explanation

### What a service worker is

A **service worker** is a script the browser runs **in the background**, separate from any page. It sits
between the page and the network as a **programmable proxy**: it can intercept requests via the **`fetch`**
event and decide how to respond. Key constraints:

- It requires **HTTPS** (localhost is exempt for development).
- It has **no DOM access** — it's not the page; it communicates via events and messaging.
- It's event-driven and can be started/stopped by the browser.

### The lifecycle

```text
register  ->  install (precache assets)  ->  activate (clean old caches)  ->  controls pages  ->  fetch events
```

An updated service worker installs in the background and, by default, **waits** until existing pages close
before activating (you can call `skipWaiting()`/`clients.claim()` to take over sooner — carefully).

### The Cache API

The **Cache API** (Cache Storage) stores **request/response pairs** under named caches. It's separate from the
HTTP cache and fully under your control in JavaScript — you decide what to store, when to serve it, and when to
delete it.

### Runtime caching strategies

- **Cache-first** — serve from cache, fall back to network. Best for **fingerprinted static assets** and
  fonts: instant and offline-capable.
- **Network-first** — try the network, fall back to cache. Best for **frequently-updated** content where
  freshness matters, with an offline fallback.
- **Stale-while-revalidate** — serve the cached copy **immediately** and fetch an update in the **background**
  for next time. A great balance for content that can be slightly stale.
- **Cache-only / network-only** — for assets that never change / must always be fresh.

### Version your caches (the classic footgun)

Name caches with a **version** and **delete old ones on `activate`**. If you don't, a stale cached asset can be
served **forever**, and users get old code after you deploy. Versioning + cleanup is what makes service-worker
caching safe.

### First visit and PRPL

A service worker installs **during or after** the first load, so it **does not speed up the first visit** — it
accelerates **subsequent** ones. A useful mental model is **PRPL**: **P**ush/preload the critical resources,
**R**ender the initial route, **P**re-cache remaining routes (via the service worker), and **L**azy-load the
rest on demand. Libraries like **Workbox** generate correct service workers with these strategies so you don't
hand-roll the tricky parts.

# Key Terminology

- **Service worker** — a background script acting as a programmable network proxy (HTTPS, no DOM).
- **`fetch` event** — where a service worker intercepts and answers network requests.
- **Cache API / Cache Storage** — JS-controlled storage of request/response pairs.
- **Cache-first / network-first / stale-while-revalidate** — runtime caching strategies.
- **Cache versioning** — naming caches by version and deleting old ones on activate.
- **PRPL** — Push/preload, Render, Pre-cache, Lazy-load.

# Options and Trade-offs

| Resource | Strategy | Why |
| -------- | -------- | --- |
| Fingerprinted JS/CSS, fonts | **Cache-first** | Immutable content — serve instantly, works offline. |
| Frequently-updated content/API | **Network-first** (cache fallback) | Freshness matters, but keep a copy for offline. |
| Content that can be slightly stale | **Stale-while-revalidate** | Instant response now, fresh next time. |
| Never/always changes | **Cache-only / network-only** | Fixed behavior when a resource truly never (or must always) update. |

# Worked Example

A minimal versioned service worker with precache, cleanup, and cache-first:

```javascript
// sw.js
const CACHE = 'assets-v3';                               // bump the version on each deploy
const PRECACHE = ['/', '/styles.css', '/app.js', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  // Delete old cache versions so we never serve stale assets forever.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first: serve cached copy, fall back to network.
  event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)));
});
```

Register it from the page (HTTPS required; localhost allowed):

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

And a stale-while-revalidate helper for content that can be slightly stale:

```javascript
async function staleWhileRevalidate(request) {
  const cache = await caches.open('swr-v1');
  const cached = await cache.match(request);
  const network = fetch(request).then((res) => {
    cache.put(request, res.clone()); // update the cache for next time
    return res;
  });
  return cached || network; // serve cache now if present, else wait for network
}
```

# Real World Analogy

A service worker is like a **personal mail assistant** who intercepts everything addressed to you. For your
**reference binder** (static assets) they hand you your **filed copy instantly** (cache-first). For the **daily
news** (fresh content) they run out to get today's edition but give you **yesterday's if the line is down**
(network-first with fallback). For some items they give you the **filed copy right now** while quietly
**ordering an updated one for next time** (stale-while-revalidate). But they only start on your **second** day
on the job — the first day's mail arrives before they're hired (no first-visit speedup) — and if they never
**throw out old files** (cache versioning), you'll keep getting last year's documents.

# Examples

## Example 1 — Basic: an offline app shell

Precaching the HTML shell, CSS, JS, and an `offline.html` on install lets the app load — and show a graceful
offline page — even with no network on a repeat visit.

**Why this works:** the essentials live in the Cache API, so the service worker can answer requests without the
network.

## Example 2 — Real-world: stale-while-revalidate for content

A news site served articles with **stale-while-revalidate**: readers got the cached article instantly, and the
service worker refreshed it in the background so the next view was current. Perceived speed jumped with no
loading spinner.

**Why this works:** it decouples "show something now" from "get the latest," giving instant responses that
self-heal.

## Example 3 — Pitfall: unversioned caches serve stale forever

A team precached assets under a fixed cache name and never cleaned up. After a deploy, returning users kept
getting the **old** JavaScript because the service worker served the stale cache indefinitely. Versioning the
cache (and deleting old versions on activate) fixed it.

**Why this bites:** without versioning + cleanup, a service worker can pin users to outdated code — the most
common service-worker bug.

# Common Mistakes

- **Not versioning caches** (or not cleaning up on activate), serving stale assets forever.
- **Expecting a first-visit speedup** — the service worker installs during/after the first load.
- **Using cache-first for frequently-changing content**, showing stale data.
- **Forgetting HTTPS** (outside localhost), so the service worker won't register.

# Best Practices

- **Version** caches and **delete old ones on `activate`**; treat cache names as part of your deploy.
- Match the **strategy to the resource**: cache-first for immutable assets, network-first for fresh content,
  stale-while-revalidate for the middle.
- Precache an **offline fallback**; keep the service worker logic small.
- Prefer a proven tool like **Workbox** over hand-rolling; remember service workers help **repeat** visits.

# Summary

- A **service worker** is a programmable network proxy (HTTPS, no DOM) that intercepts `fetch` events.
- The **Cache API** stores request/response pairs you fully control in JavaScript.
- Choose a strategy per resource: **cache-first**, **network-first**, or **stale-while-revalidate**.
- **Version caches** and clean up on activate — or risk serving stale content forever.
- Service workers speed **repeat** visits (not the first) and enable **offline**; **PRPL** is a useful pattern.

# Flash Cards

Q: What is a service worker, and what are its key constraints?
A: A background script that acts as a programmable network proxy, intercepting requests via the `fetch` event. It requires HTTPS (except localhost) and has no DOM access.

Q: What's the difference between cache-first and network-first strategies?
A: Cache-first serves the cached copy and falls back to the network (best for immutable assets, fast/offline); network-first tries the network and falls back to cache (best for fresh content, with offline resilience).

Q: What does stale-while-revalidate do?
A: It serves the cached response immediately and fetches an updated one in the background to store for next time — instant response now, fresh later.

Q: Why must you version your caches and clean up old ones on activate?
A: Otherwise a service worker can serve a stale cached asset forever, so users keep getting old code after a deploy — the most common service-worker bug.

Q: Does a service worker speed up the first visit?
A: No — it installs during or after the first load, so it accelerates subsequent visits (and enables offline), not the first one.

Q: What does the PRPL pattern stand for?
A: Push/preload critical resources, Render the initial route, Pre-cache remaining routes (via the service worker), and Lazy-load the rest on demand.

# Exercises

### Easy
In DevTools → **Application → Service Workers** and **Cache Storage**, inspect a site that uses a service
worker (many PWAs do). What's cached? Is the cache name versioned?

### Medium
Write a minimal service worker that precaches an app shell and serves it cache-first, with an `offline.html`
fallback when both cache and network miss. Test it by going offline in DevTools.

### Challenging
Design a caching strategy per resource type for a content site: which assets are cache-first, which content is
network-first vs stale-while-revalidate, and how you'll version and clean up caches across deploys so users
never get stuck on old code.

# Further Reading

- MDN — *Using Service Workers*: <https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers>
- MDN — *Cache API*: <https://developer.mozilla.org/en-US/docs/Web/API/Cache>
- web.dev — *The Offline Cookbook (caching strategies)*: <https://web.dev/articles/offline-cookbook>
- Chrome for Developers — *Workbox*: <https://developer.chrome.com/docs/workbox>
