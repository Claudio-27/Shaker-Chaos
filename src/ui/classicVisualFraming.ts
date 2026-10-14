import type { CSSProperties } from 'react';
import type { StageBounds } from './classicStageLayout.ts';
/** Measured alpha >= 8 bounds, exclusive right/bottom. Original PNGs are never changed.
 * Presentation only: these pixels and transforms must never enter canonical gameplay. */
export interface VisualSample { readonly source: { readonly width: number; readonly height: number }; readonly opaque: StageBounds }
const sample = (width: number, height: number, x: number, y: number, w: number, h: number): VisualSample =>
  Object.freeze({ source: Object.freeze({ width, height }), opaque: Object.freeze({ x, y, width: w, height: h }) });
export const VISUAL_SAMPLES: Readonly<Record<string, VisualSample>> = Object.freeze({
  'bartender.b01.balanced': sample(1086, 1448, 92, 36, 913, 1412),
  'bartender.b01.excellent': sample(1086, 1448, 45, 29, 1021, 1419),
  'bartender.b01.idle': sample(1086, 1448, 99, 38, 949, 1410),
  'bartender.b01.rough': sample(1086, 1448, 157, 13, 869, 1435),
  'bartender.b01.tasting': sample(1086, 1448, 186, 12, 857, 1436),
  'bartender.b02.balanced': sample(1086, 1448, 167, 5, 766, 1443),
  'bartender.b02.excellent': sample(1086, 1448, 89, 8, 948, 1440),
  'bartender.b02.idle': sample(1086, 1448, 81, 12, 983, 1436),
  'bartender.b02.rough': sample(1086, 1448, 126, 7, 904, 1441),
  'bartender.b02.tasting': sample(1086, 1448, 112, 9, 826, 1439),
  'ingredient.bottle01': sample(1024, 1536, 300, 13, 427, 1510),
  'ingredient.bottle02': sample(1024, 1536, 201, 59, 618, 1435),
  'ingredient.bottle03': sample(1024, 1536, 219, 34, 585, 1469),
  'gameplay.chrome-shaker': sample(1024, 1536, 170, 30, 683, 1471),
  'gameplay.martini-glass': sample(1024, 1536, 45, 106, 936, 1351),
  'counter.c01.surface': sample(2172, 724, 9, 97, 2154, 549),
});
export type VisualFraming = 'bartender' | 'bottle' | 'shaker' | 'glass' | 'counter';
/** Coordinates relative to the existing 2E art containers, independent of interaction boxes. */
export function visualPlacement(assetId: string, kind: VisualFraming) {
  const measured = VISUAL_SAMPLES[assetId];
  if (!measured) return null; // Unknown/legacy SVG fallbacks retain their normal contain layout.
  const { source, opaque } = measured;
  const height = kind === 'bartender' ? 292 : kind === 'bottle' ? (assetId === 'ingredient.bottle02' ? 111 : 118) : kind === 'shaker' ? 108 : kind === 'glass' ? 62 : 600 * opaque.height / opaque.width;
  const scale = height / opaque.height;
  const centerX = kind === 'bartender' ? 105 : kind === 'bottle' ? 32 : kind === 'shaker' ? 33 : kind === 'glass' ? 20 : 300;
  const baseline = kind === 'bartender' ? 302 : kind === 'bottle' ? 128 : kind === 'shaker' ? 108 : kind === 'glass' ? 70 : 6 + height;
  const visible = Object.freeze({ x: centerX - opaque.width * scale / 2, y: baseline - height, width: opaque.width * scale, height });
  const canvas = Object.freeze({ x: visible.x - opaque.x * scale, y: visible.y - opaque.y * scale, width: source.width * scale, height: source.height * scale });
  return Object.freeze({ source, opaque, canvas, visible, scale, centerX, baseline });
}
export function visualFramingStyle(assetId: string, kind?: VisualFraming): CSSProperties | undefined {
  const placement = kind && visualPlacement(assetId, kind);
  if (!placement) return undefined;
  const { canvas } = placement;
  return { '--art-left': kind === 'bottle' ? `calc(var(--bottle-art-x) + ${canvas.x}px)` : canvas.x + 'px', '--art-top': kind === 'bottle' ? `calc(var(--bottle-art-y) + ${canvas.y}px)` : canvas.y + 'px', '--art-width': canvas.width + 'px', '--art-height': canvas.height + 'px' } as CSSProperties;
}
/** Crop above the baked back counter (source y~580). Foreground comes only from c01. */
export const BACKGROUND_FRAMING = Object.freeze({ source: { width: 1586, height: 992 }, height: 500, width: 500 * 1586 / 992, top: 0, clipBottom: 292 });
export const BACKGROUND_STYLE = { '--scene-bg-w': BACKGROUND_FRAMING.width + 'px', '--scene-bg-h': BACKGROUND_FRAMING.height + 'px', '--scene-bg-x': (600 - BACKGROUND_FRAMING.width) / 2 + 'px', '--scene-bg-clip': BACKGROUND_FRAMING.clipBottom + 'px' } as CSSProperties;
