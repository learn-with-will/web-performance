---
id: lesson-15
slug: compression-and-minification
title: "Compression and Minification"
level: intermediate
order: 15
duration: 17
tags:
  - compression
  - brotli
  - gzip
  - minification
  - text-assets
summary: "Two different ways to shrink text assets — build-time minification that strips source cruft, and transfer-time compression (gzip, Brotli, zstd) negotiated via Accept-Encoding — plus which files to compress and which already-compressed ones to leave alone."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Distinguish **minification** (build-time) from **compression** (transfer-time).
- Name the common compression algorithms — **gzip**, **Brotli**, **zstd** — and how they're negotiated.
- Explain **`Accept-Encoding`** / **`Content-Encoding`** negotiation.
- Know **what to compress** (text) and what **not** to (already-compressed binaries).
- Apply **both** minification and compression to text assets.

# Why It Matters

Text assets — HTML, CSS, JavaScript, SVG, JSON — are highly compressible, often shrinking by **70% or more**.
Two independent techniques get you there: **minification** removes cruft from the source, and **compression**
squeezes the bytes on the way over the wire. Enabling Brotli is usually a one-time server setting that makes
every text response smaller for every visitor — a rare "set it once, benefit forever" win.

# Concept Explanation

### Minification: shrink the source at build time

**Minification** happens when you build: it removes whitespace, comments, and (for JavaScript) shortens local
variable names, without changing behavior. Tools like Terser (JS), cssnano/Lightning CSS (CSS), and HTML
minifiers do this. It reduces the *source* size before it's ever sent.

```text
Before (readable source):        After (minified):
function addToCart(item) {        function a(t){cart.push(t);render()}
  cart.push(item);
  render();
}
```

### Compression: shrink the bytes in transit

**Compression** happens when the server sends the response: it compresses the body, and the browser
decompresses it. It's **negotiated**:

```text
Request:   Accept-Encoding: gzip, br, zstd        (browser: "I understand these")
Response:  Content-Encoding: br                     (server: "I used Brotli")
```

The common algorithms:

- **gzip** — universally supported; a solid baseline.
- **Brotli (`br`)** — usually compresses **text smaller than gzip**; broadly supported; especially good when
  files are **precompressed** at a high level.
- **zstd** — newer, fast, with **emerging** support (as of writing).

Minification and compression are **complementary**: minify first (smaller source), then compress (smaller
transfer). Neither is encryption — compression just makes the same content smaller.

### Static vs dynamic compression

- **Static precompression** — compress unchanging files (your built JS/CSS) **once at build time** at the
  highest level and serve the `.br`/`.gz` version. Best ratio, no per-request CPU.
- **Dynamic compression** — compress generated responses (HTML from a server) **on the fly** at a moderate
  level to balance ratio against CPU.

### Compress text, not already-compressed binaries

Compress **text**: HTML, CSS, JS, SVG, JSON, plain-text. **Do not** re-compress formats that are **already
compressed** — JPEG, PNG, WebP, AVIF, MP4, and **WOFF2** fonts. Compressing them wastes CPU and can even make
them slightly *larger*. (This is why you never gzip your images.)

# Key Terminology

- **Minification** — build-time removal of whitespace/comments (and JS name shortening).
- **Compression** — transfer-time byte reduction (gzip/Brotli/zstd), reversed by the browser.
- **gzip / Brotli / zstd** — compression algorithms; Brotli usually beats gzip on text.
- **`Accept-Encoding`** — request header listing algorithms the browser supports.
- **`Content-Encoding`** — response header naming the algorithm the server used.
- **Static precompression** — compressing files once at build time at maximum level.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Algorithm | gzip | Brotli (`br`) | Prefer Brotli for text (smaller); keep gzip as a fallback for old clients. |
| When to compress | Dynamic (per request) | Static (precompress at build) | Precompress static files at max level; use dynamic for generated responses. |
| What to compress | Everything | Text only | Compress text; skip JPEG/PNG/WebP/AVIF/MP4/WOFF2 — they're already compressed. |
| Minify + compress | Only one | **Both** | Do both — they attack different redundancy and stack. |

# Worked Example

Checking what encoding a server used, and the savings:

```bash
# Ask for Brotli and show the response headers:
curl -s -I -H "Accept-Encoding: br" https://example.com/assets/app.js | grep -i "content-encoding\|content-length"
```

```text
Content-Encoding: br
Content-Length: 41230        <- ~41 KB transferred (compressed)

# The same file uncompressed on disk might be ~150 KB. In DevTools this shows as:
#   Transferred: 41 KB   Size: 150 KB
# Minification shrank the 200 KB original source to 150 KB; Brotli then sent 41 KB.
```

So a 200 KB source became a ~41 KB transfer: **minify** (200 → 150 KB) then **compress** (150 → 41 KB). Each
step attacks different redundancy.

# Real World Analogy

Shipping a text asset is like **mailing a product**. **Minification** is removing the pointless packaging air
and filler from inside the box so the product itself is smaller. **Compression** is then **vacuum-sealing**
the box for transit — the recipient (the browser) un-seals it on arrival to get the original back. You do
both. And you wouldn't vacuum-seal something already sealed at the factory (a JPEG) — it just wastes effort
for no gain.

# Examples

## Example 1 — Basic: confirm compression is on

Running the `curl` check above (or reading DevTools' Transferred vs Size) tells you whether text responses are
compressed and with which algorithm. A large gap between Transferred and Size means compression is working.

**Why this works:** `Content-Encoding` and the size gap directly show whether (and how) a response was
compressed.

## Example 2 — Real-world: enable Brotli static precompression

A site served gzip only. Adding **Brotli static precompression** for built JS/CSS (precompressing at max level
at build time, serving `.br` when the browser accepts it) cut those transfers noticeably below the gzip
versions — with no runtime CPU cost, since the files were compressed once at build.

**Why this works:** Brotli beats gzip on text, and precompressing avoids per-request CPU while getting the
best ratio.

## Example 3 — Pitfall: compressing images

A config compressed *all* responses, including JPEGs and WebP. Those formats are already compressed, so the
server burned CPU for essentially no size reduction (and occasionally made files larger). Excluding binary
types fixed it.

**Why this bites:** re-compressing already-compressed binaries wastes CPU and yields nothing — compress text
only.

# Common Mistakes

- **Compressing but not minifying** (or vice versa) — they stack; do both.
- **Re-compressing images/fonts/video** that are already compressed.
- **Serving only gzip** when Brotli would shrink text further.
- **Confusing compression with minification or encryption** — they're three different things.

# Best Practices

- **Minify** HTML/CSS/JS at build time, then enable **compression** on the server.
- Prefer **Brotli** for text with **gzip** as a fallback; consider **zstd** as support grows.
- **Precompress static files** at the highest level; compress dynamic responses at a moderate level.
- **Compress text only** — exclude JPEG/PNG/WebP/AVIF/MP4/WOFF2.

# Summary

- **Minification** (build time) and **compression** (transfer time) are **different** and **stack**.
- Compression is negotiated via **`Accept-Encoding`** → **`Content-Encoding`**; **Brotli** usually beats
  **gzip** on text, with **zstd** emerging.
- **Precompress** static files at max level; compress dynamic responses on the fly.
- **Compress text only** — never re-compress already-compressed binaries.
- Do **both** minify and compress for the smallest transfers.

# Flash Cards

Q: What's the difference between minification and compression?
A: Minification removes whitespace/comments (and shortens JS names) from the source at build time; compression (gzip/Brotli/zstd) shrinks the bytes in transit and is reversed by the browser. They're independent and stack.

Q: How is compression negotiated between browser and server?
A: The browser sends `Accept-Encoding` listing algorithms it supports; the server compresses and replies with `Content-Encoding` naming the one it used.

Q: Which compression algorithm usually produces smaller text than gzip, and what's newer still?
A: Brotli (`br`) usually beats gzip on text; zstd is a newer algorithm with emerging support.

Q: Which files should you NOT compress, and why?
A: Already-compressed binaries — JPEG, PNG, WebP, AVIF, MP4, WOFF2 — because compressing them again wastes CPU and can even make them slightly larger.

Q: What's the difference between static and dynamic compression?
A: Static precompression compresses unchanging files once at build time at the highest level (best ratio, no per-request CPU); dynamic compression compresses generated responses on the fly at a moderate level.

Q: Should you minify or compress — and does the order matter?
A: Do both: minify first (smaller source), then compress (smaller transfer). They attack different redundancy, so applying both gives the smallest result.

# Exercises

### Easy
Use `curl -I -H "Accept-Encoding: br"` (or DevTools) on a CSS/JS file from a large site. What
`Content-Encoding` comes back? Compare Transferred vs Size in the Network panel.

### Medium
Take an unminified CSS or JS file, minify it with a tool, and note the size drop. Then compare the minified
size with its Brotli-compressed size. How much did each step contribute?

### Challenging
Design the compression setup for a site: which algorithms, static vs dynamic per asset type, and an explicit
list of MIME types to compress and to skip. Explain why images and WOFF2 are on the skip list.

# Further Reading

- MDN — *`Content-Encoding`*: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding>
- MDN — *`Accept-Encoding`*: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Encoding>
- web.dev — *Reduce network payloads using text compression*: <https://web.dev/articles/reduce-network-payloads-using-text-compression>
- web.dev — *Minify and compress network payloads*: <https://web.dev/articles/reduce-network-payloads-using-text-compression>
