---
slug: minimizing-presentation-delay
title: "Minimizing Presentation Delay"
topic: optimizing-vitals
kind: technique
summary: "Cutting presentation delay by reducing DOM complexity, avoiding layout thrashing, and streamlining CSS selectors."
tags: [presentation-delay, inp, rendering, dom-size]
related: [anatomy-of-an-interaction, optimizing-event-handlers, avoiding-layout-thrashing]
---
> **In one line:** Minimize presentation delay by reducing DOM size, keeping styles simple, and avoiding forced synchronous layout.

## The idea

Presentation Delay is the third component of INP: the duration from when your JavaScript event handlers finish executing until the browser physically paints the updated pixels onto the user's screen.

Even if your event handler executes in a lightning-fast 5 milliseconds, a user interaction can still fail INP if the presentation delay consumes 250 milliseconds! Presentation delay is driven by the browser's visual rendering pipeline:
1. Style Recalculation: Matching CSS selector rules against affected DOM nodes.
2. Layout (Reflow): Computing geometry and bounding boxes for visible elements.
3. Paint & Compositing: Rasterizing updated pixels across GPU layers.

The primary culprit behind excessive presentation delay is an oversized DOM tree (e.g. 3,000+ nodes) combined with overly complex CSS selectors (e.g. `.sidebar div > ul li:nth-child(2n) a`). When a handler mutates a class near the root of a massive DOM tree, the browser must re-evaluate styles and reflow hundreds of nodes. Keeping the DOM lean (< 1,400 nodes) and avoiding forced synchronous layouts ensures the browser can paint the frame in under 16ms.

## See it

```html
<!-- Measuring presentation delay by timing requestAnimationFrame after interaction -->
<script>
  button.addEventListener('click', () => {
    const start = performance.now();
    button.classList.toggle('active');

    // Measures duration until browser paints the next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const presentationTime = performance.now() - start;
        console.log('Total time to next paint:', Math.round(presentationTime), 'ms');
      });
    });
  });
</script>
```

> **Tip:** Keep the total DOM tree below 1,400 nodes to keep style recalculation and layout times under 16ms.

## Go deeper

Factors contributing to excessive Presentation Delay and their remedies:

| Cause of Presentation Delay | Mechanism of Delay | Targeted Remediation |
|---|---|---|
| Enormous DOM Tree (> 2,500 nodes) | Style recalculation touches thousands of nodes | Virtualize lists; paginate deep views |
| Complex CSS Selectors | Deep selector matching algorithms | Use flat BEM or scoped utility classes |
| Forced Synchronous Layout | Reading layout properties right after modifying DOM | Batch DOM reads before writes |
| Heavy CSS Filters / Shadows | Expensive GPU rasterization during paint | Replace box-shadows with simple borders |

## Watch out

- Mutating classes on the <body> tag, forcing the browser to recalculate styles across the entire page.
- Assuming presentation delay is negligible; on complex pages it frequently accounts for over 60% of INP.

## Remember

- Presentation delay measures the time required to calculate styles, layout, and paint the next frame.
- Large DOM trees and complex CSS selectors exponentially increase style recalculation time.
- Keep total DOM nodes under 1,400 to ensure the browser can present the next frame smoothly.
