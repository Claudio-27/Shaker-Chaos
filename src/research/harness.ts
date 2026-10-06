import type { CompatibilityInput } from '../domain/session.ts';
import type { ScoreResult, ScoringEngine, VerificationStatus } from '../domain/model.ts';

export interface ResearchFixture {
  readonly id: string;
  readonly claim: string;
  readonly verificationStatus: VerificationStatus;
  readonly evidence: string;
  readonly procedure: string;
  readonly confidence: 'low' | 'medium' | 'high';
  readonly notes: string;
  readonly input: CompatibilityInput;
  readonly expectedScore?: number;
}

/** A passing invented fixture verifies software determinism, not original behavior. */
export interface FixtureRun {
  readonly fixtureId: string;
  readonly result: ScoreResult;
  readonly matchesExpectedScore: boolean | null;
  readonly evidenceStatus: VerificationStatus;
}

export function runResearchFixture(fixture: ResearchFixture, engine: ScoringEngine): FixtureRun {
  const result = engine.evaluate(fixture.input);
  return {
    fixtureId: fixture.id,
    result,
    evidenceStatus: fixture.verificationStatus,
    matchesExpectedScore: fixture.expectedScore === undefined ? null : result.score === fixture.expectedScore,
  };
}

