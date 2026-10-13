import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayerController } from './playerController.ts';
import { canEquip,equipContent,reconcilePlayerProfile,resolvePlayerLoadout,starterLoadout } from './playerContent.ts';
import { publicContentCatalog,publicContentItem } from '../content/publicContentCatalog.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { gainXp,earnCoins,immutable } from '../domain/playerProfile.ts';
import { memoryProfileStorage,newTestProfile,testRepository } from '../platform/profileTestFixtures.ts';
import { newClassicGame,transitionClassicGame } from './classicGame.ts';
import { gameDependencies } from './productionBootstrap.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import { createResultPresentation } from '../ui/resultPresentation.ts';
const finished=Object.freeze({totalScore:10000,failed:false,mechanicalReactionTierId:'legendary'});
test('controller settles the authoritative result before any reveal and ignores skip/remount duplicates',()=>{
  const storage=memoryProfileStorage(),repo=testRepository(storage),controller=createPlayerController(repo,'session-synthetic',()=>2000);
  controller.bindAttempt(0);controller.settle(finished,0);const frozen=controller.snapshot();assert.equal(frozen.reward?.xp,120);
  const reveal=createResultPresentation({after:()=>1,cancel(){}},()=>{});reveal.observe(finished as Parameters<typeof reveal.observe>[0],0,false);reveal.skip();
  controller.settle(finished,0);assert.equal(controller.snapshot(),frozen);
  const saved=testRepository(storage).load().profile;assert.equal(saved.stats.roundsPlayed,1);assert.equal(saved.progression.lifetimeXp,120);
  controller.bindAttempt(10);controller.settle(finished,0);assert.equal(controller.snapshot().profile.stats.roundsPlayed,1);
  controller.settle(finished,10);assert.equal(controller.snapshot().profile.stats.roundsPlayed,2);
});
test('only owned public items equip; independent slots and IDs persist across reload',()=>{
  const storage=memoryProfileStorage(),repo=testRepository(storage),p=repo.load().profile;
  assert.equal(canEquip(p,publicContentItem('bartender.b02')),false);assert.throws(()=>equipContent(p,'bartender.b02',2000),RangeError);
  const unlocked=reconcilePlayerProfile(gainXp(p,100,tuning),2000),equipped=equipContent(unlocked,'bartender.b02',2000);
  assert.equal(equipped.equippedLoadout.environmentId,p.equippedLoadout.environmentId);assert.equal(equipped.equippedLoadout.counterId,p.equippedLoadout.counterId);
  assert.equal(equipped.equippedLoadout.effectOverride,p.equippedLoadout.effectOverride);repo.save(equipped);
  assert.equal(testRepository(storage).load().profile.equippedLoadout.bartenderId,'bartender.b02');
});
test('catalog reconciliation repairs missing/unowned/wrong-kind loadouts without deleting inactive IDs',()=>{
  const p=reconcilePlayerProfile(gainXp(newTestProfile(),100,tuning),2000),owned=equipContent(p,'bartender.b02',2000);
  const removed={...publicContentCatalog,items:publicContentCatalog.items.filter(i=>i.id!=='bartender.b02')};
  const fixed=reconcilePlayerProfile(owned,3000,removed);assert.equal(fixed.equippedLoadout.bartenderId,starterLoadout.bartenderId);
  assert.ok(fixed.ownership.some(i=>i.contentId==='bartender.b02'));
  const invalid={...newTestProfile(),equippedLoadout:{...starterLoadout,bartenderId:'bartender.b02',environmentId:'counter.c01'}};
  assert.deepEqual(reconcilePlayerProfile(invalid,2000).equippedLoadout,starterLoadout);
});
test('renamed labels and changed visual definitions preserve canonical ownership identity',()=>{
  const p=reconcilePlayerProfile(gainXp(newTestProfile(),100,tuning),2000),equipped=equipContent(p,'bartender.b02',2000);
  const renamed={...publicContentCatalog,items:publicContentCatalog.items.map(i=>i.id==='bartender.b02'?{...i,displayName:'Synthetic rename',visualDefinitionId:'bartender.new-visual'}:i)};
  const reconciled=reconcilePlayerProfile(equipped,3000,renamed);assert.equal(reconciled,equipped);
  assert.equal(resolvePlayerLoadout(reconciled,renamed).bartenderId,'bartender.new-visual');
});
test('reconciliation grants newly added starters and all already satisfied progression rules once',()=>{
  const p=gainXp(newTestProfile(),250,tuning),without={...p,ownership:p.ownership.filter(i=>i.contentId!=='effect.sparkles')};
  const next=reconcilePlayerProfile(without,2000);assert.equal(next.ownership.length,7);assert.equal(reconcilePlayerProfile(next,2000),next);
});
test('same cocktail has exactly the same score at level 1 or 20 regardless of wallet and cosmetics',()=>{
  let game=newClassicGame(gameDependencies);
  for(const action of [{type:'PourStarted',ingredientId:'orchard',operationId:0,atMs:0},{type:'PourEnded',operationId:0,reason:'completed',atMs:1050},
    {type:'ShakeStarted',operationId:1,atMs:1050},{type:'ShakeEnded',operationId:1,reason:'completed',atMs:1150},{type:'Served',atMs:1150}] as const)
    game=transitionClassicGame(game,action,gameDependencies);
  const expected=game.result,snapshot=JSON.stringify(game),basic=newTestProfile();
  const advanced=immutable({...reconcilePlayerProfile(gainXp(basic,10450,tuning),2000),wallet:earnCoins(basic.wallet,100000)});
  for(const profile of [basic,equipContent(advanced,'bartender.b02',2000)]){
    resolvePlayerLoadout(profile);assert.deepEqual(gameDependencies.scoringEngine.evaluate(createCompatibilityInput(game.session)),expected);assert.equal(JSON.stringify(game),snapshot);
  }
  assert.equal(advanced.progression.level,20);
});
