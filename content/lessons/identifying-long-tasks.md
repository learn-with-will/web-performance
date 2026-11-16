---
slug: identifying-long-tasks
title: "Identifying Long Tasks"
topic: javascript-performance
kind: tool
summary: "Detecting JavaScript tasks exceeding 50ms that block the main thread and contribute to Total Blocking Time."
tags: [long-tasks, tbt, performance-panel, devtools]
related: [the-single-threaded-event-loop, scheduling-with-scheduler-yield, reducing-input-delay]
---
> **In one line:** A Long Task is any main-thread execution exceeding 50ms, flagged with red warning triangles in DevTools.

## The idea

In web performance engineering, a "Long Task" is formally defined as any continuous, monolithic JavaScript execution on the main thread that takes longer than 50 milliseconds to complete.

The 50ms threshold is rooted in human perception and the RAIL model. To respond to user input within 100 milliseconds, the main thread must never be occupied for more than 50ms by background work; this ensures that even if a user taps the screen midway through an ongoing task, the task finishes within 50ms and the interaction handler executes within the remaining 50ms.

Any execution time beyond 50ms is classified as "blocking time." The sum of all blocking times between First Contentful Paint and Time to Interactive is measured as Total Blocking Time (TBT).

In Chrome DevTools Performance panel, long tasks are visually flagged in the "Main" track as long rectangular bars with red hatched corners and warning triangles. Inspecting the Bottom-Up and Call Tree tabs reveals the exact function calls and file line numbers responsible.

## See it

```javascript
// Observing Long Tasks programmatically in production using Long Tasks API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn(`Long Task detected! Duration: ${Math.round(entry.duration)}ms (Blocking: ${Math.round(entry.duration - 50)}ms)`);
    for (const attribution of entry.attribution) {
      console.log('Container:', attribution.containerType, 'Source:', attribution.containerSrc);
    }
  }
});
observer.observe({ type: 'longtask', buffered: true });
```

> **Tip:** In Chrome DevTools Performance panel, tasks running longer than 50ms display a red flag indicating a Long Task.

## Go deeper

How Total Blocking Time (TBT) is calculated from Long Tasks:

| Task Number | Total Task Duration | Duration Exceeding 50ms | Blocking Time Added to TBT |
|---|---|---|---|
| Task 1 | 40 ms | 0 ms (under threshold) | 0 ms |
| Task 2 | 75 ms | 25 ms (75ms - 50ms) | **25 ms** |
| Task 3 | 180 ms | 130 ms (180ms - 50ms) | **130 ms** |
| Task 4 | 48 ms | 0 ms (under threshold) | 0 ms |
| **Total** | 343 ms | — | **155 ms TBT** |

## Watch out

- Ignoring tasks that run for 48ms; while technically not long tasks, clustering many of them back-to-back blocks input.
- Focusing on Total CPU Time instead of Long Tasks; ten 10ms tasks are far better than one 100ms task.

## Remember

- Any main-thread task executing for longer than 50 milliseconds is designated a Long Task.
- Total Blocking Time (TBT) sums the portions of all long tasks that exceed 50ms between FCP and TTI.
- Inspect the DevTools Performance panel Main track to find red-flagged long tasks and heavy functions.
