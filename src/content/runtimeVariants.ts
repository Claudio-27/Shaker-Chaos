import type { ImageAssetDefinition, RuntimeRasterVariant } from './visualModel.ts';
export interface RasterDemand { readonly scale: number; readonly canonical: boolean }
/** Resolution tier only. Never a game/scoring input; no source URL can be selected. */
export function runtimeCandidates(asset: ImageAssetDefinition, demand: RasterDemand): readonly RuntimeRasterVariant[] {
  if (!asset.runtime) return [];
  const first = demand.scale > 1.8 ? '2x' : '1x', second = first === '1x' ? '2x' : '1x';
  return [asset.runtime.variants[first], asset.runtime.variants[second]].filter((variant,index,all)=>all.findIndex(other=>other.path===variant.path)===index);
}
export function runtimePath(asset: ImageAssetDefinition, demand: RasterDemand): string { return runtimeCandidates(asset,demand)[0]?.path ?? asset.path; }
export function allRuntimePaths(asset: ImageAssetDefinition): readonly string[] { return asset.runtime ? [...new Set(Object.values(asset.runtime.variants).map(v=>v.path))] : [asset.path]; }
