import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { publicVisualCatalog } from '../content/publicVisualCatalog.ts';
import { environmentBackground } from '../content/visualPlan.ts';
import { withCleanBackgroundFailure } from './cleanBackgroundFailure.ts';

test('DEV delivery failure changes both clean URLs without mutating content, source, legacy or counter', () => {
  const original = JSON.stringify(publicVisualCatalog), broken = withCleanBackgroundFailure(publicVisualCatalog);
  const env = broken.environments['environment.e01']!, id = env.backgroundClean!;
  assert.equal(JSON.stringify(publicVisualCatalog), original);
  assert.equal(broken.environments, publicVisualCatalog.environments);
  assert.equal(broken.counters, publicVisualCatalog.counters);
  assert.equal(broken.assets[env.background], publicVisualCatalog.assets[env.background]);
  assert.deepEqual(environmentBackground(broken, env), {preferred: id, legacy: env.background});
  for (const tier of ['1x', '2x'] as const) {
    assert.match(broken.assets[id]!.runtime!.variants[tier].path, /__CLEAN_BACKGROUND_FAILURE_DEV_ONLY/);
    assert.notEqual(broken.assets[id]!.runtime!.variants[tier].path, publicVisualCatalog.assets[id]!.runtime!.variants[tier].path);
  }
});

test('seven reviewed browser baselines are bound to the production clean background and original stage', () => {
  const root = new URL('../../', import.meta.url);
  const manifest = JSON.parse(fs.readFileSync(new URL('docs/visual-baselines/phase2h/manifest.json', root), 'utf8'));
  assert.equal(manifest.phase, '2I');
  assert.equal(manifest.backgroundStatus, 'CLEAN — DOUBLE_COUNTER_STATUS: RESOLVED');
  assert.equal(manifest.background.sourceSha256, publicVisualCatalog.assets['environment.e01.background.clean']!.runtime!.source.sha256);
  assert.deepEqual(manifest.stage, {width:600, height:440});
  assert.deepEqual(manifest.cases.map((item:{name:string})=>item.name), ['b01-idle','b01-result','b02-idle','b02-result','failure','collection-closed','collection-open']);
  for (const item of manifest.cases) {
    const bytes = fs.readFileSync(new URL(item.path, root));
    assert.equal(bytes[0],255);assert.equal(bytes[1],216);
    assert.equal(bytes.length,item.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  }
});
