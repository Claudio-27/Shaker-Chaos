import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyRawCorrections } from './rawCorrections.ts';
import { parseRawObservation } from './rawObservation.ts';
import { volumeUnits } from '../domain/quantity.ts';
const rules={capacityUnits:volumeUnits(Number.MAX_SAFE_INTEGER),maximumIceUnits:Number.MAX_SAFE_INTEGER,maximumShakeDurationMs:Number.MAX_SAFE_INTEGER};
const json=(path:string)=>JSON.parse(readFileSync(new URL('../../research/'+path,import.meta.url),'utf8'));
test('append-only native chronology correction preserves the raw record, every command and timing',()=>{
 const original=parseRawObservation(json('raw-observations/IA-NATIVE-FULL-DIAG-01.json'),rules);
 const before=JSON.stringify(original),fix=json('raw-corrections/IA-NATIVE-FULL-DIAG-01-order.json');
 const [view]=applyRawCorrections([original],[fix],rules);
 assert.equal(JSON.stringify(original),before);
 assert.deepEqual(view!.requestedActions.map(a=>a.kind),['cold-start','player-control','select','pour','shake','serve']);
 assert.deepEqual(view!.native!.actions.map(a=>a.semanticTarget),['letsMixOrb','ingredientSlot08','pour','shake','serve']);
 assert.equal(view!.native!.actions.find(a=>a.semanticTarget==='pour')!.measuredHoldMs,original.native!.actions.find(a=>a.semanticTarget==='pour')!.measuredHoldMs);
 assert.equal(view!.observed!.score,270);assert.equal(view!.inputMapping,'UNMAPPED');
});
test('native chronology correction rejects missing commands, wrong source order and missing reasons',()=>{
 const raw=parseRawObservation(json('raw-observations/IA-NATIVE-FULL-DIAG-01.json'),rules),fix=json('raw-corrections/IA-NATIVE-FULL-DIAG-01-order.json');
 for(const patch of [{commandOrder:[fix.commandOrder[0]]},{beforeCommandOrder:[]},{reason:''},{observationId:'missing'}])assert.throws(()=>applyRawCorrections([raw],[{...fix,...patch}],rules));
});
test('historical pointer correction remains compatible and does not overwrite phase 1B raw data',()=>{
 const raw=parseRawObservation(json('raw-observations/IA-SYNTH-POINTER-01.json'),rules);
 const [view]=applyRawCorrections([raw],[json('raw-corrections/IA-SYNTH-POINTER-01.json')],rules);
 assert.equal(raw.deliveredInputs[11]!.button,0);assert.equal(view!.deliveredInputs[11]!.button,2);
});
