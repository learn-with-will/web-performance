---
slug: the-single-threaded-event-loop
title: "The Single-Threaded Event Loop"
topic: javascript-performance
kind: concept
summary: "How the browser balances JavaScript execution, microtasks, timers, and rendering across the event loop."
tags: [event-loop, call-stack, microtasks, rendering-loop]
related: [identifying-long-tasks, scheduling-with-scheduler-yield, offloading-to-web-workers]
---
> **In one line:** JavaScript runs on a single main thread that coordinates task queues, microtasks, and screen rendering.

## The idea

The core execution model of the browser web platform is single-threaded. Your application JavaScript, DOM event listeners, layout recalculations, style resolutions, and screen paints all compete for execution time on one single main thread.

The Event Loop coordinates this orchestration through distinct queues:
1. Call Stack: Executes synchronous JavaScript frames until the stack is empty.
2. Microtask Queue: Processes Promise callbacks (`then`, `catch`, `await`) and `MutationObserver` events. Crucially: the microtask queue drains *completely* before the browser moves to any other task.
3. Task Queue (Macrotasks): Handles timer callbacks (`setTimeout`, `setInterval`), network I/O responses, and user input events.
4. Rendering Pipeline: Periodically executes `requestAnimationFrame`, calculates style, runs layout, and paints pixels to match the display refresh rate (e.g. 60Hz or 120Hz).

If a JavaScript task runs continuously for 200 milliseconds, the event loop cannot enter the rendering pipeline, and incoming user taps cannot be dequeued. The screen freezes.

## See it

```text
// The Browser Main Thread Event Loop Flow
[ Macro Task ] -> [ Drain ALL Microtasks ] -> [ Check Display Refresh? ]
     ^                                                      |
     |                                          (Yes) -> [ requestAnimationFrame ]
     |                                                -> [ Style Recalc & Layout ]
     |                                                -> [ Paint Pixels ]
     +------------------ (Repeat Loop) <--------------------+
```

> **Note:** The browser cannot render or paint pixels while a synchronous JavaScript task is occupying the call stack.

## Go deeper
JavaScript execution, DOM manipulation, style recalculation, layout reflow, and screen painting all share the browser's single main thread. Long-running tasks on the call stack freeze the event loop, preventing both visual updates and the processing of incoming user input events.


Comparing Task Queues and their execution order on the Event Loop:

| Queue Type | Handled Items | Draining Behavior | Can Browser Paint Between Items? |
|---|---|---|---|
| **Call Stack** | Synchronous functions | Runs until empty | **No** (main thread completely locked) |
| **Microtask Queue** | Promises, `queueMicrotask` | **Drains completely before next step** | **No** (chained promises starve paint) |
| **Task Queue** | `setTimeout`, user inputs | Executes ONE task, then checks render | **Yes** (allows rendering and input) |
| **Animation Queue** | `requestAnimationFrame` | Runs immediately prior to paint step | Runs directly before rendering pipeline |


Because JavaScript executes on a single main thread, scheduling non-urgent calculations with requestIdleCallback or breaking long tasks using scheduler.yield() allows the browser to interleave user input events, preventing UI freezes and preserving responsive interaction.

## Watch out

- Chaining recursive microtasks (queueMicrotask or Promise loops), which completely starves screen rendering.
- Assuming setTimeout(fn, 0) runs immediately; it queues a macro-task behind pending tasks and rendering.

## Remember

- JavaScript, DOM updates, layout, and painting all share the browser's single main thread.
- The Event Loop coordinates synchronous code, the microtask queue, macrotasks, and rendering.
- Long tasks on the call stack freeze the event loop, preventing both visual updates and user input handling.
