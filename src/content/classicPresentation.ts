import type { MechanicalReactionPresentation } from './reactionPresentation.ts';
import type { VisualCatalog, ReactionId } from './visualModel.ts';
const tiers: Readonly<Record<string, ReactionId>> = {
  unrated: 'lab.welcome', disaster: 'lab.rough', awful: 'lab.rough', bad: 'lab.rough', rough: 'lab.rough',
  okay: 'lab.balanced', good: 'lab.balanced', great: 'lab.balanced', excellent: 'lab.excellent', legendary: 'lab.excellent',
};
export function classicReactionPresentation(catalog: VisualCatalog): MechanicalReactionPresentation {
  return { byBartender: Object.fromEntries(Object.keys(catalog.bartenders).map(id => [id, tiers])), fallback: 'lab.rough' };
}
export const classicFailurePresentation = {
  title: 'Troppo caos nello shaker!',
  line: 'Le bollicine hanno preso il comando. Un nuovo giro, con più calma?',
};
