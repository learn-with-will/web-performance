---
id: lesson-02
slug: how-the-browser-loads-a-page
title: "How the Browser Loads a Page"
level: beginner
order: 2
duration: 17
tags:
  - browsers
  - networking
  - dns
  - tls
  - ttfb
summary: "The journey from a URL to the first byte of HTML — DNS lookup, the TCP and TLS handshakes, the HTTP request and response, and why network round trips and Time to First Byte dominate the start of every page load."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Trace the steps from typing a **URL** to the browser receiving the first byte of HTML.
- Explain **DNS**, the **TCP** handshake, and the **TLS** handshake, and why each costs a round trip.
- Define **Time to First Byte (TTFB)** and what it includes.
- Explain why a page is never "one file" and how the browser discovers more resources.
- Recognize where **network latency** (not just server speed) makes a page feel slow.

# Why It Matters

A surprising amount of a page's load happens **before any of your HTML arrives**. Finding the server,
opening a secure connection, and waiting for the first byte can each take a full network round trip — and
on mobile networks a round trip is not free. If you don't know this pipeline, you'll blame "the server"
for delays that are really about distance, connection setup, or extra origins. Understanding the journey
tells you *where the time goes* so you optimize the right stage.

# Concept Explanation

### From URL to a server

When you click a link or type a URL, the browser starts a **navigation**. A URL like
`https://shop.example.com/product/42` names a **scheme** (`https`), an **origin**
(`https://shop.example.com`), and a path. But computers route by numeric **IP address**, not names, so the
first job is translation.

### DNS: turning a name into an address

**DNS (Domain Name System)** maps a hostname to an IP address. The browser asks a resolver "what's the IP
for `shop.example.com`?" If nobody nearby has the answer cached, this lookup takes a network round trip.
Results are cached (in the OS and browser) so repeat visits skip it.

### Opening a connection: TCP, then TLS

With an IP address, the browser opens a connection:

- **TCP handshake** — a three-step "SYN / SYN-ACK / ACK" exchange that establishes the connection. That's
  **one round trip** before any data flows.
- **TLS handshake** — for `https://`, the browser and server then negotiate encryption and verify the
  certificate. With **TLS 1.3** this typically adds **one more round trip** (and session resumption or
  0‑RTT can shave it further).

Each handshake is gated by **round-trip time (RTT)** — the time for a packet to go to the server and back.
If the server is far away, every round trip is expensive, which is why *where* the server lives matters
(a theme we'll return to with CDNs).

### The request, the wait, and the first byte

Now the browser sends the **HTTP request** (a `GET` for the HTML). The server processes it and starts
sending the **response**. The time from starting the navigation to the first byte of the response arriving
is **Time to First Byte (TTFB)**. TTFB bundles several things:

```text
TTFB  =  redirects  +  DNS lookup  +  TCP connect  +  TLS  +  server "think time"  +  first byte travel
         └────────────────── mostly network round trips ──────────────────┘   └ server ┘
```

So a high TTFB isn't automatically "slow backend code" — it can be distance and connection setup. As of
writing, web.dev suggests aiming to keep TTFB under about **0.8 s** for most sites, because TTFB is the
first ingredient of a fast **Largest Contentful Paint**.

### A page is never just one file

The HTML that arrives is only the beginning. As the browser parses it, it **discovers** more resources —
stylesheets, scripts, images, fonts — and fetches them, sometimes reusing the same connection and often
in parallel. Some of those resources block the page from rendering until they're ready (the subject of the
next lesson). Each brand-new **origin** the page talks to pays its own DNS + TCP + TLS cost, which is why
adding third-party origins is rarely "free."

# Key Terminology

- **URL / origin** — the address of a resource; the origin is scheme + host + port.
- **DNS** — the system that maps a hostname to an IP address.
- **IP address** — the numeric address packets are routed to.
- **RTT (round-trip time)** — how long a packet takes to reach the server and come back.
- **TCP handshake** — the exchange that opens a reliable connection (one round trip).
- **TLS handshake** — the exchange that sets up HTTPS encryption (about one more round trip with TLS 1.3).
- **TTFB (Time to First Byte)** — time from navigation start to the first response byte.
- **HTTP request/response** — the message the browser sends and the data the server returns.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| HTTP vs HTTPS | Plain HTTP (no TLS handshake) | HTTPS | Always HTTPS — it's required for modern features and HTTP/2/3, whose speed more than offsets the handshake. |
| Server location | One origin server far from users | A CDN with edge servers near users | Use a CDN to cut RTT; distance is a big part of TTFB. |
| Number of origins | Spread assets across many hosts | Consolidate; `preconnect` the few critical ones | Fewer origins means fewer DNS+TCP+TLS setups; warm up the essential cross-origin ones early. |
| Repeat lookups | Rely on first-visit DNS | Cache/`dns-prefetch` known origins | Cached DNS and early hints remove round trips on later requests. |

# Worked Example

Here's the first request of a page load, broken into the phases DevTools shows in its Network panel:

```text
Request: GET https://shop.example.com/  (the HTML document)

  Queued/Stalled     2 ms    browser scheduling
  DNS Lookup        30 ms    resolve shop.example.com -> IP
  Initial Connection 45 ms   TCP handshake  (1 round trip)
  SSL/TLS           40 ms    TLS handshake  (~1 round trip)
  Waiting (TTFB)   180 ms    request sent, waiting for first byte
  Content Download  25 ms    receiving the HTML

  Everything before "Content Download" is setup + waiting — the HTML bytes
  themselves took only 25 ms. Cutting round trips (CDN, connection reuse,
  preconnect) attacks the big middle section, not the download.
```

The lesson: on this request the actual HTML was quick; the time went to **finding and connecting to the
server and waiting for the first byte**.

# Real World Analogy

Loading a page is like **phoning a warehouse to order a part**. First you look up the number
(**DNS**). Then you dial and exchange greetings so you're both on the line (**TCP**), and if it's a secure
line you confirm identities and switch to a scrambler (**TLS**). Only then do you ask for the part
(**request**); the clerk goes to find it (**server think time**), and finally reads the details back to you
(**download**). If the warehouse is on another continent, every back-and-forth in that call takes longer —
that's round-trip time.

# Examples

## Example 1 — Basic: seeing the response start with curl

You can watch the first byte arrive from the command line. The `-I` flag requests just the headers:

```bash
# Fetch only the response headers (the start of the response)
curl -I https://example.com

# Print a timing breakdown (DNS, connect, TLS, first byte, total)
curl -s -o /dev/null -w "dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s\n" https://example.com
```

**Why this works:** the timing fields line up with the phases above — you can literally see how much time is
DNS vs connect vs waiting for the first byte.

## Example 2 — Real-world: a third-party origin's hidden setup cost

A page embeds a widget from `widgets.thirdparty.com`. Before that widget's script even downloads, the
browser must do a fresh **DNS + TCP + TLS** to a brand-new origin. Adding a
`<link rel="preconnect" href="https://widgets.thirdparty.com">` in the HTML warms that connection up early,
so the setup overlaps with other work instead of delaying the widget.

**Why this works:** the expensive part of a new origin is often the connection setup, not the bytes;
starting it sooner hides the cost.

## Example 3 — Pitfall: blaming the backend for a network problem

A team sees a 600 ms TTFB and spends a week optimizing database queries — but the server's "think time" was
only 80 ms. The rest was DNS, a distant origin, and TLS setup for users far from the single data center.
Moving static delivery to a CDN cut the round trips and dropped TTFB far more than the query work did.

**Why this bites:** TTFB includes network round trips, not just server code. Measure the breakdown before
deciding what to fix.

# Common Mistakes

- **Assuming TTFB equals backend speed.** It also includes DNS, TCP, TLS, and travel time.
- **Adding many third-party origins casually.** Each new origin pays its own DNS + TCP + TLS.
- **Forgetting distance.** A far-away server makes every round trip slow, no matter how fast the code is.
- **Skipping HTTPS to "save the handshake."** You lose modern protocols (HTTP/2/3) that are faster overall,
  plus security.

# Best Practices

- Measure the **phase breakdown** (DNS / connect / TLS / waiting) before optimizing.
- Serve content from **near your users** (a CDN) to cut round-trip time.
- **Reuse connections** and `preconnect`/`dns-prefetch` the few critical cross-origin hosts.
- Keep the number of distinct origins small; every extra one has a setup cost.

# Summary

- A page load starts with **DNS**, a **TCP** handshake, and (for HTTPS) a **TLS** handshake — each a round
  trip before your HTML arrives.
- **TTFB** measures time to the first response byte and includes all that setup plus server think time.
- **Round-trip time** and server **distance** are major, often-overlooked costs.
- The browser then **discovers and fetches** more resources; new origins repeat the setup cost.
- Fix the right stage by measuring the **breakdown**, and cut round trips with CDNs and connection warming.

# Flash Cards

Q: What does DNS do in a page load?
A: It maps the site's hostname (like shop.example.com) to a numeric IP address the browser can connect to; the lookup can cost a network round trip if not cached.

Q: What two handshakes happen before your HTML can be requested over HTTPS?
A: The TCP handshake (opens the connection, ~1 round trip) and the TLS handshake (sets up encryption, ~1 more round trip with TLS 1.3).

Q: What does Time to First Byte (TTFB) include?
A: Everything from navigation start to the first response byte: redirects, DNS, TCP connect, TLS, server "think time," and the first byte's travel — mostly network round trips plus server processing.

Q: Why isn't a high TTFB automatically the backend's fault?
A: TTFB also includes DNS, connection setup, TLS, and the distance/round-trip time to the server, so a distant origin or slow setup can dominate even when server code is fast.

Q: Why does adding a third-party origin cost more than it looks?
A: Talking to a brand-new origin requires its own DNS lookup, TCP handshake, and TLS handshake before any of its bytes download.

Q: What is round-trip time (RTT) and why does it matter?
A: RTT is how long a packet takes to reach the server and return; because handshakes are measured in round trips, a high RTT (a far-away server) makes connection setup slow.

# Exercises

### Easy
Open your browser's DevTools, go to the **Network** tab, reload a site, and click the very first request
(the HTML document). Find the **Timing** breakdown and identify the DNS, connection, TLS, and waiting
(TTFB) phases.

### Medium
Run the `curl` timing command from Example 1 against two sites — one hosted near you and one likely hosted
far away. Compare `time_connect` and `time_starttransfer`. What does the difference tell you about distance
and round trips?

### Challenging
List the distinct origins a page you use talks to (DevTools groups requests by domain). For each
third-party origin, decide whether it's worth a `preconnect`, whether it could be removed, and what its
DNS+TCP+TLS setup is likely costing on a first visit.

# Further Reading

- MDN — *Populating the page: how browsers work*: <https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work>
- web.dev — *Time to First Byte (TTFB)*: <https://web.dev/articles/ttfb>
- MDN — *An overview of HTTP*: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview>
- web.dev — *Understanding the critical path* & navigation: <https://web.dev/learn/performance/understanding-the-critical-path>
