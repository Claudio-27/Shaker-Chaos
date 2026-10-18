import type { PlayerProfile } from '../domain/playerProfile.ts';
import type { ProfileStorage } from './localPlayerProfileRepository.ts';
/** A UI preference, never part of progression, ownership or profile migrations. One current profile ID. */
export const guidePreferenceKey='shaker-chaos.guide-dismissed.v1';
export function shouldOfferGuide(profile:PlayerProfile,storage:ProfileStorage|null):boolean {
  if(profile.stats.roundsPlayed>0)return false;
  try{return storage?.getItem(guidePreferenceKey)!==profile.profileId;}catch{return true;}
}
export function dismissPlayerGuide(profileId:string,storage:ProfileStorage|null):boolean {
  try{if(!storage)return false;storage.setItem(guidePreferenceKey,profileId);return true;}catch{return false;}
}
