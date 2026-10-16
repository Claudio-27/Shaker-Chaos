import test from 'node:test';
import assert from 'node:assert/strict';
import { gainXp } from '../domain/playerProfile.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { profileStorageKey as key,recoveryStorageKey,migratePlayerProfile } from './localPlayerProfileRepository.ts';
import { memoryProfileStorage,newTestProfile,testRepository } from './profileTestFixtures.ts';
test('first creation persists one namespaced save; reload keeps ID, progress and loadout',()=>{
  const storage=memoryProfileStorage({'unrelated.save':'keep'}),repo=testRepository(storage),loaded=repo.load();
  assert.equal(loaded.status,'saved');repo.save(gainXp(loaded.profile,120,tuning));
  const restored=testRepository(storage).load();assert.equal(restored.profile.profileId,loaded.profile.profileId);
  assert.equal(restored.profile.progression.level,2);assert.equal(storage.values.get('unrelated.save'),'keep');
  assert.equal(restored.profile.ownership.length,6);
});
test('migration boundary accepts V1 and preserves unsupported older/future formats',()=>{
  assert.equal(migratePlayerProfile(JSON.stringify(newTestProfile()),tuning).kind,'current');
  for(const [version,kind] of [[0,'older-unsupported'],[3,'future-unsupported']]){
    const raw=JSON.stringify({schemaVersion:version,futureData:'keep'}),storage=memoryProfileStorage({[key]:raw}),repo=testRepository(storage);
    assert.equal(migratePlayerProfile(raw,tuning).kind,kind);assert.equal(repo.load().status,'unsupported');
    repo.save(gainXp(repo.load().profile,5,tuning));assert.equal(storage.values.get(key),raw);
  }
});
test('corrupt JSON or schema is copied exactly before recovering a safe starter',()=>{
  for(const raw of ['{broken',JSON.stringify({...newTestProfile(),wallet:{coins:-1}})]){
    const storage=memoryProfileStorage({[key]:raw}),repo=testRepository(storage),loaded=repo.load();
    assert.equal(loaded.status,'recovered');assert.equal(loaded.profile.progression.level,1);assert.equal(storage.values.get(recoveryStorageKey),raw);
    assert.equal(loaded.diagnostics[0]?.kind,'corrupt');assert.equal(migratePlayerProfile(storage.values.get(key)!,tuning).kind,'current');
  }
});
test('failed recovery backup leaves original save untouched and uses memory only',()=>{
  const storage=memoryProfileStorage({[key]:'bad',[recoveryStorageKey]:'older diagnostic'});const repo=testRepository(storage);
  assert.equal(repo.load().status,'memory');repo.save(gainXp(repo.load().profile,20,tuning));
  assert.equal(storage.values.get(key),'bad');assert.equal(storage.values.get(recoveryStorageKey),'older diagnostic');
});
test('unavailable storage, read denial and quota failure remain playable and honest',()=>{
  assert.equal(testRepository(null).load().status,'memory');
  for(const cause of ['read','write']){const storage=memoryProfileStorage();if(cause==='read')storage.failRead(true);else storage.failWrite(true);
    const repo=testRepository(storage),p=repo.load().profile;assert.equal(repo.save(gainXp(p,20,tuning)),'memory');assert.equal(repo.load().profile.progression.lifetimeXp,20);
  }
});
test('save failure can recover later without losing in-memory progress',()=>{
  const storage=memoryProfileStorage(),repo=testRepository(storage),p=repo.load().profile;storage.failWrite(true);
  assert.equal(repo.save(gainXp(p,20,tuning)),'memory');storage.failWrite(false);
  assert.equal(repo.save(gainXp(repo.load().profile,20,tuning)),'saved');assert.equal(testRepository(storage).load().profile.progression.lifetimeXp,40);
});
test('a changed save from another writer is preserved rather than overwritten',()=>{
  const storage=memoryProfileStorage(),repo=testRepository(storage),p=repo.load().profile;
  const other=JSON.stringify(gainXp(p,300,tuning));storage.setItem(key,other);
  assert.equal(repo.save(gainXp(p,20,tuning)),'conflict');assert.equal(storage.values.get(key),other);
  assert.equal(repo.load().diagnostics.at(-1)?.kind,'writer-conflict');
});
test('invalid writes do not replace the last valid save',()=>{
  const storage=memoryProfileStorage(),repo=testRepository(storage),p=repo.load().profile,raw=storage.values.get(key);
  assert.throws(()=>repo.save({...p,wallet:{...p.wallet,coins:-1}}),RangeError);assert.equal(storage.values.get(key),raw);
});
