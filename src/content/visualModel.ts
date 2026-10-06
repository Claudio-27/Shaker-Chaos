import type { ReactionTier } from '../domain/model.ts';

/** Stable public IDs. File names and formats may change without changing these keys. */
export type AssetId = `bartender.${string}` | `environment.${string}` | `ingredient.${string}` | `gameplay.${string}` | `ui.${string}`;
export type ReactionId = `lab.${string}`;
export interface ImageAssetDefinition {
  readonly path: string;
  readonly width: number;
  readonly height: number;
  readonly format: 'svg' | 'png' | 'webp' | 'avif';
}
export interface VisualSequence {
  readonly frames: readonly AssetId[];
  readonly frameDurationMs: number;
  readonly loop?: boolean;
  readonly motion?: 'none' | 'settle' | 'tilt' | 'celebrate';
}
export interface VisualLayer {
  readonly asset: AssetId;
  readonly depth: 'background' | 'back' | 'foreground';
  readonly fit: 'cover' | 'contain';
}
export interface BartenderVisualDefinition {
  readonly id: string;
  readonly idle: AssetId;
  readonly portrait: AssetId;
  readonly tasting?: VisualSequence;
  readonly reactions: Readonly<Record<ReactionId, VisualSequence>>;
  /** Layers share the registered character canvas, not screen/pointer coordinates. */
  readonly accessories?: readonly AssetId[];
  readonly effects?: readonly AssetId[];
}
export interface IngredientVisualDefinition {
  readonly id: string;
  readonly bottle: AssetId;
  readonly selectedBottle?: AssetId;
  readonly icon: AssetId;
  readonly liquid: { readonly color: string; readonly overlay?: AssetId };
}
export interface EnvironmentVisualDefinition {
  readonly id: string;
  readonly background: AssetId;
  readonly backBar: AssetId;
  readonly counterForeground: AssetId;
  readonly decorations?: readonly VisualLayer[];
}
export interface ReactionVisualDefinition {
  readonly id: ReactionId;
  readonly motion: NonNullable<VisualSequence['motion']>;
  readonly effect?: AssetId;
}
export interface LiquidWindow {
  readonly leftPercent: number; readonly topPercent: number; readonly widthPercent: number; readonly heightPercent: number;
}
export interface VisualCatalog {
  readonly assets: Readonly<Partial<Record<AssetId, ImageAssetDefinition>>>;
  readonly bartenders: Readonly<Record<string, BartenderVisualDefinition>>;
  readonly ingredients: Readonly<Record<string, IngredientVisualDefinition>>;
  readonly environments: Readonly<Record<string, EnvironmentVisualDefinition>>;
  readonly reactions: Readonly<Record<ReactionId, ReactionVisualDefinition>>;
  readonly reactionByTier: Readonly<Record<ReactionTier, ReactionId>>;
  readonly gameplay: { readonly shaker: AssetId; readonly glass: AssetId; readonly ice: AssetId; readonly garnish: AssetId; readonly liquidWindows: Readonly<Record<'shaker' | 'glass', LiquidWindow>> };
  readonly controls: Readonly<Record<'pour' | 'shake' | 'serve' | 'reset', AssetId>>;
}
export interface SceneSelection {
  readonly bartenderId: string;
  readonly environmentId: string;
  readonly ingredientIds: readonly string[];
}