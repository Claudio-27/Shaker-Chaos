import { planSceneAssets, resolveAsset } from '../content/visualPlan.ts';
import type { SceneSelection, VisualCatalog } from '../content/visualModel.ts';
/** Warm only current visible public assets; variants load when rendered. */
export function primeSceneVisuals(catalog: VisualCatalog, selection: SceneSelection, baseUrl: string): () => void {
  for (const id of planSceneAssets(catalog, selection).critical) {
    const image = new Image();
    image.decoding = 'async'; image.src = baseUrl + resolveAsset(catalog, id).path;
  }
  return () => {};
}
