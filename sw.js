/* FITQUEST service worker — network first (updates show on next open), cache fallback (gym offline). */
const CACHE = 'fq-v5';
const SHELL = ['./', 'index.html', 'app.js', 'data.js', 'photos.js', 'app.css', 'tokens.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.url.includes('generativelanguage.googleapis.com')) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && (r.url.startsWith(self.location.origin) || /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(r.url))) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy));
    }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
