---
id: lesson-17
slug: the-cost-of-javascript
title: "The Real Cost of JavaScript"
level: advanced
order: 17
duration: 20
tags:
  - javascript
  - bundle-size
  - code-splitting
  - tree-shaking
  - main-thread
summary: "Why JavaScript is the most expensive kind of byte — it must be downloaded, parsed, compiled, and executed on the main thread — and how to ship less of it with code splitting, tree shaking, dependency audits, and dropping unused polyfills."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain why JavaScript costs more, byte-for-byte, than images or fonts.
- Break a script's cost into **download → parse → compile → execute**.
- Reduce JavaScript with **code splitting** and dynamic **`import()`**.
- Use **tree shaking** and **dependency audits** to drop unused code.
- Remove **unused polyfills** and question heavy third-party scripts.

# Why It Matters

JavaScript is usually the biggest performance liability on a modern site — and not just because of its size.
Unlike an image, which the browser mostly just decodes and paints, JavaScript must be **parsed, compiled,
and executed on the main thread**. That main-thread work is exactly what drives up **TBT** (lab) and **INP**
(field). As Addy Osmani put it: *byte-for-byte, JavaScript is more expensive for the browser to process than
equivalently-sized images or web fonts.* The most reliable JS optimization is to **ship less of it**.

# Concept Explanation

### The lifecycle of a script

Every script you send goes through four stages, and each one costs — especially on a mid-range phone's slower
CPU:

```text
Download  ->  Parse  ->  Compile  ->  Execute
 (network)     (read      (turn into    (run it — can block
               the code)   machine code) the main thread)
```

An image of the same size only needs to be **downloaded and decoded**. That's why 200 KB of JavaScript hurts
far more than 200 KB of image: the JS also has to be parsed, compiled, and run.

### Ship less: audit dependencies and dead code

The biggest wins come from **not sending code in the first place**:

- **Audit dependencies.** A tiny feature can pull in a huge library. Prefer the platform (`Intl` for
  formatting, `fetch`, `URL`, native date APIs) or a small focused package.
- **Remove dead code.** Old features, unused utilities, and duplicate libraries add pure weight.
- Use **DevTools Coverage** to see how much of each script is actually used on load.

### Code splitting: load code when it's needed

Don't ship the whole app up front. **Code splitting** breaks the bundle into chunks loaded **on demand** with
dynamic **`import()`** — per route, or when a feature is actually used:

```javascript
// Load a heavy editor only when the user clicks "Edit" — not in the initial bundle.
editButton.addEventListener('click', async () => {
  const { RichTextEditor } = await import('./rich-text-editor.js');
  new RichTextEditor(container).mount();
});
```

The initial load stays small; the heavy chunk downloads only for users who need it.

### Tree shaking: drop unused exports

**Tree shaking** lets the bundler remove exports you never import — but it relies on **ES modules** (static
`import`/`export`) and correct `sideEffects` metadata. Importing a whole library for one function
(`import _ from 'lodash'`) can defeat it; import just what you use (`import debounce from 'lodash/debounce'`)
or use a tree-shakeable package.

### Drop unused polyfills

Polyfills exist to support old browsers. If you no longer target them, shipping polyfills to **modern**
browsers is wasted parse/execute time. Serve modern JavaScript to modern browsers and only send legacy code
where it's actually needed.

### Third-party and hydration costs

**Third-party scripts** (ads, tags, widgets) are often the largest and least-controlled JavaScript on a page —
audit, defer, or remove them. And in component frameworks, **hydration** (re-running JS to make server-rendered
HTML interactive) is main-thread work that can hurt INP — a theme we'll return to in the rendering-strategies
lesson.

# Key Terminology

- **Parse / compile / execute** — the CPU stages a script goes through after download.
- **Bundle** — the JavaScript file(s) shipped to the browser.
- **Code splitting** — breaking the bundle into chunks loaded on demand.
- **Dynamic `import()`** — loads a module at runtime, enabling code splitting.
- **Tree shaking** — removing unused exports at build time (needs ES modules).
- **Polyfill** — code that adds a missing feature for older browsers.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Feature need | Add a library | Use a platform API | Prefer built-ins (`Intl`, `fetch`, `URL`); reach for a library only when it earns its bytes. |
| Bundle | One big bundle | Code-split by route/interaction | Split so users download only what a page/feature needs. |
| Import style | `import _ from 'lib'` | `import fn from 'lib/fn'` | Import only what you use so tree shaking works. |
| Old browsers | Ship polyfills to everyone | Serve legacy code only where needed | Don't tax modern browsers with polyfills they don't need. |

# Worked Example

Splitting a heavy, rarely-used feature out of the initial bundle:

```javascript
// BEFORE: the charting library is in the initial bundle, parsed/compiled/executed
// on every page load — even for users who never open the dashboard.
import { renderChart } from './heavy-charts.js';
renderChart(el, data);

// AFTER: load it only when the dashboard is opened.
async function openDashboard() {
  const { renderChart } = await import('./heavy-charts.js'); // its own chunk, fetched on demand
  renderChart(el, data);
}
```

```bash
# See what's in your bundle and what's unused before/after (example tools):
npx source-map-explorer dist/assets/*.js
# DevTools → Coverage panel: record a load and read the "Unused bytes" per script.
```

Every user used to pay the download + parse + compile + execute cost of the chart library; now only dashboard
users do.

# Real World Analogy

Sending JavaScript is like shipping **ingredients that must be cooked**, not a **finished photo**. A photo you
just unwrap and hang on the wall (download + decode). Ingredients must be unpacked, chopped, and cooked before
anyone can eat (parse + compile + execute) — so a box of ingredients is far more *work* than a same-weight
framed photo. The way to serve dinner faster isn't to chop faster; it's to **send fewer ingredients** and only
what tonight's meal needs (code splitting).

# Examples

## Example 1 — Basic: lazy-load on interaction

Wrapping a heavy feature behind a dynamic `import()` triggered by a click keeps it out of the initial bundle,
so the first load is smaller and faster for everyone who doesn't use that feature.

**Why this works:** unused code that isn't downloaded costs nothing to parse, compile, or execute.

## Example 2 — Real-world: replace a heavy dependency

A page imported a large, all-in-one utility/date library for one formatting call. Switching to the platform
`Intl.DateTimeFormat` (or a small, tree-shakeable package) removed tens of kilobytes of JavaScript — and the
main-thread work that came with it.

**Why this works:** the cheapest byte is the one you don't ship; platform APIs cost zero download.

## Example 3 — Pitfall: shipping polyfills to modern browsers

A build included a broad polyfill bundle for browsers the site no longer supported. Modern browsers downloaded
and executed code they didn't need, inflating parse/execute time. Dropping the legacy bundle sped up the
majority of visits.

**Why this bites:** polyfills are dead weight for browsers that already have the feature.

# Common Mistakes

- **Judging JS by size alone**, ignoring the parse/compile/**execute** cost on the main thread.
- **Shipping one giant bundle** instead of splitting by route/interaction.
- **Importing whole libraries** for one function, defeating tree shaking.
- **Sending polyfills** to browsers that don't need them.

# Best Practices

- **Ship less JavaScript**: audit dependencies, prefer platform APIs, delete dead code.
- **Code-split** with dynamic `import()` so users download only what they use.
- Enable **tree shaking** (ES modules, `sideEffects`) and import only what you need.
- Serve modern JS to modern browsers; **drop unused polyfills**; audit **third-party** scripts.

# Summary

- JavaScript is the **most expensive kind of byte**: download **plus** parse, compile, and **execute** on the
  main thread.
- That main-thread work drives **TBT** and **INP**, so less JS means better responsiveness.
- **Code-split** with dynamic `import()`; **tree-shake** unused exports; import only what you use.
- **Audit dependencies**, prefer **platform APIs**, and **drop unused polyfills**.
- Watch **third-party** scripts and **hydration** — often the largest, least-controlled JS costs.

# Flash Cards

Q: Why is JavaScript more expensive, byte-for-byte, than an image of the same size?
A: An image is mostly downloaded and decoded, but JavaScript must additionally be parsed, compiled, and executed on the main thread — and that main-thread work blocks interactivity.

Q: What are the four cost stages of a script?
A: Download (network), parse (read the code), compile (to machine code), and execute (run it, which can block the main thread).

Q: What is code splitting and how do you do it?
A: Breaking the bundle into chunks loaded on demand, using dynamic `import()` — for example loading a feature's code only when the user first uses it, keeping the initial bundle small.

Q: What does tree shaking require to work?
A: Static ES module `import`/`export` (not dynamic `require`) and correct `sideEffects` metadata, so the bundler can safely drop exports you never import. Importing whole libraries can defeat it.

Q: Why can shipping polyfills hurt performance?
A: Modern browsers that already support the feature still download and execute the polyfill code, wasting parse/execute time — so only send polyfills to browsers that need them.

Q: Which JavaScript is often the largest and least-controlled on a page?
A: Third-party scripts (ads, tags, widgets); they should be audited, deferred, or removed, since they run on your main thread and affect your metrics.

# Exercises

### Easy
Open DevTools → **Coverage**, record a page load, and find the script with the most **unused** bytes. What
feature might it belong to, and could it be code-split?

### Medium
Find a feature in a project that isn't needed on first load (a modal, editor, chart). Move it behind a dynamic
`import()` triggered by interaction, and confirm the initial bundle shrank.

### Challenging
Audit a project's dependencies (e.g. with a bundle analyzer). Identify the heaviest one, evaluate whether a
platform API or a smaller package could replace it, and estimate the download **and** main-thread savings.

# Further Reading

- Addy Osmani — *The Cost of JavaScript*: <https://medium.com/@addyosmani/the-cost-of-javascript-in-2018-7d8950fbb5d4>
- web.dev — *Reduce JavaScript payloads with code splitting*: <https://web.dev/articles/reduce-javascript-payloads-with-code-splitting>
- web.dev — *Remove unused code / tree shaking*: <https://web.dev/articles/remove-unused-code>
- MDN — *Dynamic `import()`*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import>
