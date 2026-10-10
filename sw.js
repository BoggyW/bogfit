/* BogFit service worker: newest version whenever you're online, cached copy when you're not. */
const CACHE = 'bogfit-20261010043128';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); });
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), ms))]);
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (r.mode === 'navigate') {
    // Page itself: try the network first so you always get the latest BogFit; fall back to the saved copy at the gym.
    e.respondWith((async () => {
      try {
        const res = await withTimeout(fetch(r, { cache: 'no-store' }), 4000);
        if (res.ok) { const c = await caches.open(CACHE); c.put('./index.html', res.clone()); }
        return res;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }
  // Everything else (icons, fonts, zip library): saved copy first, refreshed in the background.
  e.respondWith((async () => {
    const hit = await caches.match(r);
    const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') caches.open(CACHE).then(c => c.put(r, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  })());
});
