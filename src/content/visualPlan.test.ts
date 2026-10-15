import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { publicCatalog } from './publicCatalog.ts';
import { publicVisualCatalog } from './publicVisualCatalog.ts';
import { planSceneAssets, selectReactionId, validateVisualCatalog } from './visualPlan.ts';
import type { VisualCatalog } from './visualModel.ts';

const activeScene = { bartenderId: 'milo', environmentId: 'studio', counterId: 'counter.studio', ingredientIds: publicCatalog.ingredients.map((item) => item.id) };

test('public content resolves to real repository-owned PNGs and SVGs with declared intrinsic dimensions', async () => {
  validateVisualCatalog(publicVisualCatalog);
  for (const ingredient of publicCatalog.ingredients) assert.ok(publicVisualCatalog.ingredients[ingredient.id]);
  for (const bartender of publicCatalog.bartenders) assert.ok(publicVisualCatalog.bartenders[bartender.id]);
  for (const asset of Object.values(publicVisualCatalog.assets)) {
    assert.ok(asset);
    const bytes = await readFile(new URL('../../public/' + asset.path, import.meta.url));
    if (asset.format === 'png') {
      assert.equal(bytes.readUInt32BE(16), asset.runtime?.variants['1x'].width ?? asset.width); assert.equal(bytes.readUInt32BE(20), asset.runtime?.variants['1x'].height ?? asset.height);
    } else {
      const source = bytes.toString('utf8');
      assert.ok(source.includes('viewBox="0 0 ' + asset.width + ' ' + asset.height + '"'), asset.path);
      assert.ok(!source.includes('href="http'), asset.path);
    }
  }
});

test('invalid paths, dimensions, references, sequences and fill regions fail before rendering', () => {
  const broken = (changes: Partial<VisualCatalog>) => ({ ...publicVisualCatalog, ...changes });
  for (const replacement of [
    { path: 'https://example.invalid/image.svg', width: 1, height: 1, format: 'svg' as const, visibility: 'public' as const },
    { path: 'art/../secret.svg', width: 1, height: 1, format: 'svg' as const, visibility: 'public' as const },
    { path: 'art/a.svg', width: 0, height: 1, format: 'svg' as const, visibility: 'public' as const },
    { path: 'art/a.svg', width: 1, height: 1, format: 'png' as const, visibility: 'public' as const },
  ]) assert.throws(() => validateVisualCatalog(broken({ assets: { ...publicVisualCatalog.assets, 'bartender.milo.idle': replacement } })), RangeError);
  const milo = publicVisualCatalog.bartenders.milo!;
  assert.throws(() => validateVisualCatalog(broken({ bartenders: { milo: { ...milo, idle: 'bartender.missing.idle' } } })), RangeError);
  assert.throws(() => validateVisualCatalog(broken({ bartenders: { milo: { ...milo, tasting: { frames: [], frameDurationMs: 100 } } } })), RangeError);
  assert.throws(() => validateVisualCatalog(broken({ gameplay: { ...publicVisualCatalog.gameplay,
    liquidWindows: { ...publicVisualCatalog.gameplay.liquidWindows, shaker: { leftPercent: 90, topPercent: 0, widthPercent: 20, heightPercent: 50 } } } })), RangeError);
  assert.throws(() => planSceneAssets(publicVisualCatalog, { ...activeScene, ingredientIds: ['missing'] }), RangeError);
});

test('active-scene planning excludes other bartenders, environments and invisible ingredients', () => {
  const milo = publicVisualCatalog.bartenders.milo!;
  const studio = publicVisualCatalog.environments.studio!;
  const alternative: VisualCatalog = {
    ...publicVisualCatalog,
    assets: { ...publicVisualCatalog.assets,
      'bartender.nova.idle': { path: 'art/synthetic/nova.svg', width: 1000, height: 500, format: 'svg', visibility: 'public' },
      'environment.night.background': { path: 'art/synthetic/night.svg', width: 800, height: 800, format: 'svg', visibility: 'public' },
      'ingredient.hidden.bottle': { path: 'art/synthetic/hidden.svg', width: 80, height: 200, format: 'svg', visibility: 'public' },
    },
    bartenders: { ...publicVisualCatalog.bartenders, nova: { ...milo, id: 'nova', idle: 'bartender.nova.idle' } },
    environments: { ...publicVisualCatalog.environments, night: { ...studio, id: 'night', background: 'environment.night.background' } },
    ingredients: { ...publicVisualCatalog.ingredients,
      hidden: { id: 'hidden', bottle: 'ingredient.hidden.bottle', icon: 'ingredient.hidden.bottle', liquid: { color: '#000' } } },
  };
  validateVisualCatalog(alternative);
  const planned = planSceneAssets(alternative, activeScene);
  const all = [...planned.critical, ...planned.deferred];
  assert.ok(!all.includes('bartender.nova.idle'));
  assert.ok(!all.includes('environment.night.background'));
  assert.ok(!all.includes('ingredient.hidden.bottle'));
  assert.equal(new Set(all).size, all.length);
  const swapped = planSceneAssets(alternative, { ...activeScene, bartenderId: 'nova', environmentId: 'night' });
  assert.ok(swapped.critical.includes('bartender.nova.idle'));
  assert.ok(swapped.critical.includes('environment.night.background'));
  assert.ok(!swapped.critical.includes('bartender.milo.idle'));
});

test('every demo result tier selects an independent reaction ID and complete bartender sequence', () => {
  const ids = publicCatalog.reactions.map((reaction) => selectReactionId(publicVisualCatalog, reaction.tier));
  assert.equal(new Set(ids).size, publicCatalog.reactions.length);
  for (const id of ids) {
    assert.ok(publicVisualCatalog.reactions[id]);
    for (const bartender of Object.values(publicVisualCatalog.bartenders)) assert.ok(bartender.reactions[id]?.frames.length);
  }
});