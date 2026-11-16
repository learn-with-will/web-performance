---
slug: ttfb-and-first-byte
title: "TTFB and Time to First Byte"
topic: network-and-browsers
kind: concept
summary: "Time to First Byte measures server responsiveness, database latency, and early connection overhead."
tags: [ttfb, metrics, server, backend]
related: [anatomy-of-a-navigation, tcp-and-tls-handshakes, secondary-resources-waterfall]
---
> **In one line:** Time to First Byte (TTFB) measures the latency from navigation start until the browser receives the first byte of HTML.

## The idea

Time to First Byte (TTFB) is a fundamental diagnostic performance metric measuring the duration from when the browser begins navigation until it receives the very first byte of the response payload from the server.

TTFB is composed of several cumulative sub-phases: redirect time, DNS resolution, TCP handshake, TLS negotiation, and server processing time (including database queries, template rendering, and caching lookups). Because the browser cannot discover external stylesheets, fonts, or scripts until it receives and parses the HTML document, a sluggish TTFB delays the entire downstream waterfall.

Google's web.dev guidance recommends keeping TTFB under 800 milliseconds for a good user experience at the 75th percentile. Achieving this target requires optimizing both the physical delivery path (using an edge CDN to terminate TLS and serve cached static HTML close to users) and backend processing (optimizing database indices, caching server rendered fragments, and streaming HTML responses as they are generated).

## See it

```bash
# Measuring exact TTFB using curl from the command line
curl -o /dev/null -s -w "DNS: %{time_namelookup}s | Connect: %{time_connect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s
" https://example.com
```

> **Tip:** A good TTFB target is under 800ms; if TTFB is high, determine whether the cause is backend database delay or physical network latency.

## Go deeper
Achieving sub-800ms TTFB on dynamic pages requires a multi-tiered backend strategy. Edge compute runtimes can authenticate requests and serve cached HTML fragments directly from edge key-value stores. For database-heavy routes, optimizing SQL query execution plans, adding composite indexes, and streaming HTML responses as data resolves prevents the server from idling while waiting for queries.


Diagnosing where TTFB latency originates by inspecting sub-timing values:

| TTFB Symptom | Likely Cause | Recommended Fix |
|---|---|---|
| High connect time (> 200ms) | Geographically distant origin server | Deploy a CDN to terminate TLS at the edge |
| Low connect, high wait time (> 600ms) | Slow backend database or SSR logic | Cache HTML at edge or optimize SQL queries |
| Multiple redirect pauses | HTTP-to-HTTPS or locale redirects | Use HSTS headers and canonical internal links |


Optimizing server-side rendering logic, utilizing streaming HTML protocols, and co-locating databases with backend compute instances dramatically reduce Time to First Byte. Faster first-byte delivery enables browsers to begin parsing markup and discovering critical sub-resources much earlier.

## Watch out

- Confusing TTFB with Largest Contentful Paint (LCP); TTFB is a prerequisite component of LCP, not LCP itself.
- Assuming high TTFB is always a backend database bug when network distance and redirects often contribute most.

## Remember

- TTFB measures the duration from navigation initiation to the arrival of the first response byte.
- Web.dev guidance recommends maintaining a TTFB under 800ms for a responsive loading experience.
- Edge CDNs, backend caching, and streaming HTML are the primary remedies for excessive TTFB.
