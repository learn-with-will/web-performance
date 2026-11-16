---
slug: optimizing-event-handlers
title: "Optimizing Event Handlers"
topic: optimizing-vitals
kind: technique
summary: "Minimizing processing duration by keeping event callbacks lean, debouncing, and giving instant UI feedback."
tags: [event-handlers, processing-time, debounce, passive-listeners]
related: [anatomy-of-an-interaction, yielding-to-the-main-thread, minimizing-presentation-delay]
---
> **In one line:** Keep event handler processing lean: provide immediate visual feedback and defer non-essential computations.

## The idea

The second component of INP is Processing Duration: the total execution time of all synchronous JavaScript callbacks registered for an interaction.

A common anti-pattern is executing heavy business logic, data formatting, and complex state updates directly inside an event handler before yielding to the renderer. For instance, when a user clicks an "Add to Cart" button, an unoptimized handler might immediately update cart state, recalculate tax for 50 items, serialize the local storage cache, and update five distinct UI components—all in one giant synchronous execution block. Because the browser cannot paint until the handler concludes, the interaction latency easily exceeds 200ms.

Optimized event handling follows a two-step principle:
1. Provide immediate visual feedback: Update the button state (e.g. depressed state, loading spinner, or optimistic count) within a few milliseconds to ensure the next painted frame responds immediately.
2. Defer heavy computation: Shift secondary processing, API requests, and expensive recalculations into a microtask or `setTimeout` callback to allow the initial frame paint to complete first.

## See it

```javascript
// Optimized Event Handler Pattern: Instant feedback first, heavy work deferred
button.addEventListener('click', (event) => {
  // Step 1: Immediate visual feedback (takes < 5ms)
  button.classList.add('loading');
  button.textContent = 'Saving...';

  // Step 2: Defer expensive computation to allow next paint to display feedback
  setTimeout(() => {
    performHeavyCartRecalculation();
    syncCartToDatabase();
  }, 0);
});
```

> **Tip:** Provide immediate visual feedback in the event handler and defer heavy processing to unblock the next frame paint.

## Go deeper
Event handlers should provide immediate visual feedback (such as depressing a button or displaying a spinner) within the first 10ms, while deferring expensive data processing, validation, or network dispatching to subsequent macro-tasks using `setTimeout` or `scheduler.yield()`, unblocking the next painted frame.


Event listener optimization techniques across user interaction types:

| Interaction Type | Common Processing Bottleneck | Optimized Pattern |
|---|---|---|
| Text Typing (`input`) | Re-filtering large lists on every keystroke | Debounce handler by 150ms; use `scheduler.yield()` |
| Scrolling (`scroll`) | Recalculating element bounding boxes | Use `passive: true` and `IntersectionObserver` |
| Button Click (`click`) | Synchronous heavy API formatting | Optimistic UI update first, defer payload prep |
| Search Filter | Re-rendering 500 DOM rows synchronously | Virtualize DOM list or paginate results |

## Watch out

- Attaching non-passive scroll or touchstart listeners, which forces the browser to wait before scrolling.
- Performing synchronous XMLHttpRequest or blocking local storage I/O inside click handlers.

## Remember

- Event handler processing duration directly contributes to total INP interaction latency.
- Provide immediate visual feedback in the first 10ms to ensure the next frame paints promptly.
- Defer expensive secondary calculations using setTimeout or scheduler.yield().
