import { sceneDownloads } from '../content/sceneDownloads.ts';
import { readRasterDemand } from './visualViewport.ts';
import type { SceneSelection, VisualCatalog } from '../content/visualModel.ts';
export type ShellStatus = 'development' | 'unavailable' | 'ready' | 'error';
/** Explicit warm works even on the first uncontrolled page visit. */
export async function registerOfflineShell(catalog: VisualCatalog, selection: SceneSelection): Promise<ShellStatus> {
  if (!import.meta.env.PROD) return 'development';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return 'unavailable';
  try {
    const base = new URL(import.meta.env.BASE_URL, window.location.href);
    await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.pathname });
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) return 'error';
    const { paths, fallbackPaths } = sceneDownloads(catalog, selection, readRasterDemand());
    const ready = await new Promise<boolean>((resolve) => {
      const channel = new MessageChannel();
      const timer = window.setTimeout(() => { channel.port1.close(); resolve(false); }, 30000);
      channel.port1.onmessage = (event: MessageEvent<{ ok: boolean }>) => {
        window.clearTimeout(timer); channel.port1.close(); resolve(event.data.ok === true);
      };
      registration.active!.postMessage({ type: 'CACHE_SCENE', paths, fallbackPaths }, [channel.port2]);
    });
    return ready ? 'ready' : 'error';
  } catch { return 'error'; }
}
