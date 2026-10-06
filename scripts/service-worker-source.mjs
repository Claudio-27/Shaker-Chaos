/** Exact public allowlists; artwork never enters install precache. */
export function serviceWorkerSource(version, files, artFiles = []) {
  const shellFile = (path) => ['index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'].includes(path) || /^assets\/[a-zA-Z0-9_-]+\.(js|css)$/.test(path);
  if (files.some((path) => !shellFile(path))) throw new RangeError('Only minimal public shell files can be precached');
  if (artFiles.some((path) => !/^art\/[a-z0-9/._-]+\.(png|svg|webp|avif)$/.test(path) || path.split('/').includes('..'))) throw new RangeError('Invalid public artwork allowlist');
  return `
const PREFIX = 'shaker-chaos-shell-';
const ART_PREFIX = 'shaker-chaos-art-';
const CACHE = PREFIX + ${JSON.stringify(version)};
const ART_CACHE = ART_PREFIX + ${JSON.stringify(version)};
const URLS = ${JSON.stringify(files)}.map((file) => new URL(file, self.registration.scope).href);
const ART_URLS = ${JSON.stringify(artFiles)}.map((file) => new URL(file, self.registration.scope).href);
const SHELL = new URL('index.html', self.registration.scope).href;
const MAX_ART_ENTRIES = 32;
let activeScene = new Set();
async function saveArtwork(cache, url, response) {
  if (!response.ok || response.type === 'opaque') return;
  await cache.put(url, response.clone());
  const keys = await cache.keys();
  let excess = keys.length - MAX_ART_ENTRIES;
  for (const key of keys) {
    if (excess <= 0) break;
    if (!activeScene.has(key.url)) { await cache.delete(key); excess--; }
  }
}
async function artwork(request) {
  const url = typeof request === 'string' ? request : request.url;
  const cache = await caches.open(ART_CACHE);
  const cached = await cache.match(url, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  await saveArtwork(cache, url, response);
  return response;
}
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(URLS)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => (key.startsWith(PREFIX) && key !== CACHE) || (key.startsWith(ART_PREFIX) && key !== ART_CACHE)).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_SCENE') return;
  const paths = event.data.paths;
  let urls;
  try { urls = Array.isArray(paths) && paths.every((path) => typeof path === 'string') ?
    [...new Set(paths.map((path) => new URL(path, self.registration.scope).href))] : []; }
  catch { event.ports?.[0]?.postMessage({ ok: false }); return; }
  if (!urls.length || urls.length > MAX_ART_ENTRIES || urls.some((url) => !ART_URLS.includes(url))) {
    event.ports?.[0]?.postMessage({ ok: false }); return;
  }
  activeScene = new Set(urls);
  event.waitUntil(Promise.all(urls.map(artwork)).then((responses) => {
    event.ports?.[0]?.postMessage({ ok: responses.every((response) => response.ok) });
  }).catch(() => { event.ports?.[0]?.postMessage({ ok: false }); }));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url), base = new URL(self.registration.scope);
  if (url.origin !== base.origin) return;
  if (request.mode === 'navigate' && (url.pathname === base.pathname || url.href === SHELL)) {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match(SHELL, { ignoreVary: true })).then((cached) => cached || fetch(request))); return;
  }
  if (URLS.includes(url.href)) {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match(request, { ignoreVary: true })).then((cached) => cached || fetch(request))); return;
  }
  if (ART_URLS.includes(url.href)) event.respondWith(artwork(request));
});
`;
}
