import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { emptyResearchCase } from './caseModel.ts';
import type { ResearchCase } from './caseModel.ts';
import { appendManualAction, timelineFromHistory } from './manualSequence.ts';
import type { ManualAction } from './manualSequence.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import { syntheticRules } from '../domain/testFixtures.ts';
import { gameDependencies } from '../application/bootstrap.ts';
import { newGame, transitionGame } from '../application/game.ts';
import { parseResearchCase, decodeResearchCase, encodeResearchCase } from './fixtureCodec.ts';
import { compareObservations } from './comparison.ts';
import { runCase } from './caseRunner.ts';
import { generateCaseSeries } from './caseSeries.ts';
import { assertProductionCompatibilityReady, MECHANIC_AREAS, validateReferenceCompatibilityConfig } from './compatibilityConfig.ts';
import type { ReferenceCompatibilityConfig } from './compatibilityConfig.ts';
function manual(actions: readonly ManualAction[], rules = gameDependencies.mixingRules): ResearchCase {
  let timeline = timelineFromHistory([], rules);
  for (const action of actions) timeline = appendManualAction(timeline, action);
  return { ...emptyResearchCase(), inputSequence: timeline.session.history };
}
const inputActions: readonly ManualAction[] = [
  { type: 'pour', ingredientId: 'orchard', units: 12, durationMs: 600, ticks: 3 },
  { type: 'pour', ingredientId: 'citrus', units: 7 },
  { type: 'ice', units: 1 }, { type: 'shake', durationMs: 800 },
  { type: 'shake', durationMs: 800 }, { type: 'shake', durationMs: 800 }, { type: 'serve' },
];
/** IN-MEMORY SYNTHETIC schema tests only. Not real observations or stored VERIFIED fixtures. */
function mockVerified(): ResearchCase {
  return { ...manual(inputActions), id: 'TEST-ONLY-SYNTHETIC', purpose: 'Fictional data testing validation, NOT reference evidence',
    observedReferenceResult: { score: -4 }, status: 'VERIFIED',
    inputValidation: { status: 'VERIFIED', evidenceIds: ['TEST-EVIDENCE'], notes: 'Synthetic unit-test metadata' },
    evidence: [{ id: 'TEST-EVIDENCE', scope: 'reference-manual', source: 'Fictional schema test',
      date: '2000-01-01', referenceBuild: 'TEST-BUILD', procedure: 'Synthetic parser test only', repetitions: 2 }] };
}
test('manual case uses canonical start/tick/end events and exact operation durations', () => {
  const item = manual(inputActions);
  const result = runCase(item, gameDependencies.mixingRules, gameDependencies.scoringEngine);
  assert.deepEqual(result.input.projection.state.mix.quantities, { orchard: 12, citrus: 7 });
  assert.deepEqual(result.input.projection.state.pours[0]?.ticks.map(t => [t.requestedUnits, t.atMs]), [[4,200],[4,400],[4,600]]);
  assert.equal(result.input.projection.state.pours[1]?.elapsedMs, 0);
  assert.deepEqual(result.input.projection.state.shakes.map(s => s.elapsedMs), [800,800,800]);
  assert.equal(result.input.projection.state.mix.shakeDurationMs, 2400);
  assert.equal(result.input.projection.state.phase, 'served');
  assert.equal(result.evidenceStatus, 'UNVERIFIED');
  assert.equal(result.result.verificationStatus, 'UNVERIFIED');
});
test('identical manual input and JSON round trips yield exactly identical history/state', () => {
  const first = manual(inputActions), second = manual(inputActions);
  const json = encodeResearchCase(first, gameDependencies.mixingRules);
  const decoded = decodeResearchCase(json, gameDependencies.mixingRules);
  assert.deepEqual(decoded, first);
  assert.equal(encodeResearchCase(decoded, gameDependencies.mixingRules), json);
  assert.deepEqual(runCase(first, gameDependencies.mixingRules, gameDependencies.scoringEngine),
    runCase(second, gameDependencies.mixingRules, gameDependencies.scoringEngine));
});
test('order reversal retains equal totals and distinguishable chronology', () => {
  const pours = inputActions.slice(0,2);
  const first = manual(pours), reverse = manual([...pours].reverse());
  const state = (item: ResearchCase) => createCompatibilityInput({ schemaVersion: 1, rules: gameDependencies.mixingRules, history: item.inputSequence }).projection.state.mix;
  assert.deepEqual(state(first), state(reverse));
  assert.notDeepEqual(first.inputSequence, reverse.inputSequence);
  assert.deepEqual(first.inputSequence.filter(e => e.type === 'PourStarted').map(e => e.ingredientId), ['orchard','citrus']);
});
test('same totals from one/two pours and one/three shakes do not collapse histories', () => {
  const a = manual([{ type: 'pour', ingredientId: 'orchard', units: 12 }, { type: 'shake', durationMs: 2400 }]);
  const b = manual([{ type: 'pour', ingredientId: 'orchard', units: 5 }, { type: 'pour', ingredientId: 'orchard', units: 7 },
    { type: 'shake', durationMs: 800 }, { type: 'shake', durationMs: 800 }, { type: 'shake', durationMs: 800 }]);
  assert.deepEqual(runCase(a, gameDependencies.mixingRules, gameDependencies.scoringEngine).input.projection.state.mix,
    runCase(b, gameDependencies.mixingRules, gameDependencies.scoringEngine).input.projection.state.mix);
  assert.notDeepEqual(a.inputSequence, b.inputSequence);
});
test('canonical quantities stay integers even at MAX_SAFE_INTEGER and uneven tick allocation', () => {
  const item = manual([{ type: 'pour', ingredientId: 'X', units: Number.MAX_SAFE_INTEGER, ticks: 7 }], syntheticRules);
  const amounts = item.inputSequence.filter(e => e.type === 'PourTick').map(e => e.requestedUnits);
  assert.equal(amounts.reduce((sum, value) => sum + BigInt(value), 0n), BigInt(Number.MAX_SAFE_INTEGER));
  assert.ok(amounts.every(Number.isSafeInteger));
  for (const bad of [-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]) {
    assert.throws(() => manual([{ type: 'pour', ingredientId: 'X', units: bad }]));
    assert.throws(() => manual([{ type: 'shake', durationMs: bad }]));
  }
  assert.throws(() => manual([{ type: 'pour', ingredientId: 'X', units: 1, ticks: 0 }]));
});
test('virtual pauses preserve timestamps and equal-time event order without wall clocks', () => {
  const item = manual([{ type: 'wait', durationMs: 10 }, { type: 'pour', ingredientId: 'orchard', units: 7, ticks: 3 },
    { type: 'wait', durationMs: 4 }, { type: 'ice', units: 1 }]);
  assert.deepEqual(item.inputSequence.map(e => e.atMs), [10,10,10,10,10,14]);
  assert.deepEqual(item.inputSequence.map(e => e.sequence), [0,1,2,3,4,5]);
});
test('reset retains earlier facts and produces a deterministic clean attempt with unique IDs', () => {
  const item = manual([...inputActions, { type: 'reset' }, { type: 'pour', ingredientId: 'soda', units: 3 }]);
  const state = runCase(item, gameDependencies.mixingRules, gameDependencies.scoringEngine).input.projection.state;
  assert.deepEqual(state.mix, { quantities: { soda: 3 }, iceUnits: 0, shakeDurationMs: 0, garnishId: null });
  assert.equal(state.shakes.length, 0);
  assert.ok(item.inputSequence.some(e => e.type === 'Reset'));
  assert.deepEqual(item, manual([...inputActions, { type: 'reset' }, { type: 'pour', ingredientId: 'soda', units: 3 }]));
});
test('strict fixture schema rejects unknown fields, bad events, fractions and reordered sequences', () => {
  const item = manual(inputActions);
  for (const bad of [
    { ...item, schemaVersion: 2 }, { ...item, pointerX: 20 }, { ...item, status: 'REJECTED' },
    { ...item, inputSequence: [{ type: 'PointerMoved', sequence: 0, atMs: 0 }] },
    { ...item, inputSequence: item.inputSequence.map((e,i) => i===1 ? { ...e, requestedUnits: 0.5 } : e) },
    { ...item, inputSequence: [...item.inputSequence].reverse() },
    { ...item, inputSequence: [{ type: 'ShakeTick', operationId: 0, sequence: 0, atMs: 0, durationMs: 1 }] },
    { ...item, observedReferenceResult: {} }, { ...item, observedReferenceResult: { score: Infinity } },
    { ...item, observedReferenceResult: { acceptedActions: [{ sequence: 9999, accepted: true }] } },
  ]) assert.throws(() => parseResearchCase(bad, gameDependencies.mixingRules));
});
test('DEMO fixtures cannot contain reference observations or promote synthetic inputs', () => {
  const item = { ...manual(inputActions), origin: 'DEMO' as const };
  assert.equal(parseResearchCase(item, gameDependencies.mixingRules).status, 'UNVERIFIED');
  assert.throws(() => parseResearchCase({ ...item, observedReferenceResult: { score: 0 } }, gameDependencies.mixingRules));
  assert.throws(() => parseResearchCase({ ...item, status: 'VERIFIED' }, gameDependencies.mixingRules));
});
test('VERIFIED fixture requires observed fields, manual source/build/procedure and validated input links', () => {
  const item = mockVerified();
  assert.equal(parseResearchCase(item, gameDependencies.mixingRules).status, 'VERIFIED');
  for (const bad of [
    { ...item, evidence: [] }, { ...item, observedReferenceResult: undefined },
    { ...item, inputValidation: { status: 'UNVERIFIED', evidenceIds: [], notes: '' } },
    { ...item, inputValidation: { status: 'VERIFIED', evidenceIds: ['MISSING'], notes: '' } },
    { ...item, evidence: [{ ...item.evidence[0], source: '' }] },
    { ...item, evidence: [{ ...item.evidence[0], date: '2001-02-29' }] },
    { ...item, inputValidation: { ...item.inputValidation, evidenceIds: ['TEST-EVIDENCE','TEST-EVIDENCE'] } },
  ]) assert.throws(() => parseResearchCase(bad, gameDependencies.mixingRules));
});
test('observed score alone matches, missing reference fields are not compared', () => {
  const comparison = compareObservations({ score: 7 }, { score: 7, reactionTier: 'anything', exploded: true });
  assert.equal(comparison.status, 'MATCH');
  assert.deepEqual(comparison.fields.map(f => f.field), ['score']);
});
test('known mismatches are visible even when another observed field is unavailable', () => {
  const comparison = compareObservations({ score: -1, exploded: true }, { score: 0 });
  assert.equal(comparison.status, 'MISMATCH');
  assert.deepEqual(comparison.fields.map(f => f.status), ['MISMATCH','UNKNOWN / INCOMPLETE']);
});
test('absent evidence and unavailable measured mechanics yield UNKNOWN, not a failure', () => {
  assert.equal(compareObservations(undefined, { score: 0 }).status, 'UNKNOWN / INCOMPLETE');
  assert.equal(compareObservations({ reactionTier: 'tier-17', exploded: false }, {}).status, 'UNKNOWN / INCOMPLETE');
  assert.equal(compareObservations({ score: 0, phase: 'shaking' }, { score: 0 }).status, 'UNKNOWN / INCOMPLETE');
});
test('predictions never become observations and demo presentation is not a mechanical reaction tier', () => {
  const item = { ...manual(inputActions), expectedObservation: { score: 999, reactionTier: 'tier-9' } };
  const run = runCase(item, gameDependencies.mixingRules, gameDependencies.scoringEngine);
  assert.equal(run.comparison.status, 'UNKNOWN / INCOMPLETE');
  assert.equal(Object.hasOwn(run.current, 'reactionTier'), false);
  assert.equal(run.evidenceStatus, 'UNVERIFIED');
  const syntheticEngine = { ...gameDependencies.scoringEngine, evaluate: (input: Parameters<typeof gameDependencies.scoringEngine.evaluate>[0]) => ({ ...gameDependencies.scoringEngine.evaluate(input), mechanicalReactionTierId: 'SYNTHETIC-tier-17' }) };
  const observed = { ...item, observedReferenceResult: { reactionTier: 'SYNTHETIC-tier-17' }, notes: 'In-memory synthetic adapter test; not a reference observation' };
  assert.equal(runCase(observed, gameDependencies.mixingRules, syntheticEngine).comparison.status, 'MATCH');
});
test('series start from identical bases without carrying observations, evidence or status', () => {
  const base = { ...mockVerified(), inputSequence: manual([{ type: 'pour', ingredientId: 'orchard', units: 12 }]).inputSequence };
  const series = generateCaseSeries(base, { kind: 'shake-duration', values: [799,800,801] }, gameDependencies.mixingRules);
  assert.deepEqual(series.map(c => runCase(c, gameDependencies.mixingRules, gameDependencies.scoringEngine).input.projection.state.mix.shakeDurationMs), [799,800,801]);
  assert.ok(series.every(c => c.status === 'UNVERIFIED' && !c.observedReferenceResult && c.evidence.length === 0));
  assert.deepEqual(series[0]?.inputSequence.slice(0,base.inputSequence.length), base.inputSequence);
  assert.throws(() => generateCaseSeries(manual(inputActions), { kind: 'quantity', values: [1], ingredientId: 'X' }, gameDependencies.mixingRules));
});
test('configuration rejects unverified or wrong-build values and incomplete production coverage', () => {
  const mock = mockVerified();
  const config: ReferenceCompatibilityConfig = { schemaVersion: 1, id: 'TEST-CONFIG', referenceBuild: 'TEST-BUILD',
    stage: 'research-candidate', mechanics: { capacity: undefined } } as unknown as ReferenceCompatibilityConfig;
  const empty = { ...config, mechanics: {} };
  assert.equal(validateReferenceCompatibilityConfig(empty, [], gameDependencies.mixingRules).productionReady, false);
  assert.throws(() => assertProductionCompatibilityReady(empty, [], gameDependencies.mixingRules), /Incomplete/);
  const candidate: ReferenceCompatibilityConfig = { ...empty, mechanics: { quantity: { claim: 'TEST ONLY', status: 'VERIFIED', value: 3, caseIds: [mock.id] } } };
  assert.throws(() => validateReferenceCompatibilityConfig(candidate, [{ ...mock, status: 'UNVERIFIED' }], gameDependencies.mixingRules));
  assert.throws(() => validateReferenceCompatibilityConfig({ ...candidate, referenceBuild: 'OTHER' }, [mock], gameDependencies.mixingRules));
  assert.throws(() => validateReferenceCompatibilityConfig(candidate, [{ ...mock, evidence: [...mock.evidence, { ...mock.evidence[0]!, id: 'OTHER-BUILD-EVIDENCE', referenceBuild: 'OTHER' }] }], gameDependencies.mixingRules));
  assert.throws(() => validateReferenceCompatibilityConfig({ ...candidate, stage: 'production' } as unknown as ReferenceCompatibilityConfig, [mock], gameDependencies.mixingRules));
  assert.throws(() => validateReferenceCompatibilityConfig(config, [mock], gameDependencies.mixingRules));
});
test('even fully covered candidate data cannot silently authorize a production adapter', () => {
  const mock = mockVerified();
  const mechanics = Object.fromEntries(MECHANIC_AREAS.map(area => [area, { claim: 'SYNTHETIC STRUCTURE TEST', status: 'VERIFIED', value: 'TEST', caseIds: [mock.id] }]));
  const config = { schemaVersion: 1, id: 'TEST-CONFIG', referenceBuild: 'TEST-BUILD', stage: 'research-candidate', mechanics } as ReferenceCompatibilityConfig;
  assert.equal(validateReferenceCompatibilityConfig(config, [mock], gameDependencies.mixingRules).complete, true);
  assert.throws(() => assertProductionCompatibilityReady(config, [mock], gameDependencies.mixingRules), /validated independent adapter/);
});
test('lab replay is isolated from an active normal game and its demo dependencies', () => {
  let normal = newGame(gameDependencies.mixingRules);
  normal = transitionGame(normal, { type: 'PourStarted', operationId: 0, ingredientId: 'orchard', atMs: 0 }, gameDependencies);
  normal = transitionGame(normal, { type: 'PourTick', operationId: 0, ingredientId: 'orchard', requestedUnits: gameDependencies.mixingRules.capacityUnits, atMs: 1 }, gameDependencies);
  const snapshot = JSON.stringify({ normal, rules: gameDependencies.mixingRules, engineStatus: gameDependencies.scoringEngine.verificationStatus });
  runCase(manual(inputActions), gameDependencies.mixingRules, gameDependencies.scoringEngine);
  generateCaseSeries(emptyResearchCase(), { kind: 'quantity', values: [1,2], ingredientId: 'X' }, gameDependencies.mixingRules);
  assert.equal(JSON.stringify({ normal, rules: gameDependencies.mixingRules, engineStatus: gameDependencies.scoringEngine.verificationStatus }), snapshot);
});
test('stored fixtures are schema-valid and DEMO cases never count as verified reference evidence', () => {
  const demo = JSON.parse(readFileSync(new URL('../../research/demo-cases/demo-sequence.json', import.meta.url), 'utf8'));
  assert.equal(parseResearchCase(demo, gameDependencies.mixingRules).origin, 'DEMO');
  const files = readdirSync(new URL('../../research/reference-cases/', import.meta.url)).filter(name => name.endsWith('.json'));
  for (const file of files) {
    const reference = parseResearchCase(JSON.parse(readFileSync(new URL('../../research/reference-cases/' + file, import.meta.url), 'utf8')), gameDependencies.mixingRules);
    assert.equal(reference.origin, 'REFERENCE');
  }
  assert.equal(Object.hasOwn(demo, 'observedReferenceResult'), false);
});

test('action comparison ignores unobserved actions and object field order, preserving unavailable actions', () => {
  assert.equal(compareObservations({ acceptedActions: [{ sequence: 3, accepted: true }] }, { acceptedActions: [{ sequence: 1, accepted: false }, { accepted: true, sequence: 3 }] }).status, 'MATCH');
  assert.equal(compareObservations({ acceptedActions: [{ sequence: 3, accepted: true }] }, { acceptedActions: [{ sequence: 1, accepted: false }] }).status, 'UNKNOWN / INCOMPLETE');
});
