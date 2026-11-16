---
slug: reserving-space-for-dynamic-content
title: "Reserving Space for Dynamic Content"
topic: optimizing-vitals
kind: technique
summary: "Preventing layout shifts from ads, embeds, banners, and dynamically injected client-side widgets."
tags: [cls, ads, placeholders, dynamic-content]
related: [anatomy-of-a-layout-shift, setting-explicit-image-dimensions, preventing-font-layout-shifts]
---
> **In one line:** Reserve layout space with CSS min-height or placeholders for dynamic ads, embeds, and client widgets.

## The idea

Beyond images, dynamic third-party content—such as programmatic advertisements, social media embeds, cookie consent banners, and client-rendered recommendation widgets—is a leading contributor to Cumulative Layout Shift.

Advertisements are particularly notorious for causing layout shifts because their dimensions are rarely known upfront. Ad networks frequently return creatives of varying sizes (e.g., 300x250, 300x600, or empty passes) based on real-time bidding auctions. If the container element starts with a height of 0px, loading the winning ad pushes the page downward.

To prevent dynamic content from causing layout shifts:
1. Reserve space statically: Allocate a fixed container with `min-height` representing the largest or most common ad slot size.
2. Avoid injecting content above existing content: Always append new notifications or infinite-scroll items below or inside dedicated fixed overlays, rather than pushing existing content downward.
3. Reserve space for cookie banners: Use fixed or sticky positioning (`position: fixed`) so banners overlay content without altering the flow of the document layout.

## See it

```html
<!-- CSS Container pre-allocating vertical space for dynamic ad slot -->
<style>
  .ad-slot-container {
    min-height: 250px;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
  }
</style>

<div class="ad-slot-container" id="ad-banner-top">
  <!-- Dynamic ad script mounts inside pre-reserved slot without shifting layout -->
</div>
```

> **Tip:** Use `min-height` on dynamic ad wrappers to reserve space before third-party ad tags load.

## Go deeper

Strategies for taming dynamic content insertion without inducing layout shifts:

| Dynamic Content Type | Shift Risk | Recommended Remediation Strategy |
|---|---|---|
| Programmatic Ads | High (variable creative sizes) | Pre-allocate slot container with `min-height` |
| Cookie Consent Banners | High if pushing document | Use `position: fixed` overlay at bottom of screen |
| Infinite Scroll Feeds | High if prepending to top | Only append items to bottom; use scroll anchoring |
| Embedded Tweets/Videos | High (async script mount) | Pre-allocate container styled with CSS `aspect-ratio` |

## Watch out

- Collapsing the reserved ad slot to 0px when an ad auction returns no inventory, causing reverse layout shift.
- Injecting breaking news banners or promo bars dynamically above the main navigation without user action.

## Remember

- Dynamic ads, embeds, and banners cause major layout shifts if inserted into zero-height containers.
- Pre-allocate layout space using CSS min-height and aspect-ratio placeholders.
- Use position: fixed for notification bars and cookie prompts to keep document layout stable.
