import type { ProfileWriteCoordinator } from '../application/profileWriteCoordinator.ts';
import { profileStorageKey } from './localPlayerProfileRepository.ts';
export const profileWriteLock='shaker-chaos.player-profile.write';
export interface ProfileWriteAdapter {
  readonly requestLock?:<T>(name:string,work:()=>T)=>Promise<T>;
  readonly listen:(listener:()=>void)=>()=>void;readonly broadcast:()=>void;
}
/** One queue per client, plus the same cross-tab lock for every persistent mutation. No game score callbacks. */
export function createProfileWriteCoordinator(adapter:ProfileWriteAdapter):ProfileWriteCoordinator {
  let tail:Promise<unknown>=Promise.resolve();
  return {mode:adapter.requestLock?'WEB_LOCKS':'FALLBACK',
    run<T>(work:()=>T){const result=tail.then(()=>adapter.requestLock?adapter.requestLock(profileWriteLock,work):work());tail=result.catch(()=>{});return result;},
    subscribe:adapter.listen,notify:adapter.broadcast};
}
export function browserProfileWrites():ProfileWriteCoordinator {
  let channel:BroadcastChannel|null=null;
  const listeners=new Set<()=>void>(),emit=()=>{for(const listener of listeners)listener();};
  const storage=(event:StorageEvent)=>{if(event.key===profileStorageKey)emit();};
  const locks=typeof navigator!=='undefined'?navigator.locks:undefined;
  return createProfileWriteCoordinator({
    ...(locks?{requestLock:<T>(name:string,work:()=>T)=>locks.request(name,work)}:{}),
    listen(listener){listeners.add(listener);
      if(listeners.size===1){window.addEventListener('storage',storage);
        try{if(typeof BroadcastChannel!=='undefined'){channel=new BroadcastChannel('shaker-chaos.profile-changes');channel.onmessage=event=>{if(event.data?.type==='profile-changed')emit();};}}catch{channel=null;}
      }
      return ()=>{listeners.delete(listener);if(!listeners.size){window.removeEventListener('storage',storage);channel?.close();channel=null;}};
    },
    broadcast(){try{channel?.postMessage({type:'profile-changed'});}catch{/* Storage events still provide fallback refresh. */}},
  });
}
