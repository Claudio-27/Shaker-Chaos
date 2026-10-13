import { immutable } from '../domain/playerProfile.ts';
import type { PlayerProfileV1, ProgressionReward, RoundIdentity } from '../domain/playerProfile.ts';
import { issueRoundIdentity, settleRoundReward } from '../domain/progression.ts';
import type { RoundResult } from '../domain/progression.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { equipContent, ownershipPolicy, reconcilePlayerProfile } from './playerContent.ts';
import type { PlayerProfileRepository, ProfileLoad } from './playerProfileRepository.ts';
export interface PlayerSnapshot extends ProfileLoad { readonly reward: ProgressionReward | null; readonly progressionError: boolean }
export function createPlayerController(repository: PlayerProfileRepository, sessionId: string, now: () => number) {
  let view: PlayerSnapshot = immutable({ ...repository.load(), reward: null, progressionError: false });
  let active: RoundIdentity | null = null;
  const listeners = new Set<() => void>();
  const publish = () => { for (const listener of listeners) listener(); };
  const commit = (profile: PlayerProfileV1, reward = view.reward) => {
    repository.save(profile); view = immutable({ ...repository.load(), reward, progressionError: false }); publish();
  };
  const safely = (work: () => void) => {
    try { work(); } catch { view = immutable({ ...view, progressionError: true }); publish(); }
  };
  return {
    snapshot: () => view,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    bindAttempt(attemptStartSequence: number) {
      if (active?.attemptStartSequence === attemptStartSequence) return;
      if (active && attemptStartSequence < active.attemptStartSequence) return;
      safely(() => { const issued = issueRoundIdentity(view.profile, sessionId, attemptStartSequence, Math.max(now(), view.profile.updatedAt)); active = issued.round; commit(issued.profile, null); });
    },
    settle(result: RoundResult, attemptStartSequence: number) {
      if (!active || active.attemptStartSequence !== attemptStartSequence) return;
      safely(() => { const settlement = settleRoundReward(view.profile, result, active!, progressionTuning, ownershipPolicy, Math.max(now(), view.profile.updatedAt));
        if (!settlement.duplicate) commit(settlement.profile, settlement.reward); });
    },
    equip(id: string | null) { safely(() => commit(equipContent(view.profile, id, now()))); },
    refreshCatalog() { safely(() => commit(reconcilePlayerProfile(view.profile, now()))); },
    /** Generic local transaction boundary; DEV-only helpers supply their own pure transformations. */
    update(transform: (profile: PlayerProfileV1) => PlayerProfileV1) { safely(() => commit(transform(view.profile))); },
  };
}
export type PlayerController = ReturnType<typeof createPlayerController>;
