import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNativeCapture } from './nativeCapture.ts';
import { parseRawObservation,observationToCase } from './rawObservation.ts';
import { readFileSync } from 'node:fs';
import { volumeUnits } from '../domain/quantity.ts';
import { evaluateResearchModel } from './modelEvaluation.ts';
import { emptyResearchCase } from './caseModel.ts';
const rules={capacityUnits:volumeUnits(Number.MAX_SAFE_INTEGER),maximumIceUnits:Number.MAX_SAFE_INTEGER,maximumShakeDurationMs:Number.MAX_SAFE_INTEGER};
function telemetry(){return {sessionId:'SYNTHETIC-NATIVE',coldLaunch:true,swfSha256:'ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7',executableSha256:'a'.repeat(64),ruffleVersion:'Fictional test runtime, never reference evidence',renderer:'synthetic',os:'Windows',clock:'Stopwatch / per-command monotonic milliseconds',actions:[{commandId:'test-1',semanticTarget:'pour',requestedHoldMs:100,measuredHoldMs:101.125,downMs:0.5,upMs:101.625,window:{width:600,height:470,dpi:120,screenX:-600,screenY:0},client:{x:75,y:443},stage:{x:75,y:413},stageScale:1,captures:['research/.captures/TEST/before.png']}]};}
function raw(){return JSON.parse(readFileSync(new URL('../../research/raw-observations/IA-EMPTY-01.json',import.meta.url),'utf8'));}
test('native wall-clock precision remains telemetry and never invents canonical quantities',()=>{
 const r=raw();r.deliveredInputs=[];r.native=telemetry();
 const result=observationToCase(r,rules);
 assert.deepEqual(result.inputSequence,[]);assert.equal(result.inputValidation.status,'UNVERIFIED');assert.equal(result.evidence[0]?.environmentId,r.environmentId);
 assert.equal(parseRawObservation(r,rules).native?.actions[0]?.measuredHoldMs,101.125);
});
test('native capture validator rejects escaped paths, binary mismatch, bad geometry and reversed clocks',()=>{
 for(const patch of [{swfSha256:'b'.repeat(64)},{executableSha256:'invalid'},{os:'Linux'}])assert.throws(()=>validateNativeCapture({...telemetry(),...patch}));
 for(const change of [{captures:['../frame.png']},{captures:['public/frame.png']},{client:{x:600,y:443}},{upMs:0},{measuredHoldMs:100},{window:{width:600,height:470,dpi:0,screenX:0,screenY:0}}])assert.throws(()=>validateNativeCapture({...telemetry(),actions:[{...telemetry().actions[0],...change}]}));
});
test('native command clocks remain separately scoped while preserving order within each command',()=>{
 const first=telemetry().actions[0]!;
 assert.doesNotThrow(()=>validateNativeCapture({...telemetry(),actions:[first,{...first,commandId:'test-2'}]}));
 assert.throws(()=>validateNativeCapture({...telemetry(),actions:[first,first]}));
});
test('native displayed score requires actual matching raw output and cannot be promoted solely by OCR',()=>{
 const r=raw();r.deliveredInputs=[];r.native={...telemetry(),scoreRead:{score:17,method:'ocr',confidence:'high',visuallyVerified:false,capture:'research/.captures/TEST/result.png'}};
 assert.throws(()=>parseRawObservation(r,rules));
 r.observed={score:17};r.status='STRONGLY_SUPPORTED';assert.throws(()=>parseRawObservation(r,rules));
 r.native.scoreRead.visuallyVerified=true;assert.doesNotThrow(()=>parseRawObservation(r,rules));
});
test('native observations cannot pretend their SendInput trace was browser DOM delivery',()=>{
 assert.throws(()=>parseRawObservation({...raw(),native:telemetry()},rules));
});
test('candidate scoring refuses exact synthetic input from another runtime even with the same SWF identity',()=>{
 let calls=0;const item={...emptyResearchCase(),id:'SYNTHETIC',inputSequence:[],inputValidation:{status:'VERIFIED' as const,evidenceIds:['TEST-E'],notes:'Synthetic only'},observedReferenceResult:{score:17},evidence:[{id:'TEST-E',scope:'reference-automated' as const,date:'2000-01-01',source:'Test only',referenceBuild:'TEST-SWF',environmentId:'TEST-RUNTIME-A',procedure:'Synthetic only',repetitions:3}]};
 const result=evaluateResearchModel([item],rules,{id:'TEST-C',referenceBuild:'TEST-SWF',environmentId:'TEST-RUNTIME-B',productionReady:false,evaluate:()=>{calls++;return {score:17};}});
 assert.equal(calls,0);assert.equal(result.unknownFixtures,1);assert.equal(result.maximumNumericError,null);
});

test('aborted native hold retains unknown duration as null rather than inventing zero or a complete pour',()=>{
 const t={...telemetry(),actions:[],abortedActions:[{semanticTarget:'pour',requestedHoldMs:15000,measuredHoldMs:null,reason:'Old capture interrupted; duration unavailable',captures:['research/.captures/TEST/before.png']}]};
 assert.doesNotThrow(()=>validateNativeCapture(t));assert.equal(t.abortedActions[0]!.measuredHoldMs,null);
 assert.throws(()=>validateNativeCapture({...t,abortedActions:[{...t.abortedActions[0],measuredHoldMs:-1}]}));
 assert.throws(()=>validateNativeCapture({...t,abortedActions:[]}));
});
