---
slug: the-hydration-cost
title: "The Hydration Cost"
topic: architecture-and-rendering
kind: concept
summary: "The hidden performance tax of hydration: downloading, parsing, and executing JS to attach listeners."
tags: [hydration, ssr, tbt, inp]
related: [server-side-rendering, client-side-rendering, streaming-ssr-and-islands]
---
> **In one line:** Hydration is the client-side process of attaching event listeners to server HTML, incurring a heavy main-thread tax.

## The idea

Server-Side Rendering produces beautiful, fully painted HTML on screen within milliseconds. However, that server-rendered HTML is initially static and non-interactive. When a user clicks a button, taps a navigation drawer, or expands an accordion, nothing happens.

To make the page interactive, the client browser must execute Hydration.

During hydration, the browser:
1. Downloads the full client-side JavaScript framework bundle.
2. Parses and executes the script, constructing the virtual DOM tree in memory.
3. Walks the existing server-rendered DOM nodes, validating that the markup matches the virtual DOM.
4. Attaches JavaScript event listeners (`onclick`, `oninput`) to the physical DOM elements.

This creates the notorious "Uncanny Valley" of web performance: a page that *looks* completely loaded and ready, but feels totally frozen when tapped. Hydration requires double the work—rendering on the server, then re-executing on the client—spiking Total Blocking Time (TBT) and harming INP on mobile devices.

## See it

```text
// The "Uncanny Valley" of Hydration Timeline
0ms                800ms                   2,200ms               3,500ms
[ Navigation ] ---> [ HTML Paints on Screen ] -> [ JS Downloads ] -> [ Hydration Runs ]
                    (Looks ready, but            (Main thread busy)   (Buttons finally
                     buttons are FROZEN!)                             respond to taps!)
```

> **Note:** Hydration forces the browser to re-execute component logic on the client to attach event listeners to server HTML.

## Go deeper
Hydration is the client-side process where framework JavaScript parses the virtual DOM, walks existing server-rendered HTML nodes, and attaches event listeners. Hydration introduces an Uncanny Valley where the page looks interactive but remains unresponsive, inflating Total Blocking Time and harming INP.


Auditing the performance overhead imposed by traditional full-page hydration:

| Hydration Bottleneck | Impact on User Experience | Affected Metric |
|---|---|---|
| **Double Work** | Server renders markup; client re-creates virtual DOM | CPU battery drain & memory bloat |
| **The Uncanny Valley** | UI looks interactive before listeners are attached | User frustration & abandoned clicks |
| **Main-Thread Lockup** | Hydrating 2,000 DOM nodes in a single task | **Severe Total Blocking Time (TBT)** |
| **Delayed Interactivity** | Taps during hydration queue in input delay | **Failing Interaction to Next Paint (INP)** |


During full-client hydration in single-page applications, the browser must attach event listeners and construct internal component trees across all SSR-rendered DOM nodes. This heavy main-thread workload blocks user input, degrading Total Blocking Time and Interaction to Next Paint.

## Watch out

- Hydrating completely static content (like terms of service text, footers, and articles) that has zero interactive listeners.
- Mismatching server and client markup, causing hydration errors that force a full client-side re-render.

## Remember

- Hydration is the process where client JavaScript binds event listeners to server-rendered HTML.
- Hydration creates an 'Uncanny Valley' where buttons appear interactive but fail to respond.
- Heavy hydration locks the main thread, directly inflating Total Blocking Time and harming INP.
