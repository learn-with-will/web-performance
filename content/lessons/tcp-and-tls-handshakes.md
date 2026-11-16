---
slug: tcp-and-tls-handshakes
title: "TCP and TLS Handshakes"
topic: network-and-browsers
kind: concept
summary: "The mechanics of the TCP 3-way handshake and TLS 1.3 cryptographic setup across network round trips."
tags: [tcp, tls, https, handshake]
related: [anatomy-of-a-navigation, dns-resolution, ttfb-and-first-byte]
---
> **In one line:** TCP establishes reliable socket delivery via a 3-way handshake, followed by TLS 1.3 negotiating encryption in a single round trip.

## The idea

Once an IP address is known, the client must establish an authenticated, encrypted connection with the server. Over standard HTTP/1.1 and HTTP/2, this requires two sequential protocols: TCP and TLS.

The Transmission Control Protocol (TCP) provides reliable, ordered byte delivery. It begins with the classic three-way handshake: the client sends a SYN packet, the server responds with SYN-ACK, and the client replies with ACK. This exchange consumes exactly one full Round-Trip Time (RTT).

Immediately following the TCP handshake, Transport Layer Security (TLS) establishes cryptographic privacy and integrity. Under legacy TLS 1.2, negotiating cipher suites, exchanging certificates, and sharing key parameters required two round trips (2-RTT). Modern TLS 1.3 streamlines this process into a single round trip (1-RTT) by combining key-exchange parameters directly into the initial ClientHello. Furthermore, TLS 1.3 supports 0-RTT session resumption for returning visitors, allowing encrypted application data to travel in the very first packet.

## See it

```text
// TCP (1 RTT) followed by TLS 1.3 (1 RTT) connection handshake
Client                                Server
  | -------------- SYN --------------> |
  | <----------- SYN-ACK ------------- |  (1 RTT: TCP established)
  | --- ACK + TLS 1.3 ClientHello ---> |
  | <------- ServerHello + Cert ------ |  (1 RTT: TLS established)
  | --------- HTTP GET Request ------> |
  | <--------- HTTP 200 (HTML) ------- |  (Data begins flowing)
```

> **Note:** TLS 1.3 cuts connection latency in half compared to TLS 1.2 by completing cryptographic negotiation in a single round trip.

## Go deeper
TCP slow start governs initial connection bandwidth. When a TCP connection is established, the congestion window (cwnd) begins small—typically 10 TCP segments (~14 KB)—and doubles with each successful round trip. Minimizing the size of the initial critical rendering assets ensures that the primary HTML and styles fit within the initial TCP window, completing First Contentful Paint in one RTT.


Comparing connection setup times across transport protocol configurations:

| Protocol Configuration | TCP Setup | TLS Setup | Total Handshake Latency |
|---|---|---|---|
| HTTP/1.1 over Plain TCP | 1 RTT | None | 1 RTT |
| HTTPS over TLS 1.2 | 1 RTT | 2 RTT | 3 RTT |
| HTTPS over TLS 1.3 | 1 RTT | 1 RTT | 2 RTT |
| HTTP/3 (QUIC over UDP) | 0 RTT | Integrated | 1 RTT (0 RTT on resumption) |

## Watch out

- Running legacy TLS 1.0 or 1.2, which forces multiple round trips and lacks modern cryptographic defenses.
- Closing TCP connections prematurely instead of allowing persistent HTTP Keep-Alive connection reuse.

## Remember

- TCP requires a 1-RTT three-way handshake to establish reliable packet transport.
- TLS 1.3 completes cryptographic setup in 1 RTT, halving the connection cost of TLS 1.2.
- Keep connections alive to avoid repeating expensive handshakes for subsequent resource requests.
