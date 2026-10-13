import type { ClassicInspiredTuningProfile } from '../domain/classicProfile.ts';

export const playerCopy = {
  phases: { mix: 'Miscela', shake: 'Agita', serve: 'Servi', result: 'Assaggio' },
  instructions: {
    empty: 'Scegli una bottiglia e tieni premuto Versa.',
    mix: 'Aggiungi le tue note, poi passa allo shaker.',
    shake: 'Trova il ritmo. Rilascia quando sei pronto.',
    serve: 'Un agrume, se ti va. Il mix è pronto da servire!',
    result: 'Il tuo prossimo giro parte da qui.',
  },
  pour: { idle: 'tieni premuto', preparing: 'Si prepara…', pouring: 'Sta versando…', full: 'Shaker pieno!' },
  risk: {
    safe: 'Ritmo tranquillo',
    warming: 'Lo shaker prende energia',
    risky: 'Piano con quel ritmo…',
    danger: 'Lo shaker scalpita! Rilascia e servi.',
  },
  ice: { accepted: 'Fresco al punto giusto!', maximum: 'Il ghiaccio basta così. Pronti allo shaker!', added: 'Ghiaccio pronto' },
  garnish: { accepted: 'Il tocco finale. Ora si brinda!', unavailable: 'Prima agita il mix', added: 'Agrume aggiunto' },
  tasting: { title: 'Un attimo di suspense…', line: 'Mmm… vediamo che ritmo hanno queste note.', status: 'Il bartender sta assaggiando' },
  ready: { title: 'Il banco è tuo', line: 'Tre bottiglie, tante idee. Vediamo cosa inventi.' },
  holdHelp: 'Tieni premuto con mouse, touch o Spazio/Invio. Rilascia per fermarti.',
  reset: 'Ricomincia il mix',
  newDrink: 'Nuovo drink',
  skip: 'Mostra il risultato',
  nextRound: 'Un altro giro? Il banco ti aspetta.',
} as const;

/** Original nine-tier dialogue. Titles stay in the unchanged production profile. */
export const classicReactionLines: Readonly<Record<string, string>> = {
  disaster: 'Questo drink ha preso una strada tutta sua. Rimettiamolo in carreggiata!',
  awful: 'La bottiglia aveva un piano. Il bicchiere, evidentemente, un altro.',
  bad: 'Le note ci sono. Per adesso stanno suonando tre canzoni diverse.',
  rough: 'C’è un’idea qui dentro. Un piccolo aggiustamento e torna il ritmo.',
  okay: 'Si lascia bere! Il prossimo giro può avere ancora più carattere.',
  good: 'Un buon mix: mi hai fatto venire voglia di un secondo sorso.',
  great: 'Ha personalità. Questo bicchiere sa già stare al bancone.',
  excellent: 'Le note ballano insieme. Io metto il bicchiere, tu il talento.',
  legendary: 'Fermi tutti: questo giro merita un brindisi tutto suo!',
};
export interface ReactionCopy { readonly title: string; readonly line: string }
export type BartenderReactionCopy = Readonly<Record<string, Readonly<Record<string, Partial<ReactionCopy>>>>>;
export function reactionCopy(profile: ClassicInspiredTuningProfile, tier: string, bartenderId: string,
  overrides: BartenderReactionCopy = {}): ReactionCopy {
  const override = Object.hasOwn(overrides, bartenderId) && Object.hasOwn(overrides[bartenderId]!, tier) ? overrides[bartenderId]![tier] : undefined;
  return {
    title: override?.title ?? profile.score.tiers.find(item => item.id === tier)?.title ?? playerCopy.ready.title,
    line: override?.line ?? (Object.hasOwn(classicReactionLines, tier) ? classicReactionLines[tier]! : playerCopy.ready.line),
  };
}
export const resultRevealTiming = { tastingMs: 650, scoreMs: 180, reactionMs: 220 } as const;
