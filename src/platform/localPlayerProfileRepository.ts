import type { PlayerProfileRepository, ProfileDiagnostic, ProfileLoad, PersistenceStatus } from '../application/playerProfileRepository.ts';
import type { PlayerProfile, PlayerProfileV3, ProgressionTuningProfile } from '../domain/playerProfile.ts';
import { addInteger, immutable } from '../domain/playerProfile.ts';
import { currentPlayerProfile, validatePlayerProfileV3 } from '../domain/playerProfileV3.ts';
export interface ProfileStorage { getItem(key:string):string|null;setItem(key:string,value:string):void }
export const profileStorageKey='shaker-chaos.player-profile';
export const recoveryStorageKey=profileStorageKey+'.recovery';
export type MigrationResult={readonly kind:'current';readonly profile:PlayerProfileV3;readonly migrated:boolean}|{readonly kind:'corrupt'|'older-unsupported'|'future-unsupported';readonly detail:string};
export function migratePlayerProfile(raw:string,tuning:ProgressionTuningProfile):MigrationResult {
  let value:unknown;try{value=JSON.parse(raw);}catch{return {kind:'corrupt',detail:'Invalid JSON'};}
  if(typeof value!=='object'||value===null||!('schemaVersion' in value)||!Number.isSafeInteger(value.schemaVersion))return {kind:'corrupt',detail:'Missing schema version'};
  if((value.schemaVersion as number)>3)return {kind:'future-unsupported',detail:'Future schema '+value.schemaVersion};
  if((value.schemaVersion as number)<1)return {kind:'older-unsupported',detail:'No registered migration for schema '+value.schemaVersion};
  try{return {kind:'current',profile:currentPlayerProfile(value as PlayerProfile,tuning),migrated:value.schemaVersion!==3};}
  catch(error){return {kind:'corrupt',detail:error instanceof Error?error.message:'Invalid profile'};}
}
/** Browser callers defer initial/reconciliation writes until the shared profile lock is held. */
export function createLocalPlayerProfileRepository(storage:ProfileStorage|null,starter:()=>PlayerProfile,tuning:ProgressionTuningProfile,
  reconcile:(profile:PlayerProfileV3)=>PlayerProfileV3,options:{readonly deferInitialWrites?:boolean}={}):PlayerProfileRepository {
  let cached:ProfileLoad|null=null,protectedSave=false,expectedRaw:string|null=null,blockedStatus:PersistenceStatus='memory',pending=false;
  const diagnostics:ProfileDiagnostic[]=[];
  const diagnostic=(entry:ProfileDiagnostic)=>{diagnostics.push(entry);if(diagnostics.length>16)diagnostics.shift();};
  const snapshot=(profile:PlayerProfileV3,status:PersistenceStatus):ProfileLoad=>immutable({profile,status,diagnostics:[...diagnostics]});
  const current=(profile:PlayerProfile)=>currentPlayerProfile(profile,tuning);
  const persist=(profile:PlayerProfileV3):PersistenceStatus=>{
    if(protectedSave)return blockedStatus;if(!storage)return 'memory';
    try{
      if(storage.getItem(profileStorageKey)!==expectedRaw){diagnostic({kind:'writer-conflict',detail:'Save changed before write; reload and retry'});return 'conflict';}
      const raw=JSON.stringify(profile);storage.setItem(profileStorageKey,raw);
      if(storage.getItem(profileStorageKey)!==raw){diagnostic({kind:'writer-conflict',detail:'Save changed during write; reload and retry'});return 'conflict';}
      expectedRaw=raw;return 'saved';
    }catch(error){diagnostic({kind:'write-failed',detail:String(error).slice(0,200)});return 'memory';}
  };
  const load=():ProfileLoad=>{
    if(cached)return cached;
    let raw:string|null=null,profile:PlayerProfileV3;
    try{raw=storage?.getItem(profileStorageKey)??null;}catch(error){diagnostic({kind:'read-failed',detail:String(error).slice(0,200)});protectedSave=true;}
    expectedRaw=raw;
    if(raw!==null){const migration=migratePlayerProfile(raw,tuning);
      if(migration.kind==='current'){
        profile=reconcile(migration.profile);pending=migration.migrated||profile!==migration.profile;
        const status=pending?(options.deferInitialWrites?'memory':persist(profile)):'saved';
        if(status==='saved')pending=false;
        return cached=snapshot(profile,status);
      }
      diagnostic({kind:migration.kind,detail:migration.detail,rawPreview:raw.slice(0,4000)});
      if(migration.kind!=='corrupt'){protectedSave=true;blockedStatus='unsupported';}
      else{try{if(!storage)throw new Error('Storage unavailable');const existing=storage.getItem(recoveryStorageKey);
        if(existing!==null&&existing!==raw)throw new Error('Recovery slot preserves another save');
        // A recovery copy contains no currency mutation and must precede any replacement.
        storage.setItem(recoveryStorageKey,raw);
      }catch(error){protectedSave=true;diagnostic({kind:'recovery-failed',detail:String(error).slice(0,200)});}}
    }
    profile=reconcile(current(starter()));pending=true;
    const status=options.deferInitialWrites?'memory':persist(profile);if(status==='saved')pending=false;
    return cached=snapshot(profile,status==='saved'&&raw!==null?'recovered':status);
  };
  const refresh=():ProfileLoad=>{
    if(!cached)return load();
    try{const raw=storage?.getItem(profileStorageKey)??null;
      if(raw!==expectedRaw){cached=null;protectedSave=false;blockedStatus='memory';pending=false;return load();}
    }catch(error){diagnostic({kind:'read-failed',detail:String(error).slice(0,200)});}
    return cached!;
  };
  return {load,refresh,
    flush(){load();if(!pending)return cached!.status;const status=persist(cached!.profile);pending=status==='memory';cached=snapshot(cached!.profile,status);return status;},
    save(input){
      const p=current(input),previous=load().profile;
      if(p.profileId!==previous.profileId||p.revision!==previous.revision){diagnostic({kind:'writer-conflict',detail:'Stale profile revision'});cached=snapshot(previous,'conflict');return 'conflict';}
      const next=validatePlayerProfileV3({...p,revision:addInteger(p.revision,1)},tuning),status=persist(next);
      pending=status==='memory';cached=snapshot(status==='conflict'?previous:next,status);return status;
    },
  };
}
export function browserProfileStorage():ProfileStorage|null{try{return window.localStorage;}catch{return null;}}
