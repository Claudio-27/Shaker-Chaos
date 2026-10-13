// REFERENCE_NATIVE_RESEARCH_ONLY — Phase1E, never imported by production.
import fs from 'node:fs';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateNativeRequest} from './safety.mjs';
import {experiment,controlGate} from '../../scripts/causal-mechanics.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=path=>JSON.parse(fs.readFileSync(resolve(root,path),'utf8'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const append=(path,value)=>fs.writeFileSync(resolve(root,path),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const cli=fileURLToPath(new URL('./cli.mjs',import.meta.url));
function invoke(command,path){
 const r=spawnSync(process.execPath,[cli,command,...(path?[path]:[])],{cwd:root,encoding:'utf8',windowsHide:true});
 if(r.status!==0)throw Error(r.stderr||r.stdout||String(r.error));
 return JSON.parse(r.stdout);
}
function allRuns(){
 return fs.readdirSync(resolve(root,'research/phase1e/runs')).filter(f=>f.endsWith('.json')).sort().map(f=>{const r=read('research/phase1e/runs/'+f);const path=resolve(root,'research/phase1e/reviews/'+r.id+'.json');return {...r,...(fs.existsSync(path)?{review:JSON.parse(fs.readFileSync(path,'utf8'))}:{})};});
}
async function main(){
 const command=process.argv[2], setting=process.argv[3], repeat=process.argv[4];
 if(command==='gate'){console.log(JSON.stringify(controlGate(allRuns()),null,2));return;}
 if(command==='review'||command==='review-no-score'){
  const id=setting;if(!/^IA-1E-[A-Za-z0-9_-]+$/.test(id))throw Error('Invalid run ID');
  const hasScore=command==='review';const run=read('research/phase1e/runs/'+id+'.json'),score=hasScore?Number(repeat):undefined,reaction=process.argv[5],fill=process.argv[6]??'not-confirmed';
  if((hasScore&&(!/^-?\d+$/.test(repeat??'')||!Number.isSafeInteger(score)))||(!hasScore&&!repeat)||!reaction||run.outcome!=='COMPLETED_INPUT'||!run.resultCapture)throw Error('Review requires inspected numeric result from completed input');
  const explosionArg=process.argv[7];if(explosionArg!==undefined&&!['true','false'].includes(explosionArg))throw Error('Explosion review must be explicit true/false or omitted');
  const resultTiming=process.argv[8];if(resultTiming!==undefined&&!['before-serve','after-serve','unknown'].includes(resultTiming))throw Error('Invalid result timing');
  const reviewed={id,...(resultTiming===undefined?{}:{resultTiming,...(hasScore&&resultTiming==='before-serve'?{phase:'failure-result'}:{})}),...(explosionArg===undefined?{}:{exploded:explosionArg==='true'}),...(hasScore?{score}:{phase:repeat}),reactionId:reaction,visibleFill:fill,visuallyVerified:true,resultCapture:run.resultCapture,date:new Date().toISOString(),method:'direct-visual'};
  const review={...reviewed,experimentId:run.variable+'/'+run.setting,traces:run.traceFiles,repetition:run.repetition,initialCondition:'Phase1E cold launch; frozen script '+run.scriptId+'; '+run.environmentId,visibleNotes:'Direct visual capture and neutral reaction identity; mechanical acceptance is separate from OS input delivery; procedure '+run.procedureSha256,limitations:['Canonical quantity, Flash ticks and capacity unmapped. Requested and measured OS timing differ. No formula or bonus inferred.'],...(fill==='full-indicator-visible'?{fullIndicatorCapture:run.fullIndicatorCapture}:{})};
  if(!['not-confirmed','partial-visible','full-indicator-visible'].includes(fill))throw Error('Invalid fill review; no record written');
  if(fs.existsSync(resolve(root,'research/phase1e/reviews/'+id+'.json'))||fs.existsSync(resolve(root,'research/raw-observations/'+id+'.json')))throw Error('Run already reviewed; corrections must be append-only');
  const local='research/.local-reference/'+id+'-review-'+Date.now()+'.json';append(local,review);
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('./record.mjs',import.meta.url)),local],{cwd:root,encoding:'utf8',windowsHide:true});if(result.status!==0)throw Error(result.stderr||result.stdout);
  fs.mkdirSync(resolve(root,'research/phase1e/reviews'),{recursive:true});append('research/phase1e/reviews/'+id+'.json',reviewed);
  console.log(result.stdout.trim());return;
 }
 if(command!=='run'||!/^\d{2}$/.test(repeat??''))throw Error('Usage: phase1e run SETTING 01 [PAIR_ID] | review ID SCORE REACTION FILL [EXPLODED] | review-no-score ID PHASE REACTION FILL [EXPLODED] | gate');
 const script=read('research/phase1e/scripts/'+(setting==='CONTROL-5000'?'control-5000-v1':'control-full-v1')+'.json');
 if(hash(script.procedure)!==script.procedureSha256)throw Error('Frozen baseline changed; create a new version instead');
 if(!['CONTROL-FULL','CONTROL-5000'].includes(setting)&&!controlGate(allRuns()).passed)throw Error('Fresh dual control gate missing or drift detected; no treatment input');
 const variant=experiment(script.procedure,setting),p=variant.procedure;
 const id='IA-1E-'+setting+'-'+repeat,path='research/phase1e/runs/'+id+'.json';if(fs.existsSync(resolve(root,path)))throw Error('Append-only run ID already exists');
 const map=read('research/native-runner/targets.json');
 for(const [target,point] of Object.entries(script.procedure.targets))if(JSON.stringify(map.targets[target])!==JSON.stringify(point))throw Error('Frozen target map changed');
 for(const action of p.actions.filter(a=>a.kind!=='idle'))if(!p.targets[action.target])p.targets[action.target]=globalThis.structuredClone(map.targets[action.target]);
 const run={targetMapSha256:hash(map),schemaVersion:1,id,phase:'1E',scriptId:script.id,baselineProcedureSha256:read('research/phase1e/scripts/control-full-v1.json').procedureSha256,procedureSha256:hash(p),environmentId:p.environmentId,setting,variable:variant.variable,role:variant.role,anchor:variant.anchor,repetition:Number(repeat),pairId:process.argv[5]??null,requestedProcedure:p,sameFrozenControl:hash(p)===script.procedureSha256,startedAt:new Date().toISOString(),outcome:'ABORTED',traceFiles:[]};
 let sessionId,launchAttemptAt;
 try{
  const doctor=invoke('doctor');if(doctor.passed!==true||doctor.pinnedRuntime.environmentId!==p.environmentId||doctor.pinnedRuntime.executableSha256!==p.executableSha256)throw Error('Pinned runtime preflight mismatch');
  try{invoke('stop');}catch{/* launch refuses any still-live owned session */}
  launchAttemptAt=new Date().toISOString();const launched=invoke('launch');sessionId=launched.session.sessionId;run.sessionId=sessionId;run.coldLaunch=true;run.initialCapture=launched.capture;run.coldFingerprint=launched.coldStateFingerprint;
  if(launched.coldStateFingerprint!==p.coldFingerprint||['width','height','dpi'].some(k=>launched.geometry[{width:'Width',height:'Height',dpi:'Dpi'}[k]]!==p.geometry[k]))throw Error('Frozen cold-state fingerprint/geometry mismatch: no input');
  run.initialStateValidated=true;
  const request='research/.local-reference/'+id+'-request.json';const input={sessionId,initialVisualConfirmed:true,expectedGeometry:p.geometry,actions:p.actions,afterServeWaitMs:p.afterServeWaitMs};validateNativeRequest(input,map);append(request,input);
  const result=invoke('run',request);run.resultCapture=result.resultCapture;
  const allSteps=result.actions??[];const actions=allSteps.filter(a=>a.kind!=='idle');run.idles=allSteps.filter(a=>a.kind==='idle');
  run.delivery=actions.map(a=>({target:a.target,requestedMs:a.requestedHoldMs,actualMs:a.measuredHoldMs,downMs:a.downMs,upMs:a.upMs,buttonDownObserved:a.buttonDownObserved,buttonUpObserved:a.buttonUpObserved,geometry:a.geometry,stage:a.stage,client:a.client,captures:a.captures}));
  run.releaseToNextDownMs=actions.slice(1).map((a,i)=>a.downMs-actions[i].upMs);
  run.reactionCaptures=result.reactionCaptures;run.captureGaps=result.captureGaps;
  run.fullIndicatorCapture=actions.filter(a=>a.target==='pour').at(-1)?.captures.at(-1);
  if(allSteps.length!==p.actions.length||allSteps.some((a,i)=>p.actions[i].kind==='idle'?(a.kind!=='idle'||a.requestedWaitMs!==p.actions[i].waitMs||a.inputSent!==false):(a.target!==p.actions[i].target||a.requestedHoldMs!==p.actions[i].holdMs||a.buttonDownObserved!==true||a.buttonUpObserved!==true)))throw Error('Delivered semantic sequence incomplete or unconfirmed');
  run.outcome='COMPLETED_INPUT';run.timingOverrunMs=actions.map(a=>a.measuredHoldMs-a.requestedHoldMs);
 }catch(error){run.reason=String(error.message);}
 finally{
  if(!sessionId&&launchAttemptAt){try{const owned=read('research/.local-reference/session.json');if(owned.environmentId===p.environmentId&&owned.swfSha256===p.swfSha256&&Date.parse(owned.processStartedAt)>=Date.parse(launchAttemptAt)){sessionId=owned.sessionId;run.sessionId=sessionId;run.coldLaunch=true;run.launchRecovery='Owned session metadata recovered after launch failure; no input validation assumed';}}catch{/* No recoverable session; never stop an unrelated process. */}}
  if(sessionId){run.traceFiles=fs.readdirSync(resolve(root,'research/.local-reference')).filter(f=>f.startsWith(sessionId+'-')&&(f.includes('-trace-')||f.includes('-abort-'))).map(f=>'research/.local-reference/'+f);try{invoke('stop');}catch(error){run.stopReason=String(error.message);}}
  if(run.outcome==='ABORTED'&&run.traceFiles.length){const failure=read(run.traceFiles.at(-1));run.diagnosticReason=run.reason;run.reason=failure.reason??run.reason;run.abortedAction=failure.abortedAction??null;run.partialDelivery=failure.actions??[];}
  run.finishedAt=new Date().toISOString();append(path,run);
 }
 console.log(JSON.stringify({id,setting,outcome:run.outcome,reason:run.reason,sessionId,resultCapture:run.resultCapture,fullIndicatorCapture:run.fullIndicatorCapture,reactionCaptures:run.reactionCaptures?.slice(0,3),holds:run.delivery?.map(a=>[a.target,a.requestedMs,a.actualMs]),traceFiles:run.traceFiles},null,2));
 if(run.outcome==='ABORTED')process.exitCode=1;
}
if(process.argv[1]===fileURLToPath(import.meta.url))await main();
