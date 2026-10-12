// REFERENCE_NATIVE_RESEARCH_ONLY — Phase1D, never imported by production.
import fs from 'node:fs';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateNativeRequest} from './safety.mjs';
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
export function treatment(base,setting){
 const p=globalThis.structuredClone(base); const actions=p.actions;
 if(setting==='BASELINE'||setting==='CONTROL')return {procedure:p,variable:setting==='BASELINE'?'baseline':'control',role:setting};
 if(/^A-(14000|14500|15000|10000|8000|6000|5000|3000|2000)$/.test(setting)){actions.find(a=>a.target==='pour').holdMs=Number(setting.slice(2));return {procedure:p,variable:'pour-duration',role:'TREATMENT'};}
 if(/^B-(1|3)$/.test(setting)){actions.splice(2,1,...(setting==='B-1'?[{target:'pour',holdMs:5000,captureDuring:true}]:[1667,1667,1666].map(holdMs=>({target:'pour',holdMs,captureDuring:true}))));return {procedure:p,variable:'pour-count',role:setting==='B-1'?'CONTROL':'TREATMENT'};}
 if(/^C-(visible-)?(early-)?[12]$/.test(setting)){actions.splice(setting.includes('early')?1:3,0,...Array.from({length:Number(setting.slice(-1))},()=>({target:setting.includes('visible')?'iceVisible':'ice',holdMs:80})));return {procedure:p,variable:'ice',role:'TREATMENT'};}
 if(/^D-(visible-)?(before|after|repeat)$/.test(setting)){const at=setting.endsWith('before')?3:4;actions.splice(at,0,...Array.from({length:setting.endsWith('repeat')?2:1},()=>({target:setting.includes('visible')?'garnishVisible':'garnish',holdMs:80})));return {procedure:p,variable:'garnish',role:'TREATMENT'};}
 if(/^E-[0-5]$/.test(setting)){actions.splice(3,1,...Array.from({length:Number(setting.slice(2))},()=>({target:'shake',holdMs:1000,captureDuring:true})));return {procedure:p,variable:'shake-count',role:'TREATMENT'};}
 if(/^F-(1|2|4)$/.test(setting)){const n=Number(setting.slice(2));actions.splice(3,1,...Array.from({length:n},()=>({target:'shake',holdMs:4000/n,captureDuring:true})));return {procedure:p,variable:'shake-total-duration',role:'TREATMENT'};}
 if(/^X-(3000|5000|10000|15000)$/.test(setting)){actions.find(a=>a.target==='shake').holdMs=Number(setting.slice(2));return {procedure:p,variable:'shake-exposure',role:'TREATMENT'};}
 if(setting==='DIAG-ICE'||setting==='DIAG-GARNISH'||setting==='DIAG-ICE-V2'||setting==='DIAG-GARNISH-V2'){p.actions=[actions[0],{target:setting==='DIAG-ICE'?'iceChunks':setting==='DIAG-GARNISH'?'garnishLemons':setting==='DIAG-ICE-V2'?'iceVisible':'garnishVisible',holdMs:80}];p.afterServeWaitMs=0;return {procedure:p,variable:'target-calibration',role:'DIAGNOSTIC'};}
 throw Error('Unsupported treatment; no input');
}
export function baselineGate(runs){
 const complete=runs.filter(r=>r.setting==='BASELINE'&&r.outcome==='COMPLETED_INPUT'&&r.review?.visuallyVerified===true&&r.review.score!==undefined&&r.sameProcedure===true&&r.coldLaunch===true&&r.initialStateValidated===true);
 const identities=new Set(complete.map(r=>r.procedureSha256+'|'+r.environmentId));
 const scores=complete.map(r=>r.review.score);
 return {successful:complete.length,scores,frequencies:Object.fromEntries([...new Set(scores)].map(s=>[s,scores.filter(v=>v===s).length])),passed:complete.length>=3&&new Set(complete.map(r=>r.sessionId)).size===complete.length&&identities.size===1&&new Set(scores).size===1,preferredFive:complete.length>=5&&new Set(complete.map(r=>r.sessionId)).size===complete.length&&identities.size===1&&new Set(scores).size===1,aborted:runs.filter(r=>r.setting==='BASELINE'&&r.outcome==='ABORTED').length};
}
function allRuns(){
 return fs.readdirSync(resolve(root,'research/phase1d/runs')).filter(f=>f.endsWith('.json')).sort().map(f=>{const r=read('research/phase1d/runs/'+f);const path=resolve(root,'research/phase1d/reviews/'+r.id+'.json');return {...r,...(fs.existsSync(path)?{review:JSON.parse(fs.readFileSync(path,'utf8'))}:{})};});
}
async function main(){
 const command=process.argv[2], setting=process.argv[3], repeat=process.argv[4];
 if(command==='gate'){console.log(JSON.stringify(baselineGate(allRuns()),null,2));return;}
 if(command==='review'||command==='review-no-score'){
  const id=setting;if(!/^IA-1D-[A-Za-z0-9_-]+$/.test(id))throw Error('Invalid run ID');
  const hasScore=command==='review';const run=read('research/phase1d/runs/'+id+'.json'),score=hasScore?Number(repeat):undefined,reaction=process.argv[5],fill=process.argv[6]??'not-confirmed';
  if((hasScore&&(!/^-?\d+$/.test(repeat??'')||!Number.isSafeInteger(score)))||(!hasScore&&!repeat)||!reaction||run.outcome!=='COMPLETED_INPUT'||!run.resultCapture)throw Error('Review requires inspected numeric result from completed input');
  const explosionArg=process.argv[7];if(explosionArg!==undefined&&!['true','false'].includes(explosionArg))throw Error('Explosion review must be explicit true/false or omitted');
  const resultTiming=process.argv[8];if(resultTiming!==undefined&&!['before-serve','after-serve','unknown'].includes(resultTiming))throw Error('Invalid result timing');
  const reviewed={id,...(resultTiming===undefined?{}:{resultTiming,...(hasScore&&resultTiming==='before-serve'?{phase:'failure-result'}:{})}),...(explosionArg===undefined?{}:{exploded:explosionArg==='true'}),...(hasScore?{score}:{phase:repeat}),reactionId:reaction,visibleFill:fill,visuallyVerified:true,resultCapture:run.resultCapture,date:new Date().toISOString(),method:'direct-visual'};
  const review={...reviewed,experimentId:run.variable+'/'+run.setting,traces:run.traceFiles,repetition:run.repetition,initialCondition:'Phase1D cold launch; frozen script '+run.scriptId+'; '+run.environmentId,visibleNotes:'Direct visual capture and neutral reaction identity; mechanical acceptance is separate from OS input delivery; procedure '+run.procedureSha256,limitations:['Canonical quantity, Flash ticks and capacity unmapped. Requested and measured OS timing differ. No formula or bonus inferred.'],...(fill==='full-indicator-visible'?{fullIndicatorCapture:run.fullIndicatorCapture}:{})};
  if(!['not-confirmed','partial-visible','full-indicator-visible'].includes(fill))throw Error('Invalid fill review; no record written');
  if(fs.existsSync(resolve(root,'research/phase1d/reviews/'+id+'.json'))||fs.existsSync(resolve(root,'research/raw-observations/'+id+'.json')))throw Error('Run already reviewed; corrections must be append-only');
  const local='research/.local-reference/'+id+'-review-'+Date.now()+'.json';append(local,review);
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('./record.mjs',import.meta.url)),local],{cwd:root,encoding:'utf8',windowsHide:true});if(result.status!==0)throw Error(result.stderr||result.stdout);
  fs.mkdirSync(resolve(root,'research/phase1d/reviews'),{recursive:true});append('research/phase1d/reviews/'+id+'.json',reviewed);
  console.log(result.stdout.trim());return;
 }
 if(command!=='run'||!/^\d{2}$/.test(repeat??''))throw Error('Usage: phase1d run SETTING 01 [PAIR_ID] | review ID SCORE REACTION FILL [EXPLODED] | review-no-score ID PHASE REACTION FILL [EXPLODED] | gate');
 const script=read('research/phase1d/scripts/baseline-270-v1.json');
 if(hash(script.procedure)!==script.procedureSha256)throw Error('Frozen baseline changed; create a new version instead');
 if(setting!=='BASELINE'&&!baselineGate(allRuns()).passed)throw Error('Baseline gate not passed; no treatment input');
 if(setting?.startsWith('B-')){const short=allRuns().filter(r=>r.setting==='A-5000'&&r.outcome==='COMPLETED_INPUT'&&r.review?.visuallyVerified===true&&Number.isSafeInteger(r.review.score)&&r.coldLaunch&&r.initialStateValidated);if(short.length<3||new Set(short.map(r=>r.sessionId)).size!==short.length||new Set(short.map(r=>r.review.score)).size!==1||new Set(short.map(r=>r.procedureSha256+'|'+r.environmentId)).size!==1||short[0].review.score===script.historicallyObservedScore)throw Error('Pour-count gate missing two distinct repeated native procedures; no input');}
 const variant=treatment(script.procedure,setting),p=variant.procedure;
 const id='IA-1D-'+setting+'-'+repeat,path='research/phase1d/runs/'+id+'.json';if(fs.existsSync(resolve(root,path)))throw Error('Append-only run ID already exists');
 const map=read('research/native-runner/targets.json');
 for(const [target,point] of Object.entries(script.procedure.targets))if(JSON.stringify(map.targets[target])!==JSON.stringify(point))throw Error('Frozen target map changed');
 for(const action of p.actions)if(!p.targets[action.target])p.targets[action.target]=globalThis.structuredClone(map.targets[action.target]);
 const run={targetMapSha256:hash(map),schemaVersion:1,id,phase:'1D',scriptId:script.id,baselineProcedureSha256:script.procedureSha256,procedureSha256:hash(p),environmentId:p.environmentId,setting,variable:variant.variable,role:variant.role,repetition:Number(repeat),pairId:process.argv[5]??null,requestedProcedure:p,sameProcedure:hash(p)===script.procedureSha256,startedAt:new Date().toISOString(),outcome:'ABORTED',traceFiles:[]};
 let sessionId,launchAttemptAt;
 try{
  const doctor=invoke('doctor');if(doctor.passed!==true||doctor.pinnedRuntime.environmentId!==p.environmentId||doctor.pinnedRuntime.executableSha256!==p.executableSha256)throw Error('Pinned runtime preflight mismatch');
  try{invoke('stop');}catch{/* launch refuses any still-live owned session */}
  launchAttemptAt=new Date().toISOString();const launched=invoke('launch');sessionId=launched.session.sessionId;run.sessionId=sessionId;run.coldLaunch=true;run.initialCapture=launched.capture;run.coldFingerprint=launched.coldStateFingerprint;
  if(launched.coldStateFingerprint!==p.coldFingerprint||['width','height','dpi'].some(k=>launched.geometry[{width:'Width',height:'Height',dpi:'Dpi'}[k]]!==p.geometry[k]))throw Error('Frozen cold-state fingerprint/geometry mismatch: no input');
  run.initialStateValidated=true;
  const request='research/.local-reference/'+id+'-request.json';const input={sessionId,initialVisualConfirmed:true,expectedGeometry:p.geometry,actions:p.actions,afterServeWaitMs:p.afterServeWaitMs};validateNativeRequest(input,map);append(request,input);
  const result=invoke('run',request);run.resultCapture=result.resultCapture;
  const actions=result.actions??[];
  run.delivery=actions.map(a=>({target:a.target,requestedMs:a.requestedHoldMs,actualMs:a.measuredHoldMs,downMs:a.downMs,upMs:a.upMs,buttonDownObserved:a.buttonDownObserved,buttonUpObserved:a.buttonUpObserved,geometry:a.geometry,stage:a.stage,client:a.client,captures:a.captures}));
  run.releaseToNextDownMs=actions.slice(1).map((a,i)=>a.downMs-actions[i].upMs);
  run.reactionCaptures=result.reactionCaptures;run.captureGaps=result.captureGaps;
  run.fullIndicatorCapture=actions.filter(a=>a.target==='pour').at(-1)?.captures.at(-1);
  if(actions.length!==p.actions.length||actions.some((a,i)=>a.target!==p.actions[i].target||a.requestedHoldMs!==p.actions[i].holdMs||a.buttonDownObserved!==true||a.buttonUpObserved!==true))throw Error('Delivered semantic sequence incomplete or unconfirmed');
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
