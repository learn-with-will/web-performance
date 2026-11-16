---
slug: defer-and-async-scripts
title: "Defer, Async, and Module Scripts"
topic: rendering-path
kind: pattern
summary: "Mastering script loading attributes: defer executes in order before DOMContentLoaded; async executes immediately."
tags: [defer, async, type-module, scripts]
related: [parser-blocking-javascript, dom-construction, critical-path-metrics]
---
> **In one line:** Use defer for scripts that require DOM order, async for independent trackers, and type=module for modern deferred modules.

## The idea

To prevent JavaScript from blocking HTML parsing, the HTML specification provides explicit script loading attributes: `defer`, `async`, and `type="module"`. Understanding the precise operational differences between them is essential for every web performance engineer.

When a script tag includes `defer`, the browser downloads the script file asynchronously in the background while HTML parsing continues completely uninterrupted. Once HTML parsing completes, all deferred scripts execute in the exact order they appeared in the markup, right before the `DOMContentLoaded` event fires. `defer` is the standard best practice for application bundles that depend on the DOM or on other libraries.

In contrast, `async` downloads the file in the background, but pauses the HTML parser and executes the script the exact millisecond the download finishes. Because execution timing depends entirely on network download speed, execution order is never guaranteed. `async` is suitable only for independent third-party scripts (such as analytics beacons) that do not touch the DOM or depend on other scripts.

Scripts declared with `type="module"` are deferred by default, executing in document order after HTML parsing.

## See it

```html
<!-- Preserves DOM order; runs before DOMContentLoaded without blocking parser -->
<script src="/js/vendor.js" defer></script>
<script src="/js/app.js" defer></script>

<!-- Independent analytics tracker: executes as soon as downloaded (order random) -->
<script src="/js/analytics.js" async></script>

<!-- Modern ES module: deferred by default, executes in order -->
<script type="module" src="/js/main.js"></script>
```

> **Note:** `defer` scripts maintain document execution order, whereas `async` scripts execute in unpredictable network arrival order.

## Go deeper
Choosing between `defer` and `async` hinges on dependency management. If your script relies on the DOM being fully parsed, or depends on other libraries (such as a charting plugin that depends on a core framework), always choose `defer`. If the script is a completely standalone tracker or telemetry beacon that operates independently, use `async`.


Comparing script loading mechanisms and execution characteristics:

| Script Attribute | Download Mode | HTML Parser Paused? | Execution Order | When It Executes |
|---|---|---|---|---|
| Plain `<script>` | Synchronous | **Yes, immediately** | Sequential in document | As soon as downloaded |
| `defer` | Asynchronous | **No** | **Guaranteed document order** | After HTML parse, before DCL |
| `async` | Asynchronous | Only while executing | **Unordered (first to arrive)** | Immediately upon download |
| `type="module"` | Asynchronous | **No** | **Guaranteed document order** | After HTML parse (like defer) |

## Watch out

- Using async for application scripts that depend on a global library; race conditions will cause intermittent errors.
- Combining defer and async on the same script tag; modern browsers will prioritize async and drop ordering guarantees.

## Remember

- defer downloads asynchronously and executes in strict document order after HTML parsing completes.
- async executes immediately upon download, without regard to document order or other scripts.
- type=module scripts are deferred by default and execute in order before DOMContentLoaded.
