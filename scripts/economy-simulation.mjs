/** Offline analysis only. Uses the real reward, reconciliation, quote and purchase services. */
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { createPlayerProfile, immutable, integer, levelThreshold } from '../src/domain/playerProfile.ts';
import { migrateV1ToV2 } from '../src/domain/playerProfileV2.ts';
import { issueRoundIdentity, rewardAmounts, settleRoundReward } from '../src/domain/progression.ts';
import { starterLoadout, ownershipPolicy } from '../src/application/playerContent.ts';
import { createPurchaseIntent, purchaseOffer, quoteStoreOffer, validateStore } from '../src/application/store.ts';
import { progressionTuning as tuning, starterContentIds } from '../src/content/progressionTuning.ts';
import { productionStore as store } from '../src/content/storeCatalog.ts';
import { publicContentCatalog as catalog } from '../src/content/publicContentCatalog.ts';
export const analysisLabel = 'ECONOMY_SIMULATION_DEV_ONLY';
const success=totalScore=>({totalScore,failed:false,mechanicalReactionTierId:'analysis'});
export const pacingCases=immutable([
  {name:'fallimento',result:{totalScore:0,failed:true,mechanicalReactionTierId:'disaster'}},
  {name:'basso',result:success(1500)}, {name:'medio',result:success(5000)},
  {name:'forte',result:success(8500)}, {name:'quasi massimo',result:success(9550)},
]);
export const scenarios=immutable({basso:[success(1500)],medio:[success(5000)],alto:[success(9550)],
  misto:pacingCases.map(c=>c.result)});
export const strategies=immutable({save:[], 'effect-first':['offer.ice-blue','offer.b02'],
  'bartender-first':['offer.b02','offer.ice-blue'],bundle:['offer.new-shift']});
export function constantPacing(){
  return pacingCases.map(({name,result})=>{const earned=rewardAmounts(result,tuning);return {name,...earned,
    levels:[2,3,4,5,6].map(level=>({level,round:Math.ceil(levelThreshold(level,tuning)/earned.xp)})),
    funds:[150,300,382].map(coins=>({coins,round:Math.ceil(coins/earned.coins)}))};});
}
/** purchasePlan is an ordered wish list: wait for its next unowned offer, never substitute another. */
export function simulateEconomy({results,rounds=40,purchasePlan=[]}){
  integer(rounds,1);if(rounds>10000||!results.length)throw new RangeError('Invalid simulation size');
  if(new Set(purchasePlan).size!==purchasePlan.length||purchasePlan.some(id=>!store.offers.some(o=>o.id===id)))throw new RangeError('Invalid purchase plan');
  results.forEach(r=>rewardAmounts(r,tuning));validateStore(store,catalog);
  let profile=migrateV1ToV2(createPlayerProfile('economy-simulation',0,starterLoadout,starterContentIds),tuning);
  const seen=new Set(),rows=[];
  const quotes=()=>store.offers.map(o=>quoteStoreOffer(profile,store,catalog,o.id));
  for(let round=1;round<=rounds;round++){
    const issued=issueRoundIdentity(profile,'simulation',round,round);
    const settled=settleRoundReward(issued.profile,results[(round-1)%results.length],issued.round,tuning,ownershipPolicy,round);
    profile=settled.profile;
    const newlyAvailable=quotes().filter(q=>q.state==='AVAILABLE'&&!seen.has(q.offerId)).map(q=>q.offerId);
    newlyAvailable.forEach(id=>seen.add(id));
    const purchases=[];
    for(const id of purchasePlan){
      const q=quoteStoreOffer(profile,store,catalog,id);if(q.state==='OWNED')continue;
      if(q.state!=='AVAILABLE'||q.missingCoins)break;
      const bought=purchaseOffer(profile,createPurchaseIntent(profile,q,'simulation'),store,catalog,round);
      if(bought.status!=='SUCCESS')throw new Error('Simulation purchase failed: '+bought.status);
      profile=bought.profile;purchases.push({offerId:id,coins:bought.receipt.coinsSpent});
    }
    rows.push({round,level:profile.progression.level,xp:profile.progression.lifetimeXp,currentXp:profile.progression.currentXp,
      xpEarned:settled.reward.xp,coinsEarned:settled.reward.coins,lifetimeCoinsEarned:profile.wallet.lifetimeCoinsEarned,
      coinsAvailable:profile.wallet.coins,newlyAvailable,purchases,
      possiblePurchases:quotes().filter(q=>q.state==='AVAILABLE'&&!q.missingCoins).map(q=>q.offerId)});
  }
  return immutable({label:analysisLabel,rows,profile});
}
export function simulationMilestones(simulation){
  return {levels:[2,3,4,5,6].map(level=>({level,round:simulation.rows.find(row=>row.level>=level)?.round??null})),
    offers:store.offers.filter(offer=>offer.availability.published).map(offer=>({offerId:offer.id,
      availableAt:simulation.rows.find(row=>row.newlyAvailable.includes(offer.id))?.round??null,
      affordableAt:simulation.rows.find(row=>row.possiblePurchases.includes(offer.id)||row.purchases.some(p=>p.offerId===offer.id))?.round??null})),
    purchases:simulation.rows.flatMap(row=>row.purchases.map(p=>({round:row.round,...p}))),coinsAvailable:simulation.profile.wallet.coins};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);
  if(args.includes('--journey')){
    if(args.some(a=>!['--journey','--json'].includes(a)))throw new Error('Use --journey [--json]');
    const {balanceReport}=await import('./balance-journey.mjs');
    const report=balanceReport();
    console.log(JSON.stringify(report,null,args.includes('--json')?0:2));
  }else{if(args.some(a=>!/^--(rounds|strategy)=/.test(a)))throw new Error('Use --rounds=N --strategy=save|effect-first|bartender-first|bundle');
  const rounds=Number(args.find(a=>a.startsWith('--rounds='))?.split('=')[1]??40);
  const strategy=args.find(a=>a.startsWith('--strategy='))?.split('=')[1]??'save';
  if(!Object.hasOwn(strategies,strategy))throw new Error('Unknown strategy');
  console.log(analysisLabel+' · strategy='+strategy+' · repeated deterministic results, not player telemetry');
  console.log(JSON.stringify(constantPacing(),null,2));
  for(const [name,results] of Object.entries(scenarios)){
    const simulation=simulateEconomy({results,rounds,purchasePlan:strategies[strategy]});
    console.log('\n'+name+'\n| Round | Level | XP total/current | Coins earned | Coins available | Newly available | Possible purchases | Purchases |\n|---|---|---|---|---|---|---|---|');
    for(const r of simulation.rows)console.log('| '+[r.round,r.level,r.xp+'/'+r.currentXp,r.coinsEarned,r.coinsAvailable,r.newlyAvailable.join(', '),r.possiblePurchases.join(', '),r.purchases.map(p=>p.offerId+':'+p.coins).join(', ')].join(' | ')+' |');
    console.log(JSON.stringify(simulationMilestones(simulation)));
  }
  }
}
