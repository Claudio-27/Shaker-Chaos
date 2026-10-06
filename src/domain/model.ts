import type { VolumeUnit } from './quantity.ts';
import type { CompatibilityInput } from './session.ts';

/** Evidence labels describe research, never a promise of compatibility. */
export type VerificationStatus = 'VERIFIED' | 'STRONGLY_SUPPORTED' | 'UNVERIFIED';
export type IngredientId = string;
/** Reference labels have no fixed number/order and never identify artwork. */
export type MechanicalReactionTierId = string;
/** Existing demo-only presentation tiers; not reference tiers. */
export type ReactionTier = 'unrated' | 'rough' | 'balanced' | 'excellent';

/** Opaque keys allow a later access policy without putting progression in scoring. */
export interface ContentMetadata {
  readonly unlockKey?: string;
}

export interface IngredientDefinition {
  readonly id: IngredientId;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly shortLabel: string;
  readonly metadata?: ContentMetadata;
}

export interface GarnishDefinition {
  readonly id: string;
  readonly name: string;
}

/** Canonical integer quantities; physical units belong to presentation. No UI, clocks, player data or persistence here. */
export interface MixState {
  readonly quantities: Readonly<Record<IngredientId, VolumeUnit>>;
  readonly iceUnits: number;
  readonly shakeDurationMs: number;
  readonly garnishId: string | null;
}

export type ScoreComponent = 'balance' | 'ice' | 'shake' | 'garnish';
export interface ScoreBreakdown {
  readonly component: ScoreComponent;
  readonly points: number;
  readonly maximum: number;
}

export interface ScoreResult {
  readonly score: number;
  readonly maximum: number;
  /** Legacy demo tier; never a reference mechanical label. */
  readonly reactionTier: ReactionTier;
  /** An independent adapter may supply any validated mechanical tier, without choosing artwork. */
  readonly mechanicalReactionTierId?: MechanicalReactionTierId;
  readonly breakdown: readonly ScoreBreakdown[];
  readonly configurationId: string;
  readonly verificationStatus: VerificationStatus;
}

export interface ReactionDefinition {
  readonly tier: ReactionTier;
  readonly title: string;
  readonly description: string;
}

export interface BartenderDefinition {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly lines: Readonly<Record<ReactionTier, string>>;
  readonly metadata?: ContentMetadata;
}

/** Recipes are content/discovery definitions; they do not dictate engine behavior. */
export interface RecipeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly ingredientParts: Readonly<Record<IngredientId, number>>;
  readonly garnishId?: string;
  readonly metadata?: ContentMetadata;
}

export interface MixingRules {
  readonly capacityUnits: VolumeUnit;
  readonly maximumIceUnits: number;
  readonly maximumShakeDurationMs: number;
}

export interface ScoringConfiguration {
  readonly id: string;
  readonly verificationStatus: VerificationStatus;
  readonly description: string;
  readonly targetParts: Readonly<Record<IngredientId, number>>;
  readonly idealIceUnits: number;
  readonly idealShakeDurationMs: number;
  readonly preferredGarnishId: string;
  readonly points: Readonly<Record<ScoreComponent, number>>;
  readonly thresholds: { readonly balanced: number; readonly excellent: number };
}

export interface ScoringEngine {
  readonly configurationId: string;
  readonly verificationStatus: VerificationStatus;
  readonly evaluate: (input: CompatibilityInput) => ScoreResult;
}

