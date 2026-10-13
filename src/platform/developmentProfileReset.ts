import type { PlayerProfileV1 } from '../domain/playerProfile.ts';
import { browserProfileStorage, profileStorageKey, recoveryStorageKey } from './localPlayerProfileRepository.ts';
/** Imported only by the DEV lazy module. Requires its explicit UI confirmation. */
export function resetDevelopmentProfile(profile: PlayerProfileV1, storage = browserProfileStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(profileStorageKey, JSON.stringify(profile));
    const scoped = storage as typeof storage & { removeItem?: (key: string) => void };
    scoped.removeItem?.(recoveryStorageKey); return true;
  } catch { return false; }
}
