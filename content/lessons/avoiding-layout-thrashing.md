---
slug: avoiding-layout-thrashing
title: "Avoiding Layout Thrashing"
topic: javascript-performance
kind: pitfall
summary: "Preventing forced synchronous layout by batching DOM style reads and geometric writes together."
tags: [layout-thrashing, reflow, dom-reads, batching]
related: [the-single-threaded-event-loop, render-tree-layout-paint, minimizing-presentation-delay]
---
> **In one line:** Avoid layout thrashing: batch all DOM style reads together before executing any DOM layout writes.

## The idea

The browser engine is naturally lazy: when you mutate DOM styles or elements, it does not recalculate layout immediately. Instead, it marks the layout as "dirty" and queues the reflow to be calculated in a single optimized batch during the next frame.

However, if your JavaScript writes to the DOM (invalidating layout) and then immediately reads a geometric layout property (such as `offsetWidth`, `offsetHeight`, `scrollTop`, or `getBoundingClientRect()`), the browser is trapped. It cannot give you an accurate measurement without calculating the layout immediately.

This forces the browser to synchronously execute a full layout reflow on the spot—a phenomenon known as Forced Synchronous Layout.

If this read-after-write pattern occurs inside a loop (reading and writing alternatingly across 100 elements), the browser executes 100 synchronous layout reflows in a single frame! This catastrophic bottleneck is known as Layout Thrashing. Always batch all reads first, then execute all writes.

## See it

```javascript
// ANTI-PATTERN: Layout Thrashing (forces layout recalculation on EVERY iteration!)
elements.forEach(el => {
  const width = el.offsetWidth; // READ (Forces reflow!)
  el.style.width = (width * 1.5) + 'px'; // WRITE (Invalidates layout!)
});

// BEST PRACTICE: Batched Reads and Writes (triggers only ONE layout calculation!)
// Step 1: Batch all reads together
const widths = elements.map(el => el.offsetWidth);

// Step 2: Batch all writes together
elements.forEach((el, index) => {
  el.style.width = (widths[index] * 1.5) + 'px';
});
```

> **Watch out:** Reading geometric properties (`offsetWidth`) right after modifying DOM styles forces synchronous layout reflows.

## Go deeper
Forced synchronous layout occurs when JavaScript writes to the DOM and immediately reads a geometric layout property (like `offsetWidth`), forcing an instant reflow. Alternating reads and writes inside loops causes layout thrashing, severely degrading framerate. Always batch all reads before executing writes.


Common JavaScript properties and methods that trigger Forced Synchronous Layout:

| Geometry Group | Properties / Methods that Force Layout |
|---|---|
| Element Dimensions | `offsetWidth`, `offsetHeight`, `clientWidth`, `clientHeight` |
| Element Positions | `offsetTop`, `offsetLeft`, `clientTop`, `clientLeft` |
| Scrolling Values | `scrollTop`, `scrollLeft`, `scrollWidth`, `scrollHeight` |
| Bounding Boxes | `getBoundingClientRect()`, `getClientRects()` |
| Window Properties | `window.innerWidth`, `window.innerHeight`, `window.scrollY` |

## Watch out

- Accessing offsetHeight inside an animation loop to compute positions; cache measurements before animating.
- Using libraries like fastdom if not properly sequenced; manually batching reads before writes is cleanest.

## Remember

- Forced synchronous layout occurs when JavaScript reads geometry immediately after modifying styles.
- Layout thrashing occurs when reads and writes alternate repeatedly inside loops, destroying framerate.
- Always batch all DOM reads first, then execute all DOM writes in a clean secondary pass.
