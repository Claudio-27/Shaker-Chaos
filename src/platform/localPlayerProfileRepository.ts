import type { PlayerProfileRepository, ProfileDiagnostic, ProfileLoad, PersistenceStatus } from '../application/playerProfileRepository.ts';
import type { PlayerProfileV1, ProgressionTuningProfile } from '../domain/playerProfile.ts';
import { validatePlayerProfile } from '../domain/playerProfile.ts';
export interface ProfileStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export const profileStorageKey = 'shaker-chaos.player-profile';
export const recoveryStorageKey = profileStorageKey + '.recovery';
export type MigrationResult = { readonly kind: 'current'; readonly profile: PlayerProfileV1 } | { readonly kind: 'corrupt' | 'older-unsupported' | 'future-unsupported'; readonly detail: string };
/** Migration dispatcher: only V1 exists. Unknown older/future formats are preserved, never guessed. */
export function migratePlayerProfile(raw: string, tuning: ProgressionTuningProfile): MigrationResult {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { kind: 'corrupt', detail: 'Invalid JSON' }; }
  if (typeof value !== 'object' || value === null || !('schemaVersion' in value) || !Number.isSafeInteger(value.schemaVersion)) return { kind: 'corrupt', detail: 'Missing schema version' };
  if ((value.schemaVersion as number) > 1) return { kind: 'future-unsupported', detail: 'Future schema ' + value.schemaVersion };
  if ((value.schemaVersion as number) < 1) return { kind: 'older-unsupported', detail: 'No registered migration for schema ' + value.schemaVersion };
  try { return { kind: 'current', profile: validatePlayerProfile(value, tuning) }; }
  catch (error) { return { kind: 'corrupt', detail: error instanceof Error ? error.message : 'Invalid profile' }; }
}
export function createLocalPlayerProfileRepository(storage: ProfileStorage | null, starter: () => PlayerProfileV1,
  tuning: ProgressionTuningProfile, reconcile: (profile: PlayerProfileV1) => PlayerProfileV1): PlayerProfileRepository {
  let cached: ProfileLoad | null = null, protectedSave = false, expectedRaw: string | null = null, blockedStatus: PersistenceStatus = 'memory';
  const diagnostics: ProfileDiagnostic[] = [];
  const diagnostic = (entry: ProfileDiagnostic) => { diagnostics.push(entry); if (diagnostics.length > 16) diagnostics.shift(); };
  const persist = (profile: PlayerProfileV1): PersistenceStatus => {
    if (protectedSave) return blockedStatus;
    if (!storage) return 'memory';
    try {
      if (storage.getItem(profileStorageKey) !== expectedRaw) { protectedSave = true; diagnostic({ kind: 'writer-conflict', detail: 'Another local writer changed this save; keeping session in memory' }); return 'memory'; }
      const raw = JSON.stringify(profile); storage.setItem(profileStorageKey, raw); expectedRaw = raw; return 'saved';
    }
    catch (error) { diagnostic({ kind: 'write-failed', detail: String(error).slice(0, 200) }); return 'memory'; }
  };
  const load = (): ProfileLoad => {
    if (cached) return cached;
    let raw: string | null = null, profile: PlayerProfileV1;
    try { raw = storage?.getItem(profileStorageKey) ?? null; }
    catch (error) { diagnostic({ kind: 'read-failed', detail: String(error).slice(0, 200) }); protectedSave = true; }
    if (raw !== null) {
      expectedRaw = raw; const migration = migratePlayerProfile(raw, tuning);
      if (migration.kind === 'current') {
        profile = reconcile(migration.profile);
        const status = profile === migration.profile ? 'saved' : persist(profile);
        cached = { profile, status, diagnostics: [...diagnostics] }; return cached;
      }
      diagnostic({ kind: migration.kind, detail: migration.detail, rawPreview: raw.slice(0, 4000) });
      if (migration.kind !== 'corrupt') { protectedSave = true; blockedStatus = 'unsupported'; }
      else {
        try {
          if (!storage) throw new Error('Storage unavailable');
          const existing = storage.getItem(recoveryStorageKey);
          if (existing !== null && existing !== raw) throw new Error('Recovery slot already preserves another save');
          storage.setItem(recoveryStorageKey, raw); // Exact original bytes before replacing a corrupt current save.
        } catch (error) { protectedSave = true; diagnostic({ kind: 'recovery-failed', detail: String(error).slice(0, 200) }); }
      }
    }
    profile = reconcile(starter()); const status = persist(profile);
    cached = { profile, status: status === 'saved' && raw !== null ? 'recovered' : status, diagnostics: [...diagnostics] }; return cached;
  };
  return {
    load,
    save(profile) {
      validatePlayerProfile(profile, tuning); const status = persist(profile);
      cached = { profile, status, diagnostics: diagnostics.slice(-16) }; return status;
    },
  };
}
export function browserProfileStorage(): ProfileStorage | null {
  try { return window.localStorage; } catch { return null; }
}
