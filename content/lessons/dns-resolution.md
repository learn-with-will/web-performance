---
slug: dns-resolution
title: "DNS Resolution"
topic: network-and-browsers
kind: concept
summary: "How browsers resolve domain names to IP addresses, DNS caching tiers, and reducing lookup latency."
tags: [dns, networking, caching, latency]
related: [anatomy-of-a-navigation, tcp-and-tls-handshakes, secondary-resources-waterfall]
---
> **In one line:** DNS translates hostnames into IP addresses across hierarchical caches, adding significant latency on cold lookups.

## The idea

The Domain Name System (DNS) is the global directory service of the internet, mapping human-friendly domain names like `example.com` to numeric IP addresses required for routing network packets.

When a browser resolves a hostname for the first time, it queries a series of hierarchical DNS caches. It checks the browser's internal DNS cache, the operating system's local resolver cache, the local network router, and the ISP's recursive resolver. If the record is not cached, the recursive resolver queries root nameservers, Top-Level Domain (TLD) nameservers, and finally the authoritative nameservers for the target domain.

On mobile networks, an uncached DNS lookup can easily consume 100 to 300 milliseconds. Because DNS must resolve before a TCP connection can even initiate, cold DNS latency directly delays the start of the HTML response. Configuring sensible Time-To-Live (TTL) values, utilizing high-performance authoritative DNS providers with Anycast routing, and leveraging preconnect or dns-prefetch hints for critical third parties are vital strategies for minimizing DNS delay.

## See it

```bash
# Inspecting DNS resolution timing and authoritative record details via dig
dig +trace +stats example.com A
```

```html
<!-- Informing the browser to resolve third-party hostnames early -->
<link rel="dns-prefetch" href="https://api.example.com">
```

> **Tip:** Use `dns-prefetch` for secondary third-party origins to resolve IP addresses in the background before assets are requested.

## Go deeper
Authoritative DNS infrastructure should leverage Anycast routing across globally distributed nameservers. Anycast routes DNS queries automatically to the geographically closest DNS server, cutting resolution latency from 150ms down to under 25ms. Pairing Anycast DNS with reasonable Time-To-Live (TTL) values balances rapid DNS propagation with high client-side cache hit rates.


DNS caching operates across several nested layers, each bound by the record's TTL setting:

| Cache Tier | Typical Duration | Storage Location |
|---|---|---|
| Browser DNS Cache | Minutes to hours | In-memory within browser process |
| OS Resolver Cache | Governed by TTL | Operating system networking daemon |
| Local Router Cache | Governed by TTL | Local Wi-Fi router / gateway memory |
| Recursive ISP Resolver | Governed by TTL | Upstream Internet Service Provider |


DNS lookup latency can add hundreds of milliseconds to initial connection times on high-latency mobile networks. By consolidating third-party services and utilizing authoritative Anycast DNS providers, teams ensure that name resolution completes with minimal round trips across the globe.

## Watch out

- Setting excessively short DNS TTLs (e.g., 60 seconds) that force frequent expensive lookups for returning users.
- Referencing dozens of distinct third-party domains on a page, causing DNS lookup stampedes.

## Remember

- DNS resolution maps hostnames to IP addresses and must complete before TCP sockets can connect.
- Uncached DNS lookups on mobile networks often add 100–300ms of latency to page load.
- Use Anycast DNS providers and dns-prefetch hints to mitigate resolution bottlenecks.
