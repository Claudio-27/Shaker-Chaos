import { resolve, relative, isAbsolute } from 'node:path';
import { realpathSync } from 'node:fs';
function object(v) { if(!v || typeof v!=='object' || Array.isArray(v))throw Error('Native research object required');return v; }
function finite(v,min=0) { if(typeof v!=='number'||!Number.isFinite(v)||v<min||Math.abs(v)>Number.MAX_SAFE_INTEGER)throw Error('Invalid native geometry'); }
export function clientPoint(map,geometry,targetName){
 object(map);object(geometry);const s=object(map.stage),p=object(object(map.targets)[targetName]);
 for(const value of [geometry.width,geometry.height,geometry.dpi,s.width,s.height]){finite(value,1);}
 for(const value of [p.x,p.y,s.insetTop,s.insetBottom])finite(value);
 const dpiBase=s.insetBaseDpi??geometry.dpi;finite(dpiBase,1);
 const top=s.insetTop*geometry.dpi/dpiBase,bottom=s.insetBottom*geometry.dpi/dpiBase;
 const scale=Math.min(geometry.width/s.width,(geometry.height-top-bottom)/s.height);
 if(scale<=0)throw Error('No stage area');
 let x,y;
 if(p.space==='client'){x=Math.round(p.x);y=Math.round(p.y);}else{
  if(p.x>=s.width||p.y>=s.height)throw Error('Stage target out of bounds');
  x=Math.round((geometry.width-s.width*scale)/2+p.x*scale);
  y=Math.round(top+(geometry.height-top-bottom-s.height*scale)/2+p.y*scale);
 }
 if(x<0||y<0||x>=geometry.width||y>=geometry.height)throw Error('Client target out of bounds');
 return {x,y,scale};
}
export function validateNativeRequest(request,map){
 object(request);if(typeof request.sessionId!=='string'||!request.sessionId||request.initialVisualConfirmed!==true)throw Error('Session and visual confirmation required');
 if(!Array.isArray(request.actions)||!request.actions.length||request.actions.length>30)throw Error('1..30 native actions required');
 for(const a of request.actions){object(a);if(Object.keys(a).some(k=>!['target','holdMs','captureDuring'].includes(k))||typeof a.target!=='string'||!Object.hasOwn(map.targets,a.target)||!Number.isSafeInteger(a.holdMs)||a.holdMs<0||a.holdMs>15000||('captureDuring'in a&&typeof a.captureDuring!=='boolean'))throw Error('Invalid native sequence; no input');}
 if('expectedGeometry'in request){const g=object(request.expectedGeometry);if(Object.keys(g).some(k=>!['width','height','dpi'].includes(k))||['width','height','dpi'].some(k=>!Number.isSafeInteger(g[k])||g[k]<=0))throw Error('Invalid frozen geometry');}
 if('afterServeWaitMs'in request&&(!Number.isSafeInteger(request.afterServeWaitMs)||request.afterServeWaitMs<0||request.afterServeWaitMs>30000))throw Error('Invalid result wait');
}
export function localResearchFile(root,input){
 if(typeof input!=='string')throw Error('Local research path required');
 const base=resolve(root,'research/.local-reference'),file=resolve(root,input),rel=relative(base,file);
 if(!rel||rel.startsWith('..')||isAbsolute(rel))throw Error('Path outside local research directory');
 const physicalRoot=realpathSync(root),physicalFile=realpathSync(file),actual=relative(physicalRoot,physicalFile);
 if(actual.startsWith('..')||isAbsolute(actual))throw Error('Research path escaped repository');
 return file;
}
