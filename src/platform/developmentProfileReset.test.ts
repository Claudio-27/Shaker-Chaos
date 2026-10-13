import test from 'node:test';
import assert from 'node:assert/strict';
import { resetDevelopmentProfile } from './developmentProfileReset.ts';
import { profileStorageKey,recoveryStorageKey } from './localPlayerProfileRepository.ts';
import { memoryProfileStorage,newTestProfile } from './profileTestFixtures.ts';
test('confirmed DEV reset adapter only replaces this profile and removes its recovery copy',()=>{
  const store=memoryProfileStorage({unrelated:'keep',[profileStorageKey]:'old',[recoveryStorageKey]:'diagnostic'});
  const scoped={...store,removeItem(key: string){store.values.delete(key);}};
  assert.equal(resetDevelopmentProfile(newTestProfile(),scoped),true);
  assert.equal(store.values.get('unrelated'),'keep');assert.equal(store.values.has(recoveryStorageKey),false);
  assert.equal(JSON.parse(store.values.get(profileStorageKey)!).schemaVersion,1);
});
