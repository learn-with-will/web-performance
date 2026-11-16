---
slug: cdn-edge-caching
title: "CDN and Edge Caching"
topic: caching-and-compression
kind: concept
summary: "Reducing geographic latency and origin load by terminating TLS and caching assets at edge Points of Presence."
tags: [cdn, edge-caching, latency, networking]
related: [http3-and-quic, http2-multiplexing, the-immutable-cache-pattern]
---
> **In one line:** A Content Delivery Network (CDN) caches content at edge servers worldwide to cut physical network latency.

## The idea

The speed of light in fiber optic cables is a physical limit: light travels at roughly 200 kilometers per millisecond. If your application's origin server is located in Virginia, USA, a user visiting from Tokyo, Japan (11,000 km away) faces an unavoidable round-trip network latency of at least 150 to 200 milliseconds before a single byte of data can return.

A Content Delivery Network (CDN) solves this physical distance problem. A CDN is a globally distributed network of edge data centers—known as Points of Presence (PoPs)—positioned in cities around the world close to end users.

A CDN delivers two vital performance benefits:
1. Edge Caching: Static assets (images, fonts, CSS, JS) and cacheable HTML are stored directly in edge memory. When the user in Tokyo requests `hero.avif`, the asset is served from a local Tokyo PoP in 10ms instead of traveling to Virginia.
2. Connection Termination: The expensive TCP, TLS, and QUIC handshakes terminate at the local edge server nearest the user. The CDN then communicates with your origin server over pre-warmed, persistent backbone network connections.

## See it

```text
// Without CDN: Every round-trip travels 11,000 km across the globe
User (Tokyo) <---------------- 200ms RTT ----------------> Origin Server (Virginia)

// With CDN: Handshake and static assets served locally from edge PoP
User (Tokyo) <-- 10ms RTT --> Edge PoP (Tokyo) <== Dedicated Backbone ==> Origin (Virginia)
```

> **Tip:** CDNs terminate TLS handshakes near users and serve cached assets from edge Points of Presence (PoPs).

## Go deeper
Content Delivery Networks (CDNs) distribute edge data centers globally close to end users. Edge PoPs terminate TLS handshakes and serve cached static and dynamic assets within milliseconds, overcoming the physical latency constraints imposed by the speed of light traveling across continental distances.


Core performance features provided by modern edge CDNs:

| CDN Capability | How It Accelerates Performance |
|---|---|
| **Edge Caching** | Serves static assets in 5–20ms from local cache |
| **Edge TLS Termination** | Completes cryptographic handshakes geographically near the user |
| **Origin Shielding** | Protects the origin database from traffic stampedes |
| **Protocol Translation** | Bridges modern client HTTP/3 down to origin HTTP/1.1 |
| **Edge Compute** | Runs lightweight auth and geolocation logic close to users |


For globally distributed web applications, stale-while-revalidate and stale-if-error headers empower CDNs to serve cached stale content immediately while fetching fresh data in the background or during origin downtime. This guarantees high availability and ultra-low latency even during infrastructure maintenance.

## Watch out

- Assuming a CDN can fix a slow application; dynamic uncached database queries still incur origin latency.
- Failing to configure cache purge webhooks during deployment, leading to stale CDN edge caches.

## Remember

- CDNs distribute content across global edge data centers to overcome physical distance limits.
- Edge PoPs terminate TLS handshakes and serve cached assets within milliseconds.
- A CDN cannot fix a slow backend origin query; cache dynamic HTML at the edge whenever possible.
