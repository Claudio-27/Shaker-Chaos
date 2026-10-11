import type { MixingRules } from '../domain/model.ts';
import type { MixEvent } from '../domain/session.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import type { ObservableResult, ReferenceEvidence, ResearchCase } from './caseModel.ts';

export const RESEARCH_SCHEMA_VERSION = 1;
export const MAX_CASE_EVENTS = 10000;
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected object');
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: readonly string[], required: readonly string[] = []) {
  if (Object.keys(value).some(k => !allowed.includes(k)) || required.some(k => !Object.hasOwn(value, k)))
    throw new TypeError('Unexpected or missing schema field');
}
function string(value: unknown, empty = false): asserts value is string {
  if (typeof value !== 'string' || (!empty && !value.trim())) throw new TypeError('Expected non-empty string');
}
function integer(value: unknown, minimum = 0): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) throw new TypeError('Expected safe integer');
}
function oneOf(value: unknown, options: readonly unknown[]) {
  if (!options.includes(value)) throw new TypeError('Invalid enum');
}
function array(value: unknown): asserts value is unknown[] { if (!Array.isArray(value)) throw new TypeError('Expected array'); }
export function validateObservable(value: unknown): asserts value is ObservableResult {
  const result = object(value);
  keys(result, ['score', 'reactionTier', 'reactionId', 'exploded', 'phase', 'capacityUnits', 'timingThresholdMs', 'acceptedActions']);
  if (!Object.keys(result).length) throw new TypeError('An observation needs at least one measured field');
  for (const [field, data] of Object.entries(result)) {
    if (field === 'score') {
      if (typeof data !== 'number' || !Number.isFinite(data) || Math.abs(data) > Number.MAX_SAFE_INTEGER) throw new TypeError('Invalid observed score');
    } else if (field === 'exploded') {
      if (typeof data !== 'boolean') throw new TypeError('Expected boolean');
    } else if (field === 'capacityUnits' || field === 'timingThresholdMs') integer(data);
    else if (field === 'acceptedActions') {
      array(data);
      if (!data.length) throw new TypeError('Empty action observation');
      const ids = new Set<number>();
      for (const row of data) {
        const entry = object(row); keys(entry, ['sequence', 'accepted'], ['sequence', 'accepted']);
        integer(entry.sequence);
        if (typeof entry.accepted !== 'boolean' || ids.has(entry.sequence)) throw new TypeError('Invalid action observation');
        ids.add(entry.sequence);
      }
    } else string(data);
  }
}
function validateEvent(value: unknown) {
  const event = object(value);
  string(event.type); integer(event.sequence); integer(event.atMs);
  const base = ['type', 'sequence', 'atMs'];
  const fields: Record<string, readonly string[]> = {
    PourStarted: ['operationId', 'ingredientId'], PourTick: ['operationId', 'ingredientId', 'requestedUnits'],
    PourEnded: ['operationId', 'reason'], ShakeStarted: ['operationId'],
    ShakeTick: ['operationId', 'durationMs'], ShakeEnded: ['operationId', 'reason'],
    IceAdded: ['requestedUnits'], GarnishChanged: ['garnishId'], Served: [], Reset: [],
  };
  if (!Object.hasOwn(fields, event.type)) throw new TypeError('Unknown domain event');
  const required = [...base, ...fields[event.type]!]; keys(event, required, required);
  if ('operationId' in event) integer(event.operationId);
  if ('ingredientId' in event) string(event.ingredientId);
  if ('requestedUnits' in event) integer(event.requestedUnits);
  if ('durationMs' in event) integer(event.durationMs);
  if ('reason' in event) oneOf(event.reason, ['completed', 'cancelled', 'limit', 'served', 'reset']);
  if ('garnishId' in event && event.garnishId !== null) string(event.garnishId);
}
function validateEvidence(value: unknown): asserts value is ReferenceEvidence {
  const evidence = object(value);
  const fields = ['id', 'scope', 'date', 'source', 'referenceBuild', 'procedure', 'repetitions'];
  keys(evidence, fields, fields);
  oneOf(evidence.scope, ['reference-manual', 'reference-automated']);
  for (const field of ['id', 'date', 'source', 'referenceBuild', 'procedure']) string(evidence[field]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(evidence.date as string)) throw new TypeError('Evidence date must use YYYY-MM-DD');
  const [year, month, day] = (evidence.date as string).split('-').map(Number);
  const leap = year! % 4 === 0 && (year! % 100 !== 0 || year! % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year! < 1 || month! < 1 || month! > 12 || day! < 1 || day! > days[month! - 1]!) throw new TypeError('Invalid evidence calendar date');
  integer(evidence.repetitions, 1);
}

/** Strict runtime schema + domain chronology validation. No promotion or persistence. */
export function parseResearchCase(value: unknown, projectionRules: MixingRules): ResearchCase {
  const item = object(value);
  const required = ['schemaVersion', 'origin', 'id', 'title', 'purpose', 'inputSequence', 'inputValidation', 'status', 'confidence', 'evidence', 'notes'];
  keys(item, [...required, 'expectedObservation', 'observedReferenceResult'], required);
  oneOf(item.schemaVersion, [RESEARCH_SCHEMA_VERSION]); oneOf(item.origin, ['DEMO', 'REFERENCE']);
  for (const field of ['id', 'title', 'purpose']) string(item[field]);
  string(item.notes, true);
  oneOf(item.status, ['VERIFIED', 'STRONGLY_SUPPORTED', 'UNVERIFIED']);
  oneOf(item.confidence, ['low', 'medium', 'high']);
  array(item.inputSequence);
  if (item.inputSequence.length > MAX_CASE_EVENTS) throw new RangeError('Research import limit: 10000 events');
  item.inputSequence.forEach(validateEvent);
  const validation = object(item.inputValidation);
  keys(validation, ['status', 'evidenceIds', 'notes'], ['status', 'evidenceIds', 'notes']);
  oneOf(validation.status, ['UNVERIFIED', 'VERIFIED']); string(validation.notes, true);
  array(validation.evidenceIds); validation.evidenceIds.forEach(id => string(id));
  array(item.evidence); item.evidence.forEach(validateEvidence);
  const ids = (item.evidence as ReferenceEvidence[]).map(e => e.id);
  if (new Set(ids).size !== ids.length || new Set(validation.evidenceIds).size !== validation.evidenceIds.length || validation.evidenceIds.some(id => !ids.includes(id as string)))
    throw new TypeError('Duplicate or unresolved evidence ID');
  if (Object.hasOwn(item, 'expectedObservation')) validateObservable(item.expectedObservation);
  if (Object.hasOwn(item, 'observedReferenceResult')) validateObservable(item.observedReferenceResult);
  if (item.origin === 'DEMO' && (item.status !== 'UNVERIFIED' || item.observedReferenceResult || validation.status !== 'UNVERIFIED' || item.evidence.length))
    throw new TypeError('DEMO is synthetic, never reference evidence');
  if (item.status !== 'UNVERIFIED' && (!item.observedReferenceResult || !ids.length))
    throw new TypeError('Supported/verified claims require actual observations and evidence');
  if ((item.status === 'VERIFIED' || validation.status === 'VERIFIED') &&
      (item.origin !== 'REFERENCE' || validation.status !== 'VERIFIED' || !validation.evidenceIds.length))
    throw new TypeError('VERIFIED requires independently validated input evidence');
  if (item.observedReferenceResult) {
    const observed = item.observedReferenceResult as ObservableResult;
    if (observed.acceptedActions?.some(row => row.sequence >= (item.inputSequence as unknown[]).length))
      throw new TypeError('Observed action does not exist in this history');
  }
  const input = createCompatibilityInput({ schemaVersion: 1, rules: projectionRules, history: item.inputSequence as MixEvent[] });
  // JSON round-trip takes ownership of all research metadata, not only events.
  return { ...JSON.parse(JSON.stringify(item)) as ResearchCase, inputSequence: input.history };
}
export function decodeResearchCase(json: string, rules: MixingRules) { return parseResearchCase(JSON.parse(json), rules); }
export function encodeResearchCase(item: ResearchCase, rules: MixingRules) {
  return JSON.stringify(parseResearchCase(item, rules), (_key, value: unknown) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const object = value as Record<string, unknown>;
      return Object.fromEntries(Object.keys(object).sort().map(key => [key, object[key]]));
    }
    return value;
  }, 2) + '\n';
}
