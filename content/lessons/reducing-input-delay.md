---
slug: reducing-input-delay
title: "Reducing Input Delay"
topic: optimizing-vitals
kind: technique
summary: "Eliminating input delay by clearing main-thread congestion and breaking up background script tasks."
tags: [input-delay, inp, main-thread, long-tasks]
related: [anatomy-of-an-interaction, yielding-to-the-main-thread, identifying-long-tasks]
---
> **In one line:** Reduce input delay by eliminating long tasks and keeping the main thread idle to handle incoming user taps.

## The idea

Input delay is often the largest single contributor to poor Interaction to Next Paint scores. When a user taps a button on their phone, the hardware registers the tap immediately. However, if the browser's main thread is occupied running an unoptimized 250ms JavaScript task, the user's tap cannot be processed until that long task finishes.

To the user, the application feels sluggish, laggy, or completely unresponsive. Repeatedly tapping in frustration only queues up additional events, worsening the jam.

To drive input delay toward zero:
1. Break up long tasks: Decompose any JavaScript task that runs longer than 50 milliseconds into smaller, cooperative tasks that yield control back to the browser.
2. Minimize third-party script congestion: Audit tag managers, heatmaps, and trackers that run continuous polling loops or heavy regex scans during user sessions.
3. Defer non-critical work: Move secondary initialization tasks, telemetry batching, and analytics logging into idle callbacks (`requestIdleCallback`) or Web Workers so the main thread remains idle and ready to receive user input.

## See it

```javascript
// Anti-pattern: Monolithic script blocks the main thread for 300ms, causing high input delay
function processDataMonolithic(items) {
  for (const item of items) {
    heavyCalculation(item); // Freezes main thread!
  }
}

// Optimized: Chunking work with scheduler.yield() keeps main thread open for user taps
async function processDataCooperative(items) {
  for (const item of items) {
    heavyCalculation(item);
    if ('scheduler' in window && 'yield' in scheduler) {
      await scheduler.yield(); // Yields immediately to handle pending user taps
    }
  }
}
```

> **Note:** Long background tasks (> 50ms) block the main thread, forcing incoming user taps to wait in the input queue.

## Go deeper

Auditing sources of input delay across application lifecycle phases:

| Source of Input Delay | Mechanism of Contention | Remediation Strategy |
|---|---|---|
| Hydration Churn | Client-side framework mounting massive DOM tree | Island architecture or progressive hydration |
| Third-party Trackers | Continuous timers, scroll listeners, and beacons | Offload to Web Worker or self-host minimal scripts |
| Heavy Array Processing | Synchronous mapping/sorting of thousands of items | Chunk processing across animation frames or Worker |
| DOM Mutation Storms | Injecting hundreds of elements in a single loop | Batch mutations inside DocumentFragment |

## Watch out

- Running heavy analytics transformations synchronously on the main thread during navigation.
- Relying on requestAnimationFrame for non-visual data processing, which delays frame rendering.

## Remember

- Input delay occurs when an incoming user event must wait for the main thread to finish active tasks.
- Eliminating long tasks (> 50ms) is the single most effective way to eliminate input delay.
- Keep the main thread predominantly idle so it can accept and dispatch user interactions immediately.
