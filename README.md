# Web Performance

A self-paced, content-only course on making web pages fast, built on the shared [course-shell](https://github.com/learn-with-will/course-shell).
115 micro-lessons (bite-sized, 3–5 minutes each across 12 topics) with 160 interactive practice questions.

**Live:** <https://learn-with-will.github.io/web-performance/>

> Scope: how the browser loads and renders a page, Core Web Vitals (LCP, INP, CLS), the critical rendering path, network & loading optimization (caching, compression, HTTP/2-3, CDNs, preload/preconnect), image and font strategy, the real cost of JavaScript, rendering architectures (SSR, SSG, streaming, islands), and lab/field monitoring (CrUX, Lighthouse, RUM). Every fact is verified against **web.dev**, **MDN**, and the **W3C/WHATWG specs** — see [`prompts/web-performance-authoring-prompt.md`](prompts/web-performance-authoring-prompt.md).

## Course layout

```text
course.json                    course metadata, brand styling, code languages
content/topics.json            the 12 curriculum topics
content/lessons/*.md           115 bite-sized micro-lessons (3–5 min each)
content/legacy.json            backward compatibility redirect map for 24 legacy lessons
quiz/questions.json            160 practice questions (all five question types)
prompts/                       authoring prompt and domain guidelines
.github/workflows/deploy.yml   thin deployment workflow invoking course-shell
```

## Develop and validate

This repository contains content only. Development and validation run through `course-shell`:

```bash
# Validate content strictly against bite rules and schema
npm --prefix ../course-shell run validate -- ../web-performance --strict

# Run dev server with hot reload
npm --prefix ../course-shell run dev -- ../web-performance

# Build static production bundle
npm --prefix ../course-shell run build -- ../web-performance
```

## Deploy

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which uses the shared [`deploy-course.yml`](https://github.com/learn-with-will/course-shell/blob/main/.github/workflows/deploy-course.yml) workflow from `course-shell` to validate, build, and deploy to GitHub Pages.
