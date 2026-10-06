import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { serviceWorkerSource } from './service-worker-source.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(folder, prefix = '') {
  const entries = await readdir(folder, { withFileTypes: true });
  const paths = await Promise.all(entries.map((entry) => {
    const relative = prefix + entry.name;
    return entry.isDirectory() ? walk(join(folder, entry.name), relative + '/') : relative;
  }));
  return paths.flat().sort();
}
const files = (await walk(dist)).filter((file) => file !== 'sw.js');
const hash = createHash('sha256');
for (const file of files) { hash.update(file); hash.update(await readFile(join(dist, file))); }
const version = hash.digest('hex').slice(0, 16);
await writeFile(join(dist, 'sw.js'), serviceWorkerSource(version, files));
console.log(`Offline shell: ${files.length} public build files, cache ${version}`);
