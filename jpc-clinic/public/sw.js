const CACHE_NAME = "jpc-clinic-v3";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/logo/heart-192.png",
    "/logo/heart-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                FILES_TO_CACHE.map(url =>
                    cache.add(url).catch(err => {
                        console.warn("Failed to cache:", url, err);
                    })
                )
            );
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {
    const req = event.request;

    if (req.method !== "GET") {
        return;
    }

    const url = new URL(req.url);

    // Huwag galawin ang backend/API at ibang domain (Render, Firebase, atbp.)
    if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
        return;
    }

    // Pages: network muna, cache lang kapag offline
    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req)
                .then(res => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put("/index.html", copy));
                    }
                    return res;
                })
                .catch(() => caches.match("/index.html"))
        );
        return;
    }

    // Static files (JS, CSS, images): cache muna
    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) {
                return cached;
            }

            return fetch(req).then(res => {
                if (res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                }
                return res;
            });
        })
    );
});