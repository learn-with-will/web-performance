---
slug: preloading-critical-assets
title: "Preloading Critical Assets"
topic: loading-strategies
kind: technique
summary: "Initiating early fetch of late-discovered critical fonts, styles, and scripts via link rel=preload."
tags: [preload, resource-hints, critical-assets, as-attribute]
related: [connection-hints-dns-and-preconnect, fetchpriority-attribute, preloading-critical-fonts]
---
> **In one line:** Use link rel=preload in HTML <head> to pull forward critical resources that the browser would discover late.

## The idea

The browser's speculative preload scanner scans HTML markup tokens to find external assets. However, many critical assets are hidden inside external files—such as web fonts declared inside CSS `@font-face` rules or hero images set via CSS `background-image`. The browser cannot discover these assets until it parses the CSS and computes layout.

`<link rel="preload">` solves this late-discovery problem. Declared in the HTML `<head>`, it instructs the browser's networking engine: "Fetch this resource immediately at high priority for the current page; I promise it will be used soon."

Preload requires two essential attributes:
- `rel="preload"`: Designates the preloading intent.
- `as="<type>"`: Informs the browser what type of content is being fetched (`font`, `style`, `script`, `image`). The `as` attribute is mandatory: without it, the browser cannot assign the correct Content-Security-Policy rules, matching request headers, or internal scheduler priority. If an asset is preloaded but unused within 3 seconds, Chrome prints a console warning.

## See it

```html
<!-- Preloading critical WOFF2 font with mandatory crossorigin -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preloading the hero image for Largest Contentful Paint -->
<link rel="preload" href="/images/hero.avif" as="image" fetchpriority="high">

<!-- Preloading critical stylesheet chunk -->
<link rel="preload" href="/css/critical.css" as="style">
```

> **Note:** The `as` attribute is strictly required on `<link rel="preload">` to assign correct priority and security headers.

## Go deeper
`<link rel="preload">` initiates high-priority background downloading of late-discovered critical resources for the current page. The mandatory `as` attribute informs the browser of the resource type, ensuring correct prioritization, request headers, and Content Security Policy enforcement.


Supported `as` attribute values and their corresponding browser priority:

| `as` Value | Target Resource | Initial Chrome Priority | Special Requirements |
|---|---|---|---|
| `"style"` | External CSS stylesheet | Highest | Blocks render when applied |
| `"font"` | WOFF2 font binary | High | **Requires `crossorigin` attribute** |
| `"script"` | JavaScript bundle | High | Must match script execution mode |
| `"image"` | Hero photo or illustration | Medium / High (with fetchpriority) | Use `imagesrcset` for responsive images |


Preloading web fonts requires adding the crossorigin attribute even when fonts reside on the same origin, because font requests follow anonymous CORS specification rules. Omitting crossorigin causes the browser to fetch the font twice, wasting valuable mobile bandwidth.


Modern bundlers automatically generate preload tags for entry chunks, ensuring that primary scripts begin downloading simultaneously alongside the initial HTML stylesheet references.

## Watch out

- Preloading resources that are not actually used on the current page; wastes bandwidth and prints console warnings.
- Preloading too many resources, which starves the critical CSS stylesheet of network bandwidth.

## Remember

- link rel=preload initiates early fetch of late-discovered critical resources for the current page.
- The as attribute is strictly mandatory to establish browser priority and request headers.
- Fonts preloaded via link rel=preload require the crossorigin attribute to avoid duplicate downloads.
