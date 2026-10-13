import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {definedCausalPairs,controlGate,experiment,timingSummary,causalPair,validateObservedFill,summarizeCausalRuns} from './causal-mechanics.mjs';
import {validateNativeRequest} from '../research/native-runner/safety.mjs';
import {parseResearchCase} from '../src/research/fixtureCodec.ts';
import {volumeUnits} from '../src/domain/quantity.ts';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const base=read('research/phase1e/scripts/control-full-v1.json').procedure;
const clone=v=>globalThis.structuredClone(v);
const make=(setting,i,score)=>({id:setting+i,setting,sessionId:'cold-'+setting+i,procedureSha256:setting,environmentId:'pinned',baselineProcedureSha256:'full',sameFrozenControl:true,coldLaunch:true,initialStateValidated:true,outcome:'COMPLETED_INPUT',review:{score,visuallyVerified:true},role:'CONTROL',anchor:'pour',delivery:[{target:'pour',requestedMs:5000,actualMs:5001,downMs:0,upMs:5001},{target:'serve',requestedMs:80,actualMs:81,downMs:7500,upMs:7581}]});
const validControls=()=>[make('CONTROL-FULL',1,270),make('CONTROL-FULL',2,270),make('CONTROL-5000',1,111),make('CONTROL-5000',2,111)];
test('dual control gate requires fresh independent exact cold controls',()=>{
 const rows=validControls();assert.equal(controlGate(rows).passed,true);
 for(const field of ['coldLaunch','initialStateValidated','sameFrozenControl']){const bad=clone(rows);bad[0][field]=false;assert.equal(controlGate(bad).passed,false);}
 const duplicate=clone(rows);duplicate[1].sessionId=duplicate[0].sessionId;assert.equal(controlGate(duplicate).passed,false);
 assert.equal(controlGate(rows.slice(0,3)).passed,false);
});
test('control drift stops inference, retains discordant scores and never averages',()=>{
 const rows=validControls();rows[3].review.score=110;
 const gate=controlGate(rows);assert.equal(gate.passed,false);assert.equal(gate.stopCausalInference,true);assert.deepEqual(gate.controls[1].scores,[111,110]);
});
test('frozen controls retain Phase1D procedure hashes and capture profile',()=>{
 for(const name of ['control-full-v1','control-5000-v1']){const s=read('research/phase1e/scripts/'+name+'.json');assert.equal(createHash('sha256').update(JSON.stringify(s.procedure)).digest('hex'),s.procedureSha256);}
 assert.deepEqual(experiment(base,'CONTROL-FULL').procedure,base);
 assert.deepEqual(experiment(base,'CONTROL-5000').procedure,read('research/phase1d/runs/IA-1D-A-5000-01.json').requestedProcedure);
});
test('segmentation preserves integer requested total and ordered unequal remainder without mutating baseline',()=>{
 const before=JSON.stringify(base);
 for(const n of [1,2,3,4,5,10]){const p=experiment(base,'P-'+n).procedure;const pours=p.actions.filter(a=>a.target==='pour');assert.equal(pours.length,n);assert.equal(pours.reduce((s,a)=>s+a.holdMs,0),5000);assert.ok(pours.every(a=>Number.isSafeInteger(a.holdMs)));}
 assert.deepEqual(experiment(base,'P-3').procedure.actions.filter(a=>a.target==='pour').map(a=>a.holdMs),[1667,1667,1666]);
 assert.equal(JSON.stringify(base),before);
});
test('idle controls add elapsed time without adding pour/shake presses; malformed waits fail before input',()=>{
 const p=experiment(base,'P-DELAY-3').procedure;assert.equal(p.actions.filter(a=>a.target==='pour').length,1);assert.equal(p.actions.find(a=>a.kind==='idle').waitMs,2400);
 const map={targets:base.targets};const req={sessionId:'synthetic',initialVisualConfirmed:true,actions:p.actions};
 assert.doesNotThrow(()=>validateNativeRequest(req,map));
 for(const a of [{kind:'idle',waitMs:1.5},{kind:'idle',waitMs:30001},{kind:'idle',waitMs:0,target:'pour'},{kind:'idle',waitMs:-1}])assert.throws(()=>validateNativeRequest({...req,actions:[req.actions[0],a]},map));
});
test('short Pour profile excludes expensive in-hold captures and all holds retain safety bounds',()=>{
 for(const ms of [100,200,300,500,750,1000,1500]){const a=experiment(base,'P-SHORT-'+ms).procedure.actions[2];assert.equal(a.captureDuring,false);assert.equal(a.holdMs,ms);}
 assert.throws(()=>experiment(base,'P-SHORT-15001'));
 const p=experiment(base,'S-3t1000').procedure;assert.deepEqual(p.actions.filter(a=>a.target==='shake').map(a=>a.holdMs),[334,333,333]);assert.ok(p.actions.filter(a=>a.target==='shake').every(a=>a.captureDuring===false));
});
test('timing summary retains holds, gaps and wall time rather than treating time as volume',()=>{
 const r=make('P-3',1,65);r.delivery=[{target:'pour',requestedMs:2500,actualMs:2501,downMs:0,upMs:2501},{target:'pour',requestedMs:2500,actualMs:2502,downMs:3701,upMs:6203},{target:'serve',downMs:8700}];
 assert.deepEqual(timingSummary(r,'pour'),{count:2,requestedMs:[2500,2500],actualMs:[2501,2502],cumulativeHoldMs:5003,firstDownToFinalUpMs:6203,gapsMs:[1200],firstDownToServeDownMs:8700});
});
test('causal pair reports matched output difference and explicit residual timing mismatch',()=>{
 const c=make('C',1,111),t=make('T',1,65);t.role='TREATMENT';t.delivery[1].downMs=7530;
 const pair=causalPair([c,t]);assert.equal(pair.delta,-46);assert.equal(pair.matched,true);assert.equal(pair.wallTimeDifferenceMs,30);
 t.delivery[1].downMs=7800;assert.equal(causalPair([c,t]).matched,false);
});
test('causal pair refuses reused sessions, unknown score, identity or phase anchor mismatch',()=>{
 const c=make('C',1,111),t=make('T',1,65);t.role='TREATMENT';
 for(const patch of [{sessionId:c.sessionId},{environmentId:'other'},{baselineProcedureSha256:'other'},{anchor:'shake'},{initialStateValidated:false},{review:{visuallyVerified:true}}])assert.equal(causalPair([c,{...t,...patch}]).delta,null);
 assert.equal(causalPair([c,t,t]).delta,null);
 assert.throws(()=>causalPair([c,t],1.5));
});
test('segmentation summary preserves every score and flags inconsistent repeats',()=>{
 const rows=[1,2,3].map(i=>({...make('P-3',i,i===3?66:65),role:'TREATMENT'}));const summary=summarizeCausalRuns(rows);
 assert.deepEqual(summary.settings[0].scores,[65,65,66]);assert.equal(summary.settings[0].repeatedExact,false);assert.equal(summary.canonicalQuantum,null);assert.equal(summary.canonicalCapacity,null);
});
test('observed fill metadata is an integer pixel ratio with no canonical mapping',()=>{
 const fill=validateObservedFill({method:'visible-gauge-height-v1',heightPixels:7,maxHeightPixels:30,canonicalUnitMapping:'UNMAPPED'});
 assert.deepEqual(fill.fraction,{numerator:7,denominator:30});
 for(const patch of [{heightPixels:7.5},{heightPixels:31},{maxHeightPixels:0},{canonicalUnitMapping:'ml'}])assert.throws(()=>validateObservedFill({...fill,...patch}));
});
test('attempted procedural promotion cannot bypass existing canonical input evidence validator',()=>{
 const fixture=read('research/reference-cases/case-IA-1D-BASELINE-02.json'),m=read('research/reference-builds.json'),rules={...m.projectionRules,capacityUnits:volumeUnits(m.projectionRules.capacityUnits)};
 assert.throws(()=>parseResearchCase({...fixture,status:'VERIFIED'},rules),/independently validated input evidence/);
 assert.equal(fixture.inputValidation.status,'UNVERIFIED');assert.equal(fixture.inputSequence.length,0);
});
test('research procedure predictors have no dependency path from production source or unchanged canonical domain',()=>{
 const dirs=['src/domain','src/application','src/ui','src/platform','src/content'];
 const walk=path=>fs.readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path+'/'+e.name):[path+'/'+e.name]);
 for(const d of dirs)for(const p of walk(new URL('../'+d,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'))){const s=fs.readFileSync(p,'utf8');assert.ok(!/causal-mechanics|procedure-hypotheses|PourProcedureModel|ShakeProcedureModel|phase1e/.test(s),p);}
});


test('all 204 historical raw, fixtures and corrections remain byte-identical',()=>{
 const baseline=read('research/phase1e/historical-evidence-sha256.json');
 assert.equal(Object.keys(baseline).length,204);
 for(const [path,expected] of Object.entries(baseline))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+path,import.meta.url))).digest('hex'),expected,path);
});

test('elapsed wall-time equality alone cannot certify a pair with different requested or delivered holds',()=>{
 const c=make('C',1,111),t=make('T',1,65);t.role='TREATMENT';t.delivery[0].requestedMs=4000;
 assert.equal(causalPair([c,t]).matched,false);
 t.delivery[0].requestedMs=5000;t.delivery[0].actualMs=5300;
 assert.equal(causalPair([c,t]).matched,false);
 t.delivery[0].actualMs=NaN;assert.equal(causalPair([c,t]).matched,false);
});

test('calibrated delay control keeps exactly one pour and records its explicit integer wait',()=>{
 const p=experiment(base,'P-MATCH-2327').procedure;assert.equal(p.actions.filter(a=>a.target==='pour').length,1);assert.equal(p.actions.find(a=>a.kind==='idle').waitMs,2327);
 assert.throws(()=>experiment(base,'P-MATCH-30001'));
});

test('append-only pair definitions link original run IDs without rewriting treatments',()=>{
 const c=make('C',1,111),t=make('T',1,63);t.role='TREATMENT';const original=JSON.stringify([c,t]);
 assert.equal(definedCausalPairs([c,t],[{id:'p',controlId:c.id,treatmentId:t.id}])[0].delta,-48);assert.equal(JSON.stringify([c,t]),original);
 assert.equal(definedCausalPairs([c],[{id:'p',controlId:c.id,treatmentId:t.id}])[0].delta,null);
 assert.throws(()=>definedCausalPairs([c,t],[{id:'p',controlId:c.id,treatmentId:c.id}]));
 assert.throws(()=>definedCausalPairs([c,t],[{id:'p',controlId:c.id,treatmentId:t.id},{id:'p',controlId:c.id,treatmentId:t.id}]));
});

test('Shake pause control retains one 4000ms hold and a bounded explicit no-input wait',()=>{
 const p=experiment(base,'S-MATCH-2457').procedure;assert.equal(p.actions.filter(a=>a.target==='shake').length,1);assert.equal(p.actions.find(a=>a.target==='shake').holdMs,4000);assert.equal(p.actions.find(a=>a.kind==='idle').waitMs,2457);assert.throws(()=>experiment(base,'S-MATCH-30001'));
});
