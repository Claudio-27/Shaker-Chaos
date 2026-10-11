import test from 'node:test';
import assert from 'node:assert/strict';
import { assertProductionBoundaries } from './production-boundaries.mjs';
test('production guard rejects reference runner identity, raw markers and SWF binaries',()=>{for(const marker of ['RAW_REFERENCE_RESEARCH_ONLY','Reference runner —','flash_therightmix','ia-therightmix-'])assert.throws(()=>assertProductionBoundaries([['assets/app.js',marker]]));assert.throws(()=>assertProductionBoundaries([['assets/reference.swf','bytes']]));assert.throws(()=>assertProductionBoundaries([['assets/app.js','demo']],['assets/app.js','assets/reference.swf']));assert.doesNotThrow(()=>assertProductionBoundaries([['assets/app.js','independent demo']]));});
