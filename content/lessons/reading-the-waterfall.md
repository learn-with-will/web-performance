---
slug: reading-the-waterfall
title: "Reading the Request Waterfall"
topic: measurement-and-tooling
kind: tool
summary: "Breaking down the timing phases of individual requests: Queueing, DNS, Connect, SSL, TTFB, and Download."
tags: [waterfall, timing, ttfb, devtools]
related: [recording-network-traces, network-panel-columns, spotting-loading-bottlenecks]
---
> **In one line:** Hover over a waterfall bar to dissect its lifecycle: Queueing, DNS lookup, TCP connect, SSL, TTFB, and Download.

## The idea

The Waterfall column in the DevTools Network panel provides a visual, horizontal timeline of every request from initiation to completion. Hovering over any request bar opens the "Timing" popover, which breaks the total duration into discrete operational phases.

The timing phases occur in strict chronological sequence:
1. Queueing: Time spent waiting in the browser's request queue before network dispatch. Causes include higher-priority requests taking precedence, or reaching the HTTP/1.1 limit of 6 connections per origin.
2. Stalled: Time spent waiting for socket availability or disk cache lookup.
3. DNS Lookup: Time spent resolving the target hostname to an IP address.
4. Initial Connection: Duration of the TCP three-way handshake.
5. SSL (TLS): Duration of cryptographic key negotiation and certificate exchange.
6. Waiting for server response (TTFB): Time elapsed between sending the HTTP request and receiving the very first response byte from the server.
7. Content Download: Time spent reading the remaining data bytes off the network stream until completion.

## See it

```text
// Waterfall Request Timing Breakdown
[ Queueing / Stalled       ] 12 ms
[ DNS Lookup               ] 45 ms
[ Initial Connection (TCP) ] 38 ms
[ SSL (TLS Handshake)      ] 42 ms
[ Request Sent             ] 0.2 ms
[ Waiting for response     ] 180 ms  <-- Time to First Byte (TTFB)
[ Content Download         ] 65 ms
------------------------------------------------
Total Request Duration     : 382.2 ms
```

> **Tip:** Green bars represent Waiting (TTFB); blue bars represent Content Download; orange represents initial connection setup.

## Go deeper
Dissecting the timing phases of waterfall bars enables rapid diagnosis of performance bottlenecks. A long green bar indicates server waiting time (TTFB), pointing to backend database or origin caching delays. A long blue bar indicates content download duration, pointing to large payload sizes or uncompressed transfer formats.


Diagnosing common performance problems using Waterfall timing phases:

| Timing Symptom | Dominant Phase | Root Cause |
|---|---|---|
| Long gray/white bar | Queueing / Stalled | HTTP/1.1 socket exhaustion (max 6 sockets) or CPU starvation |
| Long dark blue/orange bar | DNS + Connect + SSL | Cold connection to new cross-origin host; missing preconnect |
| Long green bar | Waiting for server (TTFB) | Slow backend database query, server template, or origin latency |
| Long light blue bar | Content Download | Massive uncompressed file transfer or throttled bandwidth |

## Watch out

- Confusing long TTFB (green bar) with slow download (blue bar); green indicates server delay, blue indicates size.
- Ignoring long stalled times on HTTP/1.1 connections caused by domain socket limits.

## Remember

- Hovering over any waterfall bar reveals its exact timing breakdown across seven discrete phases.
- Connection phases (DNS, TCP, SSL) occur only on the first request to each unique host.
- Differentiate between waiting for the server (green / TTFB) and downloading data bytes (light blue).
