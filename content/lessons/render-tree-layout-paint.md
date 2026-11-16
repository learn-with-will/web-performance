---
slug: render-tree-layout-paint
title: "Render Tree, Layout, and Paint"
topic: rendering-path
kind: concept
summary: "Combining DOM and CSSOM into the render tree, computing geometric layout, and rasterizing pixels to layers."
tags: [render-tree, layout, paint, compositing]
related: [dom-construction, cssom-and-render-blocking-css, critical-path-metrics]
---
> **In one line:** The browser combines the DOM and CSSOM into a render tree, computes element geometry in layout, and paints pixels.

## The idea

Once the browser has constructed both the DOM and the CSSOM, it merges them together to create the Render Tree.

The Render Tree contains only the visual nodes required to render the page on screen. Elements that do not produce visual output—such as `<head>`, `<meta>`, and `<script>` tags—are excluded. Elements explicitly hidden via CSS with `display: none` are also omitted from the render tree entirely. In contrast, elements with `visibility: hidden` or `opacity: 0` remain in the render tree because they still occupy physical layout space.

With the render tree established, the browser executes the Layout phase (also referred to as Reflow). Starting from the root of the render tree, layout calculates the exact coordinates, box models, width, and height of every visible element relative to the device viewport.

Following layout, the browser enters the Paint phase (rasterization). Paint converts the geometric representation of elements into actual colored pixels on screen, drawing backgrounds, text, borders, and shadows across distinct GPU compositing layers before displaying the final frame.

## See it

```text
// The Render Pipeline: DOM + CSSOM -> Render Tree -> Layout -> Paint -> Composite
[DOM Tree]   +   [CSSOM Tree]
              /
     [Render Tree]  (Visible nodes only; excludes display:none and <head>)
           |
       [Layout]     (Calculates exact geometric positions and dimensions in px)
           |
        [Paint]     (Rasterizes vectors, text, colors, and shadows into pixels)
           |
      [Composite]   (Blends GPU layers together to draw final screen frame)
```

> **Tip:** Elements styled with `display: none` are excluded from the render tree, whereas `visibility: hidden` elements are included in layout.

## Go deeper

Understanding the distinct stages of the visual rendering pipeline:

| Pipeline Stage | Inputs | Primary Activity | Triggered By |
|---|---|---|---|
| **Render Tree** | DOM + CSSOM | Filters non-visible nodes, matches styles | DOM mutations, CSS rule changes |
| **Layout (Reflow)** | Render Tree | Computes exact x/y positions and box geometry | Changing width, height, margin, font-size |
| **Paint** | Layout geometry | Rasterizes visual properties into bitmap pixels | Changing color, background, box-shadow |
| **Composite** | Paint bitmaps | Arranges GPU layers on the physical display | Changing transform, opacity |

## Watch out

- Triggering full page layout reflows by modifying geometric styles (e.g. width, top) in continuous animation loops.
- Assuming visibility:hidden removes elements from the render pipeline; it still incurs layout calculation costs.

## Remember

- The Render Tree merges DOM and CSSOM, excluding non-visible elements and display: none nodes.
- Layout computes the exact pixel coordinates and dimensions of all elements in the viewport.
- Paint rasterizes elements into pixels, while Compositing blends GPU layers onto the screen.
