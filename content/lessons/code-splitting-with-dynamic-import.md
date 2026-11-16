---
slug: code-splitting-with-dynamic-import
title: "Code Splitting with Dynamic Import"
topic: javascript-performance
kind: technique
summary: "Breaking monolithic JavaScript bundles into on-demand chunks using route-based splitting and dynamic import()."
tags: [code-splitting, dynamic-import, chunks, bundling]
related: [the-javascript-cost-model, auditing-bundle-dependencies, tree-shaking-dead-code]
---
> **In one line:** Split JavaScript into modular on-demand chunks using dynamic import() so users only download code they need.

## The idea

Without code splitting, bundlers compile an entire multi-page application into a single, massive JavaScript bundle. A user visiting your marketing homepage downloads the code for the admin dashboard, the checkout wizard, the chart visualization engine, and the user settings panel—even if they never navigate to those features!

Code splitting solves this by decomposing your codebase into smaller, independent chunks that download on demand.

The native web platform standard for code splitting is the dynamic `import()` syntax. Unlike static `import` statements (which must sit at the top of a file and load eagerly), dynamic `import('./module.js')` returns a Promise that resolves when the module finishes downloading.

Two primary code-splitting patterns drive web performance:
1. Route-based splitting: Splitting code by URL route (e.g. Home, Dashboard, Profile). Users download only the JavaScript required to render their active view.
2. Interaction-based splitting: Deferring heavy libraries (such as a rich markdown editor, PDF exporter, or 3D canvas) until the user explicitly clicks a button or opens a modal.

## See it

```javascript
// Interaction-based code splitting: Load heavy PDF library only when user clicks export
const exportBtn = document.querySelector('#export-pdf');

exportBtn.addEventListener('click', async () => {
  exportBtn.disabled = true;
  exportBtn.textContent = 'Generating PDF...';

  // Dynamic import loads the chunk asynchronously on demand
  const { generatePDF } = await import('./pdf-generator.js');
  await generatePDF();

  exportBtn.disabled = false;
  exportBtn.textContent = 'Export Complete';
});
```

> **Tip:** Route-based code splitting ensures users download only the JavaScript required for their active screen.

## Go deeper
Code splitting decomposes monolithic application bundles into smaller, on-demand chunks using the native dynamic `import()` syntax. Route-based and interaction-based code splitting ensures users download only the code required for their immediate view, dramatically reducing initial load times.


Comparing code-splitting strategies across application architecture:

| Code-Splitting Strategy | Trigger Mechanism | Typical Chunks Created | Performance Benefit |
|---|---|---|---|
| **Route-Based** | URL navigation / router match | Page-level chunks (Home, Settings, Shop) | Slashes initial load bundle size |
| **Interaction-Based** | User click / focus event | Modal, drawer, rich-text editor chunks | Keeps heavy features off initial load |
| **Visibility-Based** | IntersectionObserver near fold | Below-the-fold comments, charts | Defers non-critical execution |

## Watch out

- Over-splitting code into hundreds of microscopic chunks, causing network request overhead on HTTP/1.1 connections.
- Failing to display a loading indicator or skeleton while an on-demand dynamic chunk downloads.

## Remember

- Dynamic import() enables on-demand code splitting, loading scripts only when required.
- Route-based code splitting splits code on page boundaries to slash initial bundle weight.
- Interaction-based code splitting defers heavy libraries until a user clicks or requests the feature.
