import type { VisualCatalog } from '../content/visualModel.ts';
/** Used only by the lazy DEV regression scene. Exercises real image onError fallbacks. */
export function withCleanBackgroundFailure(catalog: VisualCatalog): VisualCatalog {
  const id = catalog.environments['environment.e01']!.backgroundClean;
  const asset = id && catalog.assets[id];
  if (!id || !asset?.runtime) return catalog;
  const variants = asset.runtime.variants;
  return { ...catalog, assets: { ...catalog.assets, [id]: { ...asset, runtime: { ...asset.runtime, variants: {
    '1x': { ...variants['1x'], path: '__art-source/__CLEAN_BACKGROUND_FAILURE_DEV_ONLY/1x.png' },
    '2x': { ...variants['2x'], path: '__art-source/__CLEAN_BACKGROUND_FAILURE_DEV_ONLY/2x.png' },
  } } } } };
}
