export type ShellStatus = 'development' | 'unavailable' | 'ready' | 'error';
/** Production shell only. Future private/API content must never enter this cache. */
export async function registerOfflineShell(): Promise<ShellStatus> {
  if (!import.meta.env.PROD) return 'development';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return 'unavailable';
  try {
    const base = new URL(import.meta.env.BASE_URL, window.location.href);
    await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.pathname });
    await navigator.serviceWorker.ready;
    return 'ready';
  } catch { return 'error'; }
}
