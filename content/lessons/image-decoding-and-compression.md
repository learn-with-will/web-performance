---
slug: image-decoding-and-compression
title: "Image Decoding and Compression"
topic: media-and-fonts
kind: technique
summary: "Asynchronous image decoding via decoding=async and practical production compression workflows."
tags: [decoding, compression, sharp, squoosh]
related: [modern-image-formats, native-lazy-loading, responsive-images-srcset-sizes]
---
> **In one line:** Use decoding=async to prevent image decompression from blocking the main thread, and automate image compression.

## The idea

Downloading an image is only half the battle. Once binary image bytes arrive over the wire, the browser must decompress and decode the compressed pixels (e.g. AVIF or JPEG) into an uncompressed RGBA bitmap in memory before painting.

For large images, decoding can consume 50 to 150 milliseconds of CPU time. By default, image decoding can occur synchronously during the main thread's render step, causing dropped frames (jank) and delaying user input.

Adding the `decoding="async"` attribute to the `<img>` element informs the browser engine that it is permitted to decode the image asynchronously off the main thread on a background thread pool. The main thread continues running script and handling user interactions smoothly, presenting the image as soon as decoding concludes.

Furthermore, production compression pipelines should automate lossless and lossy optimizations using tools like Squoosh CLI or Sharp in Node.js. Setting AVIF quality to 60–75 or WebP quality to 75–85 achieves massive byte reductions with zero perceptible difference to human eyes.

## See it

```javascript
// Automating modern AVIF/WebP image generation in Node.js with Sharp
import sharp from 'sharp';

async function processImage(inputPath) {
  // Generate responsive AVIF at optimal quality
  await sharp(inputPath)
    .resize(1200, null, { withoutEnlargement: true })
    .avif({ quality: 65, effort: 6 })
    .toFile('./dist/images/hero-1200.avif');

  // Generate responsive WebP fallback
  await sharp(inputPath)
    .resize(1200, null, { withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile('./dist/images/hero-1200.webp');
}
```

```html
<!-- Specifying asynchronous decoding to keep the main thread unblocked -->
<img src="/dist/images/hero-1200.avif" alt="Showcase" width="1200" height="600" decoding="async">
```

> **Tip:** Add `decoding="async"` to all images to move decompression off the main thread and maintain smooth framerates.

## Go deeper

Comparing image decoding modes in the HTML specification:

| `decoding` Attribute | Browser Behavior | Main Thread Impact | Ideal Use Case |
|---|---|---|---|
| `async` | Decodes off the main thread in background | **Zero main-thread jank** | **Default for virtually all images** |
| `sync` | Decodes synchronously with other content | Can cause dropped frames | Rarely needed; atomic UI sync |
| `auto` (default) | Browser heuristic chooses strategy | Variable | Default browser behavior |

## Watch out

- Using compression quality settings above 90, which doubles file size with no discernible visual gain.
- Manually compressing images once instead of integrating automated optimization into build pipelines.

## Remember

- Image decoding decompresses encoded bytes into raw pixel bitmaps and can block the main thread.
- Add decoding=async to offload decompression to background threads, eliminating frame jank.
- Automate image resizing and compression in build scripts using tools like Sharp or Squoosh.
