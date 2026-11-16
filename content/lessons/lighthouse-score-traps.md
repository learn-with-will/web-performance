---
slug: lighthouse-score-traps
title: "Lighthouse Score Traps"
topic: measurement-and-tooling
kind: pitfall
summary: "Common pitfalls of chasing 100/100 lab scores while inadvertently harming real-user experience."
tags: [pitfalls, lighthouse, goodharts-law, anti-patterns]
related: [running-lighthouse, lighthouse-score-weights, why-lab-and-field-differ]
---
> **In one line:** Do not game Lighthouse with artificial delays; optimizing for synthetic lab tests can degrade real-user experience.

## The idea

When a metric becomes a target, it ceases to be a good metric. In web performance, this manifestation of Goodhart's Law is commonly seen when teams obsess over achieving an arbitrary "100/100" Lighthouse score.

A classic trap is artificially delaying the execution of essential third-party scripts or chat widgets using `setTimeout(..., 5000)` or listening for the first user scroll. Because Lighthouse concludes its test shortly after load, delaying scripts makes Lighthouse believe the page is completely free of JavaScript work, yielding a perfect lab score.

However, the real user suffers terribly: the moment they touch the screen or attempt to interact, the delayed scripts suddenly wake up in a stampede, freezing the main thread and destroying real-world INP.

Other traps include inlining massive stylesheets directly into HTML (which games Lighthouse CSS audits but destroys HTTP caching across subsequent page views) and aggressive over-preloading that starves the actual hero image of bandwidth. The ultimate goal is a fast experience for human users, not a green badge from a synthetic bot.

## See it

```javascript
// Anti-pattern: Artificially deferring scripts until user scroll to game Lighthouse
// This games Lighthouse lab scores but destroys real-world INP when the user scrolls!
window.addEventListener('scroll', () => {
  loadHeavyWidgetScripts();
}, { once: true });

// Correct Pattern: Load widgets on idle, or load when user explicitly requests them
function initWidgetOnDemand() {
  const triggerBtn = document.querySelector('#open-chat');
  triggerBtn.addEventListener('click', () => {
    import('/js/chat-widget.js').then(module => module.render());
  }, { once: true });
}
```

> **Watch out:** Never artificially delay JavaScript until user interaction to game Lighthouse; it severely degrades real-world INP.

## Go deeper

Common Lighthouse gaming anti-patterns and their real-world consequences:

| Anti-Pattern | Synthetic Lab Result | Real User Field Consequence |
|---|---|---|
| Delaying all JS until scroll | 100/100 Performance score | Main thread freezes on scroll; failing INP |
| Inlining all CSS into HTML | Eliminates render-blocking audit | HTML payload bloats; zero cache reuse on page 2 |
| Preloading every asset | Flags early discovery | Network bandwidth congestion; delayed LCP |
| Hiding content with display:none | Omits nodes from render tree | Content unavailable for search crawlers & users |

## Watch out

- Using scroll-triggered script injection that turns initial smooth scrolling into a stuttering long-task freeze.
- Celebrating passing lab scores in team meetings while field data in Google Search Console shows failing URLs.

## Remember

- The Lighthouse score is a diagnostic tool, not the ultimate business or engineering goal.
- Artificially delaying scripts to fool lab tests causes massive interaction freezes for real users.
- Prioritize real-world field experience over chasing an artificial 100/100 synthetic lab badge.
