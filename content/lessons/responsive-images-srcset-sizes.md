---
slug: responsive-images-srcset-sizes
title: "Responsive Images with srcset and sizes"
topic: media-and-fonts
kind: technique
summary: "Delivering properly sized images for every device viewport using srcset, width descriptors, and sizes."
tags: [responsive-images, srcset, sizes, viewport]
related: [modern-image-formats, the-picture-element-art-direction, setting-explicit-image-dimensions]
---
> **In one line:** Use srcset with width descriptors and sizes so the browser downloads the exact image resolution needed.

## The idea

Serving a single giant 2400-pixel desktop image to a smartphone with a 390-pixel viewport wastes cellular bandwidth, increases memory usage, and slows down image decoding. Responsive images solve this by allowing you to offer multiple resolutions of the same image so the browser can select the best fit.

The modern standard relies on two attributes on the `<img>` element:
1. `srcset`: Lists a comma-separated set of image file URLs paired with their intrinsic pixel widths using width descriptors (e.g. `400w`, `800w`, `1200w`).
2. `sizes`: Informs the browser's speculative preload scanner how wide the image will render on screen across different media conditions before any external CSS stylesheets are downloaded.

Because the browser knows the user's screen width, device pixel ratio (DPR, such as 2x or 3x retina displays), and current network speed, it automatically calculates the ideal image candidate. A 400px mobile screen downloads a lightweight 400w or 800w asset, while a 4K desktop display downloads the 2400w asset.

## See it

```html
<!-- Responsive image with srcset width descriptors and matching sizes media conditions -->
<img src="/images/product-800.webp"
     srcset="/images/product-400.webp 400w,
             /images/product-800.webp 800w,
             /images/product-1200.webp 1200w,
             /images/product-1600.webp 1600w"
     sizes="(max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            800px"
     alt="Wireless headphones"
     width="800" height="600"
     loading="lazy">
```

> **Note:** The `sizes` attribute informs the browser of the image's display width before CSS is downloaded and parsed.

## Go deeper

How the browser chooses an image from `srcset` and `sizes`:

| User Device Context | `sizes` Evaluation | Target Effective Pixels | Selected `srcset` Candidate |
|---|---|---|---|
| Phone (390px, 1x display) | 100vw = 390px | 390 px | `product-400.webp (400w)` |
| Phone (390px, 2x retina) | 100vw = 390px | 390 × 2 = 780 px | `product-800.webp (800w)` |
| Tablet (768px, 2x display) | 50vw = 384px | 384 × 2 = 768 px | `product-800.webp (800w)` |
| Desktop (1440px, 2x display) | 800px | 800 × 2 = 1600 px | `product-1600.webp (1600w)` |

## Watch out

- Using pixel density descriptors (1x, 2x) instead of width descriptors (w) for fluid responsive layouts.
- Omitting sizes when using srcset with w descriptors, causing browsers to assume sizes="100vw" on all screens.

## Remember

- srcset provides a list of image files paired with intrinsic width descriptors (w).
- sizes defines the rendered display width of the image across CSS media query breakpoints.
- The browser automatically selects the optimal file based on screen width and device pixel ratio.
