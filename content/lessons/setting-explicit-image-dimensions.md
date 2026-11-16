---
slug: setting-explicit-image-dimensions
title: "Setting Explicit Image Dimensions"
topic: optimizing-vitals
kind: technique
summary: "Preventing layout shifts by providing width, height, and CSS aspect-ratio to reserve placeholder space."
tags: [images, cls, aspect-ratio, dimensions]
related: [anatomy-of-a-layout-shift, reserving-space-for-dynamic-content, responsive-images-srcset-sizes]
---
> **In one line:** Always set explicit width and height attributes on images and videos so the browser reserves space before bytes arrive.

## The idea

Historically, the single most common cause of layout instability on the web was the omission of explicit dimensions on `<img>` and `<video>` elements.

When an HTML parser encounters an image tag without `width` and `height` attributes (`<img src="photo.jpg">`), it has no way of knowing the intrinsic dimensions or aspect ratio of the image. The browser collapses the element's layout height to 0 pixels. When the image file finally downloads across the network, the browser recalculates the layout, abruptly expanding the element to its natural height and violently shoving all downstream content down the page.

All modern browsers solve this automatically using the CSS `aspect-ratio` mapping. When you declare `width="800" height="400"` in HTML attributes, the browser automatically derives an intrinsic aspect ratio (`800 / 400 = 2 / 1`). Even when your CSS specifies responsive styling like `width: 100%; height: auto;`, the browser uses the derived ratio to allocate the exact required vertical height before a single byte of image data downloads.

## See it

```html
<!-- CORRECT: Explicit HTML dimensions allow browser to compute aspect-ratio and reserve space -->
<img src="/images/product.avif"
     alt="Mechanical Keyboard"
     width="800"
     height="600"
     class="responsive-img">

<style>
  /* Responsive CSS maintains the aspect ratio smoothly across all screen widths */
  .responsive-img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
```

> **Tip:** Modern browsers automatically compute CSS `aspect-ratio` from HTML `width` and `height` attributes.

## Go deeper

Comparing layout behavior with and without explicit image attributes:

| Markup Implementation | Initial Layout Height | When Image Arrives | CLS Impact |
|---|---|---|---|
| `<img src="img.jpg">` | 0 pixels | Expands abruptly; reflows entire page | **Severe layout shift (CLS fails)** |
| `<img src="img.jpg" width="800" height="400">` | Exact scaled height reserved | Decodes image into allocated box | **Zero layout shift (CLS = 0)** |
| CSS `aspect-ratio: 16 / 9;` | Exact ratio box reserved | Fills reserved container | **Zero layout shift (CLS = 0)** |

## Watch out

- Omitting width and height attributes under the mistaken belief that responsive CSS makes them redundant.
- Providing incorrect width and height aspect ratios, causing images to distort or shift when styles apply.

## Remember

- Always set width and height attributes directly on <img>, <video>, and <iframe> elements.
- Modern browsers derive CSS aspect-ratio from HTML dimension attributes to reserve layout space.
- Combining explicit attributes with width: 100%; height: auto; provides responsive, shift-free images.
