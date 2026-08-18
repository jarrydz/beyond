import type { PillarId } from '@/types';

/**
 * The two focus questions per pillar (PRD-06) — single source of truth,
 * same pattern as pillars.ts / points.ts / prepTasks.ts. Exactly two:
 * two is a few, three is a form. Written in the member's voice.
 *
 * Answers are stored as a 0–4 scale index on DailyCheckInEntry.focusAnswers,
 * keyed by the stable question id.
 */
export interface FocusQuestion {
  id: string;
  prompt: string;
  /** Ordered labels, index 0–4. Rendered as a 5-stop scale, same visual family as the mood scale. */
  scale: [string, string, string, string, string];
}

export const FOCUS_QUESTIONS: Record<PillarId, [FocusQuestion, FocusQuestion]> = {
  sleep: [
    {
      id: 'sleep_lights_out',
      prompt: 'Lights out around…',
      scale: ['Before 9', 'By 10', 'By 11', 'By 12', 'After 12'],
    },
    {
      id: 'sleep_waking',
      prompt: 'How you woke',
      scale: ['Wrecked', 'Heavy', 'Okay', 'Fresh', 'Sharp'],
    },
  ],
  nourishment: [
    {
      id: 'nourish_food',
      prompt: "Today's food",
      scale: ['Grabbed whatever', 'Mostly winged it', 'Half and half', 'Mostly planned', 'All planned'],
    },
    {
      id: 'nourish_water',
      prompt: 'Water',
      scale: ['Barely any', 'A glass or two', 'Some', 'Most of a bottle', 'Plenty'],
    },
  ],
  movement: [
    {
      id: 'move_amount',
      prompt: 'Movement today',
      scale: ['None', 'A stretch', 'A walk', 'A workout', 'A full session'],
    },
    {
      id: 'move_body',
      prompt: 'How the body feels',
      scale: ['Stiff', 'Tight', 'Okay', 'Warm', 'Loose'],
    },
  ],
  emotional: [
    {
      id: 'emotional_pace',
      prompt: "Today's pace",
      scale: ['Frantic', 'Rushed', 'Steady', 'Easy', 'Calm'],
    },
    {
      id: 'emotional_space',
      prompt: 'Time to yourself',
      scale: ['None', 'Minutes', 'Some', 'A while', 'Unhurried'],
    },
  ],
};
