import type { MixingRules, ScoringEngine } from '../domain/model.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import type { ObservableResult, ResearchCase } from './caseModel.ts';
import { parseResearchCase } from './fixtureCodec.ts';
import { compareObservations } from './comparison.ts';
export function runCase(item: ResearchCase, rules: MixingRules, engine: ScoringEngine) {
  const validated = parseResearchCase(item, rules);
  const input = createCompatibilityInput({ schemaVersion: 1, rules, history: validated.inputSequence });
  const result = engine.evaluate(input);
  // Demo visual tier is NOT a reference mechanical tier; explosion/action acceptance are unimplemented.
  const canonicalInputKnown = !(validated.origin === 'REFERENCE' && validated.inputSequence.length === 0 && validated.inputValidation.status !== 'VERIFIED' && validated.evidence.length > 0);
  const current: ObservableResult = canonicalInputKnown ? { score: result.score, phase: input.projection.state.phase, capacityUnits: rules.capacityUnits,
    ...(result.mechanicalReactionTierId === undefined ? {} : { reactionTier: result.mechanicalReactionTierId }) } : {};
  if (result.mechanicalReactionTierId !== undefined && !result.mechanicalReactionTierId.trim()) throw new TypeError('Empty mechanical reaction tier');
  return { input, result, current, canonicalInputKnown, comparison: compareObservations(validated.observedReferenceResult, current),
    evidenceStatus: validated.status };
}
