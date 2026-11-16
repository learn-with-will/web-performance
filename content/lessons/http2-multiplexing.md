---
slug: http2-multiplexing
title: "HTTP/2 Multiplexing and HPACK"
topic: caching-and-compression
kind: concept
summary: "Multiplexing concurrent streams over a single TCP connection with binary framing and HPACK headers."
tags: [http2, multiplexing, hpack, networking]
related: [http1-limitations-and-workarounds, http3-and-quic, cdn-edge-caching]
---
> **In one line:** HTTP/2 multiplexes concurrent requests over a single TCP connection using binary framing and HPACK compression.

## The idea

Standardized in 2015 (RFC 9113), HTTP/2 revolutionized web transport by completely eliminating the need for multiple TCP sockets to the same origin.

Instead of plain text lines, HTTP/2 breaks communication into binary frames. Individual frames belonging to dozens of distinct requests and responses are interleaved simultaneously across a single, persistent TCP connection. This capability is known as Multiplexing.

With HTTP/2 multiplexing, downloading 50 small JavaScript chunks or image thumbnails incurs zero head-of-line blocking at the application layer. Requests do not queue up waiting for earlier requests to finish.

Additionally, HTTP/2 introduced HPACK header compression. In HTTP/1.1, every request repeated hundreds of bytes of identical plaintext headers (`User-Agent`, `Cookie`, `Accept`). HPACK establishes a shared, stateful header compression table between client and server, transmitting only incremental changes and indices, reducing header overhead by over 85%. Note that Chrome effectively removed HTTP/2 Server Push due to complexity and cache contention; avoid relying on Server Push.

## See it

```text
// HTTP/2 Multiplexing over a Single TCP Socket
TCP Stream: [Req 1 Frame] [Req 2 Frame] [Req 1 Frame] [Req 3 Frame] [Req 2 Frame]
                 |             |             |             |             |
Client/Server handles all requests in parallel over ONE persistent connection!
```

```bash
# Verifying that an origin serves traffic via HTTP/2 using curl
curl -I --http2 https://example.com
# HTTP/2 200
```

> **Tip:** HTTP/2 multiplexing allows dozens of modular files to download concurrently over a single TCP socket.

## Go deeper
HTTP/2 replaces plain text lines with binary frames, allowing multiple concurrent request and response streams to be interleaved over a single persistent TCP connection. Multiplexing eliminates application-layer head-of-line blocking, while HPACK compression slashes redundant HTTP header overhead.


Comparing architectural features of HTTP/1.1 versus HTTP/2:

| Feature | HTTP/1.1 | HTTP/2 |
|---|---|---|
| Protocol Format | Plain text | Binary framing |
| Connection Model | 6 connections per origin | **Single persistent TCP connection** |
| Request Concurrency | Serial (1 per connection) | **Fully multiplexed parallel streams** |
| Header Handling | Verbose plaintext on every request | **HPACK compressed stateful table** |
| Server Push | Not available | Effectively deprecated / removed |


HTTP/2 multiplexing eliminates head-of-line blocking at the application layer by streaming multiple requests over a single TCP connection. However, packet loss on unstable networks can still trigger TCP-level transport blocking, a challenge solved by the UDP-based QUIC protocol in HTTP/3.


Server push was deprecated across modern web browsers because intelligent client caching and preloading strategies offer superior, non-wasteful resource scheduling over multiplexed connections.

## Watch out

- Relying on HTTP/2 Server Push; major browsers have removed or disabled support due to inefficiency.
- Over-fragmenting code into thousands of tiny micro-files; multiplexing has diminishing returns past ~50–100 files.

## Remember

- HTTP/2 multiplexes multiple parallel request/response streams over a single TCP connection.
- Binary framing eliminates application-layer head-of-line blocking.
- HPACK compresses HTTP request and response headers by eliminating redundant header transmissions.
