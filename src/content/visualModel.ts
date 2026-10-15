import type { ReactionTier } from '../domain/model.ts';
export type AssetId = `bartender.${string}` | `environment.${string}` | `counter.${string}` | `effect.${string}` | `ingredient.${string}` | `gameplay.${string}` | `ui.${string}`;
export type ReactionId = `lab.${string}`;
export interface RasterBounds { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
export interface RuntimeRasterVariant { readonly path: string; readonly width: number; readonly height: number; readonly bytes: number; readonly sha256: string; readonly format: 'png' }
export interface RuntimeAssetDefinition {
  readonly category: string; readonly source: { readonly width: number; readonly height: number; readonly sha256: string; readonly alpha: RasterBounds };
  readonly crop: RasterBounds; readonly padding: number; readonly alphaThreshold: number;
  readonly variants: Readonly<Record<'1x' | '2x', RuntimeRasterVariant>>;
}
export interface ImageAssetDefinition {
  readonly path: string; readonly width: number; readonly height: number;
  readonly format: 'svg' | 'png' | 'webp' | 'avif'; readonly visibility: 'public';
  /** width/height retain the logical source canvas; variant dimensions describe encoded raster pixels. */
  readonly runtime?: RuntimeAssetDefinition;
}
export interface VisualSequence {
  readonly frames: readonly AssetId[]; readonly frameDurationMs: number; readonly loop?: boolean;
  readonly motion?: 'none' | 'settle' | 'tilt' | 'celebrate';
}
export interface VisualLayer { readonly asset: AssetId; readonly depth: 'background' | 'back' | 'foreground'; readonly fit: 'cover' | 'contain' }
export interface BartenderVisualDefinition {
  readonly id: string; readonly idle: AssetId; readonly portrait?: AssetId; readonly tasting?: VisualSequence;
  readonly reactions: Readonly<Record<ReactionId, VisualSequence>>;
  readonly accessories?: readonly AssetId[]; readonly defaultEffectId?: string;
}
export interface IngredientVisualDefinition {
  readonly id: string; readonly bottle: AssetId; readonly selectedBottle?: AssetId; readonly icon: AssetId;
  readonly liquid: { readonly color: string; readonly overlay?: AssetId };
}
export interface EnvironmentVisualDefinition {
  readonly id: string; readonly background: AssetId;
  /** Optional clean layer; background stays the independently retained legacy fallback. */
  readonly backgroundClean?: AssetId; readonly backBar?: AssetId; readonly decorations?: readonly VisualLayer[];
}
export interface CounterVisualDefinition { readonly id: string; readonly surface: AssetId; readonly fit: 'cover' | 'contain' }
export interface EffectVisualDefinition { readonly id: string; readonly asset?: AssetId }
export interface BottleSetDefinition { readonly id: string; readonly bottles: Readonly<Record<string, AssetId>> }
export interface ReactionVisualDefinition {
  readonly id: ReactionId; readonly motion: NonNullable<VisualSequence['motion']>; readonly effect?: AssetId;
}
export interface LiquidWindow {
  readonly leftPercent: number; readonly topPercent: number; readonly widthPercent: number; readonly heightPercent: number;
}
export interface VisualCatalog {
  readonly assets: Readonly<Partial<Record<AssetId, ImageAssetDefinition>>>;
  readonly bartenders: Readonly<Record<string, BartenderVisualDefinition>>;
  readonly ingredients: Readonly<Record<string, IngredientVisualDefinition>>;
  readonly environments: Readonly<Record<string, EnvironmentVisualDefinition>>;
  readonly counters: Readonly<Record<string, CounterVisualDefinition>>;
  readonly effects: Readonly<Record<string, EffectVisualDefinition>>;
  readonly bottleSets: Readonly<Record<string, BottleSetDefinition>>;
  readonly reactions: Readonly<Record<ReactionId, ReactionVisualDefinition>>;
  readonly reactionByTier: Readonly<Record<ReactionTier, ReactionId>>;
  readonly gameplay: {
    readonly shaker: AssetId; readonly glass: AssetId; readonly ice: AssetId; readonly garnish: AssetId;
    readonly liquidWindows: Readonly<Record<'shaker' | 'glass', LiquidWindow>>;
    /** Supplied vessel art is opaque; the external meter remains authoritative presentation. */
    readonly liquidMode?: 'window' | 'meter';
  };
  readonly controls: Readonly<Record<'pour' | 'shake' | 'serve' | 'reset', AssetId>>;
}
export interface VisualLoadout {
  readonly bartenderId: string; readonly environmentId: string; readonly counterId: string;
  /** undefined = bartender default, null = disabled; an ID selects a shared independent effect. */
  readonly effectOverride?: string | null;
  readonly bottleSetId?: string;
}
export interface SceneSelection extends VisualLoadout { readonly ingredientIds: readonly string[] }
