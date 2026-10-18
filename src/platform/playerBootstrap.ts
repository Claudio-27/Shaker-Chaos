import { browserProfileWrites } from './profileWriteCoordinator.ts';
import { currentPlayerProfile } from '../domain/playerProfileV3.ts';
import { createPlayerProfile } from '../domain/playerProfile.ts';
import { createPlayerController } from '../application/playerController.ts';
import { reconcilePlayerProfile, starterLoadout } from '../application/playerContent.ts';
import { progressionTuning, starterContentIds } from '../content/progressionTuning.ts';
import { browserProfileStorage, createLocalPlayerProfileRepository } from './localPlayerProfileRepository.ts';
export function localIdentity(prefix: string) { return prefix + '-' + (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)); }
export function newBrowserProfile() { return currentPlayerProfile(createPlayerProfile(localIdentity('local'), Date.now(), starterLoadout, starterContentIds), progressionTuning); }
export function createBrowserPlayer() {
  const repository = createLocalPlayerProfileRepository(browserProfileStorage(), newBrowserProfile, progressionTuning, profile => reconcilePlayerProfile(profile, Math.max(Date.now(), profile.updatedAt)), { deferInitialWrites: true });
  return createPlayerController(repository, localIdentity('session'), Date.now, browserProfileWrites());
}
