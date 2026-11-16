---
slug: connection-hints-dns-and-preconnect
title: "Connection Hints: dns-prefetch and preconnect"
topic: loading-strategies
kind: technique
summary: "Warming network connections early: dns-prefetch for host resolution and preconnect for full TLS sockets."
tags: [preconnect, dns-prefetch, resource-hints, networking]
related: [preloading-critical-assets, fetchpriority-attribute, anatomy-of-a-navigation]
---
> **In one line:** Use preconnect to warm DNS, TCP, and TLS to critical third parties, and dns-prefetch as a lightweight fallback.

## The idea

When a web page depends on external third-party origins—such as an external API endpoint, an image CDN, or a payment gateway—initiating that connection cold requires resolving DNS, establishing a TCP socket, and negotiating a TLS handshake. On mobile connections, this connection setup easily consumes 150 to 300 milliseconds of latency before a single byte of data can be requested.

Connection hints allow you to inform the browser's networking stack about critical cross-origin hosts before the HTML parser encounters asset tags referencing them.

Two connection hints exist in modern web standards:
1. `<link rel="preconnect">`: Commands the browser to immediately perform the full DNS lookup, TCP three-way handshake, and TLS cryptographic setup. When the application later requests data from that origin, the encrypted socket is already pre-warmed and open, eliminating connection latency entirely.
2. `<link rel="dns-prefetch">`: A lightweight fallback that resolves only the DNS IP address without opening a socket. `dns-prefetch` consumes negligible memory and CPU, making it suitable for secondary third-party domains.

## See it

```html
<!-- Preconnecting to critical origins: completes DNS + TCP + TLS ahead of time -->
<link rel="preconnect" href="https://images.cdn-provider.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Fallback for older browsers: resolves DNS only -->
<link rel="dns-prefetch" href="https://images.cdn-provider.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
```

> **Tip:** Use `preconnect` for 1–3 critical origins; use `dns-prefetch` for secondary third-party domains.

## Go deeper
Connection hints warm external cross-origin connections before assets are requested. `preconnect` completes DNS resolution, TCP handshake, and TLS negotiation ahead of time, while `dns-prefetch` serves as a lightweight fallback that resolves IP addresses with negligible resource overhead.


Comparing connection hints across operations completed and resource overhead:

| Resource Hint | Operations Performed | Socket Kept Open? | Resource Overhead | Recommended Limit |
|---|---|---|---|---|
| **`dns-prefetch`** | DNS resolution only | No socket opened | Negligible | 5–15 origins |
| **`preconnect`** | **DNS + TCP + TLS** | **Yes (ready for HTTP)** | Moderate (socket + memory) | **2–4 origins max** |


Be judicious with connection hints; opening too many unneeded TLS sockets competes for client CPU and mobile radio resources. Restrict preconnect strictly to origins providing high-priority above-the-fold assets, such as critical web fonts or the primary LCP image CDN domain.


Always verify server response headers and network waterfalls in Chrome DevTools to confirm that connection handshakes complete prior to requesting critical assets.

## Watch out

- Adding preconnect for dozens of origins; open sockets time out after ~10–20s, wasting bandwidth and memory.
- Omitting crossorigin when preconnecting to font origins; fonts fetch anonymously and require <link rel="preconnect" crossorigin>.

## Remember

- preconnect completes DNS, TCP, and TLS handshakes in the background to warm connections.
- dns-prefetch resolves hostname IP addresses with minimal memory and CPU overhead.
- Limit preconnect to 2–4 critical cross-origin domains to prevent socket starvation.
