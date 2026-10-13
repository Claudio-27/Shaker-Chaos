export interface MotionPreference {
  readonly matches: boolean;
  readonly addEventListener: (type: 'change', listener: () => void) => void;
  readonly removeEventListener: (type: 'change', listener: () => void) => void;
}
/** A browser preference changes presentation only. */
export function observeReducedMotion(preference: MotionPreference, changed: (reduced: boolean) => void): () => void {
  const update = () => changed(preference.matches);
  preference.addEventListener('change', update); update();
  return () => preference.removeEventListener('change', update);
}
