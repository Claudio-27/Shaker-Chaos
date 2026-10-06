import type { ReactionTier } from '../domain/model.ts';
import type { AssetId, ImageAssetDefinition, SceneSelection, VisualCatalog, VisualSequence } from './visualModel.ts';

export function resolveAsset(catalog: VisualCatalog, id: AssetId): ImageAssetDefinition {
  const asset = catalog.assets[id];
  if (!asset) throw new RangeError(`Missing visual asset: ${id}`);
  return asset;
}
export function selectReactionId(catalog: VisualCatalog, tier: ReactionTier) {
  return catalog.reactionByTier[tier];
}

/** A small active-scene plan, not an unlock policy or a global asset pipeline. */
export function planSceneAssets(catalog: VisualCatalog, selection: SceneSelection) {
  const bartender = catalog.bartenders[selection.bartenderId];
  const environment = catalog.environments[selection.environmentId];
  if (!bartender || !environment) throw new RangeError('Unknown active visual scene');
  const critical = new Set<AssetId>([bartender.idle, environment.background, environment.backBar,
    environment.counterForeground, catalog.gameplay.shaker, catalog.gameplay.ice, catalog.gameplay.garnish,
    ...Object.values(catalog.controls), ...(bartender.accessories ?? []),
    ...(environment.decorations ?? []).map((layer) => layer.asset)]);
  const deferred = new Set<AssetId>([bartender.portrait, catalog.gameplay.glass, ...(bartender.effects ?? [])]);
  for (const id of selection.ingredientIds) {
    const ingredient = catalog.ingredients[id];
    if (!ingredient) throw new RangeError(`Missing ingredient visuals: ${id}`);
    critical.add(ingredient.bottle);
    if (ingredient.selectedBottle) critical.add(ingredient.selectedBottle);
    deferred.add(ingredient.icon);
    if (ingredient.liquid.overlay) deferred.add(ingredient.liquid.overlay);
  }
  for (const frame of bartender.tasting?.frames ?? []) deferred.add(frame);
  for (const sequence of Object.values(bartender.reactions)) for (const frame of sequence.frames) deferred.add(frame);
  for (const id of Object.keys(bartender.reactions) as (keyof typeof bartender.reactions)[]) {
    const reaction = catalog.reactions[id];
    if (!reaction) throw new RangeError(`Missing reaction visuals: ${id}`);
    if (reaction.effect) deferred.add(reaction.effect);
  }
  for (const id of critical) { resolveAsset(catalog, id); deferred.delete(id); }
  for (const id of deferred) resolveAsset(catalog, id);
  return { critical: [...critical], deferred: [...deferred] } as const;
}

export function validateVisualCatalog(catalog: VisualCatalog): void {
  for (const [id, asset] of Object.entries(catalog.assets)) {
    if (!asset || !Number.isSafeInteger(asset.width) || asset.width <= 0 || !Number.isSafeInteger(asset.height) || asset.height <= 0) {
      throw new RangeError(`Invalid intrinsic asset dimensions: ${id}`);
    }
    if (!/^art\/[a-z0-9/._-]+\.(svg|png|webp|avif)$/.test(asset.path) || asset.path.split('/').includes('..') || !asset.path.endsWith(`.${asset.format}`)) {
      throw new RangeError(`Asset must be a repository-owned public art path: ${id}`);
    }
  }
  const sequence = (value: VisualSequence) => {
    if (!value.frames.length || !Number.isSafeInteger(value.frameDurationMs) || value.frameDurationMs <= 0) throw new RangeError('Invalid visual sequence');
    value.frames.forEach((id) => resolveAsset(catalog, id));
  };
  for (const [id, bartender] of Object.entries(catalog.bartenders)) {
    if (id !== bartender.id) throw new RangeError('Bartender visual key differs from content ID');
    resolveAsset(catalog, bartender.idle); resolveAsset(catalog, bartender.portrait);
    if (bartender.tasting) sequence(bartender.tasting);
    for (const reactionId of Object.values(catalog.reactionByTier)) {
      const reaction = bartender.reactions[reactionId];
      if (!reaction || !catalog.reactions[reactionId]) throw new RangeError(`Missing bartender reaction: ${reactionId}`);
      sequence(reaction);
    }
    for (const reaction of Object.values(bartender.reactions)) sequence(reaction);
    bartender.accessories?.forEach((id) => resolveAsset(catalog, id));
    bartender.effects?.forEach((id) => resolveAsset(catalog, id));
  }
  for (const reaction of Object.values(catalog.reactions)) if (reaction.effect) resolveAsset(catalog, reaction.effect);
  for (const [id, ingredient] of Object.entries(catalog.ingredients)) {
    if (id !== ingredient.id) throw new RangeError('Ingredient visual key differs from content ID');
    resolveAsset(catalog, ingredient.bottle); resolveAsset(catalog, ingredient.icon);
    if (ingredient.selectedBottle) resolveAsset(catalog, ingredient.selectedBottle);
    if (ingredient.liquid.overlay) resolveAsset(catalog, ingredient.liquid.overlay);
  }
  for (const [id, environment] of Object.entries(catalog.environments)) {
    if (id !== environment.id) throw new RangeError('Environment visual key differs from content ID');
    resolveAsset(catalog, environment.background); resolveAsset(catalog, environment.backBar); resolveAsset(catalog, environment.counterForeground);
    environment.decorations?.forEach((layer) => resolveAsset(catalog, layer.asset));
  }
  [catalog.gameplay.shaker, catalog.gameplay.glass, catalog.gameplay.ice, catalog.gameplay.garnish].forEach((id) => resolveAsset(catalog, id));
  for (const region of Object.values(catalog.gameplay.liquidWindows)) {
  if (!Object.values(region).every((value) => Number.isFinite(value) && value >= 0) || region.widthPercent <= 0 || region.heightPercent <= 0 || region.leftPercent + region.widthPercent > 100 || region.topPercent + region.heightPercent > 100) throw new RangeError('Invalid presentation liquid window');
  }
  Object.values(catalog.controls).forEach((id) => resolveAsset(catalog, id));
}