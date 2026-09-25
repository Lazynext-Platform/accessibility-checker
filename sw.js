// Accessibility Checker service worker — makes the PWA installable and the
// shell available offline. Scans stay network-only (a cached scan would be a
// stale audit); only the static shell + discovery files are cached.
const CACHE = 'a11y-shell-v1';
const SHELL = ['/', '/manifest.json', '/favicon.svg', '/robots.txt'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Network-first for the shell so scans always see fresh code; fall back to
  // cache offline so an installed PWA still opens.
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && SHELL.includes(u.pathname)) {
          const clone = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match('/'))),
  );
});
