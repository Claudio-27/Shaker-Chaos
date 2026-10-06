import type { MixingRules } from '../domain/model.ts';
import type { ResearchCase } from './caseModel.ts';
import { parseResearchCase } from './fixtureCodec.ts';
import { appendManualAction, timelineFromHistory } from './manualSequence.ts';
export interface Sweep { readonly kind: 'quantity' | 'shake-duration'; readonly values: readonly number[]; readonly ingredientId?: string }
/** Each candidate starts with an independent copy of the same base history. */
export function generateCaseSeries(base: ResearchCase, sweep: Sweep, rules: MixingRules): readonly ResearchCase[] {
  base = parseResearchCase(base, rules);
  const attemptStart = base.inputSequence.reduce((start, event) => event.type === 'Reset' ? event.sequence + 1 : start, 0);
  if (base.inputSequence.slice(attemptStart).some(e => e.type === 'Served')) throw new RangeError('Sweep base must not be served');
  if (!sweep.values.length || sweep.values.length > 100) throw new RangeError('Series requires 1..100 values');
  return sweep.values.map((value, index) => {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError('Sweep values must be non-negative safe integers');
    let timeline = timelineFromHistory(base.inputSequence, rules);
    if (sweep.kind === 'quantity') {
      if (!sweep.ingredientId?.trim()) throw new RangeError('Quantity sweep needs a logical ingredient ID');
      timeline = appendManualAction(timeline, { type: 'pour', ingredientId: sweep.ingredientId, units: value });
    } else timeline = appendManualAction(timeline, { type: 'shake', durationMs: value });
    timeline = appendManualAction(timeline, { type: 'serve' });
    return parseResearchCase({ schemaVersion: 1, origin: base.origin, purpose: base.purpose, id: base.id + '-' + sweep.kind + '-' + index + '-' + value,
      title: base.title + ' · ' + sweep.kind + ' = ' + value, inputSequence: timeline.session.history,
      inputValidation: { status: 'UNVERIFIED', evidenceIds: [], notes: 'Generated synthetic timeline; validate against reference before promotion.' },
      status: 'UNVERIFIED', confidence: 'low', evidence: [], notes: 'Generated candidate. No reference observation.' }, rules);
  });
}
