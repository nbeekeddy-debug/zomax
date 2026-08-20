const VERSION = "zomax-pwa-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const IMAGE_CACHE = `${VERSION}-images`;

const APP_SHELL = [
  "/",
  "/shop",
  "/deals",
  "/categories",
  "/sellers",
  "/help",
  "/offline",
  "/icon.svg",
  "/icon-maskable.svg",
];

const PUBLIC_PAGE = /^\/$|^\/shop(?:\/|$)|^\/deals(?:\/|$)|^\/categories(?:\/|$)|^\/sellers(?:\/|$)|^\/help(?:\/|$)|^\/product\//;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.allSettled(
        APP_SHELL.map(async (path) => {
          const request = new Request(path, { cache: "reload" });
          const response = await fetch(request);
          if (response.ok) await cache.put(request, response);
        })
      );
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("zomax-pwa-") && !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const url = new URL(request.url);
    if (response.ok && PUBLIC_PAGE.test(url.pathname)) {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    const url = new URL(request.url);
    if (url.pathname.startsWith("/shop")) {
      const shopFallback = await caches.match("/shop");
      if (shopFallback) return shopFallback;
    }

    return (await caches.match("/offline")) || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await update) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(request, url.pathname.startsWith("/_next/image") ? IMAGE_CACHE : STATIC_CACHE));
    return;
  }

  if (url.pathname === "/icon.svg" || url.pathname === "/icon-maskable.svg" || url.pathname === "/manifest.webmanifest") {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});
