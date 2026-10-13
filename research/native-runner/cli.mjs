import { localResearchFile, validateNativeRequest, clientPoint } from './safety.mjs';
import fs from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { assertProductionBoundaries } from '../../scripts/production-boundaries.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const command=process.argv[2] ?? 'doctor';
if(!['doctor','launch','inspect','calibrate','input','run','smoke','stop'].includes(command))throw Error('Unknown native research command');
if(process.platform!=='win32')throw Error('Native reference research requires Windows; no input sent');
const base=['-NoLogo','-NoProfile','-NonInteractive','-File',fileURLToPath(new URL('./native.ps1',import.meta.url)),'-Command'];
function invoke(name,request) {
 const args=[...base,name];if(request)args.push('-RequestFile',request);
 const result=spawnSync('pwsh.exe',args,{cwd:root,encoding:'utf8',windowsHide:true});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(result.stdout||result.stderr||'Native command failed');
 return JSON.parse(result.stdout);
}
if(command==='doctor'||command==='smoke'){
 for(const path of ['reference.swf','ruffle.exe','research/.captures/a.png','research/native-runner/Win32.cs']){
  let rejected=false;try{assertProductionBoundaries([], [path]);}catch{rejected=true;}if(!rejected)throw Error('Production guard must reject native research');
 }
}
if(['input','run'].includes(command)){
 const request=JSON.parse(fs.readFileSync(localResearchFile(root,process.argv[3]),'utf8'));
 const map=JSON.parse(fs.readFileSync(resolve(root,'research/native-runner/targets.json'),'utf8'));
 validateNativeRequest(request,map);
 invoke('inspect'); // Activates only the hash/process/title-validated owned target, without pointer input.
 const ready=invoke('doctor');if(ready.targetScreenshotVerified!==true)throw Error('Doctor requires a foreground target screenshot before input');
 for(const action of request.actions.filter(a=>a.kind!=='idle'))clientPoint(map,{width:ready.geometry.Width,height:ready.geometry.Height,dpi:ready.geometry.Dpi},action.target);
}
if(command==='smoke'){
 invoke('doctor');
 try{invoke('stop');}catch{/* launch independently rejects an existing live owned session */}
 const launch=invoke('launch'),runtime=JSON.parse(fs.readFileSync(resolve(root,'research/.local-reference/runtime.json'),'utf8'));
 const hash=launch.coldStateFingerprint;
 if(hash!==runtime.expectedColdFingerprint)throw Error('Cold screenshot differs: inspect/calibrate before pointer input');
 const ready=invoke('doctor');if(ready.targetScreenshotVerified!==true)throw Error('Cold target capture required before input');
 const protocol=JSON.parse(fs.readFileSync(resolve(root,'research/native-runner/protocols.json'),'utf8')).firstGate;
 const request='research/.local-reference/smoke-request.json';
 const input={sessionId:launch.session.sessionId,initialVisualConfirmed:true,actions:protocol.actions,afterServeWaitMs:protocol.afterServeWaitMs};
 validateNativeRequest(input,JSON.parse(fs.readFileSync(resolve(root,'research/native-runner/targets.json'),'utf8')));
 fs.writeFileSync(resolve(root,request),JSON.stringify(input));
 console.log(JSON.stringify({protocol:protocol.id,initialVisualCheck:'EXACT_STATIC_INTRO_REGION_HASH',...invoke('run',request)},null,2));
} else console.log(JSON.stringify(invoke(command,process.argv[3]),null,2));
