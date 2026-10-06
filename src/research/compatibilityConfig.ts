import type { MixingRules } from '../domain/model.ts';
import type { ResearchCase } from './caseModel.ts';
import { parseResearchCase } from './fixtureCodec.ts';

export const MECHANIC_AREAS = ['quantity', 'pour', 'ingredients', 'ice', 'garnish', 'shake', 'phases', 'score', 'reactions', 'reset'] as const;
export type MechanicArea = typeof MECHANIC_AREAS[number];
export type RuleValue = string | number | boolean | null | readonly RuleValue[] | { readonly [key: string]: RuleValue };
export interface PromotedMechanic {
  readonly claim: string; readonly status: 'VERIFIED'; readonly value: RuleValue; readonly caseIds: readonly string[];
}
/** Candidate data only. No production adapter or ready-for-production marker exists in Phase 1A. */
export interface ReferenceCompatibilityConfig {
  readonly schemaVersion: 1; readonly id: string; readonly referenceBuild: string;
  readonly stage: 'research-candidate';
  readonly mechanics: Readonly<Partial<Record<MechanicArea, PromotedMechanic>>>;
}
function validRule(value: RuleValue): boolean {
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'string') return !!value.trim();
  if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
  if (!value || typeof value !== 'object') return false;
  const values = Array.isArray(value) ? value : Object.values(value);
  return values.length > 0 && values.every(validRule);
}
export function validateReferenceCompatibilityConfig(config: ReferenceCompatibilityConfig, cases: readonly ResearchCase[], rules: MixingRules) {
  if (config.schemaVersion !== 1 || config.stage !== 'research-candidate' || !config.id.trim() || !config.referenceBuild.trim())
    throw new TypeError('Only an explicitly identified research candidate is permitted');
  const validated = cases.map(item => parseResearchCase(item, rules));
  if (new Set(validated.map(item => item.id)).size !== validated.length) throw new TypeError('Duplicate research case ID');
  if (Object.keys(config.mechanics).some(key => !(MECHANIC_AREAS as readonly string[]).includes(key))) throw new TypeError('Unknown mechanic area');
  for (const mechanic of Object.values(config.mechanics)) {
    if (mechanic.status !== 'VERIFIED' || !mechanic.claim.trim() || !validRule(mechanic.value) || !mechanic.caseIds.length)
      throw new TypeError('Mechanics require explicit verified claims, data and case references');
    for (const id of mechanic.caseIds) {
      const item = validated.find(candidate => candidate.id === id);
      if (!item || item.origin !== 'REFERENCE' || item.status !== 'VERIFIED' || item.inputValidation.status !== 'VERIFIED' ||
        !item.evidence.every(e => e.referenceBuild === config.referenceBuild))
        throw new TypeError('Unverified, absent or different-build evidence cannot be promoted');
    }
  }
  return { complete: MECHANIC_AREAS.every(area => Object.hasOwn(config.mechanics, area)),
    missingAreas: MECHANIC_AREAS.filter(area => !Object.hasOwn(config.mechanics, area)), productionReady: false as const };
}
export function assertProductionCompatibilityReady(config: ReferenceCompatibilityConfig, cases: readonly ResearchCase[], rules: MixingRules): never {
  const coverage = validateReferenceCompatibilityConfig(config, cases, rules);
  if (!coverage.complete) throw new TypeError('Incomplete compatibility coverage: ' + coverage.missingAreas.join(', '));
  throw new TypeError('Phase 1A cannot authorize production compatibility: a validated independent adapter and boundary fixtures are still required');
}
