import '../src/content/recipeCatalog.ts';
import { productionStore } from '../src/content/storeCatalog.ts';
import { validateStore } from '../src/application/store.ts';
import { allRuntimePaths } from '../src/content/runtimeVariants.ts';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { assertProductionBoundaries } from './production-boundaries.mjs';
import { serviceWorkerSource } from './service-worker-source.mjs';
import { publicVisualCatalog } from '../src/content/publicVisualCatalog.ts';
import { validateVisualCatalog } from '../src/content/visualPlan.ts';
import { publicContentCatalog } from '../src/content/publicContentCatalog.ts';
import { validatePublicContent } from '../src/content/contentValidation.ts';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(folder, prefix = '') {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(folder, entry.name), prefix + entry.name + '/') : prefix + entry.name))).flat().sort();
}
validateStore(productionStore, publicContentCatalog);
validateVisualCatalog(publicVisualCatalog);
validatePublicContent(publicContentCatalog, publicVisualCatalog);
const files = (await walk(dist)).filter((file) => file !== 'sw.js');
assertProductionBoundaries(await Promise.all(files.filter(file => /\.(js|css|html)$/.test(file)).map(async file => [file, await readFile(join(dist, file), 'utf8')])), files);
const artwork = [...new Set(Object.values(publicVisualCatalog.assets).flatMap(allRuntimePaths))].sort();
const shell = files.filter((file) => ['index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'].includes(file) ||
  /^assets\/[a-zA-Z0-9_-]+\.(js|css)$/.test(file));
if (files.some((file) => !shell.includes(file) && !artwork.includes(file)) || artwork.some((file) => !files.includes(file)))
  throw new Error('Unclassified public output or missing public artwork; review delivery before building');
const hash = createHash('sha256');
hash.update(await readFile(new URL('./service-worker-source.mjs', import.meta.url)));
for (const file of files) { hash.update(file); hash.update(await readFile(join(dist, file))); }
const version = hash.digest('hex').slice(0, 16);
await writeFile(join(dist, 'sw.js'), serviceWorkerSource(version, shell, artwork));
console.log('Offline shell: ' + shell.length + ' files; ' + artwork.length + ' public art paths allowed on demand, zero art precached; cache ' + version);
