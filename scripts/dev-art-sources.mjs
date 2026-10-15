import { readFileSync, createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';
/** DEV server only. Exact approved IDs, no arbitrary filesystem URL, never a production endpoint. */
export function localArtSources() {
  const root=fileURLToPath(new URL('../',import.meta.url));
  return {name:'local-art-source-preview',apply:'serve',configureServer(server){
    const inventory=JSON.parse(readFileSync(new URL('../docs/runtime-art-inventory.json',import.meta.url),'utf8'));
    const paths=new Map(inventory.assets.map(row=>['/__art-source/'+row.id+'.png',resolve(root,row.sourcePath)]));
    server.middlewares.use((request,response,next)=>{
      if(!request.url?.startsWith('/__art-source/'))return next();
      const path=paths.get(request.url.split('?')[0]);
      if(!path||!path.startsWith(resolve(root,'art-source')+sep)||!['GET','HEAD'].includes(request.method)){response.statusCode=404;response.end();return;}
      response.setHeader('Content-Type','image/png');response.setHeader('Cache-Control','no-store');
      if(request.method==='HEAD'){response.end();return;}createReadStream(path).pipe(response);
    });
  }};
}
