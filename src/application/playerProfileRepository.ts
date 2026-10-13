import type { PlayerProfileV1 } from '../domain/playerProfile.ts';
export type PersistenceStatus = 'saved' | 'memory' | 'recovered' | 'unsupported';
export interface ProfileDiagnostic { readonly kind: string; readonly detail: string; readonly rawPreview?: string }
export interface ProfileLoad { readonly profile: PlayerProfileV1; readonly status: PersistenceStatus; readonly diagnostics: readonly ProfileDiagnostic[] }
export interface PlayerProfileRepository { readonly load: () => ProfileLoad; readonly save: (profile: PlayerProfileV1) => PersistenceStatus }
