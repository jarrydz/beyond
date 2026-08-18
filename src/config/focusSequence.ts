import type { PillarId } from '@/types';

/**
 * What the member gets back after logging (PRD-06): one short piece of
 * guidance per day, selected DETERMINISTICALLY from the day index —
 * sequence[dayIndex % length] — never randomly. A demo that shows a
 * different tip on every render is a demo that looks broken.
 *
 * ⚠ SAMPLE SEQUENCE, NOT THE CONTENT LIBRARY. The real supply is the
 * 17 Aug '26 pillar content plan (cook-alongs, recovery video library,
 * breathwork-by-state, qi gong) — that content round is a later, bigger
 * workstream. Sleep carries seven entries because it is the demo focus and
 * must not repeat inside a week; the rest carry four and cycle.
 */
export interface FocusGuidance {
  id: string;
  title: string;
  body: string;
}

export const FOCUS_SEQUENCE: Record<PillarId, FocusGuidance[]> = {
  sleep: [
    {
      id: 'sleep-anchor-wake',
      title: 'Anchor the wake time',
      body: 'Same wake time, even after a bad night. The evening follows the morning, not the other way round.',
    },
    {
      id: 'sleep-phone-hall',
      title: 'The phone sleeps in the hall',
      body: 'Charge it outside the bedroom tonight. The 3am scroll needs the phone within reach — take the reach away.',
    },
    {
      id: 'sleep-light-down',
      title: 'Lights half an hour early',
      body: 'Drop the big lights after dinner and let lamps finish the evening. Dim rooms tell the body what clocks cannot.',
    },
    {
      id: 'sleep-caffeine-noon',
      title: 'Caffeine stops at noon',
      body: "This afternoon's coffee is still in your blood at ten. One day of stopping at midday shows you the difference.",
    },
    {
      id: 'sleep-wind-down',
      title: 'The same last twenty minutes',
      body: 'Repeat the retreat wind-down: shower, stretch, page of a book. The sequence is the signal.',
    },
    {
      id: 'sleep-bed-is-bed',
      title: 'The bed does one job',
      body: 'No laptop, no dinner, no doom-reading in bed today. Keep the association clean and sleep arrives faster.',
    },
    {
      id: 'sleep-daylight-first',
      title: 'Daylight before screens',
      body: 'Two minutes outside before the first screen. Morning light is the strongest lever you have on tonight.',
    },
  ],
  nourishment: [
    {
      id: 'nourish-plan-one',
      title: 'Plan one meal',
      body: "Decide dinner before midday. One planned meal beats three intended ones.",
    },
    {
      id: 'nourish-water-first',
      title: 'Water before coffee',
      body: 'A full glass before the first coffee. Most 11am slumps are thirst wearing a disguise.',
    },
    {
      id: 'nourish-retreat-recipe',
      title: 'Cook one from the library',
      body: 'The bircher takes ten minutes tonight and buys you tomorrow morning.',
    },
    {
      id: 'nourish-front-load',
      title: 'Front-load the plants',
      body: 'Get vegetables in before 2pm. The evening takes care of itself when the day started right.',
    },
  ],
  movement: [
    {
      id: 'move-before-screens',
      title: 'Move before the first screen',
      body: 'Ten minutes, any kind, before you open anything with a feed.',
    },
    {
      id: 'move-qi-gong',
      title: 'The morning sequence',
      body: 'The Chi Gong flow from the retreat — eight minutes, no equipment, exactly as you learned it.',
    },
    {
      id: 'move-walk-call',
      title: 'Take one call walking',
      body: "Pick today's least important meeting and do it on your feet.",
    },
    {
      id: 'move-evening-mobility',
      title: 'Five minutes of mobility',
      body: 'Hips and shoulders before dinner. Loose beats strong for feeling ten years younger.',
    },
  ],
  emotional: [
    {
      id: 'emotional-box-breath',
      title: 'Box breathing at the slump',
      body: 'Four counts in, hold, out, hold — four rounds when the 3pm dip lands.',
    },
    {
      id: 'emotional-phone-dinner',
      title: 'Phone-free dinner',
      body: 'The basket by the door, like the retreat. Conversations get longer when nothing buzzes.',
    },
    {
      id: 'emotional-ten-outside',
      title: 'Ten minutes outside',
      body: 'No podcast, no phone. Let the walk be the only thing happening.',
    },
    {
      id: 'emotional-one-thing-done',
      title: 'Close one loop',
      body: "Pick the smallest thing you've been carrying and finish it before lunch. Carried loops cost more than they weigh.",
    },
  ],
};
