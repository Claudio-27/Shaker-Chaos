/** Phase 2O: deterministic DEV analysis using real histories, scoring, V3 settlement and purchases. */
import { createPlayerProfile, immutable, integer } from '../src/domain/playerProfile.ts';
import { currentPlayerProfile } from '../src/domain/playerProfileV3.ts';
import { issueRoundIdentity, settleRoundReward } from '../src/domain/progression.ts';
import { settleRecipeRound } from '../src/domain/recipeProgression.ts';
import { evaluateRecipe, recipeAvailability } from '../src/domain/recipes.ts';
import { starterLoadout, ownershipPolicy } from '../src/application/playerContent.ts';
import { createPurchaseIntent, purchaseOffer, quoteStoreOffer } from '../src/application/store.ts';
import { newClassicGame, transitionClassicGame } from '../src/application/classicGame.ts';
import { gameDependencies } from '../src/application/productionBootstrap.ts';
import { progressionTuning as tuning, starterContentIds } from '../src/content/progressionTuning.ts';
import { productionStore as store } from '../src/content/storeCatalog.ts';
import { publicContentCatalog as content } from '../src/content/publicContentCatalog.ts';
import { recipeCatalog as recipes } from '../src/content/recipeCatalog.ts';
import { barIngredients } from '../src/content/ingredientCatalog.ts';
export const journeyLabel='BALANCE_JOURNEY_DEV_ONLY';
export const playerSkills=immutable({
  casual:{errors:[-5,-3,-2,0,1,3,5],omitEvery:4,failEvery:11,shortEvery:5},
  medio:{errors:[-2,-1,0,0,1,2],omitEvery:11,failEvery:23,shortEvery:17},
  esperto:{errors:[0,0,0,0,-1,1],omitEvery:41,failEvery:53,shortEvery:0},
});
export const journeyPlans=immutable({
  ingredients:['offer.ingredient.botanical','offer.ingredient.ember','offer.ingredient.blossom','offer.new-shift'],
  style:['offer.ice-blue','offer.ingredient.botanical','offer.ingredient.ember','offer.ingredient.blossom','offer.new-shift'],
  bartender:['offer.b02','offer.ingredient.botanical','offer.ingredient.ember','offer.ingredient.blossom','offer.ice-blue'],
  bundle:['offer.new-shift','offer.ingredient.botanical','offer.ingredient.ember','offer.ingredient.blossom'],
});
// Integer hash and finite error cycles: no randomness, wall clock, storage, or external data.
const hash=(a,b,c)=>((Math.imul(a+1,73856093)^Math.imul(b+1,19349663)^Math.imul(c+1,83492791))>>>0);
export function journeyDrink(recipe,skill,round,seed=0){
  if(!Object.hasOwn(playerSkills,skill))throw new RangeError('Unknown player skill');
  integer(round,1);integer(seed);const spec=playerSkills[skill],phase=round+seed;
  let state=newClassicGame(gameDependencies),atMs=0,operationId=0;
  const apply=action=>{state=transitionClassicGame(state,{...action,atMs},gameDependencies);};
  const short=spec.shortEvery&&phase%spec.shortEvery===0;
  for(const [index,[ingredientId,target]]of Object.entries(recipe.quantities).entries()){
    const error=spec.errors[hash(seed,round,index)%spec.errors.length]*gameDependencies.profile.pour.unitsPerStep;
    const units=Math.max(3,target+error-(short?Math.ceil(target/12)*3:0));
    apply({type:'PourStarted',ingredientId,operationId});
    atMs+=gameDependencies.profile.pour.startupMs+Math.floor(units/3)*gameDependencies.profile.pour.intervalMs;
    apply({type:'PourEnded',operationId,reason:'completed'});operationId++;atMs++;
  }
  const missingIce=hash(seed,round,11)%spec.omitEvery===0;
  const missingShake=hash(seed,round,12)%spec.omitEvery===0;
  const missingGarnish=hash(seed,round,13)%spec.omitEvery===0;
  if(!missingIce)for(let n=0;n<(recipe.ice?.minimum??0);n++)apply({type:'IceAdded',requestedUnits:1});
  const failure=phase%spec.failEvery===0;
  const count=failure?gameDependencies.profile.shake.failureCount:missingShake&&recipe.shake?1:recipe.shake?.completed.minimum??1;
  const duration=missingShake&&recipe.shake?50:Math.max(300,recipe.shake?.durationMs.minimum??300);
  for(let n=0;n<count;n++){apply({type:'ShakeStarted',operationId});atMs+=Math.floor(duration/count)+(n===count-1?duration%count:0);apply({type:'ShakeEnded',operationId,reason:'completed'});operationId++;atMs++;}
  if(recipe.garnishId&&!missingGarnish)apply({type:'GarnishChanged',garnishId:recipe.garnishId});
  apply({type:'Served'});if(!state.result)throw new Error('Journey did not serve');
  return {state,recipeResult:evaluateRecipe(recipe,state.view)};
}
const sampleCache=new WeakMap();
function cachedSample(recipe,skill,round,seed){
  let cache=sampleCache.get(recipe);if(!cache){cache=new Map();sampleCache.set(recipe,cache);}
  const key=[skill,round,seed].join(':');
  if(!cache.has(key)){const sample=journeyDrink(recipe,skill,round,seed);cache.set(key,{result:sample.state.result,recipeResult:sample.recipeResult});}
  return cache.get(key);
}
export function simulateJourney({skill='medio',seed=0,rounds=60,strategy='ingredients',catalog=recipes}={}){
  if(!Object.hasOwn(playerSkills,skill)||!Object.hasOwn(journeyPlans,strategy))throw new RangeError('Unknown journey');
  integer(rounds,1);integer(seed);if(rounds>1000)throw new RangeError('Journey too long');
  let profile=currentPlayerProfile(createPlayerProfile('balance-journey',0,starterLoadout,starterContentIds),tuning);
  const rows=[],attempts=new Map(),seen=new Set(),plan=journeyPlans[strategy];
  const quotes=()=>store.offers.map(o=>quoteStoreOffer(profile,store,content,o.id));
  for(let round=1;round<=rounds;round++){
    const available=catalog.recipes.filter(r=>recipeAvailability(profile,r,catalog).state==='AVAILABLE');
    const rank=r=>{const m=profile.recipeProgress.mastery.find(m=>m.recipeId===r.id);return !m?.completed?0:!m.perfect?1:2;};
    const recipe=[...available].sort((a,b)=>rank(a)-rank(b)||(attempts.get(a.id)??0)-(attempts.get(b.id)??0)||catalog.recipes.indexOf(a)-catalog.recipes.indexOf(b))[0];
    const sample=cachedSample(recipe,skill,round,seed);attempts.set(recipe.id,(attempts.get(recipe.id)??0)+1);
    const issued=issueRoundIdentity(profile,'journey',round,round),base=settleRoundReward(issued.profile,sample.result,issued.round,tuning,ownershipPolicy,round);
    const bonus=settleRecipeRound(base.profile,sample.recipeResult,issued.round,sample.result,catalog,tuning,ownershipPolicy,round);
    profile=bonus.profile;const beforePurchase=quotes().map(q=>({offerId:q.offerId,state:q.state,price:q.priceCoins,missing:q.missingCoins}));
    const earned=base.reward.coins+bonus.reward.recipeCoins+bonus.reward.goalCoins;
    const purchases=[];
    for(const id of plan){const q=quoteStoreOffer(profile,store,content,id);if(q.state==='OWNED')continue;if(q.state!=='AVAILABLE'||q.missingCoins)break;
      const bought=purchaseOffer(profile,createPurchaseIntent(profile,q,'journey'),store,content,round);if(bought.status!=='SUCCESS')throw new Error('Journey purchase failed');
      profile=bought.profile;purchases.push({offerId:id,coins:bought.receipt.coinsSpent});}
    const recipeIds=catalog.recipes.filter(r=>recipeAvailability(profile,r,catalog).state==='AVAILABLE').map(r=>r.id);
    const ingredientIds=barIngredients.filter(i=>profile.ownership.some(o=>o.contentId===i.contentId)).map(i=>i.id);
    const markers=[...recipeIds.map(id=>'recipe:'+id),...ingredientIds.map(id=>'ingredient:'+id),...quotes().filter(q=>q.state==='AVAILABLE').map(q=>'offer:'+q.offerId)];
    const newlyAvailable=markers.filter(id=>!seen.has(id));markers.forEach(id=>seen.add(id));
    rows.push({round,score:sample.result.totalScore,failed:sample.result.failed,recipeId:recipe.id,recipeStatus:sample.recipeResult.status,precision:sample.recipeResult.precisionBps,
      xp:profile.progression.lifetimeXp,xpEarned:base.reward.xp+bonus.reward.recipeXp+bonus.reward.goalXp,level:profile.progression.level,
      coinsEarned:earned,coinsSpent:purchases.reduce((n,p)=>n+p.coins,0),balance:profile.wallet.coins,purchases,
      recipeBonus:{xp:bonus.reward.recipeXp,coins:bonus.reward.recipeCoins},goalBonus:{xp:bonus.reward.goalXp,coins:bonus.reward.goalCoins},newRecord:bonus.reward.newRecord,
      goals:profile.recipeProgress.claimedGoalIds,newGoals:bonus.reward.goalIds,mastery:profile.recipeProgress.mastery,
      ingredients:ingredientIds,availableRecipes:recipeIds,purchasableIngredients:quotes().filter(q=>q.category==='ingredient'&&q.state==='AVAILABLE'&&!q.missingCoins).map(q=>q.offerId),
      offers:beforePurchase,bundle:quotes().find(q=>q.kind==='BUNDLE'),newlyAvailable});
  }
  return immutable({label:journeyLabel,skill,seed,strategy,rows,profile});
}
export function journeySummary(journey){
  const {rows,profile}=journey;const first=fn=>rows.find(fn)?.round??null;
  const meaningful=rows.filter(r=>r.newlyAvailable.length||r.purchases.length||r.newGoals.length||r.recipeBonus.xp||r.newRecord).map(r=>r.round);
  const finish=first(r=>r.ingredients.length===6&&r.bundle.state==='OWNED');
  const gaps=meaningful.filter(r=>r<=(finish??rows.length)).map((r,i,a)=>r-(a[i-1]??0));
  return {skill:journey.skill,strategy:journey.strategy,seed:journey.seed,levels:[2,3,4,5,6].map(level=>({level,round:first(r=>r.level>=level)})),
    purchases:rows.flatMap(r=>r.purchases.map(p=>({round:r.round,...p}))),
    ingredients:barIngredients.slice(3).map(i=>{const id='offer.'+i.contentId;return {id:i.id,gate:first(r=>r.level>=i.acquisition.availableFromLevel),
      grossFunds:first(r=>rows.slice(0,r.round).reduce((n,v)=>n+v.coinsEarned,0)>=i.acquisition.price),
      affordable:first(r=>r.offers.some(q=>q.offerId===id&&q.state==='AVAILABLE'&&!q.missing)),owned:first(r=>r.ingredients.includes(i.id))};}),
    goals:recipes.goals.map(g=>({id:g.id,round:first(r=>r.goals.includes(g.id))})),allContent:finish,
    allRecipes: first(r=>r.mastery.filter(m=>m.completed).length===recipes.recipes.length),maximumGapBeforeContent:Math.max(0,...gaps),
    bonus:rows.reduce((n,r)=>({xp:n.xp+r.recipeBonus.xp+r.goalBonus.xp,coins:n.coins+r.recipeBonus.coins+r.goalBonus.coins}),{xp:0,coins:0}),
    earned:profile.wallet.lifetimeCoinsEarned,spent:profile.wallet.lifetimeCoinsSpent,balance:profile.wallet.coins,
    completed:profile.recipeProgress.mastery.filter(m=>m.completed).length,perfect:profile.recipeProgress.mastery.filter(m=>m.perfect).length,
    meanScore:Math.round(rows.reduce((n,r)=>n+r.score,0)/rows.length),failed:rows.filter(r=>r.failed).length};
}
export function recipeSkillSurvey({attempts=120}={}){
  integer(attempts,1);if(attempts>10000)throw new RangeError('Survey too long');
  return recipes.recipes.map(recipe=>({recipeId:recipe.id,skills:Object.keys(playerSkills).map(skill=>{
    const counts={FAILED:0,CLOSE:0,SUCCESS:0,PERFECT:0};
    for(let n=1;n<=attempts;n++)counts[journeyDrink(recipe,skill,n,17).recipeResult.status]++;
    return {skill,attempts,counts};})}));
}
export function balanceReport({seeds=12,rounds=60}={}){
  integer(seeds,1);if(seeds>100)throw new RangeError('Too many seeds');
  const runs=[],traces=[];
  for(const skill of Object.keys(playerSkills))for(const strategy of Object.keys(journeyPlans))for(let seed=0;seed<seeds;seed++){
    const journey=simulateJourney({skill,strategy,seed,rounds});runs.push(journeySummary(journey));
    if(seed===0)traces.push({skill,strategy,seed,rows:journey.rows.map(row=>({...row,mastery:row.mastery.map(m=>({id:m.recipeId,status:m.bestStatus,precision:m.bestPrecisionBps})),bundle:{state:row.bundle.state,price:row.bundle.priceCoins,remaining:row.bundle.remainingIds}}))});
  }
  return {label:journeyLabel,modelVersion:'2o-independent-extra-errors-v1',assumptions:'Finite deterministic integer error cycles, omissions and failures; goal-seeking recipe choice and ordered purchase wishes. Not human telemetry or a measured probability distribution.',seeds,rounds,runs,traces,recipes:recipeSkillSurvey()};
}
