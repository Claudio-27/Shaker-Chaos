import type { ObservableResult } from './caseModel.ts';
export type ComparisonStatus = 'MATCH' | 'MISMATCH' | 'UNKNOWN / INCOMPLETE';
export interface FieldComparison {
  readonly field: keyof ObservableResult; readonly status: ComparisonStatus;
  readonly observed: unknown; readonly current: unknown;
}
export interface ObservationComparison { readonly status: ComparisonStatus; readonly fields: readonly FieldComparison[] }
/** Missing reference fields are ignored. Unimplemented observed fields stay UNKNOWN. */
export function compareObservations(observed: ObservableResult | undefined, current: ObservableResult): ObservationComparison {
  const fields = Object.keys(observed ?? {}).map(key => {
    const field = key as keyof ObservableResult;
    const known = Object.hasOwn(current, field) && current[field] !== undefined;
    if (field === 'acceptedActions' && known) {
      const observedActions = observed?.acceptedActions ?? [];
      const comparisons = observedActions.map(action => {
        const actual = current.acceptedActions?.find(row => row.sequence === action.sequence);
        return { actual, status: !actual ? 'UNKNOWN / INCOMPLETE' as const : actual.accepted === action.accepted ? 'MATCH' as const : 'MISMATCH' as const };
      });
      return { field, observed: observedActions, current: comparisons.map(row => row.actual), status: comparisons.some(row => row.status === 'MISMATCH') ? 'MISMATCH' as const : comparisons.some(row => row.status === 'UNKNOWN / INCOMPLETE') ? 'UNKNOWN / INCOMPLETE' as const : 'MATCH' as const };
    }
    return { field, observed: observed?.[field], current: current[field],
      status: !known ? 'UNKNOWN / INCOMPLETE' as const :
        JSON.stringify(observed?.[field]) === JSON.stringify(current[field]) ? 'MATCH' as const : 'MISMATCH' as const };
  });
  const status = fields.some(f => f.status === 'MISMATCH') ? 'MISMATCH' :
    !fields.length || fields.some(f => f.status === 'UNKNOWN / INCOMPLETE') ? 'UNKNOWN / INCOMPLETE' : 'MATCH';
  return { status, fields };
}
