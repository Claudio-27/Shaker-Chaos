import type { RawReferenceObservation } from './rawObservation.ts';
import { parseRawObservation } from './rawObservation.ts';
import type { MixingRules } from '../domain/model.ts';
/** Apply append-only corrections to an owned view. Never change raw files or invent events. */
export function applyRawCorrections(source: readonly RawReferenceObservation[], corrections: readonly unknown[], rules: MixingRules) {
 const view=source.map(item=>parseRawObservation(item,rules));
 for(const value of corrections){
  if(!value||typeof value!=='object'||Array.isArray(value))throw TypeError('Invalid correction');
  const fix=value as Record<string,unknown>;
  const item=view.find(r=>r.id===fix.observationId);
  if(!item||typeof fix.reason!=='string'||!fix.reason.trim())throw TypeError('Correction needs raw source and reason');
  if(fix.kind==='DELIVERED_INPUT_BUTTON'){
   if(Object.keys(fix).some(k=>!['kind','observationId','inputIndex','before','after','reason','date'].includes(k))||!Number.isSafeInteger(fix.inputIndex)||(fix.inputIndex as number)<0||!Number.isSafeInteger(fix.after)||(fix.after as number)<0||item.deliveredInputs[fix.inputIndex as number]?.button!==fix.before)throw TypeError('Invalid input-button correction');
   (item.deliveredInputs[fix.inputIndex as number] as {button:number}).button=fix.after as number;
  }else if(fix.kind==='NATIVE_COMMAND_ORDER'){
   if(Object.keys(fix).some(k=>!['kind','observationId','beforeCommandOrder','commandOrder','reason'].includes(k))||!item.native||!Array.isArray(fix.commandOrder)||!Array.isArray(fix.beforeCommandOrder)||fix.commandOrder.some(k=>typeof k!=='string'))throw TypeError('Invalid native-order correction');
   const current=[...new Set(item.native.actions.map(a=>a.commandId))];
   const desired=fix.commandOrder as string[];
   if(JSON.stringify(current)!==JSON.stringify(fix.beforeCommandOrder)||new Set(desired).size!==desired.length||desired.length!==current.length||desired.some(k=>!current.includes(k))||item.requestedActions.length!==item.native.actions.length+1||item.requestedActions[0]?.kind!=='cold-start')throw TypeError('Native correction must retain every command and requested action');
   const paired=item.native.actions.map((action,index)=>({action,request:item.requestedActions[index+1]!}));
   if(paired.some(p=>p.action.semanticTarget!==p.request.target||p.action.requestedHoldMs!==p.request.requestedDurationMs))throw TypeError('Native requested/delivered pairing mismatch');
   paired.sort((a,b)=>desired.indexOf(a.action.commandId)-desired.indexOf(b.action.commandId));
   (item.native as {actions:typeof item.native.actions}).actions=paired.map(p=>p.action);
   (item as {requestedActions:typeof item.requestedActions}).requestedActions=[item.requestedActions[0],...paired.map(p=>p.request)];
   if(item.native.traceFiles)(item.native as {traceFiles:readonly string[]}).traceFiles=[...item.native.traceFiles].sort((a,b)=>desired.indexOf(a.split('/').at(-1)!.replace('.json',''))-desired.indexOf(b.split('/').at(-1)!.replace('.json','')));
  }else throw TypeError('Unknown append-only correction');
  parseRawObservation(item,rules);
 }
 return view;
}
