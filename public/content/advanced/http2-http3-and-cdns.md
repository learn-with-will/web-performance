---
id: lesson-20
slug: http2-http3-and-cdns
title: "HTTP/2, HTTP/3, and CDNs"
level: advanced
order: 20
duration: 19
tags:
  - http2
  - http3
  - quic
  - cdn
  - multiplexing
summary: "How the transport layer affects speed — HTTP/2 multiplexing over one connection, HTTP/3 over QUIC removing head-of-line blocking with faster setup, and CDNs caching content at the edge near users — plus which old HTTP/1.1 workarounds to retire."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain **HTTP/1.1**'s limits and the workarounds it forced.
- Describe **HTTP/2** multiplexing, header compression, and why sharding/concatenation matter less.
- Describe **HTTP/3** over **QUIC** and how it removes TCP head-of-line blocking.
- Explain what a **CDN** does and why edge delivery cuts latency.
- Identify old HTTP/1.1 tricks that now **hurt** on HTTP/2+.

# Why It Matters

Two of the biggest levers on latency aren't in your code at all: the **protocol** your server speaks and
**where** your content lives. Modern protocols (HTTP/2, HTTP/3) and a **CDN** cut round trips for every user,
and they change which optimizations make sense. Knowing them keeps you from applying outdated tricks that now
backfire.

# Concept Explanation

### HTTP/1.1 and its workarounds

Over HTTP/1.1 a connection handles **one request at a time**. Browsers open ~6 connections per origin to get
parallelism, but requests still queue — **head-of-line blocking** at the application layer. To cope,
developers used **domain sharding** (spread assets across hostnames for more connections), **concatenation**
(bundle many files into one), and CSS **sprites**. These were workarounds for a protocol limit.

### HTTP/2: multiplexing over one connection (RFC 9113)

**HTTP/2** sends **many streams over a single TCP connection** — **multiplexing** — so requests no longer wait
in line at the app layer. It adds a **binary framing** layer, **HPACK** header compression, and stream
**prioritization**. Consequences:

- **Domain sharding and heavy concatenation are largely unnecessary** (and sharding can *hurt* by splitting
  multiplexing across connections). Reasonable bundling still helps (per-file overhead isn't zero).
- **Server Push** existed but proved hard to use well and is **effectively removed** (Chrome dropped it) —
  prefer `preload`.

HTTP/2's remaining weakness: it still rides on **TCP**, so a single lost packet stalls **all** streams on that
connection — **TCP-level head-of-line blocking**.

### HTTP/3: QUIC removes TCP head-of-line blocking (RFCs 9114 / 9000)

**HTTP/3** runs over **QUIC**, a transport built on **UDP**. QUIC's streams are **independent**, so a lost
packet on one stream doesn't stall the others — eliminating TCP-level head-of-line blocking. QUIC also
**integrates TLS 1.3** for faster setup (often **1‑RTT**, and **0‑RTT** on resumption) and supports
**connection migration** (a connection can survive switching from Wi‑Fi to cellular).

### CDNs: bring content to the edge

A **CDN (Content Delivery Network)** is a network of **edge servers** distributed worldwide that **cache** your
content close to users. Benefits:

- **Lower latency** — content served from a nearby edge cuts round-trip time (a big part of TTFB).
- **Origin offload** — cached responses never touch your origin, reducing load.
- Edge **TLS termination**, modern-protocol support (HTTP/2/3), compression, and sometimes **edge compute**.

Static assets benefit most (cache-friendly); dynamic content can use edge caching, `stale-while-revalidate`,
or edge functions. A CDN doesn't fix a slow application — it removes distance and offloads repeatable work.

# Key Terminology

- **HTTP/1.1** — one in-flight request per connection; needs multiple connections for parallelism.
- **Multiplexing** — many concurrent streams over one connection (HTTP/2+).
- **HPACK** — HTTP/2 header compression.
- **Head-of-line blocking** — one stalled item blocking those behind it (app-layer in H1, TCP-layer in H2).
- **QUIC** — UDP-based transport under HTTP/3 with independent streams and fast setup.
- **CDN / edge** — distributed caches near users that cut latency and offload the origin.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Protocol | HTTP/1.1 | HTTP/2 / HTTP/3 | Use H2/H3 (usually a host/CDN toggle); they multiplex and cut setup — big wins for free. |
| Bundling on H2+ | Many tiny files | Reasonable bundles | Multiplexing removes the *need* for heavy concatenation, but very many tiny files still add overhead. |
| Domain sharding | Shard across hosts | Single origin | On H2+, don't shard — it splits multiplexing and adds connection setup. |
| Delivery | Origin only | Origin + CDN | Put static assets on a CDN to cut RTT globally and offload the origin. |

# Worked Example

How the same set of requests flows on each protocol:

```text
HTTP/1.1:  one request per connection at a time; browser opens ~6 connections
           [conn1: A ][ then D ]   [conn2: B ][ then E ]  ...  -> app-layer head-of-line blocking

HTTP/2:    many streams multiplexed over ONE TCP connection
           [ A B C D E F ... interleaved on one connection ]   -> but a lost TCP packet stalls all

HTTP/3:    many INDEPENDENT streams over QUIC (UDP)
           [ A B C D E F ... ]  a lost packet on one stream doesn't stall the others
```

Check what a site uses:

```bash
# The "Protocol" column in DevTools' Network panel shows h2 / h3 / http/1.1.
# From the CLI:
curl -sI --http2 https://example.com | head -1     # HTTP/2 200 ...
curl -sI --http3 https://example.com | head -1     # HTTP/3 200 ...  (if supported)
```

# Real World Analogy

Think of delivering many parcels. **HTTP/1.1** is a **single-lane road** where only one truck moves at a time —
so you build several parallel roads (domain sharding). **HTTP/2** is a **multi-lane highway on one road**: many
trucks move together (multiplexing), so you no longer need extra roads — but a single crash blocks **all**
lanes (TCP head-of-line blocking). **HTTP/3 (QUIC)** gives each lane its **own independent path**, so one crash
only affects that lane. A **CDN** is opening **local warehouses** near your customers instead of shipping every
order from a distant headquarters.

# Examples

## Example 1 — Basic: check the protocol

Opening DevTools' Network panel and enabling the **Protocol** column shows `h2` or `h3` per request. Seeing
`http/1.1` on your assets is a signal to enable a modern protocol at your host/CDN.

**Why this works:** you can't reason about multiplexing or setup cost without knowing which protocol is in use.

## Example 2 — Real-world: a CDN cuts global TTFB

A site served everything from one region; users on other continents saw high TTFB from the long round trip.
Putting static assets (and cached HTML) on a CDN dropped TTFB dramatically for distant users, because content
came from a nearby edge.

**Why this works:** the CDN removes distance — the dominant, unavoidable part of latency for far-away users.

## Example 3 — Pitfall: domain sharding on HTTP/2

A site kept its old HTTP/1.1 **domain sharding**, splitting assets across four hostnames. On HTTP/2 this
**hurt**: it fragmented multiplexing across four connections and paid four times the DNS+TCP+TLS setup.
Consolidating to one origin let a single multiplexed connection do the work.

**Why this bites:** HTTP/1.1 workarounds can actively harm HTTP/2's single-connection multiplexing.

# Common Mistakes

- **Still using HTTP/1.1** when the host/CDN can offer HTTP/2 or HTTP/3.
- **Domain sharding on HTTP/2+**, fragmenting multiplexing and multiplying setup cost.
- **Serving everything from one region** instead of a CDN, so distant users pay high latency.
- **Assuming HTTP/2 removed all head-of-line blocking** — it's still there at the **TCP** layer (HTTP/3 fixes
  it).

# Best Practices

- **Enable HTTP/2 / HTTP/3** (usually a host or CDN setting) — multiplexing and faster setup for free.
- On H2+, **drop domain sharding** and heavy concatenation; keep bundling **reasonable**.
- Serve static assets (and cache what you can) via a **CDN** to cut RTT and offload the origin.
- Prefer **`preload`** over the retired HTTP/2 Server Push.

# Summary

- **HTTP/1.1** allowed one in-flight request per connection, forcing sharding/concatenation workarounds.
- **HTTP/2** **multiplexes** many streams over one connection with **HPACK** compression — retiring most of
  those workarounds (sharding can now hurt).
- **HTTP/3** over **QUIC** removes **TCP** head-of-line blocking and speeds connection setup.
- A **CDN** caches content at the **edge** near users, cutting latency and offloading the origin.
- Modern protocol + CDN are foundational, low-effort wins — and they change which old tricks apply.

# Flash Cards

Q: What is multiplexing in HTTP/2?
A: Sending many requests/responses as concurrent streams over a single connection, so requests don't queue one-at-a-time as they did in HTTP/1.1.

Q: Why do domain sharding and heavy concatenation matter less (or even hurt) on HTTP/2?
A: HTTP/2 multiplexes many streams over one connection, so extra hostnames just fragment that multiplexing and add DNS+TCP+TLS setup; concatenation is less needed because parallel requests are cheap.

Q: What problem does HTTP/3 (QUIC) solve that HTTP/2 still has?
A: TCP-level head-of-line blocking — in HTTP/2 a single lost packet stalls all streams on the connection; QUIC's independent streams over UDP prevent one loss from stalling the others, and it sets up connections faster.

Q: What does a CDN do for performance?
A: It caches content on edge servers near users, cutting round-trip time (a big part of TTFB), offloading the origin, and often providing TLS, modern protocols, and compression at the edge.

Q: Is HTTP/2 Server Push recommended today?
A: No — it proved hard to use well and is effectively removed (Chrome dropped it); use `preload` (and Early Hints) instead.

Q: How can you tell which HTTP protocol a request used?
A: The "Protocol" column in DevTools' Network panel (h2, h3, or http/1.1), or a CLI check like `curl --http2`/`--http3`.

# Exercises

### Easy
Enable the **Protocol** column in DevTools' Network panel on a few sites. Which use `h2` or `h3`? Which still
use `http/1.1`?

### Medium
Explain, for a site you know, whether its old bundling/sharding choices still make sense on HTTP/2. Which
would you keep and which would you undo?

### Challenging
Design the delivery for a globally-used app: which protocol, what goes on a CDN vs the origin, how dynamic
content is handled at the edge, and how you'd verify TTFB improved for users far from your origin.

# Further Reading

- MDN — *Evolution of HTTP* (HTTP/1.1 → HTTP/3): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP>
- web.dev — *Content delivery networks (CDNs)*: <https://web.dev/articles/content-delivery-networks>
- IETF — *RFC 9114 (HTTP/3)* and *RFC 9000 (QUIC)*: <https://www.rfc-editor.org/rfc/rfc9114>
- Cloudflare Learning — *What is HTTP/3?*: <https://www.cloudflare.com/learning/performance/what-is-http3/>
