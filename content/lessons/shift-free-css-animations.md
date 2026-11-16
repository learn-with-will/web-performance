---
slug: shift-free-css-animations
title: "Shift-Free CSS Animations"
topic: optimizing-vitals
kind: technique
summary: "Animating exclusively transform and opacity properties on the GPU compositor thread to avoid layout shifts."
tags: [animations, cls, compositor, transform]
related: [anatomy-of-a-layout-shift, anatomy-of-an-interaction, render-tree-layout-paint]
---
> **In one line:** Animate exclusively transform and opacity properties; animating top, left, width, or height induces layout shifts.

## The idea

CSS animations and transitions are vital for modern web application polish, but animating geometric layout properties can single-handedly ruin your Cumulative Layout Shift score.

Whenever you animate CSS properties that participate in document geometry—such as `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding`—the browser engine is forced to execute full layout recalculations (reflow) on every single frame. If these elements alter the layout coordinates of surrounding content, every frame records unexpected layout shifts, driving CLS through the roof.

To create buttery-smooth, 60fps animations that produce zero layout shifts, animate exclusively compositor-only properties: `transform` (for position, scaling, and rotation) and `opacity` (for fading).

Composited properties run entirely on the GPU compositor thread without triggering layout or paint on the browser's main thread. Because `transform` alters visual rendering without altering the element's original geometric footprint in the document flow, the Layout Instability API records exactly zero layout shift.

## See it

```css
/* Anti-pattern: Triggers layout recalculation on every frame; causes CLS */
.slide-in-bad {
  position: absolute;
  top: -100px;
  transition: top 0.3s ease;
}
.slide-in-bad.active {
  top: 0px; /* Triggers reflow and layout shift */
}

/* Best Practice: Runs on GPU compositor thread; zero layout shift */
.slide-in-good {
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  will-change: transform;
}
.slide-in-good.active {
  transform: translateY(0); /* Zero layout shift; 60fps smooth */
}
```

> **Note:** Only `transform` and `opacity` animations run on the compositor thread and produce zero layout shift.

## Go deeper

Comparing layout-triggering properties against compositor-only properties:

| Animated Property | Pipeline Stages Triggered | CLS Impact | Frame Performance |
|---|---|---|---|
| `top` / `left` | **Layout -> Paint -> Composite** | **High layout shift** | Prone to jank / dropped frames |
| `width` / `height` | **Layout -> Paint -> Composite** | **Severe layout shift** | Heavy CPU reflow overhead |
| `transform: translate()` | **Composite Only** | **Zero layout shift** | **Hardware-accelerated 60fps** |
| `opacity` | **Composite Only** | **Zero layout shift** | **Hardware-accelerated 60fps** |

## Watch out

- Animating margin-top to create drop-down menus; use transform: translateY() instead.
- Overusing will-change on hundreds of elements, exhausting device GPU memory.

## Remember

- Animating geometric properties (top, left, width, height) forces layout reflows and spikes CLS.
- Animate exclusively transform and opacity to keep visual motion on the GPU compositor thread.
- Compositor-only animations produce zero layout shift and deliver consistent 60fps framerates.
