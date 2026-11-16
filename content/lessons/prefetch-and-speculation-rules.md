---
slug: prefetch-and-speculation-rules
title: "Prefetch and Speculation Rules"
topic: loading-strategies
kind: technique
summary: "Anticipating future page navigations using link rel=prefetch and the modern Speculation Rules API."
tags: [prefetch, speculation-rules, prerender, future-navigation]
related: [preloading-critical-assets, fetchpriority-attribute, priority-budget-and-over-hinting]
---
> **In one line:** Use prefetch and the Speculation Rules API to fetch or prerender the next page for instant navigations.

## The idea

While `preload` fetches critical assets required for the *current* page, `prefetch` anticipates the *next* page the user is likely to visit.

When a user hovers over a navigation link, reaches the final step of a checkout wizard, or reads an article, you can prefetch the assets of the anticipated next page:
```html
<link rel="prefetch" href="/shop/checkout.js">
```
The browser downloads the prefetched file at Lowest priority when the network connection becomes completely idle, storing it in the HTTP disk cache ready for instant reuse upon navigation.

The cutting-edge evolution of prefetch is the Speculation Rules API. Declared via a JSON block inside `<script type="speculationrules">`, it allows the browser to not only prefetch resources, but fully prerender entire target HTML pages into an invisible background tab! When the user clicks the link, the prerendered page activates instantly—delivering a 0-millisecond perceived load time.

## See it

```html
<!-- Speculation Rules API: Prerender the checkout page when user hovers over link -->
<script type="speculationrules">
{
  "prerender": [
    {
      "source": "list",
      "urls": ["/checkout"],
      "eagerness": "moderate"
    }
  ],
  "prefetch": [
    {
      "source": "document",
      "where": { "and": [{ "href_matches": "/*" }] },
      "eagerness": "conservative"
    }
  ]
}
</script>
```

> **Note:** The Speculation Rules API can fully prerender future HTML pages into background tabs for instant activation.

## Go deeper

Comparing `preload`, `prefetch`, and Speculation Rules prerender:

| Feature | `<link rel="preload">` | `<link rel="prefetch">` | Speculation Rules Prerender |
|---|---|---|---|
| Target Page | **Current page** | **Future navigation** | **Future navigation** |
| Priority | High / Highest | Lowest (idle bandwidth) | Low (background processing) |
| What Is Executed | File downloaded only | File downloaded to cache | **Full HTML, CSS, & JS prerendered!** |
| Browser Support | Universal | Universal | Chromium (broadening) |

## Watch out

- Prerendering pages that execute state-mutating actions (like POST requests or analytics conversions) on load.
- Prefetching entire catalogs on mobile connections with Save-Data active, wasting user cellular data.

## Remember

- link rel=prefetch downloads assets for anticipated future navigations at lowest priority.
- The Speculation Rules API allows prefetching and prerendering entire future pages in background tabs.
- Check navigator.connection.saveData before initiating speculative prefetching on mobile.
