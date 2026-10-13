import fs from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { localResearchFile } from './safety.mjs';
import { parseRawObservation } from '../../src/research/rawObservation.ts';
import { volumeUnits } from '../../src/domain/quantity.ts';
const root=fileURLToPath(new URL('../../',import.meta.url));
const review=JSON.parse(fs.readFileSync(localResearchFile(root,process.argv[2]),'utf8'));
const metadata=JSON.parse(fs.readFileSync(resolve(root,'research/reference-builds.json'),'utf8'));
const rules={...metadata.projectionRules,capacityUnits:volumeUnits(metadata.projectionRules.capacityUnits)};
if(!Array.isArray(review.traces)||!review.traces.length)throw Error('Reviewed trace list required');
const traces=review.traces.map(file=>({file,recordedAt:fs.statSync(localResearchFile(root,file)).birthtimeMs,data:JSON.parse(fs.readFileSync(localResearchFile(root,file),'utf8'))})).sort((a,b)=>a.recordedAt-b.recordedAt);
const first=traces[0].data;
if(traces.some(t=>t.data.session.sessionId!==first.session.sessionId||t.data.runtime.environmentId!==first.runtime.environmentId))throw Error('Do not merge cold sessions or runtimes');
const env=metadata.environments.find(e=>e.id===first.runtime.environmentId);
if(!env||env.executableSha256!==first.runtime.executableSha256||env.player!==first.runtime.version)throw Error('Pinned runtime identity mismatch');
const actions=traces.flatMap(t=>t.data.actions.filter(a=>a.kind!=='idle').map(a=>({commandId:t.file.split('/').at(-1).replace('.json',''),semanticTarget:a.target,requestedHoldMs:a.requestedHoldMs,measuredHoldMs:a.measuredHoldMs,downMs:a.downMs,upMs:a.upMs,window:{width:a.geometry.Width,height:a.geometry.Height,dpi:a.geometry.Dpi,screenX:a.geometry.X,screenY:a.geometry.Y},client:a.client,stage:a.stage,stageScale:a.stageScale,captures:a.captures,...(a.buttonDownObserved!==undefined?{buttonDownObserved:a.buttonDownObserved}:{}),...(a.buttonUpObserved!==undefined?{buttonUpObserved:a.buttonUpObserved}:{})})));
const native={sessionId:first.session.sessionId,coldLaunch:first.session.coldLaunch,swfSha256:first.session.swfSha256,executableSha256:first.runtime.executableSha256,ruffleVersion:first.runtime.version,renderer:first.runtime.renderer,os:'Windows',clock:'Stopwatch / per-command monotonic milliseconds',actions,traceFiles:traces.map(t=>t.file),reactionCaptures:traces.flatMap(t=>t.data.reactionCaptures??[]),captureGaps:traces.flatMap(t=>t.data.captureGaps??(t.data.reason?[{reason:t.data.reason}]:[])).map(g=>({reason:g.reason})),visibleFill:review.visibleFill??'not-confirmed'};
native.abortedActions=traces.filter(t=>t.data.abortedAction).map(t=>{const a=t.data.abortedAction;return {semanticTarget:a.target,requestedHoldMs:a.requestedHoldMs,measuredHoldMs:a.timing?.Started?a.timing.MeasuredHoldMs:null,reason:a.timing?.AbortReason??t.data.reason,captures:Array.isArray(a.captures)?a.captures:[a.captures]};});
 if(!native.abortedActions.length)delete native.abortedActions;
const finalCapture=review.resultCapture??traces.at(-1).data.resultCapture;
if(finalCapture)native.resultCapture=finalCapture;
if(review.fullIndicatorCapture)native.fullIndicatorCapture=review.fullIndicatorCapture;
if(review.score!==undefined){if(!finalCapture||review.visuallyVerified!==true)throw Error('A displayed score requires its local screenshot and explicit visual verification');native.scoreRead={score:review.score,method:'direct-visual',confidence:'high',visuallyVerified:true,capture:finalCapture};}
for(const file of [...actions.flatMap(a=>a.captures),...native.reactionCaptures,...(finalCapture?[finalCapture]:[]),...(native.fullIndicatorCapture?[native.fullIndicatorCapture]:[])]){
 const path=resolve(root,file);if(!file.startsWith('research/.captures/')||!fs.existsSync(path))throw Error('Reviewed local capture missing');
}
const kind=target=>['pour','shake','serve','ice','garnish'].includes(target)?target:target.startsWith('ingredientSlot')?'select':'player-control';
const raw=parseRawObservation({schemaVersion:1,id:review.id,experimentId:review.experimentId,referenceBuild:'ia-therightmix-ede221ad99e03173',date:first.session.processStartedAt.slice(0,10),environmentId:first.runtime.environmentId,method:'AUTOMATED OBSERVATION',repetition:review.repetition??1,initialCondition:review.initialCondition,requestedActions:[{kind:'cold-start',target:'exact SWF / fresh Ruffle process'},...traces.flatMap(t=>t.data.actions.map(a=>a.kind==='idle'?{kind:'wait',target:'guarded idle / no input',requestedDurationMs:a.requestedWaitMs}:{kind:kind(a.target),target:a.target,requestedDurationMs:a.requestedHoldMs})),...(native.abortedActions??[]).map(a=>({kind:kind(a.semanticTarget),target:a.semanticTarget,requestedDurationMs:a.requestedHoldMs}))],deliveredInputs:[],inputMapping:'UNMAPPED',...(review.score!==undefined?{observed:{...(typeof review.exploded==='boolean'?{exploded:review.exploded}:{}),score:review.score,phase:review.phase??'result-screen',...(review.reactionId?{reactionId:review.reactionId}:{})}}:{observed:{...(typeof review.exploded==='boolean'?{exploded:review.exploded}:{}),phase:review.phase??'diagnostic-screen'}}),visibleNotes:review.visibleNotes,limitations:review.limitations,confidence:review.score!==undefined?'medium':'low',status:'UNVERIFIED',source:'Native Windows black-box input; public official Ruffle release; SWF '+first.session.swfSha256,native},rules);
fs.writeFileSync(resolve(root,'research/raw-observations',raw.id+'.json'),JSON.stringify(raw,null,2)+'\n',{flag:'wx'});
console.log('Appended '+raw.id+' with native telemetry; no status/input/quantity promotion.');
