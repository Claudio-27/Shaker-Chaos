// REFERENCE_NATIVE_RESEARCH_ONLY: sequential native runs, abort stops the batch.
import fs from 'node:fs';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const id=process.argv[2];if(!/^[A-Za-z0-9_-]+$/.test(id??''))throw Error('Repository batch ID required');
const root=fileURLToPath(new URL('../../',import.meta.url)),path=new URL('../phase1d/batches/'+id+'.json',import.meta.url);
const batch=JSON.parse(fs.readFileSync(path,'utf8'));
if(batch.id!==id||batch.schemaVersion!==1||!Array.isArray(batch.jobs)||batch.jobs.length>30)throw Error('Invalid batch');
const deadline=batch.notAfterUtc?Date.parse(batch.notAfterUtc):null;if(deadline!==null&&!Number.isFinite(deadline))throw Error('Invalid research deadline');
for(const job of batch.jobs){
 if(deadline!==null&&Date.now()+90000>deadline){console.log('Stopped before next cold run: agreed interval ending.');break;}
 console.log(JSON.stringify({starting:job,at:new Date().toISOString()}));
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('./phase1d.mjs',import.meta.url)),'run',job.setting,job.repeat,...(job.pairId?[job.pairId]:[])],{cwd:root,encoding:'utf8',windowsHide:true});
 if(result.stdout)console.log(result.stdout.trim());if(result.status!==0){if(result.stderr)console.error(result.stderr);process.exitCode=1;break;}
}
