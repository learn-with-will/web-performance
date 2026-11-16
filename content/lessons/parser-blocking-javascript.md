---
slug: parser-blocking-javascript
title: "Parser-Blocking JavaScript"
topic: rendering-path
kind: concept
summary: "How synchronous script tags halt HTML parsing and wait for pending stylesheets to build the CSSOM."
tags: [parser-blocking, javascript, dom-parsing, head-scripts]
related: [dom-construction, cssom-and-render-blocking-css, defer-and-async-scripts]
---
> **In one line:** Synchronous script tags block HTML parsing immediately because JavaScript can query and alter the DOM and CSSOM.

## The idea

When the browser's HTML parser encounters a standard, synchronous `<script>` tag without attributes like `defer` or `async`, it must immediately halt DOM construction. It cannot continue parsing subsequent HTML tokens until the script is fully downloaded from the network and executed to completion.

This parser-blocking behavior exists because JavaScript has full programmatic access to modify the document. A script can call `document.write()` to inject new HTML tokens into the parser stream, alter element attributes, or manipulate the DOM tree dynamically. If the browser continued parsing speculative HTML while a script ran, it might construct nodes that the script immediately deletes.

Furthermore, JavaScript creates an indirect dependency on CSS. If a script requests computed styles (e.g., `window.getComputedStyle(element).height`), the browser cannot provide an answer until all preceding stylesheets have finished downloading and parsing into the CSSOM. Consequently, if a synchronous script follows a stylesheet in the HTML header, the script pauses waiting for CSS, and HTML parsing halts waiting for the script.

## See it

```html
<!-- Anti-pattern: Parser halts here until style.css AND app.js fully download & execute -->
<head>
  <link rel="stylesheet" href="/style.css">
  <script src="/app.js"></script>
</head>

<!-- Best Practice: Parser continues uninterrupted; script deferred until DOM parsed -->
<head>
  <link rel="stylesheet" href="/style.css">
  <script src="/app.js" defer></script>
</head>
```

> **Note:** A synchronous script tag in `<head>` halts the HTML parser completely until the file downloads and runs.

## Go deeper
When synchronous scripts execute, they pause both DOM construction and the execution of subsequent scripts until they finish. If a synchronous script attempts to access DOM nodes that have not yet been parsed, it will fail with null pointer errors. Using `defer` or `type="module"` guarantees that scripts execute in clean document order only after the full DOM tree is constructed.


The interlocking blocking relationship between HTML, CSS, and synchronous JavaScript:

| Scenario | HTML Parsing | CSSOM Building | JS Execution | First Paint |
|---|---|---|---|---|
| Pure HTML & CSS | Streams progressively | Blocks First Paint | None | Once DOM + CSSOM ready |
| Sync Script in `<head>` | **Blocked** at script tag | Must finish before JS runs | Runs immediately | Severely delayed |
| Script with `defer` | Uninterrupted | Builds in parallel | Runs before DOMContentLoaded | Fast first paint |

## Watch out

- Placing synchronous script tags in <head> above content, which stops the HTML parser cold.
- Calling document.write(), which permanently forces the browser into a synchronous parsing bottleneck.

## Remember

- Synchronous <script> tags block the HTML parser from building the DOM until they download and execute.
- Scripts that inspect styles must wait for all preceding stylesheets to finish parsing the CSSOM.
- Use defer, async, or type=module on script tags to keep the HTML parser running smoothly.
