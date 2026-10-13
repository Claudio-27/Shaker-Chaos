import test from 'node:test';import assert from 'node:assert/strict';
import {evaluateShakeExplanations} from './procedure-hypotheses.mjs';
import {assertProductionBoundaries} from './production-boundaries.mjs';
const sample=(id,holds,score,extra=[])=>({id,outcome:'COMPLETED_INPUT',review:{score,visuallyVerified:true},requestedProcedure:{actions:[{target:'pour',holdMs:15000},...holds.map(holdMs=>({target:'shake',holdMs})),...extra]},delivery:holds.map(ms=>({target:'shake',actualMs:ms+1}))});
test('procedural hypotheses retain contradictory observations without fitting a bonus or discarding failures',()=>{
 const r=evaluateShakeExplanations([sample('a',[1000],270),sample('b',[4000],275),sample('c',[2000,2000],285),{...sample('x',[10000],0),review:{score:0,visuallyVerified:true,exploded:true}}]);
 assert.equal(r.pressCountOnly.status,'CONTRADICTED BY PROCEDURE DATA');assert.equal(r.requestedTotalDurationOnly.status,'CONTRADICTED BY PROCEDURE DATA');assert.equal(r.samples.length,4);assert.equal(r.samples[3].score,0);assert.equal(r.modelStatus,'NO_CANDIDATE');assert.equal(r.actualInternalDuration,'UNMEASURED');
});
test('Shake explanation scope excludes modifiers, different Pour baselines and missing results',()=>{
 const short=sample('short',[1000],111);short.requestedProcedure.actions[0].holdMs=5000;
 const missing=sample('missing',[1000],undefined);
 const r=evaluateShakeExplanations([sample('full',[1000],270),short,missing,sample('g',[1000],370,[{target:'garnishVisible',holdMs:80}])]);assert.deepEqual(r.samples.map(s=>s.id),['full']);assert.equal(r.pressCountOnly.status,'NOT YET TESTABLE');
});
test('production audit rejects actual research-only procedure-model and fill markers',()=>{
 for(const marker of ['RESEARCH ONLY — NOT GAME MECHANICS — NOT PRODUCTION READY','visible-gauge-height-v1'])assert.throws(()=>assertProductionBoundaries([['assets/app.js',marker]]));
});

