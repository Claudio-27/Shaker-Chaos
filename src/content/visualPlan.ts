import type { ReactionTier } from '../domain/model.ts';
import type { AssetId, ImageAssetDefinition, SceneSelection, VisualCatalog, VisualLoadout, VisualSequence } from './visualModel.ts';
import { validateLoadout } from './visualLoadout.ts';
export function resolveAsset(catalog: VisualCatalog, id: AssetId): ImageAssetDefinition {
  const asset = catalog.assets[id];
  if (!asset || asset.visibility !== 'public') throw new RangeError('Missing public visual asset: ' + id);
  return asset;
}
/** Optional references resolve deterministically; required references always use resolveAsset. */
export function optionalAsset(catalog: VisualCatalog, id: AssetId | undefined, fallback?: AssetId): AssetId | undefined {
  if (id && catalog.assets[id]?.visibility === 'public') return id;
  if (fallback) { resolveAsset(catalog, fallback); return fallback; }
  return undefined;
}
export function selectReactionId(catalog: VisualCatalog, tier: ReactionTier) { return catalog.reactionByTier[tier]; }
export function selectedEffect(catalog: VisualCatalog, loadout: VisualLoadout): AssetId | undefined {
  const id = loadout.effectOverride === undefined ? catalog.bartenders[loadout.bartenderId]?.defaultEffectId : loadout.effectOverride;
  return id ? optionalAsset(catalog, catalog.effects[id]?.asset) : undefined;
}
export function ingredientVisuals(catalog: VisualCatalog, loadout: VisualLoadout, id: string) {
  const original = catalog.ingredients[id];
  if (!original) throw new RangeError('Missing ingredient visuals: ' + id);
  const bottle = loadout.bottleSetId ? catalog.bottleSets[loadout.bottleSetId]?.bottles[id] : undefined;
  return bottle ? { ...original, bottle, selectedBottle: undefined } : original;
}
/** Only currently visible assets. Reaction variants and effects load when rendered, never at idle. */
export function planSceneAssets(catalog: VisualCatalog, selection: SceneSelection) {
  validateLoadout(catalog, selection);
  const bartender = catalog.bartenders[selection.bartenderId]!;
  const environment = catalog.environments[selection.environmentId]!;
  const critical = new Set<AssetId>([bartender.idle, environment.background, catalog.counters[selection.counterId]!.surface,
    catalog.gameplay.shaker, catalog.gameplay.glass, catalog.gameplay.ice, catalog.gameplay.garnish,
    ...Object.values(catalog.controls), ...(bartender.accessories ?? []), ...(environment.decorations ?? []).map((layer) => layer.asset)]);
  if (environment.backBar) critical.add(environment.backBar);
  const portrait = optionalAsset(catalog, bartender.portrait, bartender.idle);
  if (portrait) critical.add(portrait);
  for (const id of selection.ingredientIds) {
    const ingredient = ingredientVisuals(catalog, selection, id);
    critical.add(ingredient.bottle);
    const overlay = optionalAsset(catalog, ingredient.liquid.overlay);
    if (overlay && catalog.gameplay.liquidMode !== 'meter') critical.add(overlay);
  }
  for (const id of critical) resolveAsset(catalog, id);
  return { critical: [...critical], deferred: [] as AssetId[] } as const;
}
export function validateVisualCatalog(catalog: VisualCatalog): void {
  for (const [id, asset] of Object.entries(catalog.assets)) {
    if (!asset || asset.visibility !== 'public' || !Number.isSafeInteger(asset.width) || asset.width <= 0 || !Number.isSafeInteger(asset.height) || asset.height <= 0)
      throw new RangeError('Invalid public asset dimensions or delivery: ' + id);
    if (!/^art\/[a-z0-9/._-]+\.(svg|png|webp|avif)$/.test(asset.path) || asset.path.split('/').includes('..') || !asset.path.endsWith('.' + asset.format))
      throw new RangeError('Asset must be a repository-owned public art path: ' + id);
  }
  const sequence = (value: VisualSequence) => {
    if (!value.frames.length || !Number.isSafeInteger(value.frameDurationMs) || value.frameDurationMs <= 0) throw new RangeError('Invalid visual sequence');
    value.frames.forEach((id) => resolveAsset(catalog, id));
  };
  for (const [id, bartender] of Object.entries(catalog.bartenders)) {
    if (id !== bartender.id) throw new RangeError('Bartender visual key differs from content ID');
    resolveAsset(catalog, bartender.idle);
    if (bartender.tasting) sequence(bartender.tasting);
    for (const reactionId of Object.values(catalog.reactionByTier)) {
      const reaction = bartender.reactions[reactionId];
      if (!reaction || !catalog.reactions[reactionId]) throw new RangeError('Missing bartender reaction: ' + reactionId);
      sequence(reaction);
    }
    for (const reaction of Object.values(bartender.reactions)) sequence(reaction);
    bartender.accessories?.forEach((id) => resolveAsset(catalog, id));
    // Portrait and effects are explicitly optional: unresolved references use documented fallbacks.
  }
  for (const [id, ingredient] of Object.entries(catalog.ingredients)) {
    if (id !== ingredient.id) throw new RangeError('Ingredient visual key differs from content ID');
    resolveAsset(catalog, ingredient.bottle); resolveAsset(catalog, ingredient.icon);
  }
  for (const [id, environment] of Object.entries(catalog.environments)) {
    if (id !== environment.id) throw new RangeError('Environment visual key differs from content ID');
    resolveAsset(catalog, environment.background);
    if (environment.backBar) resolveAsset(catalog, environment.backBar);
    environment.decorations?.forEach((layer) => resolveAsset(catalog, layer.asset));
  }
  for (const [id, counter] of Object.entries(catalog.counters)) {
    if (id !== counter.id || !['contain', 'cover'].includes(counter.fit)) throw new RangeError('Invalid counter definition');
    resolveAsset(catalog, counter.surface);
  }
  for (const [id, effect] of Object.entries(catalog.effects)) if (id !== effect.id) throw new RangeError('Invalid effect ID');
  for (const [id, set] of Object.entries(catalog.bottleSets)) {
    if (id !== set.id) throw new RangeError('Invalid bottle set ID');
    for (const [ingredientId, asset] of Object.entries(set.bottles)) {
      if (!catalog.ingredients[ingredientId]) throw new RangeError('Unknown bottle ingredient');
      resolveAsset(catalog, asset);
    }
  }
  [catalog.gameplay.shaker, catalog.gameplay.glass, catalog.gameplay.ice, catalog.gameplay.garnish, ...Object.values(catalog.controls)].forEach((id) => resolveAsset(catalog, id));
  for (const region of Object.values(catalog.gameplay.liquidWindows)) {
    if (!Object.values(region).every((value) => Number.isFinite(value) && value >= 0) || region.widthPercent <= 0 || region.heightPercent <= 0 ||
      region.leftPercent + region.widthPercent > 100 || region.topPercent + region.heightPercent > 100) throw new RangeError('Invalid presentation liquid window');
  }
}
