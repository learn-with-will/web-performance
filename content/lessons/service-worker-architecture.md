---
slug: service-worker-architecture
title: "Service Worker Architecture"
topic: loading-strategies
kind: concept
summary: "Understanding service workers as client-side programmable network proxies operating over HTTPS."
tags: [service-workers, proxy, offline, cache-api]
related: [service-worker-lifecycle, the-cache-api, runtime-caching-strategies]
---
> **In one line:** A service worker is a programmable client-side network proxy that intercepts and routes all outgoing HTTP requests.

## The idea

A Service Worker is a specialized type of web worker that acts as a programmable network proxy running between the web browser, the network, and the local cache storage.

Unlike standard scripts that run inside a page document, a service worker runs in an independent background thread with its own lifecycle. It has no access to the DOM and does not block the user interface. Because a service worker has the power to intercept network requests, alter HTTP headers, and serve synthetic responses, the web platform strictly mandates that service workers operate exclusively over secure HTTPS origins (with `localhost` permitted for development).

The superpower of a service worker lies in its ability to listen to the `fetch` event. Whenever the page requests an HTML document, stylesheet, image, or API endpoint, the service worker intercepts the request before it touches the physical network. The service worker can decide to serve the asset from local Cache Storage, fetch it from the network, or combine both in custom caching strategies.

## See it

```javascript
// Registering a service worker from the main application script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('Service Worker registered with scope:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
```

> **Note:** Service workers require HTTPS and act as programmable proxies intercepting outgoing network fetch events.

## Go deeper
Service workers operate as programmable network proxies running on independent background threads over HTTPS. By intercepting outgoing `fetch` events, service workers can route requests to local Cache Storage, query the network, or combine both in custom offline and caching architectures.


Service worker capabilities compared to standard browser execution environments:

| Capability | Main Thread Window | Dedicated Web Worker | Service Worker |
|---|---|---|---|
| Access to DOM (`document`) | **Yes** | No | No |
| Intercept Network (`fetch`) | No | No | **Yes (Full Proxy Control)** |
| Runs in Background | Dies when tab closes | Dies when tab closes | **Persists across tab closures** |
| HTTPS Mandated | Recommended | No | **Strictly Required (HTTPS)** |
| Access to Cache Storage | Yes | Yes | **Primary Consumer** |

## Watch out

- Assuming a service worker speeds up the first visit; it installs during or after the first visit and aids repeat views.
- Placing the service worker script in a subfolder (e.g. /js/sw.js); its default scope is restricted to that subfolder.

## Remember

- Service workers are client-side programmable proxies that intercept outgoing HTTP requests.
- Service workers require HTTPS and execute in an isolated background thread without DOM access.
- Service workers empower offline experiences, custom caching strategies, and background synchronization.
