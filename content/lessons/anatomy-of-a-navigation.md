---
slug: anatomy-of-a-navigation
title: "Anatomy of a Navigation"
topic: network-and-browsers
kind: concept
summary: "The step-by-step path from URL input through redirect, DNS, TCP, TLS, and HTTP request."
tags: [navigation, networking, http, latency]
related: [dns-resolution, tcp-and-tls-handshakes, ttfb-and-first-byte]
---
> **In one line:** Every browser navigation requires a sequence of network steps: redirect checks, cache lookup, DNS, TCP connection, TLS setup, and HTTP transfer.

## The idea

When a user types a URL into the browser address bar or clicks a hyperlink, the browser initiates a complex, multi-stage networking journey before receiving even a single byte of HTML content.

The browser first checks its local caches and evaluates whether any service workers intercept the request. If the navigation requires network transport, the browser verifies whether any HTTP-to-HTTPS redirects exist. Next, the human-readable hostname must be translated into a machine-routable IP address via Domain Name System (DNS) resolution.

Once an IP address is established, the browser initiates a Transmission Control Protocol (TCP) three-way handshake to open a reliable communication socket. If the connection is encrypted—as all modern web applications should be—a Transport Layer Security (TLS) cryptographic handshake follows immediately to authenticate the server and negotiate session encryption keys. Only after these handshakes conclude can the browser dispatch the HTTP GET request and await the server's initial response.

## See it

```text
// Navigation timing sequence from URL dispatch to document load
[Prompt / URL] -> [Cache & SW Check]
               -> [DNS Resolution]       (1 RTT)
               -> [TCP Handshake]        (1 RTT)
               -> [TLS 1.3 Setup]        (1 RTT)
               -> [HTTP Request / TTFB]  (1 RTT + Server time)
               -> [HTML Content Download]
```

> **Note:** Every network phase adds round-trip times (RTT) across physical distances, making connection reuse and latency reduction critical.

## Go deeper
Optimizing navigation latency requires minimizing sequential network round trips before the HTML document stream begins. Using HTTP Strict Transport Security (HSTS) preload headers eliminates HTTP-to-HTTPS redirect round trips, while persistent HTTP Keep-Alive connections reuse existing encrypted sockets, allowing subsequent navigations to proceed without repeating expensive TCP and TLS handshakes.


The Navigation Timing Level 2 API exposes exact timestamps for each distinct connection phase:

| Performance Timing Property | Meaning in the Navigation Flow |
|---|---|
| `redirectStart` / `redirectEnd` | Duration spent resolving HTTP 301/302 redirects |
| `domainLookupStart` / `domainLookupEnd` | Time spent performing DNS name resolution |
| `connectStart` / `connectEnd` | TCP handshake duration (includes TLS setup) |
| `secureConnectionStart` | Point where TLS handshake begins |
| `requestStart` / `responseStart` | Duration from sending HTTP request to receiving first byte (TTFB) |

## Watch out

- Chaining multiple HTTP redirects (e.g., http -> https -> www), which adds full RTTs before DNS or TCP completes.
- Failing to account for geographic latency: light in fiber travels at roughly 200 km per millisecond.

## Remember

- A navigation must traverse redirects, DNS lookup, TCP connect, and TLS negotiation before sending HTTP data.
- Physical distance between client and server enforces minimum round-trip time latencies.
- Eliminate unnecessary redirect chains to prevent burning multiple round trips before page processing starts.
