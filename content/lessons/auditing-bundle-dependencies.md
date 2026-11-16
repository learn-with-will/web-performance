---
slug: auditing-bundle-dependencies
title: "Auditing Bundle Dependencies"
topic: javascript-performance
kind: tool
summary: "Visualizing bundle composition with bundle analyzers to eliminate duplicate and bloated dependencies."
tags: [bundle-analyzer, dependencies, npm, tree-shaking]
related: [the-javascript-cost-model, code-splitting-with-dynamic-import, tree-shaking-dead-code]
---
> **In one line:** Audit production bundles using visual bundle analyzers to discover bloated dependencies and duplicate libraries.

## The idea

Modern JavaScript applications are built on sprawling `npm` dependency trees. It is alarmingly easy for a developer to run `npm install <package>` to solve a minor problem, inadvertently introducing 300 kilobytes of transitive dependencies into the production bundle.

Visual bundle analyzers—such as `rollup-plugin-visualizer` in Vite or `webpack-bundle-analyzer` in Webpack—generate an interactive treemap of your production build. Every module, package, and component is represented as a colored rectangle whose area corresponds directly to its byte size.

Auditing your bundle treemap exposes common optimization opportunities:
1. Massive legacy utility libraries: Replacing full `lodash` (70 KB) with native modern JavaScript array methods or modular micro-imports (`lodash-es/debounce`).
2. Heavy date libraries: Replacing `moment.js` (which includes massive internationalization locales) with modern lightweight alternatives like `date-fns` or native `Intl.DateTimeFormat`.
3. Duplicate packages: Identifying cases where conflicting version ranges force bundlers to package two distinct copies of the same library.

## See it

```javascript
// vite.config.js: Integrating rollup-plugin-visualizer for bundle audits
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: './dist/bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

> **Tip:** Inspect bundle treemaps regularly to catch accidental dependencies and bloated transitive packages before shipping.

## Go deeper
Visual bundle analyzers generate interactive treemaps illustrating the byte footprint of every `npm` package. Auditing production bundles exposes oversized legacy libraries, duplicate dependencies, and un-treeshaken modules, allowing developers to replace heavy packages with native browser APIs.


High-ROI package replacements discovered during dependency audits:

| Bloated Legacy Dependency | Typical Bundle Size | Modern Lightweight Replacement | Byte Savings |
|---|---|---|---|
| `moment.js` | ~72 KB min+gz | Native `Intl` or `date-fns` | **~65 KB (90% savings)** |
| Full `lodash` | ~70 KB min+gz | Native ES6 methods or `lodash-es` | **~60 KB (85% savings)** |
| `validator.js` | ~60 KB min+gz | Zod modular schema or native regex | **~45 KB (75% savings)** |
| `axios` | ~15 KB min+gz | Native `fetch()` | **~15 KB (100% savings)** |

## Watch out

- Importing from library roots (import { debounce } from 'lodash'), which pulls in the entire library without tree-shaking.
- Adding UI component libraries without verifying whether unused components can be tree-shaken.

## Remember

- Visual bundle analyzers generate treemaps displaying the exact byte footprint of every dependency.
- Replace heavy legacy packages (like Moment or full Lodash) with native browser platform APIs.
- Audit bundles regularly in CI to catch accidental dependency bloat before release.
