---
slug: network-panel-columns
title: "Network Panel Columns"
topic: measurement-and-tooling
kind: tool
summary: "Decoding essential Network panel columns: status, type, initiator, size vs transferred, and priority."
tags: [devtools, network-panel, columns, priority]
related: [recording-network-traces, reading-the-waterfall, spotting-loading-bottlenecks]
---
> **In one line:** Inspect Name, Status, Type, Initiator, Size vs Transferred, and Priority to decode asset delivery mechanics.

## The idea

The request table in the Chrome DevTools Network panel provides extensive metadata for every network transaction. Configuring and reading these columns correctly is crucial for diagnosing performance issues.

Right-click any column header to ensure these critical columns are visible:
- Status: The HTTP response status code (`200 OK`, `304 Not Modified`, `404 Not Found`).
- Type: The resource MIME type (document, stylesheet, script, font, image).
- Initiator: What triggered the request. Shows whether an asset was requested by the HTML parser, an external stylesheet, or a specific line of JavaScript. Hovering displays the complete asynchronous call stack!
- Size vs Transferred: "Transferred" displays the actual compressed bytes sent across the network socket (including HTTP headers). "Size" displays the uncompressed byte size of the asset in memory. A large discrepancy indicates effective gzip or Brotli compression.
- Priority: The internal fetch priority assigned by Chrome's resource scheduler (`Highest`, `High`, `Medium`, `Low`, `Lowest`).

## See it

```text
// Typical Network Table Columns Layout
Name           Status  Type    Initiator    Size     Transferred  Priority
---------------------------------------------------------------------------
example.com    200     doc     Other        18.4 KB  4.8 KB       Highest
style.css      200     css     index:12     42.1 KB  8.2 KB       Highest
hero.avif      200     img     index:45     180 KB   180 KB       High
app.js         200     script  index:14     320 KB   85 KB        Low
analytics.js   200     script  index:98     15 KB    4 KB         Lowest
```

> **Note:** "Transferred" represents compressed bytes sent over the network; "Size" represents uncompressed bytes in memory.

## Go deeper
Configuring the Network panel columns to display Priority, Initiator, and Size versus Transferred provides deep visibility into browser loading mechanics. Inspecting the Initiator call stack pinpoints the exact script line responsible for dynamic asset injection, while Priority reveals how Chrome's resource scheduler prioritizes downloads across network sockets.


Decoding the diagnostic significance of core Network panel columns:

| Column | What to Look For | Diagnostic Warning Sign |
|---|---|---|
| **Status** | 200 vs 304 vs 4xx/5xx | Unexpected 404s or uncached 200s on static assets |
| **Initiator** | Call stack / origin | Heavy assets requested dynamically by obscure third-party scripts |
| **Size vs Transf.** | Compression ratio | Transferred equals Size for text files (indicates missing compression) |
| **Priority** | Browser priority bucket | Non-critical widgets assigned 'Highest' ahead of hero images |


In the Network panel, inspecting the Initial Priority column reveals whether your preload tags and fetchpriority attributes are functioning as intended. Observing waterfall timing breakdowns helps pinpoint whether slow asset delivery stems from queueing, DNS resolution, or server response latency.

## Watch out

- Confusing transferred bytes with uncompressed memory footprint; CPU parse cost is tied to uncompressed Size.
- Leaving the Priority column hidden, making it difficult to understand why certain assets queue behind others.

## Remember

- The Network panel columns expose status, resource type, initiator call stack, payload size, and priority.
- Transferred size shows wire bytes after compression; resource size shows memory footprint.
- Priority reveals how Chrome's scheduler orders concurrent downloads across available network sockets.
