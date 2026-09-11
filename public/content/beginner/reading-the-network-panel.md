---
id: lesson-07
slug: reading-the-network-panel
title: "Reading the Network Panel"
level: beginner
order: 7
duration: 17
tags:
  - devtools
  - network-panel
  - waterfall
  - request-timing
  - throttling
summary: "Reading the browser's Network panel and its request waterfall — the timing phases of each request, the size-versus-transferred and priority columns, throttling and cache options, and how to spot blocking, oversized, or late-loading resources."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Record and read the **Network panel** and its **waterfall**.
- Interpret each request's **timing phases** (queueing, connection, waiting/TTFB, download).
- Read the key columns: **status, type, initiator, size vs transferred, priority**.
- Use **network/CPU throttling** and **Disable cache** to test realistic conditions.
- Spot **render-blocking, oversized, and late-starting** resources — including the LCP image.

# Why It Matters

Metrics tell you *that* a page is slow; the **waterfall** shows you *why*. It's the single richest view of a
page load: every request, when it started, how long each phase took, how big it was, and what triggered it.
Once you can read it, loading problems — a blocking script, a giant image, a long dependency chain — jump
right out.

# Concept Explanation

### Recording a load

Open DevTools → **Network**, then **reload** with it open (it only records while open). Two toggles matter:

- **Disable cache** — forces a cold, first-visit load. Turn it **on** to test new visitors; **off** to see
  repeat visits.
- **Preserve log** — keeps requests across navigations.

Add **throttling** (a "Slow 4G" network preset and/or CPU slowdown) so you see what a real phone experiences,
not your fast connection.

### The columns

Each row is one request. The columns worth knowing:

- **Name** — the file/URL.
- **Status** — HTTP status (200 OK, **304 Not Modified** = revalidated cache hit, 200 *(from disk/memory
  cache)* = served locally).
- **Type** — document, stylesheet, script, image, font, fetch…
- **Initiator** — *what* requested this (the HTML, or another script) — reveals dependency chains.
- **Size / Transferred** — **Transferred** is bytes over the wire (after compression); **Size** is the
  uncompressed resource. A big gap means good compression; "(from cache)" means it wasn't downloaded.
- **Time** — total duration.
- **Priority** — the browser's fetch priority (Highest → Low), which controls ordering.

### The waterfall and its timing phases

The **waterfall** plots each request as a horizontal bar over time. Hover a bar (or open **Timing**) to see
the same phases from Lesson 2, now **per request**:

```text
|Queueing/Stalled|DNS|Initial connection|SSL|Request sent|====== Waiting (TTFB) ======|Content Download|
```

- **Queueing / Stalled** — waiting for a free connection or higher-priority requests.
- **DNS / Initial connection / SSL** — setup (only on the first request to an origin; reused after).
- **Waiting (TTFB)** — request sent, waiting for the first byte.
- **Content Download** — receiving the bytes.

### Reading order and dependencies

The HTML document loads first; as the browser parses it, it discovers and requests more resources. The
**Initiator** column shows these chains: HTML → CSS/JS, and a script may itself request more (a **request
chain**). Long chains delay everything downstream. **Render-blocking** resources (CSS, sync scripts) appear
early and gate the first paint; a **late-starting LCP image** — one that only begins downloading after a
chain of other work — is a classic LCP problem you can see directly in the waterfall.

# Key Terminology

- **Waterfall** — the time-ordered chart of all requests and their phases.
- **Initiator** — what caused a request (used to trace dependency chains).
- **Transferred vs resource size** — bytes over the wire (compressed) vs uncompressed size.
- **Priority** — the browser's fetch priority for a request, controlling order.
- **Disable cache** — DevTools toggle to force a cold, first-visit load.
- **Throttling** — emulating a slower network and/or CPU to mimic real devices.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Cache | Leave enabled | **Disable cache** | Disable to test first-time visitors; enable to inspect repeat-visit behavior. |
| Network | No throttling | **Slow 4G** + CPU throttle | Throttle to see what real mobile users experience. |
| Reading a slow load | Look at total time only | Inspect **per-request phases** | The phase breakdown shows whether it's setup, waiting, or download. |
| Chasing order | Guess | Use the **Initiator** column | Trace what requested what to find long dependency chains. |

# Worked Example

A simplified waterfall for a slow first paint (time flows left→right):

```text
index.html      |==conn==|=TTFB=|dl|
styles.css              |==conn==|=TTFB=|dl|                 (render-blocking)
app.js                  |==conn==|=TTFB=|==dl==|             (blocking script in <head>)
hero.jpg                                    |==conn==|=TTFB=|=======dl=======|  <- LCP image
first paint  ......................................|                         (waits on CSS + JS)
LCP          ...................................................................|

Diagnosis: the hero (LCP element) doesn't even START downloading until CSS and the
blocking script are done. The LCP is gated by a chain, not by the image's own size.
Fixes: defer app.js, preload the hero, and don't lazy-load it.
```

You can literally see the problem: the most important image starts late because earlier, blocking work is in
front of it.

# Real World Analogy

A waterfall is like a **project Gantt chart**. Each request is a task with a start, a duration, and
dependencies: some tasks can't begin until others finish (the hero image "task" waits on the "parse HTML"
and "run script" tasks). Reading the chart tells you the **critical path** — the chain of tasks that decides
the finish time — so you know which task to shorten or start earlier.

# Examples

## Example 1 — Basic: find the biggest download

Sort the Network list by the **Transferred** column (descending). The largest rows are usually images or
JavaScript. This instantly answers "what's heaviest?" — often an unoptimized image or a big bundle.

**Why this works:** sorting by transferred bytes surfaces the payload that costs the most network time, a
prime optimization target.

## Example 2 — Real-world: a blocking third-party script

The waterfall shows a gap where nothing paints while a third-party `tag.js` (Priority: High, in the
`<head>`, no `async`) downloads over a fresh connection. Its **Initiator** is the HTML; everything after
waits. Marking it `async` removes the gap.

**Why this matters:** the waterfall makes a render-blocking request visually obvious — a stall before the
first paint.

## Example 3 — Pitfall: measuring with the cache on

A developer profiles a repeat visit with cache enabled, sees tiny "(from disk cache)" entries, and concludes
the site is fast. First-time visitors — with an empty cache — download everything. Checking **Disable
cache** reveals the real first-visit cost.

**Why this bites:** repeat-visit numbers hide the first-visit experience most new users have.

# Common Mistakes

- **Not disabling cache** when testing the first-visit experience.
- **Ignoring the Initiator column**, so long dependency chains go unnoticed.
- **Confusing Transferred with Size**, missing that a resource is (or isn't) compressed.
- **Testing without throttling**, so mobile problems stay invisible.

# Best Practices

- Reload with the panel **open**, **cache disabled**, and **throttling on** for first-visit realism.
- Read **per-request phases** to tell setup/waiting/download apart.
- Follow the **Initiator** chains to find late-starting critical resources (like the LCP image).
- Sort by **Transferred** to find the heaviest downloads to optimize first.

# Summary

- The **Network panel** records every request; the **waterfall** shows when each started and its phases.
- **Timing phases** (queueing, connection, waiting/TTFB, download) reveal *where* a request spends time.
- **Transferred vs Size** shows compression/caching; **Initiator** reveals dependency chains; **Priority**
  shows ordering.
- Use **Disable cache** and **throttling** to test the real first-visit mobile experience.
- The waterfall is where you spot **blocking, oversized, and late-starting** resources — including a
  late LCP image.

# Flash Cards

Q: What does the request "waterfall" show?
A: Every request plotted over time, with each request's timing phases, so you can see load order, dependencies, durations, and where time is spent.

Q: What's the difference between the "Transferred" and "Size" columns?
A: Transferred is the bytes sent over the wire (after compression); Size is the uncompressed resource size. A large gap indicates effective compression; "(from cache)" means it wasn't downloaded at all.

Q: What does the "Initiator" column tell you?
A: What caused each request (the HTML or another script), letting you trace dependency chains where one resource must finish before another can start.

Q: Why enable "Disable cache" when profiling?
A: To simulate a first-time visitor with an empty cache; otherwise repeat-visit "(from cache)" entries hide the real first-visit download cost.

Q: What are the main per-request timing phases?
A: Queueing/Stalled, DNS, Initial connection, SSL, Request sent, Waiting (TTFB), and Content Download — the same stages as a page load, shown for each request.

Q: How can the waterfall reveal a slow LCP image?
A: You can see the LCP image start downloading late — only after a chain of blocking CSS/JS — meaning its start is gated by earlier work, not the image's own size.

# Exercises

### Easy
Open the Network panel with **Disable cache** on, reload a site, and click the HTML document request. Read
its **Timing** breakdown and name the phase that took longest.

### Medium
Sort requests by **Transferred**. What are the three heaviest resources? For each, note its Type and whether
it looks compressed (compare Transferred vs Size).

### Challenging
Find a page's LCP image in the waterfall and trace its **Initiator** chain back to the HTML. Is it starting
as early as it could? Propose one change (preload, defer a blocking script, don't lazy-load it) and predict
how the waterfall would change.

# Further Reading

- Chrome for Developers — *Network features reference*: <https://developer.chrome.com/docs/devtools/network>
- Chrome for Developers — *Inspect network activity*: <https://developer.chrome.com/docs/devtools/network/reference>
- MDN — *Network Monitor*: <https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor>
- web.dev — *Lab and field measurement tools*: <https://web.dev/learn/performance/lab-and-field-measurement-tools>
