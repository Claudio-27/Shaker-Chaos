/** Tiny optional presentation port. No audio assets, downloads, autoplay or domain dependency. */
export type PresentationSound = 'pour' | 'ice' | 'shake' | 'serve' | 'resultPositive' | 'resultNegative' | 'failure';
export interface PresentationAudio {
  readonly cue: (sound: PresentationSound) => void;
  readonly stop: () => void;
}
export const silentPresentationAudio: PresentationAudio = Object.freeze({
  cue: () => {}, stop: () => {},
});
