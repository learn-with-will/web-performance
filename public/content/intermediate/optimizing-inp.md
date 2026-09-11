---
id: lesson-11
slug: optimizing-inp
title: "Optimizing Interaction to Next Paint"
level: intermediate
order: 11
duration: 20
tags:
  - inp
  - responsiveness
  - long-tasks
  - main-thread
  - event-handlers
summary: "Making interactions feel instant by attacking INP's three parts — input delay, processing time, and presentation delay — through breaking up long tasks, yielding to the main thread, minimizing handler work, and giving immediate visual feedback."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Break **INP** into **input delay**, **processing time**, and **presentation delay**.
- Explain why **long tasks** on the **main thread** cause slow interactions.
- **Yield** to the main thread and **break up** long tasks.
- Keep event handlers small and **defer non-urgent** work.
- Reduce **presentation delay** with immediate feedback and a lighter DOM.

# Why It Matters

**INP** is the responsiveness Core Web Vital (good ≤ **200 ms**). It's about the moment a user taps, clicks,
or types and waits for the page to *visibly* respond. Unlike loading, INP is a **runtime** problem dominated
by **main-thread JavaScript** — and it's the vital most sites now struggle with. The fixes are a distinct
skill: keep the main thread free so the browser can respond.

# Concept Explanation

### The three parts of an interaction

Every interaction's latency is:

```text
INP (one interaction) = input delay + processing time + presentation delay

  input delay        : time before your handler can even start (main thread busy)
  processing time    : your event handlers actually running
  presentation delay : time to render the next frame after the handlers finish
```

INP reports a value near the **worst** interaction of the visit. Each part has its own fixes.

### Input delay: keep the main thread free

The browser runs JavaScript on a single **main thread**. If it's busy with a **long task** (>50 ms) when the
user taps, the tap **waits** — that's input delay. The cause is usually heavy work: a big script executing,
a large re-render, expensive timers. The fix is to **break long tasks into smaller ones** and **yield** so
the browser can handle input between chunks:

```javascript
// Yield to the main thread so pending input (a click, a keypress) can be handled.
async function yieldToMain() {
  // scheduler.yield() is the modern API (Chromium, as of writing); setTimeout is the fallback.
  if ('scheduler' in window && 'yield' in scheduler) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function processItems(items) {
  for (const item of items) {
    doWork(item);
    // After each chunk, let the browser respond to any pending interaction.
    await yieldToMain();
  }
}
```

### Processing time: do less, and defer the rest

When your handler runs, do **only what's needed for the visual response** synchronously; push everything
non-urgent (analytics, logging, prefetching, non-visible updates) to **after** the paint:

```javascript
button.addEventListener('click', async () => {
  updateUIImmediately();     // the visible response the user is waiting for
  await yieldToMain();       // let the browser paint that response
  sendAnalytics();           // non-urgent work happens after the user sees the change
});
```

Avoid **layout thrashing** — interleaving DOM reads (`offsetWidth`, `getBoundingClientRect`) and writes in a
loop, which forces repeated synchronous reflows. Batch reads, then writes.

### Presentation delay: make rendering cheap

After the handler, the browser must render the next frame. This is slower with a **huge DOM**, complex CSS,
or expensive re-renders. Reduce DOM size, avoid re-rendering the whole page for a small change, and consider
CSS **`content-visibility: auto`** to skip rendering off-screen content. Giving **immediate feedback** (an
optimistic UI change) keeps the *perceived* response fast even if more work follows.

### Framework note

In component frameworks, INP is often hurt by **hydration** and **unnecessary re-renders**. Memoizing,
splitting state, and avoiding rendering large trees on every keystroke all reduce processing time.

# Key Terminology

- **INP** — Interaction to Next Paint; responsiveness vital (good ≤ 200 ms).
- **Input delay** — time before an event handler can start (main thread busy).
- **Processing time** — time the event handlers take to run.
- **Presentation delay** — time to render the next frame after the handlers.
- **Long task** — main-thread work over 50 ms that blocks input.
- **Yielding** — briefly returning control to the browser so it can respond.
- **Layout thrashing** — read/write DOM interleaving that forces repeated reflows.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Big task | Run it all at once | Break it up and **yield** | Break it up so interactions aren't blocked; batch work has its place off the interaction path. |
| Handler work | Do everything synchronously | Update UI, then defer the rest | Do the visible response first; defer analytics/non-urgent work after paint. |
| Frequent input | Handle every keystroke | **Debounce/throttle** | Debounce expensive work (search) so it runs once the user pauses. |
| Heavy computation | On the main thread | In a **Web Worker** | Move pure, heavy computation off-thread (next lesson) to keep the UI responsive. |

# Worked Example

Before — a click handler does everything synchronously and blocks the response:

```javascript
button.addEventListener('click', () => {
  const results = expensiveFilter(hugeList); // long task — blocks the UI
  render(results);                            // user waited the whole time
  logAnalytics();                             // and this too
});
```

After — respond first, yield so the browser paints, then do the rest:

```javascript
button.addEventListener('click', async () => {
  showSpinner();            // immediate visual feedback (small presentation delay)
  await yieldToMain();      // let the browser paint the spinner

  const results = await computeInChunks(hugeList); // broken into yielding chunks
  render(results);
  await yieldToMain();
  logAnalytics();           // non-urgent, after the user sees results
});
```

The interaction now *responds* almost immediately (spinner), and the heavy work no longer blocks the main
thread in one long task — INP drops.

# Real World Analogy

The main thread is a **single cashier**. If that cashier is in the back doing a full inventory count (a long
task), a customer at the register waits — that's **input delay**. A good cashier counts inventory in **small
batches**, stepping back to the register whenever someone walks up (yielding). And they greet the customer
and start ringing them up **immediately** (feedback) rather than finishing paperwork first. One cashier can
feel responsive if they never disappear into a long, uninterruptible job.

# Examples

## Example 1 — Basic: break up a long loop

Processing 10,000 items in one synchronous loop is a long task that freezes taps. Wrapping it to **yield
after each chunk** lets the browser handle interactions in between, so the page stays responsive even while
the work continues.

**Why this works:** the browser can only respond to input between tasks; smaller tasks mean more chances to
respond.

## Example 2 — Real-world: a search box that re-renders on every keystroke

A filter re-renders a 5,000-row list on every keystroke, so typing feels laggy (high processing +
presentation delay). **Debouncing** the filter (run it when typing pauses) and **virtualizing** the list
(render only visible rows) makes each keystroke cheap.

**Why this works:** less work per interaction lowers processing time, and a smaller rendered DOM lowers
presentation delay.

## Example 3 — Pitfall: synchronous analytics in the handler

A "like" button sends an analytics beacon and updates several counters **before** repainting the heart icon,
so the tap feels delayed. Painting the icon first and deferring analytics with `yieldToMain()` makes it feel
instant.

**Why this bites:** non-urgent work on the interaction path inflates processing time and delays the visible
response.

# Common Mistakes

- **Running long tasks** without yielding, blocking input (input delay).
- **Doing non-urgent work** (analytics, logging) synchronously in handlers.
- **Layout thrashing** — reading and writing the DOM in a loop, forcing reflows.
- **Re-rendering huge trees** on every keystroke instead of debouncing/virtualizing.

# Best Practices

- **Break up long tasks** and **yield** so the browser can respond to input.
- In handlers, **update the visible UI first**, then defer non-urgent work after paint.
- **Debounce/throttle** frequent events; **virtualize** large lists.
- Keep the **DOM small** and avoid layout thrashing to cut presentation delay.

# Summary

- **INP = input delay + processing time + presentation delay**; the goal is ≤ 200 ms.
- Slow interactions are dominated by **main-thread work**; **long tasks** cause input delay.
- **Break up tasks and yield**; do the **visible response first** and defer the rest.
- Cut presentation delay with a **smaller DOM**, cheaper rendering, and immediate feedback.
- **Debounce**, **virtualize**, and move heavy computation to a **Web Worker** (next lesson).

# Flash Cards

Q: What three parts make up an interaction's latency (INP)?
A: Input delay (before the handler runs), processing time (the handler running), and presentation delay (rendering the next frame after it).

Q: Why do "long tasks" hurt INP?
A: The main thread is single-threaded, so a task over 50 ms blocks it; if the user interacts during one, the browser can't respond until it finishes — that's input delay.

Q: What does "yielding to the main thread" do for responsiveness?
A: It briefly hands control back to the browser (via scheduler.yield() or setTimeout) between chunks of work, so pending interactions can be handled instead of waiting for one long task.

Q: In an event handler, what work should run synchronously and what should be deferred?
A: Run only the visible response the user is waiting for synchronously; defer non-urgent work (analytics, logging, non-visible updates) until after the browser paints the response.

Q: What is layout thrashing and why does it slow interactions?
A: Interleaving DOM reads (like offsetWidth) and writes in a loop forces repeated synchronous reflows, adding expensive work to processing/presentation time.

Q: How can a large DOM increase INP?
A: A big or complex DOM makes rendering the next frame (presentation delay) slower, and re-rendering large trees on each interaction inflates processing time.

# Exercises

### Easy
Write (or find) a loop that processes many items synchronously. Add a `yieldToMain()` call after each chunk
and describe how the page's responsiveness changes while the work runs.

### Medium
Take a click handler that does analytics plus a UI update. Reorder it to update the visible UI first, yield,
then run analytics. Measure the interaction in the DevTools Performance panel (look for the long task).

### Challenging
Profile a page with slow INP in the DevTools Performance panel. Identify whether the bottleneck is input
delay, processing time, or presentation delay, and choose the matching fix (break up tasks, defer work, or
shrink/virtualize the DOM). Justify your diagnosis.

# Further Reading

- web.dev — *Optimize Interaction to Next Paint*: <https://web.dev/articles/optimize-inp>
- web.dev — *Interaction to Next Paint (INP)*: <https://web.dev/articles/inp>
- web.dev — *Optimize long tasks*: <https://web.dev/articles/optimize-long-tasks>
- MDN — *`Scheduler.yield()`*: <https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield>
