---
slug: scheduling-with-scheduler-yield
title: "Scheduling Work with scheduler.yield"
topic: javascript-performance
kind: technique
summary: "Implementing cooperative multitasking using the Prioritized Task Scheduling API and scheduler.yield()."
tags: [scheduler-yield, cooperative-multitasking, prioritized-task, long-tasks]
related: [the-single-threaded-event-loop, identifying-long-tasks, yielding-to-the-main-thread]
---
> **In one line:** Cooperative multitasking with scheduler.yield() breaks long tasks into sub-50ms chunks without losing context.

## The idea

When an application must process a computationally intensive task—such as parsing a large local data file, generating a PDF preview, or filtering a list of 5,000 items—running it synchronously creates a massive Long Task that freezes the UI.

The modern web platform standard for solving this is the Prioritized Task Scheduling API, specifically `scheduler.yield()`.

`scheduler.yield()` provides cooperative multitasking. When you call `await scheduler.yield()`, the browser suspends execution of your function and returns control to the browser's event loop. The browser paints any pending visual changes, processes any user taps or keypresses waiting in the input queue, and then immediately resumes your function where it left off.

Crucially: `scheduler.yield()` places your continuation at the front of the scheduler queue, preserving priority and execution context without the artificial timer clamping delays associated with `setTimeout(..., 0)`.

## See it

```javascript
// Processing large datasets cooperatively with scheduler.yield()
async function processBatchItems(items) {
  let processedCount = 0;

  for (const item of items) {
    transformItem(item);
    processedCount++;

    // Yield control every 25 items to prevent tasks from exceeding 50ms
    if (processedCount % 25 === 0) {
      if ('scheduler' in window && 'yield' in scheduler) {
        await scheduler.yield(); // Pauses, lets browser paint and respond to input
      } else {
        await new Promise(r => setTimeout(r, 0)); // Fallback
      }
    }
  }
}
```

> **Note:** `scheduler.yield()` yields to the event loop and immediately resumes execution after pending user input."

## Go deeper
The Prioritized Task Scheduling API provides `scheduler.yield()` to enable cooperative multitasking. By yielding control back to the event loop, heavy JavaScript computations pause briefly to let the browser handle pending user input and paint visual updates before resuming immediately without timer clamping delays.


Comparing task chunking mechanisms:

| Scheduling API | Continuation Priority | Timer Clamping Delay | Standard Status |
|---|---|---|---|
| **`scheduler.yield()`** | **High (resumes immediately after input)** | **0 ms** | **Modern W3C Standard** |
| `scheduler.postTask()` | Configurable (`user-blocking`, `background`) | 0 ms | Modern W3C Standard |
| `setTimeout(fn, 0)` | Low (appended to end of task queue) | ~4ms minimum delay | Universal Legacy Hack |
| `requestIdleCallback()` | Runs only when browser has spare idle time | Variable | Best for non-urgent tasks |

## Watch out

- Yielding inside every single loop iteration, which creates massive scheduler overhead and slows total completion.
- Using Promise.resolve() to yield; Promises are microtasks and do not yield to the rendering pipeline.

## Remember

- scheduler.yield() allows heavy JavaScript functions to cooperatively yield control to the event loop.
- Yielding ensures the browser can paint frames and handle user interactions without input delay.
- Unlike setTimeout, scheduler.yield() preserves priority and avoids artificial timer clamping delays.
