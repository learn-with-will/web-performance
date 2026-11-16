---
slug: dom-construction
title: "DOM Construction"
topic: rendering-path
kind: concept
summary: "How browsers convert raw HTML bytes into characters, tokens, nodes, and the Document Object Model tree."
tags: [dom, html-parsing, browser-internals, tokens]
related: [cssom-and-render-blocking-css, parser-blocking-javascript, render-tree-layout-paint]
---
> **In one line:** The browser tokenizes raw HTML bytes and constructs the Document Object Model (DOM) as a hierarchical node tree.

## The idea

The Document Object Model (DOM) is the browser's internal tree representation of the HTML document structure. Constructing the DOM is the very first step of the Critical Rendering Path.

The browser processes HTML through a four-stage translation pipeline:
1. Bytes to Characters: The browser reads raw binary bytes from the network or disk and converts them into text characters according to the specified encoding (typically UTF-8).
2. Characters to Tokens: The tokenizer consumes characters and identifies discrete HTML tokens—start tags, end tags, attribute names, values, and text strings.
3. Tokens to Nodes: As tokens are emitted, they are converted into Node objects containing properties, attributes, and relationships.
4. Nodes to DOM Tree: Because HTML tags nest inside one another, nodes are linked into a parent-child hierarchical tree structure.

HTML parsing is incremental. The browser does not wait for the complete HTML document to download before starting DOM construction; it tokenizes and builds the tree progressively as chunks of HTML arrive over the network socket.

## See it

```text
// HTML Parsing Pipeline
[Bytes: 3C 68 74 6D 6C 3E]
   | (Encoding: UTF-8)
   v
[Characters: <html><body><h1>Fast</h1></body></html>]
   | (Tokenizer)
   v
[Tokens: StartTag(html), StartTag(body), StartTag(h1), Text('Fast'), EndTag(h1)...]
   | (Tree Construction)
   v
[DOM Tree: html -> body -> h1 -> 'Fast']
```

> **Tip:** Keep the DOM tree compact (< 1,500 total nodes) to prevent memory bloating and slow layout recalculations.

## Go deeper
Excessively deep DOM trees increase the memory footprint of the browser process and inflate the computational cost of every subsequent style recalculation and layout reflow. Aim for a maximum DOM depth of less than 32 levels and a total node count under 1,400 elements. Virtualizing extensive lists and paginating heavy tables prevents DOM node proliferation.


Performance characteristics of the DOM construction pipeline:

| DOM Pipeline Stage | Primary Resource Cost | Optimization Lever |
|---|---|---|
| Byte Decoding | Minimal CPU | Specify `<meta charset="utf-8">` in the first 1024 bytes |
| Tokenization | CPU linear with document length | Eliminate invalid HTML syntax and unclosed tags |
| Tree Construction | Memory & parent-child pointer allocation | Maintain shallow nesting depth (less than 32 levels) |

## Watch out

- Creating excessively deep or wide DOM trees with thousands of nodes, which slows every subsequent style recalculation.
- Omitting explicit charset declarations, forcing the browser to buffer bytes while guessing character encoding.

## Remember

- DOM construction converts raw bytes into characters, tokens, nodes, and a hierarchical tree.
- The browser builds the DOM incrementally as HTML chunks arrive over the network.
- Avoid deeply nested markup and excessively large DOM trees to keep memory and parsing fast.
