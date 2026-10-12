import test from 'node:test';
import assert from 'node:assert/strict';
import { clientPoint,validateNativeRequest,localResearchFile } from '../research/native-runner/safety.mjs';
import { assertProductionBoundaries } from './production-boundaries.mjs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const map=()=>({stage:{width:600,height:440,insetTop:30,insetBottom:0,insetBaseDpi:120},targets:{pour:{x:75,y:413},control:{x:207,y:15,space:'client'}}});
const geometry={width:600,height:470,dpi:120};
test('native stage mapping preserves target across client resizing, letterboxing and DPI',()=>{
 assert.deepEqual(clientPoint(map(),geometry,'pour'),{x:75,y:443,scale:1});
 assert.deepEqual(clientPoint(map(),{width:750,height:580,dpi:120},'pour'),{x:94,y:546,scale:1.25});
 assert.deepEqual(clientPoint(map(),{width:600,height:464,dpi:96},'pour'),{x:75,y:437,scale:1});
 assert.deepEqual(clientPoint(map(),{width:1000,height:470,dpi:120},'pour'),{x:275,y:443,scale:1});
});
test('native mapping rejects unknown targets and points outside the visible client',()=>{
 assert.throws(()=>clientPoint(map(),geometry,'unknown'));
 const bad=map();bad.targets.pour.y=440;assert.throws(()=>clientPoint(bad,geometry,'pour'));
 bad.targets.pour.y=-1;assert.throws(()=>clientPoint(bad,geometry,'pour'));
 for(const width of [0,NaN,Infinity,-1])assert.throws(()=>clientPoint(map(),{...geometry,width},'pour'));
 assert.throws(()=>clientPoint(map(),{...geometry,height:10},'pour'));
});
test('native sequence validation rejects malformed later actions before any sequence can begin',()=>{
 const req={sessionId:'SYNTHETIC-TEST',initialVisualConfirmed:true,actions:[{target:'pour',holdMs:100},{target:'pour',holdMs:250.5}]};
 assert.throws(()=>validateNativeRequest(req,map()));
 for(const patch of [{initialVisualConfirmed:false},{sessionId:''},{actions:[]},{actions:[{target:'constructor',holdMs:100}]},{actions:[{target:'pour',holdMs:15001}]},{actions:[{target:'pour',holdMs:0,script:'unsafe'}]},{afterServeWaitMs:30001}])assert.throws(()=>validateNativeRequest({...req,actions:[{target:'pour',holdMs:0}],...patch},map()));
 assert.doesNotThrow(()=>validateNativeRequest({...req,actions:[{target:'pour',holdMs:0,captureDuring:true}],afterServeWaitMs:0},map()));
});
test('native request paths cannot escape local research or read arbitrary repository files',()=>{
 for(const path of ['package.json','../outside.json','research/.local-reference/../../package.json','C:/Windows/system.ini'])assert.throws(()=>localResearchFile(root,path));
});
test('production guard rejects native binaries, captures, helpers, maps and markers',()=>{
 for(const path of ['ruffle.exe','runtime.dll','bundle.zip','helper.ps1','Win32.cs','research/.captures/shot.png','research/native-runner/targets.json'])assert.throws(()=>assertProductionBoundaries([], [path]));
 for(const marker of ['REFERENCE_NATIVE_RESEARCH_ONLY','ReferenceNative','research/.local-reference','research/.captures','research/native-runner'])assert.throws(()=>assertProductionBoundaries([['assets/app.js',marker]]));
 assert.doesNotThrow(()=>assertProductionBoundaries([['assets/app.js','original demo']],['assets/app.js','art/public.png']));
});
