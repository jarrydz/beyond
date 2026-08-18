import type { PrepTask } from '@/types';

/**
 * The pre-retreat countdown (PRD-05) — single source of truth for task copy,
 * order and unlock days, same pattern as config/pillars.ts. Components must
 * read from here; no task strings hard-coded in screens.
 *
 * Eight unlock stages: T-21, 14, 10, 7, 5, 3, 1, and the T-0 "You're ready"
 * state (which is a screen state, not a task). No points before arrival —
 * decision 5: a caffeine taper is not a game.
 */
export type PrepTaskSeed = Omit<PrepTask, 'done'>;

export const prepTasks: PrepTaskSeed[] = [
  // T-21
  {
    id: 'prep-connect',
    unlocksAt: 21,
    title: 'Connect your booking',
    blurb: 'Your confirmation number and surname — then the countdown starts.',
    kind: 'form',
    required: true,
  },
  {
    id: 'prep-host-video',
    unlocksAt: 21,
    title: 'Meet your host',
    blurb: 'A short video from your Program Manager.',
    kind: 'video',
    required: false,
  },
  {
    id: 'prep-goal-why',
    unlocksAt: 21,
    title: 'What do you want from this?',
    blurb: 'Your goal, and your why — in your own words.',
    kind: 'reflect',
    required: true,
  },
  // T-14
  {
    id: 'prep-philosophy',
    unlocksAt: 14,
    title: 'Why we do it this way',
    blurb: 'The philosophy, before you arrive.',
    kind: 'read',
    required: false,
  },
  {
    id: 'prep-reservation-form',
    unlocksAt: 14,
    title: 'Essential Reservation Form',
    blurb: 'Intolerances, allergies, medical — the kitchen and clinic need this.',
    kind: 'form',
    required: true,
    externalLabel: 'Essential Reservation Form',
  },
  // T-10
  {
    id: 'prep-treatments',
    unlocksAt: 10,
    title: 'Choose your treatments',
    blurb: 'The spa menu — every massage hand-done.',
    kind: 'choice',
    required: true,
    externalLabel: 'Spa Request Form',
  },
  // T-7
  {
    id: 'prep-taper',
    unlocksAt: 7,
    title: 'Step down',
    blurb: 'Alcohol out, caffeine and sugar tapering. This makes day one easier.',
    kind: 'track',
    required: true,
    pillarId: 'nourishment',
  },
  // T-5
  {
    id: 'prep-room-video',
    unlocksAt: 5,
    title: 'See your room',
    blurb: 'A walkthrough of your room type.',
    kind: 'video',
    required: false,
  },
  {
    id: 'prep-packing',
    unlocksAt: 5,
    title: 'What to bring',
    blurb: 'And what to leave behind — no perfume.',
    kind: 'read',
    required: true,
  },
  // T-3
  {
    id: 'prep-day-shape',
    unlocksAt: 3,
    title: 'The shape of a day',
    blurb: 'Wake time, sessions, bed time.',
    kind: 'read',
    required: false,
    pillarId: 'sleep',
  },
  // T-1
  {
    id: 'prep-getting-here',
    unlocksAt: 1,
    title: 'Getting here',
    blurb: 'Transfers, the gate, your arrival window.',
    kind: 'read',
    required: true,
  },
];

/** The taper substances, in grid order. Copy is guidance, never judgement. */
export const TAPER_SUBSTANCES = [
  { key: 'alcohol', label: 'Alcohol', guidance: 'Stop now — give your liver the head start.' },
  { key: 'caffeine', label: 'Caffeine', guidance: 'Step down one cup every two days.' },
  { key: 'sugar', label: 'Sugar', guidance: 'Cut added sugar from four days out.' },
] as const;

export type TaperSubstance = (typeof TAPER_SUBSTANCES)[number]['key'];

/** Longer body copy for the read/video sheets, keyed by task id. */
export const PREP_TASK_BODY: Record<string, string[]> = {
  'prep-host-video': [
    'Two minutes from the person who runs your program — what your first day looks like, and what to expect from your check-ins.',
  ],
  'prep-philosophy': [
    'No caffeine, no alcohol, no sugar, no perfume. Not rules for their own sake — the property runs on nervous systems slowing down, and every one of these gets in the way of that.',
    'Devices stay in your room. The days are structured so you don’t have to decide anything. You’ll be told when to wake, when to move, when to eat, when to rest.',
  ],
  'prep-reservation-form': [
    'Intolerances, allergies, medications and anything the kitchen or the clinic should know. Gwinganna needs this back before you arrive.',
  ],
  'prep-treatments': [
    'Your package includes spa credit. The menu is long and the good slots go early — choosing before you arrive means your treatments are booked around your program, not squeezed into it.',
  ],
  'prep-room-video': [
    'A short walkthrough of your room type — where you’ll wake up, the deck, and why there’s no TV in it.',
  ],
  'prep-packing': [
    'Comfortable clothes you can move in, a hat, walking shoes, swimwear. Layers — the mornings start cool.',
    'Leave behind: perfume and strongly scented products, and anything with a screen you can live without. There’s no dress-up dinner. Nobody is looking.',
  ],
  'prep-day-shape': [
    '5:30am wake. Qi gong as the sun comes up. Breakfast, then the morning activity — a hike most days. Lunch is the biggest meal. Afternoons are slower: a seminar, your treatments, the pools. Dinner is early and light. In bed by 9.',
    'The point of knowing this now: start nudging your bedtime earlier this week and the first morning won’t hurt.',
  ],
  'prep-getting-here': [
    'Arrive inside your window — the gate is staffed for it. Transfers from Gold Coast airport are pre-booked through reservations; if you’re driving, parking is on-site and free.',
    'From the gate it’s a slow kilometre up the hill. That drive is the start of it. Take it slowly on purpose.',
  ],
};

/** Video stand-in durations (no real assets — same pattern as Meal.tint photography). */
export const PREP_VIDEO_META: Record<string, { duration: string; tint: string }> = {
  'prep-host-video': { duration: '2:10', tint: '#5C7470' },
  'prep-room-video': { duration: '1:45', tint: '#8C7B9C' },
};

/** The shape of a retreat day — quiet mode's schedule and the T-3 read. */
export const RETREAT_DAY_SCHEDULE = [
  { time: '5:30am', item: 'Wake' },
  { time: '6:00am', item: 'Qi gong on the lawn' },
  { time: '7:30am', item: 'Breakfast' },
  { time: '9:00am', item: 'Morning hike' },
  { time: '12:30pm', item: 'Lunch' },
  { time: '2:00pm', item: 'Seminar · rest · pools' },
  { time: '6:00pm', item: 'Dinner' },
  { time: '9:00pm', item: 'Lights down' },
] as const;

/** Mock booked treatments shown in quiet mode (local-first — no real spa data). */
export const RETREAT_TREATMENTS = [
  { time: '2:30pm', name: 'Remedial massage', therapist: 'Mara' },
  { time: '4:15pm', name: 'Salt therapy', therapist: 'Jonah' },
] as const;
