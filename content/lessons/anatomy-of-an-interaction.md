---
slug: anatomy-of-an-interaction
title: "Anatomy of an Interaction"
topic: optimizing-vitals
kind: concept
summary: "Dissecting user interactions into input delay, processing duration, and presentation delay for INP."
tags: [inp, interaction, event-loop, latency]
related: [interaction-to-next-paint-metric, reducing-input-delay, optimizing-event-handlers]
---
> **In one line:** Interaction latency consists of Input Delay (waiting for main thread), Processing Duration, and Presentation Delay.

## The idea

To diagnose and fix Interaction to Next Paint (INP) bottlenecks, you must dissect the anatomy of an interaction into its three discrete, sequential phases:

1. Input Delay: The time elapsed from when the user physically touches the screen or presses a key until the browser can actually begin executing the associated event listener callbacks. Input delay is driven almost entirely by main-thread contention: if an unrelated long JavaScript task is currently hogging the main thread, the incoming user event sits queued and frozen in the OS event queue.
2. Processing Duration: The total time the browser spends synchronously executing all registered JavaScript event listener callbacks associated with the interaction (e.g. `pointerdown`, `pointerup`, `click`).
3. Presentation Delay: The time elapsed from when event handlers finish executing until the browser recalculates layout, paints the updated pixels, and presents the next visible frame to the user's display.

Total interaction latency is the sum of all three phases:
$$\text{Total Latency} = \text{Input Delay} + \text{Processing Duration} + \text{Presentation Delay}$$
To achieve an INP under 200ms, all three phases must be kept minimal.

## See it

```text
// Anatomy of an Interaction Timeline
[ User Click ]
      |
  [ Input Delay ]         (Main thread busy finishing background tasks)
      |
[ Event Handlers Run ]    (Processing Duration: executing JavaScript callbacks)
      |
 [ Presentation Delay ]   (Style recalc, Layout, Paint, GPU frame compositing)
      |
[ Next Frame Painted ]    <-- INP measurement ends here
```

> **Tip:** Use the Event Timing API with attribution to determine whether INP is failing due to Input Delay, Processing, or Presentation.

## Go deeper

Breakdown of interaction phases and their primary architectural drivers:

| Interaction Phase | What It Measures | Primary Driver / Bottleneck | Target Threshold |
|---|---|---|---|
| **Input Delay** | Wait time before handlers start | Long tasks from background scripts or analytics | < 50 ms |
| **Processing Duration** | Time spent inside event callbacks | Complex synchronous algorithms, framework re-renders | < 50 ms |
| **Presentation Delay** | Time to render and paint next frame | Huge DOM trees, forced reflows, expensive CSS effects | < 50 ms |

## Watch out

- Assuming high INP is always caused by slow event listeners; input delay from unrelated scripts is often the culprit.
- Performing heavy data fetching or sorting synchronously inside click handlers.

## Remember

- Total interaction latency equals Input Delay + Processing Duration + Presentation Delay.
- Input delay measures how long an interaction must wait before its event handlers can even begin.
- Presentation delay captures the time required to recalculate layout and paint the next frame.
