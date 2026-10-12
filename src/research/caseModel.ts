import type { MixEvent } from '../domain/session.ts';
import type { VerificationStatus } from '../domain/model.ts';

/** Logical labels, with no assumption about count, ordering or artwork. */
export type { MechanicalReactionTierId } from '../domain/model.ts';
import type { MechanicalReactionTierId } from '../domain/model.ts';
export interface ObservableResult {
  readonly score?: number;
  readonly reactionTier?: MechanicalReactionTierId;
  readonly reactionId?: string;
  readonly exploded?: boolean;
  readonly phase?: string;
  readonly capacityUnits?: number;
  readonly timingThresholdMs?: number;
  readonly acceptedActions?: readonly { readonly sequence: number; readonly accepted: boolean }[];
}
export interface ReferenceEvidence {
  readonly id: string;
  readonly scope: 'reference-manual' | 'reference-automated';
  readonly date: string;
  readonly source: string;
  readonly referenceBuild: string;
  readonly environmentId?: string;
  readonly procedure: string;
  readonly repetitions: number;
}
export interface ResearchCase {
  readonly schemaVersion: 1;
  readonly origin: 'DEMO' | 'REFERENCE';
  readonly id: string;
  readonly title: string;
  readonly purpose: string;
  /** Exact domain events, not UI holds or a second mix model. */
  readonly inputSequence: readonly MixEvent[];
  readonly inputValidation: {
    readonly status: 'UNVERIFIED' | 'VERIFIED';
    readonly evidenceIds: readonly string[];
    readonly notes: string;
  };
  /** A prediction, never an observation. DEMO predictions are synthetic project data. */
  readonly expectedObservation?: ObservableResult;
  readonly observedReferenceResult?: ObservableResult;
  readonly status: VerificationStatus;
  readonly confidence: 'low' | 'medium' | 'high';
  readonly evidence: readonly ReferenceEvidence[];
  readonly notes: string;
}
export function emptyResearchCase(): ResearchCase {
  return { schemaVersion: 1, origin: 'REFERENCE', id: 'new-case', title: 'Nuovo caso',
    purpose: 'Da definire', inputSequence: [], inputValidation: { status: 'UNVERIFIED', evidenceIds: [],
      notes: 'Timeline sintetica e unità canoniche non ancora mappate al riferimento.' },
    status: 'UNVERIFIED', confidence: 'low', evidence: [], notes: '' };
}
