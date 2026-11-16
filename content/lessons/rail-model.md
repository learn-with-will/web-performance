---
slug: rail-model
title: "The RAIL Model"
topic: foundations
kind: pattern
summary: "The RAIL model establishes user-centric performance targets across Response, Animation, Idle, and Load."
tags: [rail, latency, framerate, architecture]
related: [what-web-performance-means, perceived-performance, optimizing-for-real-users]
---
> **In one line:** RAIL structures performance into four user-centric phases: Response (<100ms), Animation (<16ms), Idle (50ms chunks), and Load (<5s).

## The idea

To make performance actionable across complex engineering teams, Google created the RAIL model. Rather than focusing on abstract system metrics like CPU utilization or network bandwidth, RAIL frames performance entirely around user perception and expectations.

The acronym stands for Response, Animation, Idle, and Load. Each pillar defines an explicit latency target based on human cognitive limits.

Response requires that any user action—such as clicking a button, tapping a navigation link, or expanding an accordion—produces visible acknowledgment within 100 milliseconds. Animation requires that smooth scrolling, visual transitions, and continuous movements render at 60 frames per second, which allocates roughly 16 milliseconds per frame (with 10 milliseconds reserved for browser internal rendering overhead).

Idle dictates that background computational tasks must be split into small chunks of at most 50 milliseconds. This ensures that if the user suddenly initiates an interaction, the main thread can finish the active task and respond within the 100-millisecond threshold. Finally, Load requires delivering meaningful, interactive content in under 5 seconds on initial mobile loads, and under 2 seconds on subsequent cached loads.

## See it

```javascript
// Implementing the RAIL Idle pattern using requestIdleCallback to defer analytics
function scheduleAnalyticsFlush(payload) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback((deadline) => {
      // Execute only while the main thread has spare idle time
      while (deadline.timeRemaining() > 0 && payload.length > 0) {
        sendEventBeacon(payload.pop());
      }
    }, { timeout: 2000 });
  } else {
    setTimeout(() => sendEventBeacon(payload.pop()), 50);
  }
}
```

> **Tip:** Keep idle tasks under 50ms so a sudden user tap is never blocked from responding within the 100ms Response window.

## Go deeper

The four RAIL targets align directly with human cognitive perception:

| RAIL Pillar | User Expectation | Engineering Target | Key Rule |
|---|---|---|---|
| **Response** | Visual reaction to tap or click | Under 100 ms | Provide feedback immediately |
| **Animation** | Smooth motion and scrolling | Under 16 ms / frame | Budget 10ms for script + 6ms browser paint |
| **Idle** | Background work invisible | Max 50 ms chunks | Yield frequently so user inputs take priority |
| **Load** | Fast access to core content | Under 5 s (mobile) | Defer secondary assets off the critical path |

## Watch out

- Running continuous non-essential tasks in requestAnimationFrame, stealing time from layout and paint.
- Grouping multiple async calculations into a single monolithic block that exceeds the 50ms idle limit.

## Remember

- RAIL stands for Response (100ms), Animation (16ms), Idle (50ms), and Load (5s on mobile).
- Keep background and idle JavaScript chunks under 50ms to preserve immediate interaction responsiveness.
- Budget 10ms of work per frame for animations to leave the browser sufficient time to composite and paint.
