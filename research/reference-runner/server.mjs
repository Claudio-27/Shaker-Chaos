import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
const sources = ['https://archive.org/download/flash_therightmix/flash_therightmix.swf','https://flashga.me/download/bartender-the-right-mix'];
const expected = 'ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7';
let binary;
let sourceUrl;
for (const source of sources) {
  let candidate;
  let response;
  try {
    response = await fetch(source, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
      console.log('Source unavailable: ' + source + ' | HTTP ' + response.status);
      continue;
    }
    candidate = Buffer.from(await response.arrayBuffer());
  } catch {
    console.log('Source download interrupted: ' + source);
    continue;
  }
  const candidateHash = createHash('sha256').update(candidate).digest('hex');
  if (candidateHash !== expected) throw Error('Reference bytes changed; stop and document a new build.');
  binary = candidate;
  sourceUrl = response.url;
  break;
}
if (!binary) throw Error('No reference source fully downloaded; retry later.');
const hash = createHash('sha256').update(binary).digest('hex');
const identity={referenceBuild:'ia-therightmix-ede221ad99e03173',source:sourceUrl,sha256:hash,bytes:binary.length,binarySaved:false};
createServer(async (req, res) => {
  if (req.method !== 'GET' || !['/', '/reference.swf', '/identity.json'].includes(req.url)) { res.writeHead(404).end(); return; }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', req.url === '/' ? 'text/html; charset=utf-8' : req.url === '/identity.json' ? 'application/json' : 'application/x-shockwave-flash');
  res.end(req.url === '/' ? await readFile(new URL('./player.html', import.meta.url)) : req.url === '/identity.json' ? JSON.stringify(identity) : binary);
}).listen(4191, '127.0.0.1', () => console.log('Research only: http://127.0.0.1:4191/ | SHA-256 ' + hash + ' | SWF in RAM only'));
