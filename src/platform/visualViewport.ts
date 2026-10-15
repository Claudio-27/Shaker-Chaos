import { classicLandscape, fitClassicStage } from '../ui/classicStageLayout.ts';
import type { RasterDemand } from '../content/runtimeVariants.ts';
/** Shared by rendering, preload and SW warmup. Same demand => the same single variant. */
export function readRasterDemand(): RasterDemand {
  if (typeof window === 'undefined') return { scale: 1, canonical: true };
  const canonical = classicLandscape(window.innerWidth, window.innerHeight);
  const scale = canonical ? fitClassicStage(window.innerWidth-24, window.innerHeight-24)?.scale ?? 1 : 1;
  return { scale: scale * Math.max(1, window.devicePixelRatio || 1), canonical };
}
