import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {treatment,baselineGate} from '../research/native-runner/phase1d.mjs';
import {summarizeNativeRuns} from './native-characterization.mjs';
import {validateNativeRequest} from '../research/native-runner/safety.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('../research/phase1d/scripts/baseline-270-v1.json',import.meta.url),'utf8'));
const map=JSON.parse(fs.readFileSync(new URL('../research/native-runner/targets.json',import.meta.url),'utf8'));
const mock=(id,score=270)=>({id,sessionId:id,setting:'BASELINE',variable:'baseline',role:'BASELINE',sameProcedure:true,coldLaunch:true,initialStateValidated:true,outcome:'COMPLETED_INPUT',procedureSha256:'test-hash',baselineProcedureSha256:'test-hash',environmentId:'synthetic-test-environment',review:{score,visuallyVerified:true}});
test('baseline gate requires three independent cold sessions in one exact scope and retains aborted attempts',()=>{
 const failed={...mock('aborted'),outcome:'ABORTED',reason:'test focus loss'};
 assert.equal(baselineGate([mock('a'),mock('b'),failed]).passed,false);
 const result=baselineGate([mock('a'),mock('b'),mock('c'),failed]);assert.equal(result.passed,true);assert.equal(result.aborted,1);assert.equal(result.preferredFive,false);
 assert.equal(baselineGate([mock('a'),mock('a'),mock('c')]).passed,false);
 assert.equal(baselineGate([mock('a'),mock('b'),{...mock('c'),coldLaunch:false}]).passed,false);
});
test('one discordant score or runtime fails repeatability instead of being averaged or discarded',()=>{
 assert.equal(baselineGate([mock('a'),mock('b'),mock('c',271)]).passed,false);
 assert.equal(baselineGate([mock('a'),mock('b'),{...mock('c'),environmentId:'other'}]).passed,false);
 assert.equal(baselineGate([mock('a'),mock('b'),{...mock('c'),review:{score:270,visuallyVerified:false}}]).passed,false);
});
test('pour treatment changes only requested hold and leaves the frozen baseline owned and intact',()=>{
 const before=JSON.stringify(baseline.procedure),v=treatment(baseline.procedure,'A-14500');
 assert.equal(v.procedure.actions[2].holdMs,14500);v.procedure.actions[2].holdMs=15000;
 assert.deepEqual(v.procedure,baseline.procedure);assert.equal(JSON.stringify(baseline.procedure),before);
 assert.throws(()=>treatment(baseline.procedure,'A-15001'));
});
test('garnish placement and equal requested shake totals preserve their deliberate operation change',()=>{
 assert.deepEqual(treatment(baseline.procedure,'D-before').procedure.actions.map(a=>a.target),['letsMixOrb','ingredientSlot08','pour','garnish','shake','serve']);
 assert.deepEqual(treatment(baseline.procedure,'D-after').procedure.actions.map(a=>a.target),['letsMixOrb','ingredientSlot08','pour','shake','garnish','serve']);
 assert.equal(treatment(baseline.procedure,'D-visible-repeat').procedure.actions.filter(a=>a.target==='garnishVisible').length,2);
 assert.equal(treatment(baseline.procedure,'C-visible-2').procedure.actions.filter(a=>a.target==='iceVisible').length,2);
 for(const setting of ['F-1','F-2','F-4'])assert.equal(treatment(baseline.procedure,setting).procedure.actions.filter(a=>a.target==='shake').reduce((n,a)=>n+a.holdMs,0),4000);
});
test('summary pairs actual independent score observations and never treats missing or aborted outcomes as zero',()=>{
 const control={...mock('control'),setting:'CONTROL',role:'CONTROL',variable:'control',pairId:'pair1'};
 const treated={...mock('treated',300),setting:'C-1',role:'TREATMENT',variable:'ice',pairId:'pair1'};
 const failed={...mock('failure'),setting:'C-1',role:'TREATMENT',outcome:'ABORTED',pairId:'pair2',reason:'test abort'};
 const s=summarizeNativeRuns([control,treated,failed]);assert.equal(s.totalRuns,3);assert.equal(s.successfulServes,2);assert.equal(s.abortedRuns.length,1);assert.equal(s.controlTreatmentDeltas[0].delta,30);assert.equal(s.controlTreatmentDeltas[1].status,'UNKNOWN / INCOMPLETE');assert.equal('delta'in s.controlTreatmentDeltas[1],false);
 assert.deepEqual(s.scoreFrequencies,{'270':1,'300':1});assert.equal(s.modelStatus,'NO_CANDIDATE / CANONICAL QUANTITY UNMAPPED');
});
test('frozen geometry is validated before requests can reach native input',()=>{
 const request={sessionId:'synthetic',initialVisualConfirmed:true,actions:[{target:'pour',holdMs:10}],expectedGeometry:{width:600,height:470,dpi:120}};
 validateNativeRequest(request,map);assert.throws(()=>validateNativeRequest({...request,expectedGeometry:{width:600,height:470,dpi:0}},map));
});

test('diagnostics without served numeric results never inflate successful serves or score frequencies',()=>{
 const diagnostic={...mock('diagnostic'),setting:'DIAG-ICE-V2',variable:'target-calibration',role:'DIAGNOSTIC',review:{phase:'modifier-diagnostic',visuallyVerified:true}};
 const s=summarizeNativeRuns([mock('baseline'),diagnostic]);assert.equal(s.successfulServes,1);assert.deepEqual(s.scoreFrequencies,{'270':1});assert.equal(s.baseline.gate3,false);
});

test('per-setting repeatability retains discordant observations even when another setting is stable',()=>{
 const rows=[mock('a'),mock('b'),mock('c'),{...mock('d',100),setting:'A-5000',variable:'pour-duration'},{...mock('e',101),setting:'A-5000',variable:'pour-duration'},{...mock('f',100),setting:'A-5000',variable:'pour-duration'}];
 const report=summarizeNativeRuns(rows);assert.equal(report.experiments.find(e=>e.variable==='baseline').settings[0].repeatability,'REPEATED_NATIVE_OUTPUT');assert.equal(report.experiments.find(e=>e.variable==='pour-duration').settings[0].repeatability,'UNVERIFIED / INSUFFICIENT OR DISCORDANT REPEATS');
});

test('split pours preserve integer requested total while retaining distinct operation count',()=>{
 const one=treatment(baseline.procedure,'B-1'),split=treatment(baseline.procedure,'B-3');const pours=p=>p.procedure.actions.filter(a=>a.target==='pour');assert.equal(pours(one).length,1);assert.equal(pours(split).length,3);assert.equal(pours(one).reduce((n,a)=>n+a.holdMs,0),5000);assert.equal(pours(split).reduce((n,a)=>n+a.holdMs,0),5000);assert.ok(pours(split).every(a=>Number.isInteger(a.holdMs)));assert.equal(one.role,'CONTROL');assert.equal(split.role,'TREATMENT');
});

test('numeric zero from automatic failure remains a scored result but is not a successful Serve',()=>{
 const failure={...mock('failure',0),setting:'X-10000',variable:'shake-exposure',review:{score:0,visuallyVerified:true,exploded:true,resultTiming:'before-serve'}};const s=summarizeNativeRuns([mock('ok'),failure]);assert.equal(s.scoredResults,2);assert.equal(s.successfulServes,1);assert.deepEqual(s.scoreFrequencies,{'0':1,'270':1});assert.deepEqual(s.automaticFailureIds,['failure']);
});
