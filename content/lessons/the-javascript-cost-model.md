---
slug: the-javascript-cost-model
title: "The JavaScript Cost Model"
topic: javascript-performance
kind: concept
summary: "Why JavaScript is uniquely expensive: download, parse, compile, and execute on the single main thread."
tags: [javascript-cost, main-thread, v8, execution]
related: [auditing-bundle-dependencies, code-splitting-with-dynamic-import, the-single-threaded-event-loop]
---
> **In one line:** Byte-for-byte, JavaScript is more expensive than any other asset because it must be parsed, compiled, and run.

## The idea

As Google performance lead Addy Osmani famously summarized: "Byte-for-byte, JavaScript is more expensive for the browser to process than equivalently-sized images or web fonts."

When a browser downloads an image, it decodes the pixels and passes the bitmap directly to the GPU for rendering. In stark contrast, when a browser downloads JavaScript, the work has barely begun:
1. Download: The compressed script transfers across the network.
2. Parse: The V8 or JavaScriptCore engine tokenizes the source text and builds an Abstract Syntax Tree (AST).
3. Compile: The Just-In-Time (JIT) compiler transforms the AST into baseline bytecode.
4. Execute: The engine runs the bytecode on the browser's single main thread.
5. Garbage Collection: The engine periodically cleans up allocated memory.

Crucially: all parsing, compilation, and execution happens directly on the single browser main thread! A 500 KB image might take 20ms to display, whereas a 500 KB JavaScript bundle can easily freeze a mid-tier mobile processor for two full seconds while compiling and running.

## See it

```text
// Comparing Processing Cost: 300 KB Image vs 300 KB JavaScript
300 KB Image : [ Download ] ---------------------> [ GPU Rasterize (Fast) ]
300 KB Script: [ Download ] -> [ Parse AST ] -> [ JIT Compile ] -> [ Main Thread Exec (Heavy!) ]
```

> **Note:** JavaScript is uniquely expensive because after download it must be parsed, compiled, and executed on the main thread.

## Go deeper
Byte-for-byte, JavaScript is more expensive to process than images or fonts because after downloading it must be parsed into an AST, compiled to bytecode, and executed on the browser's single main thread. Managing JavaScript payload size is essential for preserving interactive responsiveness.


Comparing browser resource processing costs across asset types:

| Asset Type | 200 KB Transfer | Browser Processing Required | Main Thread Cost |
|---|---|---|---|
| **Image (AVIF/WebP)** | Fast download | Decode pixels to GPU buffer | Minimal |
| **Web Font (WOFF2)** | Fast download | Decode font table to memory | Minimal |
| **CSS Stylesheet** | Fast download | Parse to CSSOM, match selectors | Moderate |
| **JavaScript Bundle** | Fast download | **Parse AST -> Compile Bytecode -> Execute** | **Severe (locks main thread)** |


Mobile devices with slower processors spend significantly more time parsing and compiling JavaScript than desktop computers. Minimizing code payload sizes directly reduces battery consumption and main-thread execution delays, creating fluid user experiences across lower-end devices.


Profile JavaScript execution time across constrained hardware profiles using DevTools CPU throttling to uncover unoptimized functions before releasing features to global mobile audiences.

## Watch out

- Assuming a fast download speed means JavaScript is fast; mobile CPUs struggle with script parse and compile.
- Shipping multi-megabyte bundles containing complex framework runtimes for simple, static content pages.

## Remember

- Byte-for-byte, JavaScript is the most expensive resource type on the web.
- After downloading, JavaScript must be parsed into an AST, compiled to bytecode, and executed.
- JavaScript execution monopolizes the browser's single main thread, directly delaying user interactivity.
