# Web Performance — Learning-Portal course

A self-paced, **frontend-only** course on making web pages fast, part of the
[Learning Portal](https://thachthanhthien.github.io/LearningPortal/) family of static course micro-apps.
24 lessons (8 beginner · 8 intermediate · 8 advanced), each with a quiz, all rendered from Markdown and
JSON at runtime. Progress is saved in `localStorage`; there is no backend.

**Live:** <https://learn-with-will.github.io/web-performance/>

> Scope: how the browser loads and renders a page, the Core Web Vitals (LCP, INP, CLS), the critical
> rendering path, network & loading optimization (caching, compression, HTTP/2-3, CDNs,
> preload/prefetch), image and font strategy, the real cost of JavaScript & CSS, rendering strategies,
> and measuring with Lighthouse / WebPageTest / field RUM data. Every fact is verified against
> **web.dev**, **MDN**, and the **W3C/WHATWG specs** — see [`prompts/web-performance-authoring-prompt.md`](prompts/web-performance-authoring-prompt.md).

## Tech stack

React 19 · Vite 6 · TypeScript · React Router 7 · Tailwind CSS v4 · `marked` (Markdown) · PrismJS
(syntax highlighting for `html`, `css`, `javascript`, `bash`).

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run build      # tsc -b && vite build  (+ postbuild writes dist/404.html)
npm run preview    # preview the production build locally
```

The production base path is set from `BASE_PATH` (CI passes `/<repo>/`); local dev and build default to
`/`. GitHub Pages has no SPA fallback, so `scripts/copy-404.mjs` copies `dist/index.html` to
`dist/404.html` after each build and the app boots for any deep link.

## How it's structured

Everything is **manifest-driven** — adding a lesson needs no code change:

```
public/
  content/
    course-manifest.json          # ordered list of all 24 lessons (id, slug, title, level, file, summary, tags)
    beginner/ intermediate/ advanced/
      <slug>.md                   # one Markdown lesson each (YAML front-matter + fixed H1 sections)
  quizzes/
    lesson-NN.json                # one quiz per lesson (5–6 questions across five types)
src/
  core/       # models, contexts (course, progress, theme), services (lesson/quiz/asset/search), prism
  features/   # home, roadmap, dashboard, bookmarks, search, lesson, quiz pages
  shared/     # navbar, footer, lesson content renderer, quiz UI, brand mark
```

### Add or edit a lesson

1. Create `public/content/<tier>/<slug>.md` with the front-matter and H1 sections described in the
   [authoring prompt](prompts/web-performance-authoring-prompt.md).
2. Add `public/quizzes/lesson-NN.json` (same `lessonId`).
3. Add an entry to `public/content/course-manifest.json` (its `summary` mirrors the lesson front-matter).

## Deploy

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds with
`BASE_PATH=/<repo>/` and deploys to GitHub Pages. Enable Pages once under **Settings → Pages → Source:
GitHub Actions**.

## Credits

Built on the shared Learning-Portal shell (first created for the Angular / React / Data Science
courses). Content is educational and verified against primary sources; brand colour is the Core Web
Vitals "good" green (`#0CCE6B`).
