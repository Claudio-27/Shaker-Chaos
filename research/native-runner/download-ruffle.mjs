import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import process from 'node:process';
const source=process.argv[2];
if(!source || !/^https:\/\/github\.com\/ruffle-rs\/ruffle\/releases\/download\/[^/]+\/ruffle-[^/]+-windows-x86_64\.zip$/.test(source))throw Error('Only an explicitly authorized official Ruffle Windows release download is accepted');
let url=source,response;
for(let i=0;i<6;i++){
 const u=new URL(url);
 if(!(u.hostname==='github.com'&&u.pathname.startsWith('/ruffle-rs/ruffle/releases/download/'))&&!['release-assets.githubusercontent.com','objects.githubusercontent.com','github-releases.githubusercontent.com'].includes(u.hostname))throw Error('Unexpected redirect host; stop download');
 response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(60000)});
 if(response.status>=300&&response.status<400){const next=response.headers.get('location');if(!next)throw Error('Redirect without target');url=new URL(next,url).href;continue;}
 if(!response.ok)throw Error('Official download HTTP '+response.status);break;
}
if(!response?.ok)throw Error('Download did not complete');
const data=Buffer.from(await response.arrayBuffer()),hash=createHash('sha256').update(data).digest('hex');
const path='research/.local-reference/'+new URL(source).pathname.split('/').at(-1);
await fs.writeFile(path,data,{flag:'wx'});
console.log(JSON.stringify({path,source,bytes:data.length,archiveSha256:hash},null,2));
