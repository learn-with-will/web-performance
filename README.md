# Web Performance — Learning-Portal course (to be built)

This repository will host the **Web Performance** course for the
[Learning Portal](https://thachthanhthien.github.io/) family of self-paced, static course micro-apps.

It is currently seeded with a single build prompt. To create the course, open a Claude Code session
connected to this repo and hand it [`prompts/new-course-prompt.md`](prompts/new-course-prompt.md):
that prompt derives every detail from the topic and builds the full 24-lesson course end-to-end
(React 19 + Vite + TypeScript shell, Markdown lessons, JSON quizzes), then publishes it to GitHub Pages
at `https://thachthanhthien.github.io/web-performance/`.

> Scope: Making web pages fast — Core Web Vitals (LCP, INP, CLS), the critical rendering path, network & loading optimization (caching, compression, HTTP/2-3, CDNs, preload/prefetch), image and font strategy, the real cost of JavaScript & CSS, rendering strategies, and measuring with Lighthouse / WebPageTest / field RUM data.
