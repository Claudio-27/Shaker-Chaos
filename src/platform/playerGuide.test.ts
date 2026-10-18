import test from 'node:test';import assert from 'node:assert/strict';
import {shouldOfferGuide,dismissPlayerGuide,guidePreferenceKey} from './playerGuide.ts';
import {newTestProfile} from './profileTestFixtures.ts';
const makeStorage=()=>{const map=new Map<string,string>();return {map,getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};};
test('guide offers first-run only and never interrupts a returning player even without a preference',()=>{
  const p=newTestProfile();assert.equal(shouldOfferGuide(p,makeStorage()),true);
  assert.equal(shouldOfferGuide({...p,stats:{...p.stats,roundsPlayed:1}},null),false);
});
test('skip or completion persists only the current profile ID, survives reload and preserves the gameplay save',()=>{
  const p=newTestProfile(),storage=makeStorage();storage.setItem('shaker-chaos.player-profile','original-save');
  assert.equal(dismissPlayerGuide(p.profileId,storage),true);assert.equal(shouldOfferGuide(p,storage),false);
  assert.equal(storage.map.get('shaker-chaos.player-profile'),'original-save');assert.deepEqual([...storage.map.keys()],['shaker-chaos.player-profile',guidePreferenceKey]);
  assert.equal(shouldOfferGuide({...p,profileId:'new-profile'},storage),true);
});
test('invalid or foreign preference cannot silently dismiss a fresh guide',()=>{
  const p=newTestProfile(),storage=makeStorage();for(const value of ['','true','{bad JSON','another-profile']){storage.setItem(guidePreferenceKey,value);assert.equal(shouldOfferGuide(p,storage),true);}
});
test('denied preference storage degrades safely without blocking play or inventing a profile mutation',()=>{
  const storage={getItem(){throw new Error('read denied');},setItem(){throw new Error('quota');}};
  assert.equal(shouldOfferGuide(newTestProfile(),storage),true);assert.equal(dismissPlayerGuide('profile',storage),false);assert.equal(dismissPlayerGuide('profile',null),false);
});
