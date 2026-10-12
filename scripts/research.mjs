import { applyRawCorrections } from '../src/research/rawCorrections.ts';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { volumeUnits } from '../src/domain/quantity.ts';
import { decodeResearchCase, encodeResearchCase } from '../src/research/fixtureCodec.ts';
import { parseRawObservation, observationToCase } from '../src/research/rawObservation.ts';
import { evaluateResearchModel } from '../src/research/modelEvaluation.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const metadata=JSON.parse(await readFile(resolve(root,'research/reference-builds.json'),'utf8'));
const rules={...metadata.projectionRules,capacityUnits:volumeUnits(metadata.projectionRules.capacityUnits)};
function inside(path) { const absolute=resolve(root,path), rel=relative(root,absolute); if(!rel || rel.startsWith('..') || isAbsolute(rel)) throw Error('Path must be a file inside repository'); return absolute; }
async function jsonFiles(dir) { return (await readdir(resolve(root,dir))).filter(f=>f.endsWith('.json')).sort(); }
let raw=[];
for(const name of await jsonFiles('research/raw-observations')) {
  const item=parseRawObservation(JSON.parse(await readFile(resolve(root,'research/raw-observations',name),'utf8')),rules);
  if(name!==item.id+'.json' || raw.some(r=>r.id===item.id)) throw Error('Raw ID/filename mismatch or duplicate');
  if(!metadata.builds.some(b=>b.id===item.referenceBuild) || !metadata.environments.some(e=>e.id===item.environmentId)) throw Error('Unknown build/environment');
  if(item.native){const env=metadata.environments.find(e=>e.id===item.environmentId);if(env.swfSha256!==item.native.swfSha256||env.executableSha256!==item.native.executableSha256||env.player!==item.native.ruffleVersion)throw Error('Native environment identity mismatch');}
  raw.push(item);
}
const correctionNames=await jsonFiles('research/raw-corrections');
raw=applyRawCorrections(raw,await Promise.all(correctionNames.map(async name=>JSON.parse(await readFile(resolve(root,'research/raw-corrections',name),'utf8')))),rules);
const command=process.argv[2] ?? 'validate';
if(command==='raw') {
 const item=raw.find(r=>r.id===process.argv[3]);if(!item)throw Error('Unknown raw observation ID');console.log(JSON.stringify(item,null,2));
} else if(command==='record') {
  const source=process.argv[3]; if(!source) throw Error('Usage: research:record repository-relative-file.json');
  const item=parseRawObservation(JSON.parse(await readFile(inside(source),'utf8')),rules);
  if(!metadata.builds.some(b=>b.id===item.referenceBuild) || !metadata.environments.some(e=>e.id===item.environmentId)) throw Error('Unknown build/environment');
  await writeFile(resolve(root,'research/raw-observations',item.id+'.json'),JSON.stringify(item,null,2)+'\n',{flag:'wx'});
  console.log('Appended '+item.id+'; existing records cannot be overwritten.');
} else if(command==='fixtures') {
  for(const item of raw) {
    const generated=observationToCase(item,rules), path=resolve(root,'research/reference-cases',generated.id+'.json');
    const content=encodeResearchCase(generated,rules);
    let prior; try{prior=await readFile(path,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
    if(prior!==undefined && prior!==content) throw Error('Existing fixture differs: '+generated.id+'; review it explicitly, do not overwrite evidence.');
    if(prior===undefined) await writeFile(path,content,{flag:'wx'});
  }
  console.log('Generated/checked '+raw.length+' independent fixtures; no evidence promotion.');
} else {
  const fixtures=[];
  for(const name of await jsonFiles('research/reference-cases')) {
    const item=decodeResearchCase(await readFile(resolve(root,'research/reference-cases',name),'utf8'),rules);
    if(name!==item.id+'.json' || fixtures.some(f=>f.id===item.id)) throw Error('Fixture ID/filename mismatch or duplicate');
    for(const e of item.evidence) if(!raw.some(r=>r.id===e.id && r.referenceBuild===e.referenceBuild && (!e.environmentId||e.environmentId===r.environmentId))) throw Error('Missing raw evidence for '+item.id);
    // Generated fixture equality exposes stale output/input/status edits, not just schema validity.
    const source=raw.find(r=>'case-'+r.id===item.id);
    if(item.id.startsWith('case-') && (!source || encodeResearchCase(item,rules)!==encodeResearchCase(observationToCase(source,rules),rules))) throw Error('Fixture differs from immutable raw: '+item.id);
    fixtures.push(item);
  }
  if(raw.some(r=>!fixtures.some(f=>f.id==='case-'+r.id))) throw Error('Raw/fixture coverage incomplete; run research:fixtures');
  const summary={rawObservations:raw.length,appendOnlyCorrections:correctionNames.length,referenceFixtures:fixtures.length,
    statuses:Object.fromEntries(['VERIFIED','STRONGLY_SUPPORTED','UNVERIFIED'].map(status=>[status,fixtures.filter(f=>f.status===status).length])),
    methods:Object.fromEntries(['AUTOMATED OBSERVATION','MANUAL OBSERVATION'].map(method=>[method,raw.filter(r=>r.method===method).length])),
    exactInputs:fixtures.filter(f=>f.inputValidation.status==='VERIFIED').length,numericScores:fixtures.filter(f=>f.observedReferenceResult?.score!==undefined).length,
    buildCounts:Object.fromEntries(metadata.builds.map(b=>[b.id,raw.filter(r=>r.referenceBuild===b.id).length])),
    nativeObservations:raw.filter(r=>r.native).length,nativeNumericScores:raw.filter(r=>r.native?.scoreRead).length,nativeColdSessions:new Set(raw.filter(r=>r.native).map(r=>r.native.sessionId)).size,
    environmentCounts:Object.fromEntries(metadata.environments.map(e=>[e.id,raw.filter(r=>r.environmentId===e.id).length])),
    experiments:[...new Set(raw.map(r=>r.experimentId))].sort(),referenceQuantum:null,referenceCapacity:null};
  if(command==='validate') console.log('Validated raw + linked ResearchCase fixtures: '+raw.length+' / '+fixtures.length);
  else if(command==='summary') console.log(JSON.stringify(summary,null,2));
  else if(command==='model') console.log(JSON.stringify({modelStatus:'INSUFFICIENT_DATA / NO_SCORING_CANDIDATE',...evaluateResearchModel(fixtures,rules)},null,2));
  else throw Error('Unknown research command');
}
