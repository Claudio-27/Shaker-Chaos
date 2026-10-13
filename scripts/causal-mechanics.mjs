// RESEARCH ONLY — NOT GAME MECHANICS — NOT PRODUCTION READY.
export const CONTROL_SCORES = {'CONTROL-FULL':270,'CONTROL-5000':111};
const known=r=>r.outcome==='COMPLETED_INPUT'&&r.review?.visuallyVerified===true&&Number.isSafeInteger(r.review.score);
export function controlGate(runs) {
 const controls=Object.entries(CONTROL_SCORES).map(([setting,expectedScore])=>{
  const attempts=runs.filter(r=>r.setting===setting), valid=attempts.filter(r=>known(r)&&r.coldLaunch===true&&r.initialStateValidated===true&&r.sameFrozenControl===true);
  const distinct=new Set(valid.map(r=>r.sessionId)).size===valid.length;
  const sameScope=new Set(valid.map(r=>r.procedureSha256+'|'+r.environmentId)).size===1;
  return {setting,expectedScore,attempts:attempts.length,ids:valid.map(r=>r.id),scores:valid.map(r=>r.review.score),
   passed:valid.length>=2&&distinct&&sameScope&&valid.every(r=>r.review.score===expectedScore),
   drift:valid.some(r=>r.review.score!==expectedScore),aborted:attempts.filter(r=>r.outcome==='ABORTED').map(r=>r.id)};
 });
 return {passed:controls.every(c=>c.passed),stopCausalInference:controls.some(c=>c.drift),controls};
}
export function experiment(base, setting) {
 const p=globalThis.structuredClone(base), a=p.actions;
 let variable='control',role='CONTROL',anchor='pour';
 if(setting==='CONTROL-FULL')return {procedure:p,variable,role,anchor};
 if(setting==='CONTROL-5000'){a.find(s=>s.target==='pour').holdMs=5000;return {procedure:p,variable,role,anchor};}
 // Capture callbacks alter short OS holds; profile is exact, retained and isolated.
 const fast=setting.startsWith('P-FAST-');
 const seg=/^P-(?:(FAST|GAP)-)?(1|2|3|4|5|10)$/.exec(setting);
 const delay=/^P-DELAY-(2|3|4|5|10)$/.exec(setting);
 const matched=/^P-MATCH-(\d+)$/.exec(setting);
 if(matched){const ms=Number(matched[1]);if(!Number.isSafeInteger(ms)||ms>30000)throw Error('Invalid matched idle');variable='pour-segmentation';a.splice(2,1,{target:'pour',holdMs:5000,captureDuring:true},{kind:'idle',waitMs:ms});}
 else if(seg||delay){
  variable=fast?'pour-capture':seg?.[1]==='GAP'?'pour-pauses':'pour-segmentation';
  const n=Number((seg??delay)[2]??delay[1]);
  const durations=Array.from({length:n},(_,i)=>Math.floor(5000/n)+(i<5000%n?1:0));
  if(delay){variable='pour-segmentation';a.splice(2,1,{target:'pour',holdMs:5000,captureDuring:true},{kind:'idle',waitMs:1200*(n-1)});}
  else {role=n===1?'CONTROL':'TREATMENT';const steps=durations.flatMap((holdMs,i)=>[{target:'pour',holdMs,captureDuring:fast?false:holdMs>=750},...(seg[1]==='GAP'&&i<n-1?[{kind:'idle',waitMs:2000}]:[])]);a.splice(2,1,...steps);}
 }else if(/^P-SHORT-(100|200|300|500|750|1000|1500)$/.test(setting)){
  variable='pour-activation';role='TREATMENT';a[2]={target:'pour',holdMs:Number(setting.split('-').at(-1)),captureDuring:false};
 }else if(/^P-CURVE-(2000|3000|4000|6000|7000|8000|9000|10000|11000|12000|12500|13000|13500|14000)$/.test(setting)){
  variable='pour-curve';role='TREATMENT';a[2].holdMs=Number(setting.split('-').at(-1));
 }else if(/^G-(CONTROL|AFTER|BEFORE|LATE|ONCE|TWICE)$/.test(setting)){
  variable='garnish-delay';anchor='shake';role=setting==='G-CONTROL'?'CONTROL':'TREATMENT';
  const click={target:'garnishVisible',holdMs:80};
  const idle={kind:'idle',waitMs:1280};
  if(setting==='G-CONTROL')a.splice(4,0,idle);
  if(setting==='G-AFTER')a.splice(4,0,click);
  if(setting==='G-BEFORE'){a.splice(3,0,click);a.splice(5,0,idle);}
  if(setting==='G-LATE'){a.splice(4,0,idle,click);}
  if(setting==='G-ONCE')a.splice(4,0,click,idle);
  if(setting==='G-TWICE')a.splice(4,0,click,click);
 }else if(/^S-(1x(1000|2000|3000|4000|5000)|2x(500|1000|2000)|3t(1000|3000|4000)|4x1000|5x1000)$/.test(setting)){
  variable='shake-grid';anchor='shake';role='TREATMENT';
  const spec=setting.slice(2),n=Number(spec[0]),total=spec.includes('t')?Number(spec.slice(2)):n*Number(spec.slice(2));
  a.splice(3,1,...Array.from({length:n},(_,i)=>({target:'shake',holdMs:Math.floor(total/n)+(i<total%n?1:0),captureDuring:total/n>=750})));
 }else if(/^S-MATCH-(\d+)$/.test(setting)){
  const ms=Number(setting.slice(8));if(!Number.isSafeInteger(ms)||ms>30000)throw Error('Invalid Shake idle');variable='shake-pauses';anchor='shake';a[3].holdMs=4000;a.splice(4,0,{kind:'idle',waitMs:ms});
 }else if(/^S-DELAY-(2|4)$/.test(setting)){
  variable='shake-pauses';anchor='shake';a[3].holdMs=4000;a.splice(4,0,{kind:'idle',waitMs:1200*(Number(setting.slice(-1))-1)});
 }else if(/^X-(6000|7000|8000|9000)$/.test(setting)){
  variable='explosion-boundary';anchor='shake';role='TREATMENT';a[3].holdMs=Number(setting.slice(2));
 }else if(/^I-(CONTROL|EARLY|MID|LATE|2|3)$/.test(setting)){
  variable='ice-acceptance';role=setting==='I-CONTROL'?'CONTROL':'TREATMENT';a[2].holdMs=5000;
  const click={target:'iceVisible',holdMs:80},idle={kind:'idle',waitMs:3000};
  if(setting==='I-CONTROL')a.splice(3,0,{kind:'idle',waitMs:4280});
  else{const n=/[23]$/.test(setting)?Number(setting.slice(-1)):1;const at=setting==='I-EARLY'?1:setting==='I-LATE'?4:3;a.splice(at,0,...Array.from({length:n},()=>[click,idle]).flat());}
 }else throw Error('Unsupported Phase1E experiment');
 return {procedure:p,variable,role,anchor};
}
export function timingSummary(r,target){
 const rows=(r.delivery??[]).filter(a=>a.target===target);
 if(!rows.length)return null;
 return {count:rows.length,requestedMs:rows.map(a=>a.requestedMs),actualMs:rows.map(a=>a.actualMs),
  cumulativeHoldMs:rows.reduce((n,a)=>n+a.actualMs,0),firstDownToFinalUpMs:rows.at(-1).upMs-rows[0].downMs,
  gapsMs:rows.slice(1).map((a,i)=>a.downMs-rows[i].upMs),
  firstDownToServeDownMs:(r.delivery??[]).find(a=>a.target==='serve')?.downMs-rows[0].downMs};
}
export function causalPair(rows,toleranceMs=100){
 if(!Number.isSafeInteger(toleranceMs)||toleranceMs<0)throw Error('Integer nonnegative timing tolerance');
 const c=rows.filter(r=>r.role==='CONTROL'),t=rows.filter(r=>r.role==='TREATMENT');
 const eligible=rows.length===2&&c.length===1&&t.length===1&&rows.every(r=>known(r)&&r.coldLaunch===true&&r.initialStateValidated===true)
  &&c[0].sessionId!==t[0].sessionId&&c[0].environmentId===t[0].environmentId&&c[0].baselineProcedureSha256===t[0].baselineProcedureSha256&&c[0].anchor===t[0].anchor;
 if(!eligible)return {status:'UNKNOWN / INVALID PAIR',delta:null};
 const ct=timingSummary(c[0],c[0].anchor),tt=timingSummary(t[0],t[0].anchor);
 const difference=ct&&tt?tt.firstDownToServeDownMs-ct.firstDownToServeDownMs:null;
 const validTiming=ct&&tt&&[ct,tt].every(t=>[...t.requestedMs,...t.actualMs,t.cumulativeHoldMs,t.firstDownToFinalUpMs,t.firstDownToServeDownMs,...t.gapsMs].every(v=>Number.isFinite(v)&&v>=0));
 const requestedHoldsMatch=validTiming&&ct.requestedMs.reduce((a,b)=>a+b,0)===tt.requestedMs.reduce((a,b)=>a+b,0);
 const holdDifference=validTiming?tt.cumulativeHoldMs-ct.cumulativeHoldMs:null;
 const matched=validTiming&&requestedHoldsMatch&&Math.abs(holdDifference)<=toleranceMs&&Math.abs(difference)<=toleranceMs;
 return {status:matched?'DELAY MATCHED PROCEDURE EFFECT':'OBSERVED DELTA / TIMING NOT MATCHED',controlId:c[0].id,treatmentId:t[0].id,delta:t[0].review.score-c[0].review.score,wallTimeDifferenceMs:difference,matched,toleranceMs,requestedHoldsMatch,holdDifferenceMs:holdDifference,controlTiming:ct,treatmentTiming:tt,interpretation:'Procedure effect only; internal ticks, effective liquid, phase timing and cursor hover remain unmeasured.'};
}
export function validateObservedFill(value){
 if(!value||value.method!=='visible-gauge-height-v1'||!Number.isSafeInteger(value.heightPixels)||!Number.isSafeInteger(value.maxHeightPixels)||value.maxHeightPixels<=0||value.heightPixels<0||value.heightPixels>value.maxHeightPixels||value.canonicalUnitMapping!=='UNMAPPED')throw Error('Invalid observed fill');
 return {...value,fraction:{numerator:value.heightPixels,denominator:value.maxHeightPixels}};
}
export function definedCausalPairs(runs,definitions){
 if(!Array.isArray(definitions))throw Error('Pair definitions array required');
 const ids=new Set();
 return definitions.map(d=>{
  if(!d||Object.keys(d).some(k=>!['id','controlId','treatmentId'].includes(k))||!['id','controlId','treatmentId'].every(k=>typeof d[k]==='string'&&d[k])||ids.has(d.id)||d.controlId===d.treatmentId)throw Error('Invalid causal pair definition');
  ids.add(d.id);const c=runs.find(r=>r.id===d.controlId),t=runs.find(r=>r.id===d.treatmentId);
  return {id:d.id,...causalPair([c,t].filter(Boolean))};
 });
}
export function summarizeCausalRuns(runs,definitions=[]){
 const settings=[...new Set(runs.map(r=>r.setting))];
 return {scope:'RESEARCH ONLY — NOT GAME MECHANICS — NOT PRODUCTION READY',controls:controlGate(runs),totalRuns:runs.length,inputCompleted:runs.filter(r=>r.outcome==='COMPLETED_INPUT').length,scored:runs.filter(known).length,
 aborted:runs.filter(r=>r.outcome==='ABORTED').map(r=>({id:r.id,reason:r.reason})),pendingReviews:runs.filter(r=>!r.review).map(r=>r.id),
 settings:settings.map(setting=>{const rows=runs.filter(r=>r.setting===setting),scores=rows.filter(known).map(r=>r.review.score);return {setting,ids:rows.map(r=>r.id),scores,repeatedExact:scores.length>=3&&new Set(scores).size===1&&new Set(rows.map(r=>r.sessionId)).size===rows.length,runs:rows.map(r=>({id:r.id,outcome:r.outcome,score:r.review?.score??null,reactionId:r.review?.reactionId??null,pour:timingSummary(r,'pour'),shake:timingSummary(r,'shake'),idles:r.idles??[],fill:r.review?.observedFill??null}))};}),
 pairs:[...[...new Set(runs.map(r=>r.pairId).filter(Boolean))].map(id=>({id,...causalPair(runs.filter(r=>r.pairId===id))})),...definedCausalPairs(runs,definitions)],
 modelStatus:'NO_CANDIDATE',canonicalQuantum:null,canonicalCapacity:null};
}

