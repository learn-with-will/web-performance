---
slug: tree-shaking-dead-code
title: "Tree Shaking and Dead Code Elimination"
topic: javascript-performance
kind: technique
summary: "Eliminating unused JavaScript exports using static ES modules and package.json sideEffects configuration."
tags: [tree-shaking, es-modules, side-effects, dead-code]
related: [auditing-bundle-dependencies, code-splitting-with-dynamic-import, removing-legacy-polyfills]
---
> **In one line:** Tree shaking relies on static ES module imports and package sideEffects declarations to discard unused code.

## The idea

Tree shaking is the automated process of eliminating unused code ("dead code") from your final production bundles. The visual analogy imagines your codebase as an abstract syntax tree: live utility functions and components are green leaves, while unused exports are brown dead leaves that the bundler shakes off before packaging.

For tree shaking to work, three architectural conditions must be met:
1. ES Module (ESM) Syntax: Tree shaking strictly requires static `import` and `export` statements. Static imports cannot be nested inside `if` statements or dynamic blocks, allowing the bundler to analyze the dependency graph statically at build time. Legacy CommonJS (`require()` and `module.exports`) cannot be safely tree-shaken.
2. Named Exports: Import specific named functions rather than wildcard namespaces (use `import { add } from './math'` instead of `import * as math from './math'`).
3. The `sideEffects` Flag: In `package.json`, declaring `"sideEffects": false` informs the bundler that none of the files perform global mutations (such as modifying `window` or injecting global CSS). If an export is unused, the bundler can safely discard the entire file.

## See it

```json
// package.json: Informing bundlers that modules contain no side effects
{
  "name": "my-app",
  "version": "1.0.0",
  "sideEffects": false
}

// Or specifying only files that actually have side effects (like global CSS)
{
  "sideEffects": ["./src/global.css", "*.scss"]
}
```

> **Note:** Tree shaking requires static ES module syntax (`import`/`export`); legacy CommonJS (`require`) cannot be tree-shaken.

## Go deeper
Tree shaking automatically eliminates unused exports from production bundles using static ES module dependency analysis. Declaring `"sideEffects": false` in `package.json` informs bundlers that modules do not perform global mutations, allowing dead code to be safely pruned during compilation.


Key factors governing whether code can be safely tree-shaken by modern bundlers:

| Code Pattern | Tree-Shakeable? | Explanation |
|---|---|---|
| `import { pick } from 'lodash-es'` | **Yes (100%)** | Static ESM import from modular package |
| `const { pick } = require('lodash')` | **No** | CommonJS dynamic runtime evaluation prevents static analysis |
| `import * as utils from './utils'` | Partial | Bundler must evaluate whether namespace is dynamically accessed |
| Class with unused methods | Rarely | JavaScript dynamic prototype dispatch makes class methods hard to prune |

## Watch out

- Compiling ES modules to CommonJS with Babel or TypeScript before passing code to your bundler, breaking tree shaking.
- Omitting the sideEffects flag, forcing the bundler to retain unused files that might perform side-effect mutations.

## Remember

- Tree shaking eliminates unused exports from production bundles using static dependency analysis.
- Tree shaking requires ES module static import and export syntax, not CommonJS require().
- Declare "sideEffects": false in package.json so bundlers can safely prune unused module files.
