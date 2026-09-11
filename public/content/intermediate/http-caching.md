---
id: lesson-14
slug: http-caching
title: "HTTP Caching"
level: intermediate
order: 14
duration: 19
tags:
  - caching
  - cache-control
  - etag
  - immutable
  - cache-busting
summary: "Making repeat visits nearly free with HTTP caching — the Cache-Control directives (max-age, no-cache, no-store, immutable), ETag/Last-Modified revalidation and 304 responses, and the fingerprint-plus-immutable pattern for static assets with no-cache HTML."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain how the **browser cache** removes network work on repeat visits.
- Read and set the key **`Cache-Control`** directives.
- Explain **revalidation** with `ETag`/`Last-Modified` and the **`304 Not Modified`** response.
- Apply the **fingerprint + `immutable`** pattern for static assets and **`no-cache`** for HTML.
- Avoid the classic caching mistakes (caching HTML forever, or not caching at all).

# Why It Matters

The fastest request is the one you never make. **HTTP caching** lets the browser (and CDNs) reuse a stored
response instead of downloading it again — turning slow repeat visits into near-instant ones and cutting
server load. It's one of the highest-impact optimizations, and it's mostly about setting the right response
**headers**.

# Concept Explanation

### What caching does

When the server sends a response, it can tell the browser "you may reuse this for a while." On the next
request the browser serves the **stored copy** with no network round trip. Caching is controlled by
response **headers**, principally **`Cache-Control`** (defined in RFC 9111; the old `Expires` header is
legacy).

### The `Cache-Control` directives you need

- **`max-age=<seconds>`** — the response is **fresh** for this many seconds; reuse it with no network.
- **`no-cache`** — you may **store** it, but you **must revalidate** with the server before reusing it
  (a conditional request). *Not* "don't cache."
- **`no-store`** — never store it at all (for sensitive/personalized responses).
- **`public` / `private`** — `public` may be cached by shared caches (CDNs, proxies); `private` only by the
  user's browser.
- **`immutable`** — the content will never change at this URL, so **don't revalidate even on reload**.
- **`s-maxage=<seconds>`** — like `max-age` but for **shared** caches specifically.
- **`stale-while-revalidate=<seconds>`** — serve the stale copy immediately while revalidating in the
  background.

### Revalidation and `304 Not Modified`

When a cached response goes stale (or is `no-cache`), the browser doesn't blindly re-download. It sends a
**conditional request** using a validator the server gave it:

- **`ETag`** (a content fingerprint) → the browser sends `If-None-Match`.
- **`Last-Modified`** (a date) → the browser sends `If-Modified-Since`.

If nothing changed, the server replies **`304 Not Modified`** with **no body** — the browser reuses its copy.
That saves the download but still costs a round trip, so it's slower than a fresh `max-age` hit.

### The canonical strategy: fingerprint + immutable, no-cache HTML

The best pattern separates **versioned assets** from **HTML**:

- **Static assets with a content hash in the filename** (`app.9f2a1c.js`, `styles.4b8e.css`) →
  `Cache-Control: public, max-age=31536000, immutable` (one year). Because the filename changes when the
  content changes, a new deploy is a **new URL** — safe to cache forever. This is **cache busting** via
  fingerprinting, and it's why bundlers hash filenames.
- **HTML** → `Cache-Control: no-cache` (or a short `max-age`), so the browser **revalidates** and always
  picks up the latest HTML, which then references the new hashed asset URLs.

That combination gives you instant repeat visits **and** immediate deploys.

# Key Terminology

- **`Cache-Control`** — the primary header controlling caching (RFC 9111).
- **`max-age`** — seconds a response stays fresh (reusable without the network).
- **`no-cache` / `no-store`** — must revalidate before reuse / never store.
- **`immutable`** — never revalidate; the content at this URL won't change.
- **`ETag` / `Last-Modified`** — validators used to revalidate a stale response.
- **`304 Not Modified`** — "your copy is still good"; reused without re-downloading the body.
- **Fingerprinting / cache-busting** — hashing the filename so new content gets a new URL.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| HTML caching | Long `max-age` | `no-cache` (revalidate) | Use `no-cache` (or short max-age) so deploys are seen; never cache HTML for a year. |
| Fingerprinted asset | Short `max-age` | `max-age=31536000, immutable` | Hashed URLs can be cached forever — the URL changes when content does. |
| Shared caches | `private` | `public` (+ CDN) | `public` lets CDNs/proxies cache and offload your origin; `private` for per-user responses. |
| Freshness check | Re-download always | `ETag`/`304` revalidation | Revalidation saves the body transfer for unchanged files; a fresh `max-age` avoids the round trip entirely. |

# Worked Example

Headers for a hashed asset vs the HTML that references it:

```text
# A fingerprinted bundle — safe to cache for a year, never revalidated:
GET /assets/app.9f2a1c.js
  200 OK
  Cache-Control: public, max-age=31536000, immutable
  ETag: "9f2a1c"

# The HTML — always revalidated so new deploys (with new asset URLs) are picked up:
GET /
  200 OK
  Cache-Control: no-cache
  ETag: "html-v52"
```

A repeat visit and a revalidation of the HTML:

```text
# Browser revalidates the no-cache HTML using its stored ETag:
GET / 
  If-None-Match: "html-v52"
-> 304 Not Modified            (no body re-sent; browser reuses its copy)

# The hashed JS isn't even requested — it's still fresh & immutable in the cache.
```

The result: near-instant repeat loads, but the moment you deploy, the HTML revalidates, sees new content, and
points at freshly hashed asset URLs.

# Real World Analogy

Caching is like keeping a **copy of a reference book at your desk** instead of walking to the library for
every lookup. `max-age` is "trust this copy for a month." An **`ETag`** is the **edition number** stamped
inside: when you're unsure, you phone the librarian and read them the edition (`If-None-Match`); if it's still
current they just say **"that's the latest"** (`304`) and you save the trip to fetch a new book.
**`immutable`** is a book you *know* never gets revised — you never even phone to check.

# Examples

## Example 1 — Basic: inspect caching headers

```bash
# Show the response headers, including Cache-Control and ETag:
curl -I https://example.com/assets/app.js
```

**Why this works:** the `Cache-Control` and `ETag`/`Last-Modified` headers tell you exactly how (and whether)
the browser and CDNs will cache the file.

## Example 2 — Real-world: fingerprint + immutable + no-cache HTML

A build hashes asset filenames and serves them `immutable` for a year, while HTML is `no-cache`. Repeat
visitors download **zero** JS/CSS/images (all cached), the HTML revalidates with a cheap `304`, and a deploy
is visible immediately because the HTML now references new hashed URLs.

**Why this works:** versioned URLs make "cache forever" safe, and revalidated HTML keeps deploys instant.

## Example 3 — Pitfall: caching HTML for a year

A team sets `max-age=31536000` on **HTML**. Repeat visitors are stuck on an old page for up to a year and
never see deploys — and there's no easy way to bust it, because the HTML URL didn't change.

**Why this bites:** only **fingerprinted** URLs are safe to cache long-term; HTML must revalidate.

# Common Mistakes

- **Caching HTML long-term**, so users never see updates.
- **Confusing `no-cache` with `no-store`** — `no-cache` still stores, it just revalidates first.
- **Not caching static assets at all**, forcing re-downloads every visit.
- **Long `max-age` without fingerprinted filenames**, leaving no way to bust the cache on change.

# Best Practices

- **Fingerprint** static asset filenames and serve them `public, max-age=31536000, immutable`.
- Serve **HTML** with `no-cache` (or a short `max-age`) so deploys are picked up.
- Use `public` + a **CDN** for shared assets; `private`/`no-store` for personalized/sensitive responses.
- Rely on **`ETag`/`304`** revalidation for things that occasionally change.

# Summary

- **HTTP caching** reuses stored responses, making repeat visits nearly free.
- **`Cache-Control`** rules it: `max-age` (fresh), `no-cache` (revalidate), `no-store` (never), `immutable`
  (never revalidate), `public/private`.
- Stale responses **revalidate** with `ETag`/`Last-Modified`, yielding a body-less **`304`** when unchanged.
- The canonical pattern: **fingerprinted assets `immutable` for a year + `no-cache` HTML**.
- Never cache **HTML** long-term; only cache **fingerprinted** URLs forever.

# Flash Cards

Q: What's the difference between `no-cache` and `no-store`?
A: `no-cache` still stores the response but must revalidate with the server before reusing it; `no-store` means never store it at all (for sensitive/personalized data).

Q: What is the recommended caching for a fingerprinted static asset like app.9f2a1c.js?
A: `Cache-Control: public, max-age=31536000, immutable` — cache for a year and never revalidate, because a content change produces a new filename (URL).

Q: How should HTML be cached, and why?
A: With `no-cache` (or a short max-age) so the browser revalidates and always gets the latest HTML — which then references the newest hashed asset URLs, making deploys visible.

Q: What is a `304 Not Modified` response and what does it save?
A: It's the server's reply to a conditional request saying the cached copy is still valid; it sends no body, saving the download — though it still costs a round trip.

Q: What does the `immutable` directive tell the browser?
A: That the content at this URL will never change, so it shouldn't revalidate the resource even when the user reloads the page.

Q: What is cache-busting via fingerprinting?
A: Putting a content hash in the filename (e.g. styles.4b8e.css) so that when the content changes the URL changes, letting you cache the old URL forever while new content is fetched from the new URL.

# Exercises

### Easy
Run `curl -I` (or use DevTools) on a static asset from a big site. Read its `Cache-Control`. Is it
fingerprinted and `immutable`? How long is `max-age`?

### Medium
For a small project, write the caching headers you'd set for (a) hashed JS/CSS, (b) HTML, and (c) an API
response with per-user data. Justify each choice.

### Challenging
Explain, step by step, what a repeat visitor's browser does after you deploy a new version: which requests
are served from cache, which revalidate (304), and which download fresh — assuming fingerprinted assets +
`no-cache` HTML.

# Further Reading

- MDN — *HTTP caching*: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching>
- MDN — *`Cache-Control`*: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control>
- web.dev — *Prevent unnecessary network requests with the HTTP Cache*: <https://web.dev/articles/http-cache>
- IETF — *RFC 9111: HTTP Caching*: <https://www.rfc-editor.org/rfc/rfc9111>
