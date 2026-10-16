import { immutable } from '../domain/playerProfile.ts';
import type { PlayerProfileV2, ProgressionReward } from '../domain/playerProfile.ts';
import { issueRoundIdentity, settleRoundReward } from '../domain/progression.ts';
import type { RoundResult } from '../domain/progression.ts';
import type { PurchaseIntent, PurchaseResult } from '../application/store.ts';
import { purchaseOffer } from '../application/store.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { productionStore } from '../content/storeCatalog.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { equipContent, ownershipPolicy, reconcilePlayerProfile } from './playerContent.ts';
import type { PlayerProfileRepository, ProfileLoad, PersistenceStatus } from './playerProfileRepository.ts';
import { synchronousProfileWrites } from './profileWriteCoordinator.ts';
import type { ProfileWriteCoordinator } from './profileWriteCoordinator.ts';
export interface PlayerSnapshot extends ProfileLoad {readonly reward:ProgressionReward|null;readonly progressionError:boolean;readonly coordinationMode:ProfileWriteCoordinator['mode']}
export interface PurchaseOutcome extends PurchaseResult {readonly persistence:PersistenceStatus}
export function createPlayerController(repository:PlayerProfileRepository,sessionId:string,now:()=>number,coordinator:ProfileWriteCoordinator=synchronousProfileWrites){
  let view:PlayerSnapshot=immutable({...repository.load(),reward:null,progressionError:false,coordinationMode:coordinator.mode});
  let active:{sequence:number;profileId:string;settled:boolean}|null=null,unsubscribe:(()=>void)|null=null;
  const listeners=new Set<()=>void>();
  const publish=()=>{for(const listener of listeners)listener();};
  const adopt=(reward=view.reward)=>{view=immutable({...repository.load(),reward:reward?.round.profileId===repository.load().profile.profileId?reward:null,progressionError:false,coordinationMode:coordinator.mode});publish();};
  const fresh=()=>{repository.refresh();repository.flush();return repository.load().profile;};
  const commit=(p:PlayerProfileV2,reward=view.reward)=>{const status=repository.save(p);if(status==='conflict'){repository.refresh();adopt();return status;}adopt(reward);if(status==='saved')coordinator.notify();return status;};
  const failed=()=>{view=immutable({...view,progressionError:true});publish();};
  const safely=(work:()=>void)=>{try{const result=coordinator.run(work);if(result instanceof Promise)return result.catch(failed);return result;}catch{failed();}};
  const refresh=()=>safely(()=>{fresh();adopt();});
  // Initial creation/migration/reconciliation is persisted inside the same browser lock.
  safely(()=>{const before=repository.load();fresh();adopt();if(before.status!=='saved'&&view.status==='saved')coordinator.notify();});
  return {
    snapshot:()=>view,
    subscribe(listener:()=>void){listeners.add(listener);if(!unsubscribe)unsubscribe=coordinator.subscribe(refresh);return ()=>{listeners.delete(listener);if(!listeners.size){unsubscribe?.();unsubscribe=null;}};},
    bindAttempt(sequence:number){if(active&&sequence<=active.sequence)return;active={sequence,profileId:view.profile.profileId,settled:false};if(view.reward)adopt(null);},
    settle(result:RoundResult,sequence:number){
      if(!active||active.sequence!==sequence||active.settled)return;
      const attempt=active;
      safely(()=>{if(attempt.settled)return;const p=fresh();if(attempt.profileId!==p.profileId)throw new Error('Profile changed during round');
        // Issue ordinal and settle in ONE locked write, so reverse completion in two tabs never drops a reward.
        const issued=issueRoundIdentity(p,sessionId,sequence,Math.max(now(),p.updatedAt));
        const settled=settleRoundReward(issued.profile,result,issued.round,progressionTuning,ownershipPolicy,Math.max(now(),p.updatedAt));
        const status=commit(settled.profile,active===attempt?settled.reward:null);if(status==='conflict')throw new Error('Profile changed');attempt.settled=true;
      });
    },
    equip(id:string|null){return safely(()=>commit(equipContent(fresh(),id,Math.max(now(),repository.load().profile.updatedAt))));},
    refreshCatalog(){return safely(()=>{const p=fresh();commit(reconcilePlayerProfile(p,Math.max(now(),p.updatedAt)));});},
    update(transform:(profile:PlayerProfileV2)=>PlayerProfileV2){return safely(()=>commit(transform(fresh())));},
    refresh,
    async purchase(intent:PurchaseIntent):Promise<PurchaseOutcome>{
      try{return await coordinator.run(()=>{const p=fresh(),result=purchaseOffer(p,intent,productionStore,publicContentCatalog,Math.max(now(),p.updatedAt));
        if(result.status!=='SUCCESS'){adopt();return {...result,persistence:view.status};}
        const status=commit(result.profile);
        return status==='conflict'?{status:'PROFILE_CONFLICT' as const,profile:view.profile,persistence:status}:{...result,profile:view.profile,persistence:status};
      });}catch{return {status:'PROFILE_CONFLICT',profile:view.profile,persistence:view.status};}
    },
  };
}
export type PlayerController=ReturnType<typeof createPlayerController>;
