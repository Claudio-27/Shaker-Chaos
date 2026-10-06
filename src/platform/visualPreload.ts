import { planSceneAssets, resolveAsset } from '../content/visualPlan.ts';
import type { SceneSelection, VisualCatalog } from '../content/visualModel.ts';

/** Only public assets of the injected active scene. No progress/unlock decisions here. */
export function primeSceneVisuals(catalog: VisualCatalog, selection: SceneSelection, baseUrl: string): () => void {
  const plan = planSceneAssets(catalog, selection);
  const warm = (ids: readonly (keyof VisualCatalog['assets'])[]) => {
    for (const id of ids) {
      const image = new Image();
      image.decoding = 'async';
      image.src = `${baseUrl}${resolveAsset(catalog, id).path}`;
    }
  };
  warm(plan.critical);
  if ('requestIdleCallback' in window) {
    const idle = window.requestIdleCallback(() => warm(plan.deferred), { timeout: 1500 });
    return () => window.cancelIdleCallback(idle);
  }
  const timer = globalThis.setTimeout(() => warm(plan.deferred), 300);
  return () => globalThis.clearTimeout(timer);
}