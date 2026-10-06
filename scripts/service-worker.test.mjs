import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { serviceWorkerSource } from './service-worker-source.mjs';

function worker() {
  const listeners = {};
  const deleted = [];
  const precached = [];
  const cache = { addAll: async (urls) => precached.push(...urls), match: async (request, options) => request.headers?.origin && !options?.ignoreVary ? undefined : ({ cached: true }) };
  runInNewContext(serviceWorkerSource('test', ['index.html', 'assets/app.js']), {
    URL,
    self: { registration: { scope: 'http://localhost/game/' }, clients: { claim: async () => {} }, addEventListener: (name, callback) => { listeners[name] = callback; } },
    caches: { open: async () => cache, keys: async () => ['shaker-chaos-shell-test', 'shaker-chaos-shell-old', 'other-application'], delete: async (key) => deleted.push(key) },
    fetch: async () => ({ network: true }),
  });
  return { listeners, deleted, precached };
}

test('install precaches only build assets relative to deployment scope', async () => {
  const { listeners, precached } = worker();
  let pending;
  listeners.install({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.deepEqual(precached, ['http://localhost/game/index.html', 'http://localhost/game/assets/app.js']);
});

test('activation removes only old Shaker-Chaos caches', async () => {
  const { listeners, deleted } = worker();
  let pending;
  listeners.activate({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.deepEqual(deleted, ['shaker-chaos-shell-old']);
});

test('worker never intercepts API, private, foreign, non-GET or out-of-scope requests', () => {
  const { listeners } = worker();
  for (const [url, method, mode] of [
    ['http://localhost/game/api/profile', 'GET', 'cors'],
    ['http://localhost/game/vault/secret', 'GET', 'navigate'],
    ['http://localhost/another/', 'GET', 'navigate'],
    ['https://example.invalid/game/assets/app.js', 'GET', 'cors'],
    ['http://localhost/game/assets/app.js', 'POST', 'cors'],
  ]) {
    let intercepted = false;
    listeners.fetch({ request: { url, method, mode }, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false, url);
  }
});

test('public shell navigations and exact static assets can be served offline', async () => {
  const { listeners } = worker();
  for (const [url, mode] of [['http://localhost/game/', 'navigate'], ['http://localhost/game/assets/app.js', 'cors']]) {
    let response;
    listeners.fetch({ request: { url, method: 'GET', mode }, respondWith: (promise) => { response = promise; } });
    assert.deepEqual(await response, { cached: true });
  }
});


test('precache remains usable when a public module request has a different Origin header', async () => {
  const { listeners } = worker();
  let response;
  listeners.fetch({
    request: { url: 'http://localhost/game/assets/app.js', method: 'GET', mode: 'cors', headers: { origin: 'http://localhost' } },
    respondWith: (promise) => { response = promise; },
  });
  assert.deepEqual(await response, { cached: true });
});
