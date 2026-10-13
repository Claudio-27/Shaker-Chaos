import { createPlayerProfile } from '../domain/playerProfile.ts';
import { starterLoadout, reconcilePlayerProfile } from '../application/playerContent.ts';
import { progressionTuning, starterContentIds } from '../content/progressionTuning.ts';
import { createLocalPlayerProfileRepository } from './localPlayerProfileRepository.ts';
export const newTestProfile = () => createPlayerProfile('local-synthetic-profile', 1000, starterLoadout, starterContentIds);
export function memoryProfileStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial)); let readFailed = false, writeFailed = false;
  return { values, failRead(value: boolean) { readFailed = value; }, failWrite(value: boolean) { writeFailed = value; },
    getItem(key: string) { if (readFailed) throw new Error('Synthetic storage read denial'); return values.get(key) ?? null; },
    setItem(key: string, value: string) { if (writeFailed) throw new Error('Synthetic quota'); values.set(key, value); } };
}
export function testRepository(storage: ReturnType<typeof memoryProfileStorage> | null = memoryProfileStorage()) {
  return createLocalPlayerProfileRepository(storage, newTestProfile, progressionTuning, p => reconcilePlayerProfile(p, 2000));
}
