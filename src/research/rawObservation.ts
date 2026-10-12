import type { NativeCapture } from './nativeCapture.ts';
import { validateNativeCapture } from './nativeCapture.ts';
import type { MixEvent } from '../domain/session.ts';
import type { ObservableResult, ResearchCase } from './caseModel.ts';
import type { MixingRules } from '../domain/model.ts';
import { parseResearchCase, validateObservable } from './fixtureCodec.ts';

export interface RequestedReferenceAction {
  readonly kind: 'select' | 'pour' | 'shake' | 'ice' | 'garnish' | 'serve' | 'reset' | 'cold-start' | 'wait' | 'player-control';
  readonly target?: string;
  readonly requestedDurationMs?: number;
}
export interface DeliveredReferenceInput {
  readonly type: 'pointerdown' | 'pointerup' | 'pointercancel' | 'mousedown' | 'mouseup';
  readonly atMs: number;
  readonly trusted: boolean;
  readonly x: number;
  readonly y: number;
  readonly buttons?: number;
  readonly button?: number;
}
export interface RawReferenceObservation {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly experimentId: string;
  readonly referenceBuild: string;
  readonly date: string;
  readonly environmentId: string;
  readonly method: 'AUTOMATED OBSERVATION' | 'MANUAL OBSERVATION';
  readonly repetition: number;
  readonly initialCondition: string;
  readonly requestedActions: readonly RequestedReferenceAction[];
  /** Wrapper DOM delivery, never Flash ticks or canonical domain events. */
  readonly deliveredInputs: readonly DeliveredReferenceInput[];
  readonly inputMapping: 'UNMAPPED' | 'EXACT';
  readonly canonicalInput?: readonly MixEvent[];
  readonly native?: NativeCapture;
  readonly observed?: ObservableResult;
  readonly visibleNotes: string;
  readonly limitations: readonly string[];
  readonly confidence: 'low' | 'medium' | 'high';
  readonly status: 'UNVERIFIED' | 'STRONGLY_SUPPORTED' | 'VERIFIED';
  readonly source: string;
}
function object(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw TypeError('Expected object');
  return v as Record<string, unknown>;
}
function fields(v: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []) {
  if (required.some(k => !Object.hasOwn(v,k)) || Object.keys(v).some(k => ![...required,...optional].includes(k))) throw TypeError('Raw schema field');
}
function text(v: unknown) { if (typeof v !== 'string' || !v.trim()) throw TypeError('Expected text'); }
function integer(v: unknown, min = 0) { if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < min) throw TypeError('Expected integer'); }
function option(v: unknown, values: readonly unknown[]) { if (!values.includes(v)) throw TypeError('Invalid raw enum'); }
function list(v: unknown): asserts v is unknown[] { if (!Array.isArray(v)) throw TypeError('Expected list'); }
/** Raw observations have their own schema: unknown quantity is absent, never zero. */
export function parseRawObservation(value: unknown, rules: MixingRules): RawReferenceObservation {
  const v = object(value);
  fields(v,['schemaVersion','id','experimentId','referenceBuild','date','environmentId','method','repetition','initialCondition','requestedActions','deliveredInputs','inputMapping','visibleNotes','limitations','confidence','status','source'],['canonicalInput','observed','native']);
  option(v.schemaVersion,[1]);
  for (const k of ['id','experimentId','referenceBuild','date','environmentId','initialCondition','visibleNotes','source']) text(v[k]);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(v.id as string)) throw TypeError('Unsafe observation ID');
  integer(v.repetition,1); option(v.method,['AUTOMATED OBSERVATION','MANUAL OBSERVATION']);
  option(v.confidence,['low','medium','high']); option(v.status,['UNVERIFIED','STRONGLY_SUPPORTED','VERIFIED']);
  option(v.inputMapping,['UNMAPPED','EXACT']);
  list(v.limitations); v.limitations.forEach(text);
  list(v.requestedActions); if (!v.requestedActions.length || v.requestedActions.length > 10000) throw RangeError('Raw action limit');
  for (const a of v.requestedActions) {
    const r=object(a); fields(r,['kind'],['target','requestedDurationMs']);
    option(r.kind,['select','pour','shake','ice','garnish','serve','reset','cold-start','wait','player-control']);
    if ('target' in r) text(r.target); if ('requestedDurationMs' in r) integer(r.requestedDurationMs);
  }
  list(v.deliveredInputs); if (v.deliveredInputs.length > 20000) throw RangeError('Raw input limit');
  let last=-1;
  for (const input of v.deliveredInputs) {
    const r=object(input); fields(r,['type','atMs','trusted','x','y'],['buttons','button']);
    option(r.type,['pointerdown','pointerup','pointercancel','mousedown','mouseup']);
    integer(r.atMs); if ((r.atMs as number)<last) throw TypeError('Input chronology'); last=r.atMs as number;
    if(typeof r.trusted !== 'boolean') throw TypeError('Input trust flag');
    for(const k of ['x','y']) if(typeof r[k] !== 'number' || !Number.isSafeInteger(r[k])) throw TypeError('Input coordinate');
    if('buttons' in r) integer(r.buttons); if('button' in r) integer(r.button);
  }
  if ('observed' in v) validateObservable(v.observed);
  if ('native' in v) {validateNativeCapture(v.native);const native=v.native as NativeCapture;if((v.deliveredInputs as unknown[]).length)throw TypeError('Native telemetry must not masquerade as DOM delivery');if(native.scoreRead && native.scoreRead.score!==(v.observed as {score?:number}|undefined)?.score)throw TypeError('Native displayed score mismatch');if(v.status==='STRONGLY_SUPPORTED' && native.scoreRead && !native.scoreRead.visuallyVerified)throw TypeError('Native score requires visual verification');}
  if (Object.hasOwn(v,'canonicalInput') && !Array.isArray(v.canonicalInput)) throw TypeError('Canonical input must be an array');
  if (v.inputMapping === 'EXACT' && !Array.isArray(v.canonicalInput)) throw TypeError('Exact mapping requires canonical history');
  if (v.status === 'VERIFIED') throw TypeError('Raw capture cannot promote evidence: adjudicate independent exact repetitions separately');
  if (v.status === 'STRONGLY_SUPPORTED' && !v.observed) throw TypeError('Supported acquisition needs observation');
  // Reuse calendar, evidence, event and chronology validation from ResearchCase.
  const probe: ResearchCase = {
    schemaVersion:1,origin:'REFERENCE',id:v.id as string,title:'Raw validation',purpose:'Acquisition validation',
    inputSequence:(v.canonicalInput ?? []) as MixEvent[],inputValidation:{status:'UNVERIFIED',evidenceIds:[],notes:'Validation only'},
    status:'UNVERIFIED',confidence:'low',notes:'Raw validation only',evidence:[{id:v.id as string,scope:'reference-automated',date:v.date as string,source:v.source as string,referenceBuild:v.referenceBuild as string,procedure:'Raw record',repetitions:1}],
  };
  parseResearchCase(probe,rules);
  return JSON.parse(JSON.stringify(v)) as RawReferenceObservation;
}
/** Individual repeats stay independent; this does not promote findings or invent ticks. */
export function observationToCase(raw: RawReferenceObservation, rules: MixingRules): ResearchCase {
  const r=parseRawObservation(raw,rules);
  const item: ResearchCase={schemaVersion:1,origin:'REFERENCE',id:'case-'+r.id,title:r.experimentId+' / '+r.id,
    purpose:'Black-box observation; original raw data remain authoritative.',inputSequence:r.canonicalInput ?? [],
    inputValidation:{status:'UNVERIFIED',evidenceIds:[],
      notes:r.inputMapping==='EXACT'?'Complete input asserted by acquisition source; independent adjudication still required.':'INCOMPLETE INPUT: empty history means unmapped/unknown, not an empty reference cocktail. Never score this projection.'},
    ...(r.observed?{observedReferenceResult:r.observed}:{}),status:r.status,confidence:r.confidence,
    evidence:[{id:r.id,scope:r.method==='AUTOMATED OBSERVATION'?'reference-automated':'reference-manual',date:r.date,source:r.source,
      referenceBuild:r.referenceBuild,...(r.native?{environmentId:r.environmentId}:{}),procedure:'research/raw-observations/'+r.id+'.json; '+r.initialCondition+'; '+r.visibleNotes,repetitions:1}],
    notes:r.limitations.join(' ')+' Raw source: research/raw-observations/'+r.id+'.json'};
  return parseResearchCase(item,rules);
}
