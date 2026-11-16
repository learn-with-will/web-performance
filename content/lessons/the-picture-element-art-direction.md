---
slug: the-picture-element-art-direction
title: "The Picture Element and Art Direction"
topic: media-and-fonts
kind: technique
summary: "Using the HTML picture element for format negotiation and responsive art direction across viewports."
tags: [picture-element, art-direction, responsive-images, formats]
related: [modern-image-formats, responsive-images-srcset-sizes, image-decoding-and-compression]
---
> **In one line:** Use the <picture> element for format negotiation (AVIF -> WebP -> JPEG) and art direction cropping.

## The idea

While `srcset` on a standard `<img>` element is ideal for serving different resolutions of the same visual crop, the HTML `<picture>` element solves two distinct architectural requirements: format negotiation and art direction.

1. Format Negotiation: Older browsers do not support next-gen formats like AVIF. By nesting `<source type="image/avif">` and `<source type="image/webp">` above a standard `<img>` fallback, modern browsers download the most efficient format they support, while legacy clients cleanly fall back to JPEG or PNG.
2. Art Direction: On wide desktop screens, a landscape panorama showing an entire mountain range looks stunning. On a narrow mobile screen, however, shrinking that panorama makes the subject tiny and illegible. Art direction allows you to serve a tight, square crop focusing on the hiker on mobile, while serving the wide panorama on desktop using `<source media="(min-width: 768px)">`.

The nested `<img>` tag inside `<picture>` is not optional; it is the element that actually renders on screen and receives attributes like `alt`, `width`, and `height`.

## See it

```html
<!-- Art Direction + Format Negotiation combined in a single picture element -->
<picture>
  <!-- Desktop wide landscape: AVIF then WebP -->
  <source media="(min-width: 1024px)" srcset="/images/hero-wide.avif" type="image/avif">
  <source media="(min-width: 1024px)" srcset="/images/hero-wide.webp" type="image/webp">

  <!-- Mobile square crop: AVIF then WebP -->
  <source srcset="/images/hero-mobile.avif" type="image/avif">
  <source srcset="/images/hero-mobile.webp" type="image/webp">

  <!-- Universal fallback <img> tag with explicit dimensions -->
  <img src="/images/hero-mobile.jpg" alt="Founder portrait" width="600" height="600" decoding="async">
</picture>
```

> **Tip:** The browser reads `<source>` tags from top to bottom and selects the very first match that evaluates to true.

## Go deeper
The HTML `<picture>` element enables format negotiation by pairing next-gen AVIF and WebP `<source>` tags with backward-compatible JPEG fallbacks. Additionally, `<picture>` allows responsive art direction, serving different crop ratios across mobile and desktop breakpoints to preserve visual focus and composition.


Deciding between `<picture>` and `<img>` with `srcset`:

| Use Case | Recommended Element | Rationale |
|---|---|---|
| Same image, different resolutions | `<img srcset="..." sizes="...">` | Browser decides best file using viewport & DPR |
| Format negotiation (AVIF / WebP / JPEG) | `<picture><source type="...">` | Hard MIME type fallback handling |
| Art direction (different crop ratios) | `<picture><source media="...">` | Author dictates layout changes at breakpoints |
| High-DPR icon alternatives | `<img srcset="icon.png 1x, icon@2x.png 2x">` | Simple pixel density switching |

## Watch out

- Putting width, height, or alt attributes on <source> tags; they must be declared on the inner <img> tag.
- Arranging <source> media queries out of order; always order media conditions from most specific to least.

## Remember

- The <picture> element handles MIME format negotiation and responsive art direction crops.
- Browsers evaluate <source> tags in top-down order, picking the first supported format or media match.
- The inner <img> tag is required and dictates rendering, accessibility alt text, and dimensions.
