import type { PlayerProfile, PlayerProfileV3 } from '../domain/playerProfile.ts';
export type PersistenceStatus = 'saved' | 'memory' | 'recovered' | 'unsupported' | 'conflict';
export interface ProfileDiagnostic { readonly kind: string; readonly detail: string; readonly rawPreview?: string }
export interface ProfileLoad { readonly profile: PlayerProfileV3; readonly status: PersistenceStatus; readonly diagnostics: readonly ProfileDiagnostic[] }
export interface PlayerProfileRepository {
  readonly load: () => ProfileLoad; readonly refresh: () => ProfileLoad;
  readonly flush: () => PersistenceStatus; readonly save: (profile: PlayerProfile) => PersistenceStatus;
}
