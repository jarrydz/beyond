import type { PillarId } from '@/types';

/**
 * The day's guidance (PRD-06 → PRD-07): each entry names a real item in
 * src/content/library.ts by id. Selection stays deterministic —
 * sequence[dayIndex % length] — so a demo day always shows the same piece.
 * Seven entries for sleep (the demo focus must not repeat inside a week's
 * rhythm of visits), four elsewhere, cycling.
 */
export const FOCUS_SEQUENCE: Record<PillarId, string[]> = {
  sleep: [
    'lib-sleep-winddown',
    'lib-sleep-meditation',
    'lib-sleep-acupressure',
    'lib-sleep-winddown',
    'lib-sleep-acupressure',
    'lib-sleep-meditation',
    'lib-sleep-winddown',
  ],
  nourishment: [
    'lib-nourish-fads',
    'lib-nourish-cookalong',
    'lib-nourish-herbs',
    'lib-nourish-fads',
  ],
  movement: [
    'lib-move-qigong',
    'lib-move-planner',
    'lib-move-leo-class',
    'lib-move-qigong',
  ],
  emotional: [
    'lib-emotional-breathe',
    'lib-emotional-peace',
    'lib-emotional-breath-states',
    'lib-emotional-breathe',
  ],
};
