import { environmentBackground, planSceneAssets, resolveAsset } from './visualPlan.ts';
import { runtimeCandidates } from './runtimeVariants.ts';
import type { RasterDemand } from './runtimeVariants.ts';
import type { SceneSelection, VisualCatalog } from './visualModel.ts';
/** Ordered, bounded fallback chain shared by preload and offline warm. No speculative downloads. */
export function sceneDownloads(catalog: VisualCatalog, selection: SceneSelection, demand: RasterDemand) {
  const background = environmentBackground(catalog, catalog.environments[selection.environmentId]!);
  const pathsFor = (id: Parameters<typeof resolveAsset>[1]) => { const asset = resolveAsset(catalog, id); const variants = runtimeCandidates(asset, demand); return variants.length ? variants.map(v => v.path) : [asset.path]; };
  const paths: string[] = [], fallbackPaths: Record<string, string[]> = {};
  for (const id of planSceneAssets(catalog, selection).critical) {
    const candidates = pathsFor(id);
    if (id === background.preferred && id !== background.legacy) candidates.push(...pathsFor(background.legacy));
    const [primary, ...alternatives] = [...new Set(candidates)];
    paths.push(primary!);
    if (alternatives.length) fallbackPaths[primary!] = alternatives;
  }
  return { paths, fallbackPaths };
}
