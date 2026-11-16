---
slug: offloading-to-web-workers
title: "Offloading to Web Workers"
topic: javascript-performance
kind: technique
summary: "Moving compute-heavy algorithms and parsing completely off the main thread onto dedicated Web Workers."
tags: [web-workers, threads, concurrency, offloading]
related: [the-single-threaded-event-loop, scheduling-with-scheduler-yield, identifying-long-tasks]
---
> **In one line:** Offload heavy computation and data parsing to Web Workers to keep the main thread completely free.

## The idea

Cooperative multitasking with `scheduler.yield()` breaks long tasks into pieces, but those pieces still run on the single main thread. If a computation is inherently CPU-bound—such as image filtering, complex financial modeling, cryptography, or parsing massive JSON datasets—the optimal solution is to remove it from the main thread entirely.

Web Workers allow you to run JavaScript in true background worker threads running in parallel with the main browser thread.

A Web Worker operates in an isolated global execution context. It does not have access to the DOM, `window`, or `document` objects, which prevents thread safety and race condition bugs. Instead, the main thread and worker communicate asynchronously by passing messages via `postMessage()` and listening with `onmessage`.

To maximize performance when passing large datasets, use Transferable Objects (such as `ArrayBuffer`). Transferring ownership moves the underlying memory pointer between threads instantly with zero-copy overhead, eliminating expensive serialization.

## See it

```javascript
// worker.js: Running heavy calculation in a dedicated background thread
self.onmessage = (event) => {
  const { numbers } = event.data;
  // Heavy computation executes on background CPU core without touching main thread
  const result = numbers.map(n => Math.sqrt(n) * Math.sin(n)).reduce((a, b) => a + b, 0);
  self.postMessage({ result });
};

// main.js: Dispatching work and receiving results without freezing the UI
const worker = new Worker('/js/worker.js');

worker.postMessage({ numbers: [1, 2, 3, 4, 5] });

worker.onmessage = (event) => {
  console.log('Calculation result from worker:', event.data.result);
};
```

> **Tip:** Transfer `ArrayBuffer` objects as Transferable Objects in `postMessage` to achieve zero-copy data transfer.

## Go deeper
Web Workers execute JavaScript in dedicated background threads running on separate CPU cores in parallel with the main thread. Offloading computationally intensive tasks (such as large data parsing, image processing, and cryptography) ensures the main thread remains completely free for user interactions.


Determining what should run on the Main Thread vs a Web Worker:

| Task / Workload | Main Thread | Web Worker | Rationale |
|---|---|---|---|
| User Event Handling & DOM Updates | **YES** | No | Workers have no access to the DOM |
| Heavy JSON / CSV Parsing (5MB+) | No | **YES** | Offloads multi-second parse freeze |
| Cryptography & Image Processing | No | **YES** | CPU-intensive mathematical loops |
| UI State Management & Routing | **YES** | No | Needs immediate access to browser history & view |

## Watch out

- Passing huge object graphs through structured clone postMessage, causing serialization pauses on the main thread.
- Attempting to touch window or document inside a Web Worker, which throws a ReferenceError.

## Remember

- Web Workers run JavaScript in background threads on separate CPU cores in parallel with the main thread.
- The main thread communicates with Web Workers via asynchronous postMessage events.
- Offloading heavy computation to workers guarantees that the main thread remains free for user interactions.
