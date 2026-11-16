---
slug: removing-legacy-polyfills
title: "Removing Legacy Polyfills"
topic: javascript-performance
kind: technique
summary: "Modernizing browser targets to eliminate legacy core-js polyfills and unnecessary transpilation bloat."
tags: [polyfills, browserslist, core-js, transpilation]
related: [the-javascript-cost-model, tree-shaking-dead-code, auditing-bundle-dependencies]
---
> **In one line:** Modernize your Browserslist targets to drop legacy polyfills like Promise, Symbol, and core-js bloat.

## The idea

A decade ago, web developers routinely shipped polyfills for essential language features—such as Promises, `fetch()`, `Object.assign()`, `Array.prototype.includes()`, and `Symbol`—because legacy browsers like Internet Explorer 11 lacked native support.

Today, all evergreen modern browsers (Chrome, Edge, Firefox, Safari) support modern ES2020+ standards natively. Yet, thousands of production applications continue to ship massive polyfill suites (frequently via uncurated `core-js` imports or overly permissive Babel presets) to all visitors!

Shipping redundant polyfills carries a triple performance tax:
1. Inflates wire transfer size by 50 KB to 100 KB.
2. Burns CPU cycles during initialization executing polyfill checks.
3. Overrides fast, optimized native C++ browser implementations with slower userland JavaScript polyfills!

To fix this: audit your `.browserslistrc` configuration to target modern baseline browsers (`defaults, not dead, not IE 11`) and remove global `core-js` imports.

## See it

```text
// Modern .browserslistrc: Targets evergreen browsers and eliminates legacy polyfills
defaults
last 2 versions
not dead
not IE 11
not op_mini all
```

```javascript
// Anti-pattern: Global polyfill import that adds 80 KB of unnecessary code
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Modern Pattern: Native browser platform support requires zero polyfills!
const data = await fetch('/api/items').then(res => res.json());
```

> **Tip:** Update your `.browserslistrc` target to `defaults, not dead, not IE 11` to strip obsolete polyfills.

## Go deeper
Targeting modern baseline browsers in Browserslist configuration removes obsolete polyfills (such as core-js and regenerator-runtime). Modern evergreen browsers support ES2020+ standards natively; removing redundant polyfills saves 50–100 KB in bundle size and eliminates runtime initialization overhead.


Auditing legacy polyfills versus modern native browser implementations:

| Polyfill Suite | Typical Bundle Size | Modern Status | Native Replacement |
|---|---|---|---|
| Full `core-js` | 60 KB – 100 KB min+gz | Obsolete for evergreen browsers | Native ES2020+ engines |
| `whatwg-fetch` | 8 KB min+gz | Obsolete | Native `window.fetch` |
| `regenerator-runtime` | 12 KB min+gz | Obsolete | Native async/await support |
| `core-js/features/promise` | 15 KB min+gz | Obsolete | Native C++ `Promise` |


Shipping legacy polyfills for outdated browsers penalizes modern mobile users with redundant code execution and parsing overhead. Modern tooling and differential bundling allow modern browsers to execute native JavaScript APIs without downloading legacy polyfill libraries.

## Watch out

- Targeting outdated browsers in tsconfig.json (e.g. target: 'es5'), which bloats code with complex helper transforms.
- Importing third-party libraries that bundle their own internal copy of core-js.

## Remember

- Evergreen modern browsers support ES2020+ natively, making legacy polyfills obsolete.
- Polyfills inflate bundle weight, waste CPU cycles, and override fast native browser C++ methods.
- Configure Browserslist to exclude dead browsers and target modern baseline platforms.
