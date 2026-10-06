/** Static public allowlist only; no runtime API or private-content caching. */
export function serviceWorkerSource(version, files) {
  return `
const PREFIX = 'shaker-chaos-shell-';
const CACHE = PREFIX + ${JSON.stringify(version)};
const FILES = ${JSON.stringify(files)};
const URLS = FILES.map((file) => new URL(file, self.registration.scope).href);
const SHELL = new URL('index.html', self.registration.scope).href;
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(URLS)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const base = new URL(self.registration.scope);
  if (url.origin !== base.origin) return;
  if (request.mode === 'navigate' && (url.pathname === base.pathname || url.href === SHELL)) {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match(SHELL, { ignoreVary: true })).then((cached) => cached || fetch(request)));
    return;
  }
  if (!URLS.includes(url.href)) return;
  // Only allowlisted public build assets: Vite's Vary: Origin must not split this static cache.
  event.respondWith(caches.open(CACHE).then((cache) => cache.match(request, { ignoreVary: true })).then((cached) => cached || fetch(request)));
});
`;
}

