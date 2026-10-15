import { Buffer } from 'node:buffer';
import process from 'node:process';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';

// Read-only PNG inspection; no raster rewriting, conversion, resampling or cropping.
function inspect(bytes) {
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  const depth = bytes[24], type = bytes[25];
  if (depth !== 8 || ![2, 6].includes(type) || bytes[28] !== 0) throw new Error('Unsupported PNG inspection format');
  const channels = type === 6 ? 4 : 3, chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const size = bytes.readUInt32BE(offset), kind = bytes.toString('ascii', offset + 4, offset + 8);
    if (kind === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * channels;
  let previous = Buffer.alloc(stride), cursor = 0, transparent = 0, partial = 0;
  const bounds = [width, height, -1, -1];
  const paeth = (a,b,c) => { const p=a+b-c, da=Math.abs(p-a), db=Math.abs(p-b), dc=Math.abs(p-c); return da<=db && da<=dc ? a : db<=dc ? b : c; };
  for (let y=0;y<height;y++) {
    const filter=packed[cursor++], row=Buffer.from(packed.subarray(cursor,cursor+stride)); cursor+=stride;
    for(let i=0;i<stride;i++) {
      const a=i>=channels ? row[i-channels] : 0, b=previous[i], c=i>=channels ? previous[i-channels] : 0;
      const predictors=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)];
      if(filter>4)throw new Error('Invalid PNG filter');
      row[i]=(row[i]+predictors[filter])&255;
    }
    for(let x=0;x<width;x++){
      const alpha=channels===4 ? row[x*4+3] : 255;
      if(alpha===0)transparent++; else if(alpha<255)partial++;
      if(alpha>8){bounds[0]=Math.min(bounds[0],x);bounds[1]=Math.min(bounds[1],y);bounds[2]=Math.max(bounds[2],x);bounds[3]=Math.max(bounds[3],y);}
    }
    previous=row;
  }
  return {width,height,format:'png',encodedBytes:bytes.length,decodedRgbaBytes:width*height*4,transparentPixels:transparent,partialAlphaPixels:partial,alphaBoundsAbove8:bounds};
}
const repository=resolve(import.meta.dirname,'..');
if(process.argv.includes('--copy'))throw new Error('Master ingestion is frozen. Originals live in art-source; use npm run art:build for runtime variants.');
const sourceRoot=process.argv[2];
if(!sourceRoot)throw new Error('Supply explicitly authorized source directory');
const rows=JSON.parse(await readFile(resolve(repository,'scripts/artwork-mapping.json'),'utf8'));
for(const row of rows){
 const bytes=await readFile(resolve(sourceRoot,row.source));
 Object.assign(row,inspect(bytes),{sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(resolve(repository,'docs/artwork-inventory.json'),JSON.stringify(rows,null,2)+'\n');
if(process.argv.includes('--copy')){
 for(const row of rows){
  const target=resolve(repository,'public',row.path);
  if(relative(repository,target).startsWith('..'))throw new Error('Target escaped repository');
  await mkdir(dirname(target),{recursive:true});
  await copyFile(resolve(sourceRoot,row.source),target);
  if(createHash('sha256').update(await readFile(target)).digest('hex')!==row.sha256)throw new Error('Copy hash mismatch');
 }
}
console.log(JSON.stringify(rows,null,2));
