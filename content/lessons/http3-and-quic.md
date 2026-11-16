---
slug: http3-and-quic
title: "HTTP/3 and QUIC"
topic: caching-and-compression
kind: concept
summary: "How QUIC protocol over UDP eliminates TCP head-of-line blocking with 0-RTT/1-RTT connection setup."
tags: [http3, quic, udp, handshake]
related: [http2-multiplexing, http1-limitations-and-workarounds, cdn-edge-caching]
---
> **In one line:** HTTP/3 runs over QUIC (UDP), eliminating transport-layer head-of-line blocking and accelerating connection setup.

## The idea

While HTTP/2 solved application-layer head-of-line blocking, it introduced a subtle transport-level vulnerability because it runs on top of TCP. In TCP, all streams share a single packet sequence. If even one single packet is dropped on a congested mobile connection, the entire TCP socket pauses until that missing packet is retransmitted—stalling all multiplexed HTTP/2 streams simultaneously!

HTTP/3 (standardized in RFC 9114) solves this by replacing TCP entirely with QUIC (RFC 9000), a modern transport protocol built on top of UDP.

In QUIC, individual streams are completely independent at the transport layer. If a packet belonging to stream 5 is dropped, stream 5 pauses for retransmission, but streams 1, 2, 3, and 4 continue downloading completely uninterrupted!

Furthermore, QUIC merges transport and encryption into a single protocol. TLS 1.3 is baked directly into QUIC, enabling 1-RTT connection setup on initial visits, and 0-RTT connection resumption for returning visitors. QUIC also supports seamless Connection Migration: when a mobile phone transitions from Wi-Fi to cellular data, active downloads continue without reconnecting because connections are identified by a 64-bit Connection ID rather than an IP address.

## See it

```text
// Protocol Stack Comparison
HTTP/1.1 & HTTP/2 Stack:       HTTP/3 Stack:
[ HTTP Application Layer ]     [ HTTP/3 Application Layer ]
[ TLS 1.2 / TLS 1.3      ]     [ QUIC (Transport + TLS 1.3) ]
[ TCP Transport Protocol ]     [ UDP Transport Protocol   ]
[ IP Network Layer       ]     [ IP Network Layer         ]
```

```bash
# Testing HTTP/3 connectivity using curl with HTTP/3 support
curl --http3 -I https://cloudflare.com
# HTTP/3 200
```

> **Note:** HTTP/3 uses QUIC over UDP, ensuring packet loss on one stream does not block any other concurrent stream.

## Go deeper

Advantages of HTTP/3 and QUIC over HTTP/2 and TCP:

| Feature | HTTP/2 over TCP | HTTP/3 over QUIC |
|---|---|---|
| Underlying Transport | TCP | **QUIC (UDP)** |
| Connection Handshake | 2 RTT (1 TCP + 1 TLS) | **1 RTT (0 RTT on session resumption)** |
| Packet Loss Handling | Stalls all multiplexed streams | **Stalls only the specific affected stream** |
| Network Handover | Drops connection; must reconnect | **Connection Migration preserves socket via ID** |
| Encryption | Layered on top of TCP | Integrated directly into transport layer |

## Watch out

- Assuming HTTP/3 is supported on legacy corporate firewalls; some strict enterprise networks block UDP port 443.
- Trying to configure QUIC on bare origin servers without an edge CDN; edge CDNs handle HTTP/3 negotiation seamlessly.

## Remember

- HTTP/3 replaces TCP with QUIC over UDP, eliminating transport-layer head-of-line blocking.
- QUIC integrates TLS 1.3 directly into the transport layer, enabling 0-RTT/1-RTT connection setup.
- Connection migration allows mobile users to switch networks without interrupting active downloads.
