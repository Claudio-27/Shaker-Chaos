import fs from 'node:fs';
import { publicVisualCatalog } from '../src/content/publicVisualCatalog.ts';
import { planSceneAssets } from '../src/content/visualPlan.ts';
import { allRuntimePaths } from '../src/content/runtimeVariants.ts';
import { gamePresentation } from '../src/application/productionBootstrap.ts';

const inventory = JSON.parse(fs.readFileSync(new URL('../docs/runtime-art-inventory.json', import.meta.url), 'utf8'));
const byId = new Map(inventory.assets.map(row => [row.id, row]));
const ids = planSceneAssets(publicVisualCatalog, gamePresentation.scene).critical;
const active = ids.map(id => byId.get(id)).filter(Boolean);
const sum = (rows, value) => rows.reduce((total, row) => total + value(row), 0);
const tier = name => ({
  pngBytes: sum(active, row => row.variants[name].bytes),
  rgbaBytes: sum(active, row => row.variants[name].width * row.variants[name].height * 4),
});
const metrics = {
  activeIds: ids,
  activeDistinctImageUrls: ids.length,
  activeRasterCount: active.length,
  before: { pngBytes: sum(active, row => row.sourceBytes), rgbaBytes: sum(active, row => row.sourceRgbaBytes) },
  after1x: tier('1x'),
  after2x: tier('2x'),
  publicRuntimeUrls: new Set(Object.values(publicVisualCatalog.assets).flatMap(allRuntimePaths)).size,
  categories: {},
};
for (const category of ['bartender.b01', 'bartender.b02', 'ingredient', 'gameplay', 'effect', 'counter', 'environment']) {
  const rows = inventory.assets.filter(row => row.id.startsWith(category));
  metrics.categories[category] = {
    sourceBytes: sum(rows, row => row.sourceBytes),
    runtime1x: sum(rows, row => row.variants['1x'].bytes),
    runtime2x: sum(rows, row => row.variants['2x'].bytes),
  };
}
fs.writeFileSync(new URL('../docs/runtime-art-performance.json', import.meta.url), JSON.stringify(metrics, null, 2) + '\n');
console.log(metrics);
