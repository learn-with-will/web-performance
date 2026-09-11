# Web Performance Course — Authoring Prompt & No-Hallucination Contract

This file is the contract for writing and maintaining the **Web Performance** course in this repo.
Every lesson and quiz must obey it. The goal: a beginner-friendly, **source-verified** course on making
web pages fast — how the browser loads and renders a page, the Core Web Vitals, network and asset
optimization, the cost of JavaScript, rendering strategies, and how to measure it all — with **zero
invented facts**.

## Audience & voice

- **Suitable for everyone.** Assume the reader is new to web performance and may be an early-career web
  developer. Define every term the first time it appears (LCP, CRP, TTFB, RUM, hydration…). Prefer
  short sentences and concrete examples.
- Explain the *why*, not just the *how*. Use **one plain-language analogy per lesson**.
- Be honest about limits and trade-offs. Performance is full of "it depends": there is rarely a single
  "fastest" answer. Never oversell ("this makes your site instant", "always do X"). Name the trade-off
  (e.g. preloading everything de-prioritizes the thing that actually matters).
- Keep code **minimal and runnable**, using the platform: `html`, `css`, `javascript`, and `bash` for
  shell/tooling. Show HTTP headers, request waterfalls, and console output as `text`. Prefer small,
  self-contained snippets a reader can paste into a page or DevTools.

## Currency & honesty (verified 2025 — "as of writing")

- The web platform evolves. Do **not** hard-code exact benchmark timings, browser-support percentages,
  or "fastest/best" claims as fixed facts. Say **"as of writing"** and link the current docs. Metric
  definitions and **thresholds** are stable and *should* be stated exactly (see the checklist); tooling
  weights and browser support are **not** — qualify them.
- Respect known changes: **INP replaced FID** as a Core Web Vital on **2024-03-12**; Chrome effectively
  **removed HTTP/2 Server Push**; **AVIF** support is now broad but still "check support". When you show
  an API or attribute, it must match the **current** documented behaviour.

## Authoritative sources (cite these; do not invent)

- **web.dev** — https://web.dev/ — the primary reference for Core Web Vitals and optimization:
  - Vitals overview: https://web.dev/articles/vitals · LCP https://web.dev/articles/lcp ·
    CLS https://web.dev/articles/cls · INP https://web.dev/articles/inp ·
    FCP https://web.dev/articles/fcp · TTFB https://web.dev/articles/ttfb
  - Learn Performance course: https://web.dev/learn/performance
  - Lighthouse performance scoring: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
- **MDN Web Docs** — https://developer.mozilla.org/ — HTTP caching, `Cache-Control`, images (`srcset`,
  `loading`), fonts (`@font-face`, `font-display`), resource hints, Service Worker & Cache APIs,
  Performance APIs (`PerformanceObserver`, Navigation/Resource/Event Timing).
- **W3C specifications** — Largest Contentful Paint, Layout Instability, Event Timing, Paint Timing,
  Resource Hints, Preload, Priority Hints, Navigation/Resource Timing (https://www.w3.org/TR/).
- **WHATWG HTML Standard** — https://html.spec.whatwg.org/ — `<script>` `defer`/`async`/`type=module`,
  the `loading` attribute, `<link rel=preload>`.
- **IETF RFCs** — HTTP Semantics **9110**, HTTP Caching **9111**, HTTP/1.1 **9112**, HTTP/2 **9113**,
  HTTP/3 **9114**, QUIC **9000** (https://www.rfc-editor.org/).
- **HTTP Archive Web Almanac** — https://almanac.httparchive.org/ — for "state of the web" context
  (cite the year).
- **Chrome for Developers / DevTools** — https://developer.chrome.com/docs/devtools/ — Network panel,
  Performance panel, coverage.
- **Addy Osmani, "The Cost of JavaScript"** — https://v8.dev/blog and https://web.dev — for JS
  parse/compile/execute cost.

If a claim isn't backed by one of these (or another primary source), don't write it. If unsure, qualify
it or leave it out.

## High-risk facts to get right (anti-hallucination checklist)

These are the classic places web-performance material goes wrong. Getting them right is the point of the
course.

1. **Core Web Vitals thresholds & percentile.** **LCP** good ≤ **2.5 s**, poor > **4.0 s**. **CLS**
   good ≤ **0.1**, poor > **0.25** (unitless). **INP** good ≤ **200 ms**, poor > **500 ms**. Each is
   assessed at the **75th percentile** of real page loads/interactions, split by **mobile and desktop**.
   Do not invent other numbers.
2. **INP replaced FID.** As of **2024-03-12**, **INP** is a Core Web Vital and **FID is retired**. Never
   present FID as a current Core Web Vital.
3. **What is / isn't a Core Web Vital.** The three current CWV are **LCP, INP, CLS**. **FCP** and
   **TTFB** are important *diagnostic* Web Vitals but **not** Core Web Vitals. **TBT** and **Speed
   Index** are **lab** metrics (TBT is the lab proxy for INP).
4. **Lab vs field.** **Lab** (Lighthouse, DevTools, WebPageTest) = synthetic, reproducible, one
   environment; great for debugging. **Field / RUM** (real users, e.g. **CrUX**) = what users actually
   experience; it's what CWV assessment uses. They can legitimately disagree. The Lighthouse
   **performance score is a lab score and does not include INP or FID**.
5. **Lighthouse score is weighted and version-dependent.** As of writing (**Lighthouse 10/11**) the
   performance score weights are **FCP 10% · Speed Index 10% · LCP 25% · TBT 30% · CLS 25%**; bands are
   **0–49 red, 50–89 orange, 90–100 green**. Weights change between versions — say "as of writing" and
   link the scoring docs. A perfect lab score does **not** guarantee a good field experience.
6. **CLS details.** Only **unexpected** layout shifts count; shifts within **500 ms** of a user
   interaction (`hadRecentInput`) are excluded. It's scored with **session windows** (≤ 5 s window,
   1 s gap) and the reported value is the **largest** window's sum. Layout shift score = impact
   fraction × distance fraction (unitless).
7. **INP details.** INP observes **all** qualifying interactions and reports a value at (near) the
   **worst** one; pages with many interactions ignore a few of the worst. Only **click, tap, and
   keyboard** interactions count — **not** scrolling or hover. An interaction's latency = **input delay
   + processing time + presentation delay**.
8. **LCP element & TTFB.** The LCP element is the largest **text block, image, video poster frame, or
   CSS `background-image`** in the viewport. **TTFB** (time to first byte) is a *component* of LCP;
   web.dev suggests keeping TTFB under ~**0.8 s** for a good LCP (guidance, **not** a CWV threshold).
9. **Render-blocking vs parser-blocking.** **CSS is render-blocking** — the browser won't paint until
   the CSSOM is built. A plain synchronous `<script>` is **parser-blocking**. **`defer`** runs after
   HTML parsing, **in document order**, before `DOMContentLoaded`; **`async`** runs as soon as it's
   fetched, **order not guaranteed**; **`type="module"`** is deferred by default. (WHATWG HTML.)
10. **Images.** Prefer **AVIF**, then **WebP**, falling back to JPEG/PNG (use `<picture>`/`type`).
    Always set **`width`/`height`** (or CSS `aspect-ratio`) to reserve space and prevent CLS. Use
    **`loading="lazy"`** for below-the-fold images, but **never lazy-load the LCP image** — instead
    consider **`fetchpriority="high"`**. `srcset`+`sizes` serve responsive sizes. Don't quote fixed
    "% smaller" numbers as universal.
11. **Fonts.** Use **WOFF2**. **`font-display`**: `swap` = show fallback then swap (**FOUT**);
    `optional` = best for CLS, may skip the web font on a slow connection; `block` = invisible text up
    to ~3 s (**FOIT**). Preload key fonts with `<link rel="preload" as="font" type="font/woff2"
    crossorigin>` — fonts are fetched **anonymously**, so `crossorigin` is required or the preload is
    wasted. Cut swap-driven CLS with `size-adjust` / metric overrides or tuned fallback fonts.
12. **HTTP caching.** **`Cache-Control`** is the modern control (`Expires` is legacy). `max-age`
    (seconds); **`no-cache`** = may store but **must revalidate** before reuse; **`no-store`** = never
    store; `public`/`private`; **`immutable`** = don't revalidate even on reload. Best practice:
    **fingerprinted** static assets → `Cache-Control: public, max-age=31536000, immutable` (1 year);
    HTML → `no-cache`. Revalidation uses **`ETag`/`If-None-Match`** or
    **`Last-Modified`/`If-Modified-Since`** → **`304 Not Modified`**. (RFC 9111.)
13. **Compression vs minification.** **Compression** (**gzip**, **Brotli** `br`, emerging **zstd**) is
    negotiated by the server via **`Accept-Encoding`**/`Content-Encoding`; **minification** removes
    source whitespace/comments at build time. **Do both.** Brotli usually beats gzip on text. **Never
    re-compress already-compressed binaries** (JPEG/PNG/WebP/AVIF/WOFF2/MP4). Compression ≠ encryption.
14. **The cost of JavaScript.** Bytes matter, but JS is uniquely expensive because after download it is
    **parsed, compiled, and executed on the main thread**. "Byte-for-byte, JavaScript is more expensive
    for the browser to process than equivalently-sized images or web fonts" (Osmani). Ship less:
    **code-split** with dynamic `import()`, **tree-shake**, remove unused polyfills.
15. **Main thread & long tasks.** JavaScript runs on a **single main thread**; a **long task** blocks it
    for **> 50 ms** and delays interactions (hurting INP). Break work up and yield (`await`,
    `scheduler.yield()`, `setTimeout`, `requestIdleCallback`) or move it to a **Web Worker**.
16. **Resource hints & priorities.** **`preconnect`** = DNS + TCP + TLS to a critical cross-origin;
    **`dns-prefetch`** = DNS only (cheaper, wider support). **`preload`** = fetch a **current-page**
    critical resource early (correct `as`; `crossorigin` for fonts). **`prefetch`** = low-priority
    fetch for a **future** navigation. **`fetchpriority`** raises/lowers a fetch's priority;
    **`modulepreload`** for ES modules. The **Speculation Rules API** (prefetch/prerender future pages)
    is Chromium and emerging as of writing. Over-preloading **hurts** — it competes with what matters.
17. **HTTP/2, HTTP/3, CDNs.** **HTTP/2** = **multiplexing** many streams over one TCP connection + HPACK
    header compression; this makes domain sharding and heavy concatenation **less necessary** (not
    useless). Chrome effectively **removed Server Push**. **HTTP/3** runs over **QUIC** (UDP), removing
    TCP head-of-line blocking, with faster (0/1-RTT) setup and built-in TLS 1.3. A **CDN** caches
    content at **edge** servers near users to cut latency; it doesn't fix a slow application. (RFCs
    9113 / 9114 / 9000.)
18. **Rendering strategies (trade-offs, not winners).** **CSR** (render in browser: cheap server, slow
    FCP/LCP, heavy JS); **SSR** (HTML per request: faster FCP, needs **hydration**, which adds
    main-thread work and can hurt INP/TBT); **SSG/prerender** (HTML at build time: fastest,
    CDN-cacheable, not for per-request data); plus **streaming SSR** and **islands / partial
    hydration**. There is **no universally best** strategy — it trades TTFB vs FCP vs interactivity.
19. **Service workers & caching.** A service worker is a **programmable network proxy** (intercepts
    `fetch`) that requires **HTTPS**. The **Cache API** (Cache Storage) enables offline and runtime
    strategies — **cache-first**, **network-first**, **stale-while-revalidate**. **Version** caches and
    clean up on `activate`, or you serve stale assets forever. It does **not** speed up the **first**
    visit (it installs during/after it).
20. **Measurement honesty.** Optimize the **75th-percentile field** experience, not your fast laptop on
    fast Wi-Fi. Test on **throttled mobile** and slow networks. Averages hide the tail — use
    **percentiles** (p75/p95). A single lab run varies; compare **medians** of several. Never quote
    "fastest/best" or invented benchmark numbers; say "as of writing" and cite current docs.

## Lesson structure (match the shell + the other courses)

Front-matter (YAML): `id` (`lesson-NN`), `slug`, `title`, `level` (`beginner|intermediate|advanced`),
`order` (1–24), `duration` (minutes), `tags` (exactly 5), `summary` (one sentence — used to generate
the manifest). Then these H1 sections, in order:

`Learning Objectives` · `Why It Matters` · `Concept Explanation` (use `###` subsections) ·
`Key Terminology` · `Options and Trade-offs` (a table) · `Worked Example` · `Real World Analogy` ·
`Examples` (`## Example 1/2/3`: basic, real-world, pitfall) · `Common Mistakes` · `Best Practices` ·
`Summary` · `Flash Cards` (≥ 5 `Q:`/`A:` pairs; put 6) · `Exercises` (`### Easy/Medium/Challenging`) ·
`Further Reading` (links to the sources above).

## Code fences (only these languages — enforced by the validator)

`html` (markup the browser parses — **primary**), `css` (styles, `@font-face`, the render path),
`javascript` (scripts, Performance APIs, service workers), `bash` (shell: `curl -I`, `npm`, build
tooling), `text` (HTTP headers/responses, request waterfalls, DevTools/console output, config that
isn't one of the above). **No other fence languages** (no `json`, `http`, `nginx`, `yaml`, `jsx`, `ts`).

## Curriculum (24 lessons, 8/8/8)

Beginner: 01 why-web-performance-matters · 02 how-the-browser-loads-a-page · 03
the-critical-rendering-path · 04 core-web-vitals · 05 lab-vs-field-data · 06 measuring-with-lighthouse ·
07 reading-the-network-panel · 08 performance-budgets.

Intermediate: 09 optimizing-lcp · 10 optimizing-cls · 11 optimizing-inp · 12 image-optimization · 13
font-loading · 14 http-caching · 15 compression-and-minification · 16 render-blocking-resources.

Advanced: 17 the-cost-of-javascript · 18 reducing-main-thread-work · 19 resource-hints-and-priorities ·
20 http2-http3-and-cdns · 21 rendering-strategies · 22 service-workers-and-caching · 23
monitoring-performance-in-production · 24 performance-audit-capstone.

## Quizzes

One per lesson: `public/quizzes/lesson-NN.json`, `id` `quiz-lesson-NN`, `lessonId` `lesson-NN`,
`passingScore` 60, 5–6 questions spanning the five types (`single-choice`, `multiple-choice`,
`fill-blank`, `ordering`, `match-pair`). Every answer must be traceable to the lesson text; add an
`explanation` to each. Keep `fill-blank` answers short and provide case variants (e.g. `["LCP", "largest
contentful paint"]`). Use the quiz to reinforce the anti-hallucination points above — especially the CWV
thresholds, the 75th percentile, INP-not-FID, lab-vs-field, render-blocking rules, caching directives,
and "never lazy-load the LCP image".
