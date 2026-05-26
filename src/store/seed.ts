import type {
  Cohort,
  CheckIn,
  ContentItem,
  Goal,
  Post,
  Profile,
  Subscription,
} from '@/types';

const now = Date.now();
const days = (n: number) => new Date(now + n * 86_400_000).toISOString();
const hours = (n: number) => new Date(now + n * 3_600_000).toISOString();

export const cohort: Cohort = {
  id: 'cohort-april',
  name: 'April Cohort',
  retreatName: 'Gwinganna',
};

export const coach: Profile = {
  id: 'coach-lucy',
  fullName: 'Lucy Holloway',
  avatarInitial: 'L',
  role: 'coach',
  cohortId: cohort.id,
  onboarded: true,
};

export const you: Profile = {
  id: 'member-jarryd',
  fullName: 'Andrew Simons',
  avatarInitial: 'A',
  role: 'member',
  cohortId: cohort.id,
  onboarded: false,
};

export const members: Profile[] = [
  you,
  {
    id: 'member-sarah',
    fullName: 'Rebecca',
    avatarInitial: 'R',
    role: 'member',
    cohortId: cohort.id,
    onboarded: true,
  },
  {
    id: 'member-tom',
    fullName: 'Craig Thomas',
    avatarInitial: 'C',
    role: 'member',
    cohortId: cohort.id,
    onboarded: true,
  },
  {
    id: 'member-priya',
    fullName: 'Priya Anand',
    avatarInitial: 'P',
    role: 'member',
    cohortId: cohort.id,
    onboarded: true,
  },
];

export const profiles: Profile[] = [coach, ...members];

export const goals: Goal[] = [
  {
    id: 'goal-jarryd-sleep',
    profileId: you.id,
    title: 'Asleep before 10pm',
    target: '7 nights a week',
    active: true,
    createdAt: days(-12),
  },
  {
    id: 'goal-sarah-walk',
    profileId: 'member-sarah',
    title: 'Walk before scrolling',
    active: true,
    createdAt: days(-12),
  },
  {
    id: 'goal-tom-breath',
    profileId: 'member-tom',
    title: 'Breathe through the 3pm slump',
    active: true,
    createdAt: days(-12),
  },
  {
    id: 'goal-priya-screens',
    profileId: 'member-priya',
    title: 'No screens at dinner',
    active: true,
    createdAt: days(-12),
  },
];

export const checkIns: CheckIn[] = [
  // Jarryd
  {
    id: 'ci-jarryd-1',
    memberId: you.id,
    leaderId: coach.id,
    scheduledAt: days(-11),
    status: 'completed',
    goalScore: 4,
    topBlocker: 'late screens',
    commitment: 'Phone out of the bedroom this week',
    notes: 'Goal-setting call. Set the sleep goal with Lucy.',
  },
  {
    id: 'ci-jarryd-2',
    memberId: you.id,
    leaderId: coach.id,
    scheduledAt: days(-4),
    status: 'completed',
    goalScore: 7,
    topBlocker: 'work emails after 9pm',
    commitment: 'Hard stop at 8:30pm',
    notes: 'Big jump. Phone-in-the-hall trick is working.',
  },
  {
    id: 'ci-jarryd-3',
    memberId: you.id,
    leaderId: coach.id,
    scheduledAt: hours(36),
    status: 'upcoming',
  },
  // Sarah
  {
    id: 'ci-sarah-1',
    memberId: 'member-sarah',
    leaderId: coach.id,
    scheduledAt: days(-10),
    status: 'completed',
    goalScore: 6,
    topBlocker: 'morning scrolling',
    commitment: 'Phone face-down on the bench overnight',
  },
  {
    id: 'ci-sarah-2',
    memberId: 'member-sarah',
    leaderId: coach.id,
    scheduledAt: days(-3),
    status: 'completed',
    goalScore: 8,
    topBlocker: 'weekends',
    commitment: 'Walk before opening Instagram',
  },
  {
    id: 'ci-sarah-3',
    memberId: 'member-sarah',
    leaderId: coach.id,
    scheduledAt: hours(8),
    status: 'upcoming',
  },
  // Tom
  {
    id: 'ci-tom-1',
    memberId: 'member-tom',
    leaderId: coach.id,
    scheduledAt: days(-9),
    status: 'completed',
    goalScore: 3,
    topBlocker: '3pm sugar crash',
    commitment: 'Pre-pack a protein snack',
  },
  {
    id: 'ci-tom-2',
    memberId: 'member-tom',
    leaderId: coach.id,
    scheduledAt: hours(28),
    status: 'upcoming',
  },
  // Priya
  {
    id: 'ci-priya-1',
    memberId: 'member-priya',
    leaderId: coach.id,
    scheduledAt: days(-8),
    status: 'completed',
    goalScore: 7,
    topBlocker: 'partner brings the phone to dinner',
    commitment: 'Phone basket by the front door',
  },
  {
    id: 'ci-priya-2',
    memberId: 'member-priya',
    leaderId: coach.id,
    scheduledAt: days(2),
    status: 'upcoming',
  },
];

export const posts: Post[] = [
  {
    id: 'post-tom',
    authorId: 'member-tom',
    cohortId: cohort.id,
    body: "Hardest part is the 3pm slump — that's when old habits call. Tried the breathing thing Lucy showed us and it actually worked today. Anyone else?",
    createdAt: hours(-0.5),
    likedBy: ['member-sarah', 'member-priya', you.id, 'coach-lucy', 'member-tom', 'member-jarryd'].slice(0, 6),
  },
  {
    id: 'post-sarah',
    authorId: 'member-sarah',
    cohortId: cohort.id,
    body: 'Walked the headland before sunrise instead of scrolling. Small win but it is sticking.',
    createdAt: hours(-1),
    likedBy: Array.from({ length: 11 }, (_, i) => `like-${i}`),
  },
  {
    id: 'post-lucy',
    authorId: coach.id,
    cohortId: cohort.id,
    body: "Proud of this group. Remember: the goal isn't perfection, it's not quitting. Drop one thing you're grateful for today.",
    createdAt: hours(-3),
    likedBy: Array.from({ length: 13 }, (_, i) => `like-${i}`),
  },
  {
    id: 'post-priya',
    authorId: 'member-priya',
    cohortId: cohort.id,
    body: 'First full week of phone-free dinners. The conversations got longer.',
    createdAt: hours(-22),
    likedBy: Array.from({ length: 8 }, (_, i) => `like-${i}`),
  },
];

const thisMonday = (() => {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
})();

export const content: ContentItem[] = [
  {
    id: 'content-recipe',
    type: 'recipe',
    title: '5 plant-forward dinners',
    description: 'Straight from the Gwinganna kitchen. Shopping list included.',
    weekOf: thisMonday,
    payload: {
      shoppingList: [
        'Sweet potato',
        'Tahini',
        'Cavolo nero',
        'Brown rice',
        'Chickpeas',
        'Lemons',
        'Coriander',
        'Almonds',
      ],
    },
    doneBy: [],
  },
  {
    id: 'content-movement',
    type: 'movement',
    title: 'Morning mobility · 8 min',
    description: 'A gentle flow to start the day. No equipment.',
    weekOf: thisMonday,
    doneBy: [],
  },
  {
    id: 'content-cookalong',
    type: 'event',
    title: 'Group cook-along',
    description: 'Wed 6pm · with the Gwinganna chef',
    weekOf: thisMonday,
    doneBy: [],
  },
];

export const affirmations: string[] = [
  'I am the kind of person who keeps the promises I make to myself.',
  'Small and consistent beats big and rare.',
  'The retreat opened the door. I walk through it daily.',
  'I don\'t have to feel motivated to show up.',
  'Rest is part of the work, not a reward for it.',
];

export const subscriptions: Subscription[] = [];
