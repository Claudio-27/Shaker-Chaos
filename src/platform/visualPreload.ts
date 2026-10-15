import { sceneDownloads } from '../content/sceneDownloads.ts';
import { readRasterDemand } from './visualViewport.ts';
import type { SceneSelection, VisualCatalog } from '../content/visualModel.ts';
/** Warm current visible assets only; follow alternatives only after a delivery failure. */
export function primeSceneVisuals(catalog: VisualCatalog, selection: SceneSelection, baseUrl: string): () => void {
  const { paths, fallbackPaths } = sceneDownloads(catalog, selection, readRasterDemand());
  const images = paths.map(path => {
    const image = new Image(), candidates = [path, ...(fallbackPaths[path] ?? [])];
    let index = 0;
    image.decoding = 'async';
    image.onerror = () => { if (++index < candidates.length) image.src = baseUrl + candidates[index]; };
    image.src = baseUrl + path;
    return image;
  });
  return () => { for (const image of images) image.onerror = null; };
}
