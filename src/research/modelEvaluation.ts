import type { CompatibilityInput } from '../domain/session.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import type { MixingRules } from '../domain/model.ts';
import type { ObservableResult, ResearchCase } from './caseModel.ts';
import { compareObservations } from './comparison.ts';
export interface ResearchCandidateModel {
  readonly id: string;
  readonly referenceBuild: string;
  readonly productionReady: false;
  readonly evaluate: (input: CompatibilityInput) => ObservableResult;
}
/** Evaluate ALL fixtures. Unknowns stay in the denominator; no fitting or lookup of observed outputs. */
export function evaluateResearchModel(cases: readonly ResearchCase[], rules: MixingRules, candidate?: ResearchCandidateModel) {
  const rows=cases.map(item=>{
    const eligible=!!candidate && item.inputValidation.status==='VERIFIED' && !!item.evidence.length && item.evidence.every(e=>e.referenceBuild===candidate.referenceBuild);
    const current=eligible?candidate.evaluate(createCompatibilityInput({schemaVersion:1,rules,history:item.inputSequence})):{};
    const comparison=compareObservations(item.observedReferenceResult,current);
    const errors=comparison.fields.flatMap(f=>typeof f.current==='number' && typeof f.observed==='number'?[Math.abs(f.current-f.observed)]:[]);
    return {id:item.id,comparison,reason:!candidate?'NO_CANDIDATE':!eligible?'INPUT_OR_BUILD_UNKNOWN':'EVALUATED',numericErrors:errors};
  });
  const matched=rows.filter(r=>r.comparison.status==='MATCH').length;
  const errors=rows.flatMap(r=>r.numericErrors);
  return {label:'RESEARCH CANDIDATE — NOT PRODUCTION READY',candidateId:candidate?.id ?? null,productionReady:false,
    totalFixtures:rows.length,matchedFixtures:matched,mismatchedFixtures:rows.filter(r=>r.comparison.status==='MISMATCH').length,
    unknownFixtures:rows.filter(r=>r.comparison.status==='UNKNOWN / INCOMPLETE').length,
    unknownFields:rows.flatMap(r=>r.comparison.fields).filter(f=>f.status==='UNKNOWN / INCOMPLETE').length,
    maximumNumericError:errors.length?Math.max(...errors):null,exactMatchPercentage:rows.length?100*matched/rows.length:null,rows};
}
