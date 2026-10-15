import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import process from 'node:process';
export function verifyRuntimeArt() {
  const root=fileURLToPath(new URL('../',import.meta.url));
  const read=path=>readFileSync(resolve(root,path));
  const data=JSON.parse(read('docs/runtime-art-inventory.json'));
  const historical=JSON.parse(read('docs/artwork-inventory.json'));
  assert.equal(data.assets.length,historical.length);
  assert.deepEqual(data.config,JSON.parse(read('scripts/art-runtime-config.json')));
  const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),paths=new Set();
  for(const row of data.assets){
    const original=historical.find(item=>item.id===row.id);assert.ok(original);
    assert.ok(row.sourcePath.startsWith('art-source/'));assert.equal(sha(read(row.sourcePath)),original.sha256);
    assert.equal(row.source.width,original.width);assert.equal(row.source.height,original.height);
    const {crop,source}=row;assert.ok(crop.x>=0&&crop.y>=0&&crop.width>0&&crop.height>0&&crop.x+crop.width<=source.width&&crop.y+crop.height<=source.height);
    assert.ok(row.discardedMaximumAlpha<row.alphaThreshold);
    for(const variant of Object.values(row.variants)){
      assert.match(variant.path,/^art\/runtime\/[a-z0-9/._-]+\.png$/);const path=resolve(root,'public',variant.path);
      assert.ok(path.startsWith(resolve(root,'public/art/runtime')+sep));const bytes=readFileSync(path);
      assert.equal(sha(bytes),variant.sha256);assert.equal(bytes.length,variant.bytes);assert.equal(bytes.readUInt32BE(16),variant.width);assert.equal(bytes.readUInt32BE(20),variant.height);paths.add(variant.path);
    }
  }
  const actual=[];const walk=(dir,prefix)=>{for(const entry of readdirSync(dir,{withFileTypes:true})){if(entry.isDirectory())walk(resolve(dir,entry.name),prefix+entry.name+'/');else actual.push(prefix+entry.name);}};
  walk(resolve(root,'public/art/runtime'),'art/runtime/');assert.deepEqual(actual.sort(),[...paths].sort());
  return {masters:data.assets.length,runtimeFiles:paths.size};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(verifyRuntimeArt());
