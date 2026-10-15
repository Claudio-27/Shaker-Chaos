import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { publicContentCatalog, publicContentItem } from './publicContentCatalog.ts';
import { publicVisualCatalog as visuals } from './publicVisualCatalog.ts';
import { validatePublicContent } from './contentValidation.ts';
import { replaceVisualSlot, validateLoadout } from './visualLoadout.ts';
import { environmentBackground, ingredientVisuals, optionalAsset, planSceneAssets, resolveAsset, selectedEffect, validateVisualCatalog } from './visualPlan.ts';
import type { AssetId, ImageAssetDefinition, VisualLoadout } from './visualModel.ts';
import { gameDependencies } from '../application/bootstrap.ts';
import { newGame, transitionGame } from '../application/game.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import { volumeUnits } from '../domain/quantity.ts';
const loadout: VisualLoadout = { bartenderId: 'bartender.b01', environmentId: 'environment.e01', counterId: 'counter.c01', bottleSetId: 'bottles.supplied' };
test('every public item and bundle resolves with a unique canonical identity', () => {
  validatePublicContent(publicContentCatalog, visuals);
  const shared = publicContentItem('environment.e01');
  const memberships = publicContentCatalog.bundles.filter((bundle) => bundle.includedContentIds.includes(shared.id));
  assert.ok(memberships.length > 1);
  for (const bundle of memberships) assert.equal(publicContentItem(bundle.includedContentIds.find((id) => id === shared.id)!), shared);
  assert.throws(() => validatePublicContent({ ...publicContentCatalog, items: [...publicContentCatalog.items, shared] }, visuals), RangeError);
  assert.throws(() => validatePublicContent({ ...publicContentCatalog, bundles: [{ ...publicContentCatalog.bundles[0]!, includedContentIds: ['private.nonexistent'] }] }, visuals), RangeError);
});
test('public catalog rejects protected items and invalid price metadata', () => {
  const original = publicContentCatalog.items[0]!;
  for (const changed of [{ ...original, visibility: 'private' as const }, { ...original, price: { currency: 'synthetic', amount: 0.5 } }])
    assert.throws(() => validatePublicContent({ items: [changed], bundles: [] }, visuals), RangeError);
  assert.throws(() => validatePublicContent({ ...publicContentCatalog, bundles: [{ ...publicContentCatalog.bundles[0]!, visibility: 'private' }] }, visuals), RangeError);
});
test('display-name changes retain technical IDs and bundle references', () => {
  const renamed = { ...publicContentCatalog, items: publicContentCatalog.items.map((item) => ({ ...item, displayName: 'Synthetic renamed label' })) };
  validatePublicContent(renamed, visuals);
  assert.deepEqual(renamed.items.map((item) => item.id), publicContentCatalog.items.map((item) => item.id));
  assert.deepEqual(renamed.bundles, publicContentCatalog.bundles);
});
test('all bartender, environment and counter combinations resolve independently', () => {
  for (const bartenderId of Object.keys(visuals.bartenders)) for (const environmentId of Object.keys(visuals.environments)) for (const counterId of Object.keys(visuals.counters)) {
    const combined = { ...loadout, bartenderId, environmentId, counterId };
    validateLoadout(visuals, combined);
    const plan = planSceneAssets(visuals, { ...combined, ingredientIds: ['orchard', 'citrus', 'soda'] });
    assert.ok(plan.critical.includes(visuals.bartenders[bartenderId]!.idle));
    assert.ok(plan.critical.includes(environmentBackground(visuals,visuals.environments[environmentId]!).preferred));
    assert.ok(plan.critical.includes(visuals.counters[counterId]!.surface));
  }
  const next = replaceVisualSlot(loadout, 'bartenderId', 'bartender.b02');
  assert.equal(next.environmentId, loadout.environmentId); assert.equal(next.counterId, loadout.counterId);
  assert.equal(replaceVisualSlot(next, 'environmentId', 'studio').bartenderId, 'bartender.b02');
  assert.throws(() => validateLoadout(visuals, { ...loadout, bartenderId: 'constructor' }), RangeError);
  assert.notEqual(next, loadout); assert.equal(loadout.bartenderId, 'bartender.b01');
});
test('changing cosmetic slots preserves served history, quantities and exact scoring', () => {
  let game = newGame(gameDependencies.mixingRules);
  game = transitionGame(game, { type: 'PourStarted', operationId: 1, ingredientId: 'orchard', atMs: 0 }, gameDependencies);
  game = transitionGame(game, { type: 'PourTick', operationId: 1, ingredientId: 'orchard', requestedUnits: volumeUnits(60), atMs: 1 }, gameDependencies);
  game = transitionGame(game, { type: 'Served', atMs: 2 }, gameDependencies);
  const snapshot = JSON.stringify(game), result = gameDependencies.scoringEngine.evaluate(createCompatibilityInput(game.session));
  for (const next of [replaceVisualSlot(loadout, 'counterId', 'counter.studio'), replaceVisualSlot(loadout, 'bartenderId', 'bartender.b02'), replaceVisualSlot(loadout, 'bottleSetId', 'bottles.placeholder')]) {
    planSceneAssets(visuals, { ...next, ingredientIds: ['orchard'] });
    assert.equal(JSON.stringify(game), snapshot);
    assert.deepEqual(gameDependencies.scoringEngine.evaluate(createCompatibilityInput(game.session)), result);
  }
});
test('idle planning excludes variants, effects and other active-slot alternatives', () => {
  const plan = planSceneAssets(visuals, { ...loadout, ingredientIds: ['orchard', 'citrus', 'soda'] });
  assert.equal(plan.deferred.length, 0);
  assert.ok(plan.critical.length < Object.keys(visuals.assets).length);
  for (const id of ['bartender.b01.tasting', 'bartender.b01.rough', 'bartender.b01.excellent', 'bartender.b02.idle', 'environment.studio.background', 'environment.studio.counter', 'effect.sparkles'] as const)
    assert.ok(!plan.critical.includes(id), id);
  assert.ok(plan.critical.includes('gameplay.martini-glass'), 'offline serving needs the active glass');
});
test('portraits, selected bottles and effects have deterministic optional fallbacks', () => {
  const missing: AssetId = 'effect.synthetic-missing';
  assert.equal(optionalAsset(visuals, missing), undefined);
  assert.equal(optionalAsset(visuals, missing, 'bartender.b01.idle'), 'bartender.b01.idle');
  const catalog = { ...visuals, bartenders: { ...visuals.bartenders, 'bartender.b01': { ...visuals.bartenders['bartender.b01']!, portrait: missing } },
    effects: { ...visuals.effects, 'effect.sparkles': { id: 'effect.sparkles', asset: missing } },
    ingredients: { ...visuals.ingredients, orchard: { ...visuals.ingredients.orchard!, selectedBottle: missing } } };
  validateVisualCatalog(catalog);
  assert.equal(selectedEffect(catalog, loadout), undefined);
  assert.deepEqual(planSceneAssets(catalog, { ...loadout, ingredientIds: ['orchard'] }), planSceneAssets(catalog, { ...loadout, ingredientIds: ['orchard'] }));
  assert.equal(selectedEffect(visuals, { ...loadout, bartenderId: 'bartender.b02' }), 'effect.ice-blue');
  assert.equal(selectedEffect(visuals, { ...loadout, bartenderId: 'bartender.b02', effectOverride: 'effect.sparkles' }), 'effect.sparkles');
  assert.equal(selectedEffect(visuals, { ...loadout, effectOverride: null }), undefined);
});
test('public manifests cannot resolve private URLs or protected assets disguised as public paths', () => {
  assert.throws(() => resolveAsset(visuals, 'bartender.private.idle'), RangeError);
  const protectedAsset = { path: 'art/protected.png', width: 10, height: 10, format: 'png', visibility: 'private' } as unknown as ImageAssetDefinition;
  const catalog = { ...visuals, assets: { ...visuals.assets, 'bartender.private.idle': protectedAsset } };
  assert.throws(() => validateVisualCatalog(catalog), RangeError);
  assert.throws(() => resolveAsset(catalog, 'bartender.private.idle'), RangeError);
});
test('bottle cosmetics change only visual references, preserving ingredient identity and liquid metadata', () => {
  const supplied = ingredientVisuals(visuals, loadout, 'orchard');
  const placeholder = ingredientVisuals(visuals, { ...loadout, bottleSetId: 'bottles.placeholder' }, 'orchard');
  assert.equal(supplied.id, placeholder.id); assert.deepEqual(supplied.liquid, placeholder.liquid);
  assert.equal(supplied.bottle, 'ingredient.bottle03'); assert.notEqual(supplied.bottle, placeholder.bottle);
});
test('all 21 source copies retain their inventoried byte hashes and dimensions', async () => {
  const rows: { path: string; sha256: string; width: number; height: number }[] = JSON.parse(await readFile(new URL('../../docs/artwork-inventory.json', import.meta.url), 'utf8'));
  assert.equal(rows.length, 21);
  for (const row of rows) {
    const bytes = await readFile(new URL('../../art-source/' + row.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.path);
    assert.equal(bytes.readUInt32BE(16), row.width); assert.equal(bytes.readUInt32BE(20), row.height);
  }
});
