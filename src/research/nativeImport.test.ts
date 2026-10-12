import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gameDependencies } from '../application/bootstrap.ts';
import { observationToCase } from './rawObservation.ts';
import { runCase } from './caseRunner.ts';
import { emptyResearchCase } from './caseModel.ts';
import { appendManualAction, timelineFromHistory } from './manualSequence.ts';
test('native score import remains visible while an unmapped empty history cannot produce a false demo mismatch',()=>{
 const raw=JSON.parse(readFileSync(new URL('../../research/raw-observations/IA-1D-BASELINE-02.json',import.meta.url),'utf8'));
 const item=observationToCase(raw,gameDependencies.mixingRules),run=runCase(item,gameDependencies.mixingRules,gameDependencies.scoringEngine);
 assert.equal(item.observedReferenceResult?.score,270);assert.equal(run.canonicalInputKnown,false);assert.equal(run.comparison.status,'UNKNOWN / INCOMPLETE');assert.equal(run.current.score,undefined);assert.equal(run.evidenceStatus,'UNVERIFIED');
});
test('mapped synthetic chronology still compares exact reference score against unchanged demo scoring',()=>{
 let t=timelineFromHistory([],gameDependencies.mixingRules);t=appendManualAction(t,{type:'pour',ingredientId:'orchard',units:12});
 const item={...emptyResearchCase(),inputSequence:t.session.history,observedReferenceResult:{score:999}};
 const run=runCase(item,gameDependencies.mixingRules,gameDependencies.scoringEngine);
 assert.equal(run.canonicalInputKnown,true);assert.equal(run.comparison.status,'MISMATCH');assert.equal(run.result.verificationStatus,'UNVERIFIED');
});
