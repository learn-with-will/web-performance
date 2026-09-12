---
id: lesson-18
slug: reducing-main-thread-work
title: "Reducing Main-Thread Work"
level: advanced
order: 18
duration: 20
tags:
  - main-thread
  - long-tasks
  - web-workers
  - scheduling
  - tbt
summary: "Keeping the browser's single main thread free — understanding what it does, breaking up long tasks and scheduling work with the right API, moving heavy computation to Web Workers, and avoiding forced synchronous layout (layout thrashing)."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what the **main thread** does and why it's a bottleneck.
- Identify **long tasks** and their effect on **TBT** and **INP**.
- **Break up** and **schedule** work with the right API.
- Move heavy computation to a **Web Worker**.
- Avoid **forced synchronous layout** (layout thrashing).

# Why It Matters

The browser does almost everything on **one main thread**: running JavaScript, calculating styles and layout,
painting, and handling your clicks and scrolls. If that thread is busy with a long task, the page can't
respond to input or render the next frame — so it feels frozen. This is the machinery behind **INP** and
**TBT**, and keeping the main thread free is the core skill of runtime performance.

# Concept Explanation

### What the main thread does

Style calculation, layout, paint, JavaScript execution, and event handling are all **serialized** on the main
thread — only one can happen at a time. A **long task** (over **50 ms**) monopolizes the thread; **Total
Blocking Time (TBT)** sums the blocking part of long tasks during load, and long tasks during interactions
inflate **INP**.

### Break up long tasks and schedule work

Beyond simply doing less (Lesson 17), split remaining work and use the right scheduling primitive:

- **Break up + yield** — chunk a big loop and `await` a yield between chunks so the browser can render and
  respond (Lesson 11's `yieldToMain`).
- **`requestAnimationFrame(cb)`** — run visual updates **just before the next paint**; use it for animation
  and DOM changes tied to a frame.
- **`requestIdleCallback(cb)`** — run **low-priority** background work when the browser is idle (analytics
  flushing, prefetch, non-urgent caching).
- **`scheduler.postTask()`** — the Prioritized Task Scheduling API to queue tasks at explicit priorities
  (`background`/`user-visible`/`user-blocking`); emerging support as of writing.

Rule of thumb: **animation → `requestAnimationFrame`**, **non-urgent → `requestIdleCallback`**, **urgent but
chunkable → break up and yield**.

### Move heavy computation to a Web Worker

A **Web Worker** runs JavaScript on a **separate thread**, so heavy, self-contained computation doesn't block
the UI. Workers **cannot touch the DOM**; they communicate via `postMessage`. Use them for parsing big
datasets, image/audio processing, or expensive number-crunching.

```javascript
// main.js — hand heavy work to a worker; the main thread stays free for UI and input.
const worker = new Worker('/worker.js');
worker.postMessage({ rows: bigDataset });
worker.onmessage = (e) => render(e.data.result); // DOM work stays on the main thread
```

```javascript
// worker.js — runs off the main thread; no DOM access here.
self.onmessage = (e) => {
  const result = crunch(e.data.rows); // expensive, but not blocking the UI
  self.postMessage({ result });
};
```

### Avoid forced synchronous layout (layout thrashing)

Reading a layout property (`offsetHeight`, `getBoundingClientRect()`) **after** a style write forces the
browser to recompute layout **immediately** — and doing it in a loop causes repeated reflows. **Batch reads,
then writes:**

```javascript
// BAD: read after write, every iteration -> forced reflow each time
for (const el of boxes) el.style.height = el.offsetHeight + 10 + 'px';

// GOOD: all reads first, then all writes -> one layout pass
const heights = boxes.map((el) => el.offsetHeight);      // reads
boxes.forEach((el, i) => (el.style.height = heights[i] + 10 + 'px')); // writes
```

### Debounce and throttle high-frequency events

`scroll`, `resize`, `pointermove`, and rapid `input` can fire dozens of times a second. **Throttle** (run at
most every N ms) or **debounce** (run after activity stops) their expensive handlers so they don't flood the
main thread.

# Key Terminology

- **Main thread** — the single thread running JS, style, layout, paint, and events.
- **Long task** — main-thread work over 50 ms that blocks rendering and input.
- **TBT** — Total Blocking Time; the summed blocking time of long tasks during load.
- **Web Worker** — a background thread for JS with no DOM access, via `postMessage`.
- **`requestIdleCallback` / `requestAnimationFrame`** — schedule idle-time / pre-paint work.
- **Forced synchronous layout** — reading layout right after a write, forcing an immediate reflow.

# Options and Trade-offs

| Work type | Option A | Option B | How to choose |
| --------- | -------- | -------- | ------------- |
| Heavy pure computation | Run on main thread | **Web Worker** | Offload to a worker when it doesn't need the DOM; keeps the UI responsive. |
| Visual update | `setTimeout` | **`requestAnimationFrame`** | rAF aligns with the paint cycle; setTimeout can cause jank or extra work. |
| Non-urgent work | Run now | **`requestIdleCallback`** | Defer analytics/prefetch to idle time so it doesn't compete with the UI. |
| Big loop | Run all at once | **Chunk + yield** | Break it up so input/rendering can interleave. |

# Worked Example

Offloading a data crunch and fixing a thrash in the same page:

```javascript
// 1) Parsing a large CSV blocks the UI on the main thread. Offload it:
const worker = new Worker('/parse-worker.js');
worker.postMessage(csvText);
worker.onmessage = (e) => {
  // Back on the main thread only to touch the DOM:
  updateTable(e.data.rows);
};

// 2) A resize handler was thrashing layout. Batch reads/writes and throttle it:
let scheduled = false;
window.addEventListener('resize', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    const widths = cards.map((c) => c.clientWidth);          // reads
    cards.forEach((c, i) => (c.style.height = widths[i] + 'px')); // writes
    scheduled = false;
  });
});
```

The parse no longer freezes the page (it's on a worker), and the resize handler does one batched read/write per
frame instead of thrashing layout on every event.

# Real World Analogy

The main thread is a **single chef** who cooks, takes orders, and buses tables. If they start a 20-minute
sauce reduction and refuse to stop (a long task), waiting customers can't order — the restaurant "freezes."
Good kitchens **hire a prep cook** for chopping and stock (a Web Worker), **take quick orders between steps**
(yielding), and don't **run to the pantry mid-plating to double-check an ingredient** every few seconds
(forced synchronous layout). One chef can still feel responsive if they never lock themselves into one long,
uninterruptible job.

# Examples

## Example 1 — Basic: move a computation to a worker

A page froze for a second while scoring a large dataset. Moving the scoring into a Web Worker kept the main
thread free — the spinner animated and buttons responded while the work ran in the background.

**Why this works:** the heavy computation no longer competes with the UI for the one main thread.

## Example 2 — Real-world: rAF + throttle for a scroll effect

A parallax scroll handler ran expensive layout reads on every scroll event, causing jank. Throttling it to one
`requestAnimationFrame` per frame (and batching reads before writes) made scrolling smooth.

**Why this works:** aligning to the frame and avoiding per-event layout thrash cuts the main-thread work per
scroll.

## Example 3 — Pitfall: layout thrashing in a loop

Code set each element's width and then read a neighbor's height in the same loop, forcing a reflow every
iteration and turning a quick update into a long task. Splitting into a read pass and a write pass fixed it.

**Why this bites:** interleaving reads and writes forces the browser to recompute layout repeatedly.

# Common Mistakes

- **Running heavy computation on the main thread** when a Web Worker would free it.
- **Layout thrashing** — reading layout right after writing, in a loop.
- **Using `setTimeout` for animation** instead of `requestAnimationFrame`.
- **Not throttling/debouncing** high-frequency events (scroll, resize, input).

# Best Practices

- **Break up long tasks** and yield; keep individual tasks well under 50 ms.
- Move **DOM-free heavy computation** to a **Web Worker**.
- Use **`requestAnimationFrame`** for visual work and **`requestIdleCallback`** for non-urgent work.
- **Batch DOM reads then writes** to avoid forced reflows; **throttle/debounce** frequent events.

# Summary

- The **main thread** serializes JS, style, layout, paint, and events — a **long task** freezes all of them.
- Long tasks drive **TBT** and **INP**; break them up and **yield**.
- Offload **DOM-free heavy computation** to a **Web Worker**.
- Schedule with the right API: **rAF** for visuals, **`requestIdleCallback`** for non-urgent work.
- Avoid **forced synchronous layout** by batching reads/writes, and **throttle/debounce** frequent events.

# Flash Cards

Q: What work happens on the browser's main thread?
A: JavaScript execution, style calculation, layout, paint, and event handling — all serialized on one thread, so a long task blocks everything else.

Q: What is a long task and why does it matter?
A: Main-thread work over 50 ms; it blocks rendering and input, inflating Total Blocking Time (lab) and INP (field), so the page feels unresponsive.

Q: What can and can't a Web Worker do?
A: It runs JavaScript on a separate thread (great for heavy, DOM-free computation) and communicates via postMessage, but it cannot access the DOM directly.

Q: When should you use requestAnimationFrame vs requestIdleCallback?
A: requestAnimationFrame for visual updates that should happen just before the next paint (animation); requestIdleCallback for low-priority background work during idle time.

Q: What is forced synchronous layout (layout thrashing) and how do you avoid it?
A: Reading a layout property right after a style write forces an immediate reflow; in a loop it repeats. Avoid it by batching all reads first, then all writes.

Q: Why throttle or debounce scroll and resize handlers?
A: Those events fire many times per second; throttling (run at most every N ms) or debouncing (run after activity stops) prevents expensive handlers from flooding the main thread.

# Exercises

### Easy
In DevTools' Performance panel, record an interaction and find a **long task** (a red-flagged block over
50 ms). What runs inside it?

### Medium
Take a synchronous heavy computation and move it into a Web Worker, updating the DOM only when the worker
posts back its result. Confirm the UI stays responsive while it runs.

### Challenging
Find a scroll or resize handler that reads and writes layout in a loop. Refactor it to batch reads then
writes and run at most once per `requestAnimationFrame`, and measure the reduction in main-thread time.

# Further Reading

- web.dev — *Optimize long tasks*: <https://web.dev/articles/optimize-long-tasks>
- MDN — *Using Web Workers*: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers>
- web.dev — *Avoid large, complex layouts and layout thrashing*: <https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing>
- MDN — *`Window.requestIdleCallback()`*: <https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback>
