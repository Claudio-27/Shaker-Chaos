import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { serviceWorkerSource } from './service-worker-source.mjs';
function worker({ offline = false, artCount = 0 } = {}) {
  const listeners = {}, deleted = [], precached = [], fetched = [], art = new Map(), shell = new Map();
  const artPaths = ['art/active.png', ...Array.from({ length: artCount }, (_, i) => 'art/variant-' + i + '.png')];
  const response = (name) => ({ ok: true, type: 'basic', name, clone() { return this; } });
  const shellCache = {
    addAll: async (urls) => { precached.push(...urls); for (const url of urls) shell.set(url, response('cached')); },
    match: async (request, options) => request.headers?.origin && !options?.ignoreVary ? undefined : shell.get(typeof request === 'string' ? request : request.url),
  };
  const artCache = {
    match: async (url) => art.get(url), put: async (url, value) => art.set(url, value),
    keys: async () => [...art.keys()].map((url) => ({ url })),
    delete: async (key) => art.delete(typeof key === 'string' ? key : key.url),
  };
  for (const path of ['index.html', 'assets/app.js']) shell.set('http://localhost/game/' + path, response('cached'));
  runInNewContext(serviceWorkerSource('test', ['index.html', 'assets/app.js'], artPaths), {
    URL, self: { registration: { scope: 'http://localhost/game/' }, clients: { claim: async () => {} }, addEventListener: (name, callback) => { listeners[name] = callback; } },
    caches: { open: async (name) => name.startsWith('shaker-chaos-art-') ? artCache : shellCache,
      keys: async () => ['shaker-chaos-shell-test', 'shaker-chaos-shell-old', 'shaker-chaos-art-test', 'shaker-chaos-art-old', 'other-application'],
      delete: async (key) => deleted.push(key) },
    fetch: async (request) => { const url = typeof request === 'string' ? request : request.url; fetched.push(url); if (offline) throw new Error('offline'); return response(url); },
  });
  return { listeners, deleted, precached, fetched, art };
}
async function fetchFrom(worker, url, mode = 'cors', extra = {}) {
  let pending;
  worker.listeners.fetch({ request: { url, method: 'GET', mode, ...extra }, respondWith: (promise) => { pending = promise; } });
  return pending ? await pending : undefined;
}
async function warm(worker, paths, fallbackPaths = {}) {
  let pending, reply;
  worker.listeners.message({ data: { type: 'CACHE_SCENE', paths, fallbackPaths }, ports: [{ postMessage: (value) => { reply = value; } }], waitUntil: (promise) => { pending = promise; } });
  if (pending) await pending;
  return reply;
}
test('install precaches only build assets relative to deployment scope', async () => {
  const w = worker(); let pending;
  w.listeners.install({ waitUntil: (promise) => { pending = promise; } }); await pending;
  assert.deepEqual(w.precached, ['http://localhost/game/index.html', 'http://localhost/game/assets/app.js']);
  assert.equal(w.art.size, 0); assert.equal(w.fetched.length, 0);
});
test('activation removes only old Shaker-Chaos caches', async () => {
  const w = worker(); let pending;
  w.listeners.activate({ waitUntil: (promise) => { pending = promise; } }); await pending;
  assert.deepEqual(w.deleted, ['shaker-chaos-shell-old', 'shaker-chaos-art-old']);
});
test('worker never intercepts API, private, foreign, non-GET or out-of-scope requests', async () => {
  const w = worker();
  for (const [url, method, mode] of [
    ['http://localhost/game/api/profile', 'GET', 'cors'], ['http://localhost/game/vault/secret', 'GET', 'navigate'],
    ['http://localhost/another/', 'GET', 'navigate'], ['https://example.invalid/game/assets/app.js', 'GET', 'cors'],
    ['http://localhost/game/assets/app.js', 'POST', 'cors'], ['http://localhost/game/art/unlisted.png', 'GET', 'cors'],
  ]) assert.equal(await fetchFrom(w, url, mode, { method }), undefined, url);
});
test('public shell navigations and exact static assets can be served offline', async () => {
  const w = worker({ offline: true });
  for (const [url, mode] of [['http://localhost/game/', 'navigate'], ['http://localhost/game/assets/app.js', 'cors']])
    assert.equal((await fetchFrom(w, url, mode)).name, 'cached');
  assert.equal(w.fetched.length, 0);
});
test('precache remains usable when a public module request has a different Origin header', async () => {
  assert.equal((await fetchFrom(worker({ offline: true }), 'http://localhost/game/assets/app.js', 'cors', { headers: { origin: 'http://localhost' } })).name, 'cached');
});
test('artwork is cached only on demand and reused when the network is unavailable', async () => {
  const w = worker();
  await fetchFrom(w, 'http://localhost/game/art/active.png');
  assert.equal(w.art.size, 1); assert.equal(w.fetched.length, 1);
  await fetchFrom(w, 'http://localhost/game/art/active.png');
  assert.equal(w.fetched.length, 1);
});
test('explicit scene warm includes only approved active public paths and acknowledges completion', async () => {
  const w = worker({ artCount: 3 });
  assert.equal((await warm(w, ['art/active.png', 'art/active.png'])).ok, true);
  assert.deepEqual([...w.art.keys()], ['http://localhost/game/art/active.png']);
  assert.equal(w.fetched.length, 1);
});
test('private and invalid scene warm requests fail without fetching any path', async () => {
  const w = worker();
  for (const paths of [[], ['http://['], ['vault/private.png'], ['art/not-listed.png'], ['https://example.invalid/art/active.png'], ['art/active.png', 'api/private']])
    assert.equal((await warm(w, paths)).ok, false);
  assert.equal(w.fetched.length, 0);
  assert.throws(() => serviceWorkerSource('test', ['art/private.png']), RangeError);
  assert.throws(() => serviceWorkerSource('test', ['vault/private.js']), RangeError);
  assert.throws(() => serviceWorkerSource('test', [], ['vault/private.png']), RangeError);
});
test('unavailable active artwork does not falsely report an offline-ready scene', async () => {
  const w = worker({ offline: true });
  assert.equal((await warm(w, ['art/active.png'])).ok, false);
  assert.equal(w.art.size, 0);
});
test('runtime cache stays bounded while retaining pinned active-scene images', async () => {
  const w = worker({ artCount: 40 });
  await warm(w, ['art/active.png']);
  for (let i = 0; i < 40; i++) await fetchFrom(w, 'http://localhost/game/art/variant-' + i + '.png');
  assert.equal(w.art.size, 32); assert.ok(w.art.has('http://localhost/game/art/active.png'));
});

test('scene warm does not download alternate resolutions when preferred files succeed',async()=>{
 const w=worker({artCount:1});assert.equal((await warm(w,['art/active.png'],{'art/active.png':'art/variant-0.png'})).ok,true);
 assert.deepEqual(w.fetched,['http://localhost/game/art/active.png']);assert.equal(w.art.size,1);
});
test('offline scene warm succeeds from the other cached resolution without needing masters',async()=>{
 const w=worker({offline:true,artCount:1});w.art.set('http://localhost/game/art/variant-0.png',{ok:true,type:'basic'});
 assert.equal((await warm(w,['art/active.png'],{'art/active.png':'art/variant-0.png'})).ok,true);
 assert.deepEqual(w.fetched,['http://localhost/game/art/active.png']);assert.equal(w.art.size,1);
});
test('scene fallback validation rejects private paths and unrequested sources before fetching',async()=>{
 for(const alternatives of [{'art/active.png':'../art-source/master.png'},{'art/not-requested.png':'art/variant-0.png'},{'art/active.png':'https://example.invalid/secret'}]){
  const w=worker({artCount:1});assert.equal((await warm(w,['art/active.png'],alternatives)).ok,false);assert.equal(w.fetched.length,0);
 }
});
