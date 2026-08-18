import type {
  Booking,
  Cohort,
  CheckIn,
  ContentItem,
  DailyCheckInEntry,
  Goal,
  GuestBooking,
  Meal,
  PointsLedgerEntry,
  Post,
  Product,
  Profile,
  Subscription,
} from '@/types';
import { ACTION_LABELS, AWARDS } from '@/config/points';

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

/**
 * The one seeded reservation (PRD-05). Dated relative to the real clock —
 * arrival is always a week out — so the demo lands mid-countdown (T-7, the
 * taper live) regardless of when it's opened. The stage switcher moves the
 * simulated clock around these dates; the dates themselves never change.
 */
/**
 * Ten days of check-in back-history for the demo member, on the sleep focus
 * (PRD-06). Generated RELATIVE TO THE SIMULATED TODAY, not seeded statically
 * at boot — the stage switcher moves the clock ±90 days and the insight must
 * have something true to say on every canonical demo day. Two missed days
 * (4 and 9 days ago) keep the record credible; misses are neutral, never red.
 *
 * Deterministic by design — same base date, same history, every render.
 */
export function seedDailyHistory(base: Date): DailyCheckInEntry[] {
  // [daysAgo, mood, lightsOutIdx (0='Before 9'…4='After 12'), wakingIdx]
  const rows: Array<[number, number, number, number]> = [
    [1, 4, 1, 3],
    [2, 4, 1, 3],
    [3, 3, 2, 2],
    [5, 4, 1, 4],
    [6, 5, 1, 4],
    [7, 3, 3, 1],
    [8, 4, 1, 3],
    [10, 3, 1, 2],
    [11, 4, 2, 3],
    [12, 3, 1, 2],
  ];
  return rows.map(([ago, mood, lightsOut, waking]) => {
    const d = new Date(base.getTime() - ago * 86_400_000);
    d.setHours(20, 40, 0, 0); // evenings — when a sleep-focus member actually logs
    return {
      id: `seed-ci-${ago}`,
      memberId: you.id,
      recordedAt: d.toISOString(),
      mood,
      pillarId: 'sleep' as const,
      focusAnswers: { sleep_lights_out: lightsOut, sleep_waking: waking },
    };
  });
}

/**
 * The seeded guest cohort for the coach's arrivals/departures board
 * (PRD-06). Generated relative to the SIMULATED today — the same sliding
 * pattern as seedDailyHistory — so the board has arrivals, departures and
 * a real roll-up percentage on every canonical demo day.
 *
 * Prep completion is deliberately varied: a strip reading 100% is not
 * credible and hides the product's own argument. Required total mirrors
 * the seven required prep tasks in config/prepTasks.ts.
 */
export function seedCohortBookings(base: Date): GuestBooking[] {
  const iso = (daysFromBase: number) =>
    new Date(base.getTime() + daysFromBase * 86_400_000).toISOString().slice(0, 10);
  // [name, package, room, arrival offset (days from sim today), requiredDone,
  //  erf, taper, pillar, goal, why] — stays: 5 nights, departure = arrival + 5.
  const rows: Array<
    [string, string, string, number, number, boolean, boolean, Goal['pillarId'], string, string]
  > = [
    ['Marion Wells', 'Optimum Wellbeing', 'Orchard Suites', -5, 7, true, true, 'sleep', 'Asleep by 10:30', "I've run on six hours for a decade. My cardiologist stopped joking about it."],
    ['Dale Hutchins', 'Fitness Focus', 'Mountain View', -4, 6, true, true, 'movement', 'Move every morning', 'My knees gave me a warning I intend to hear.'],
    ['Amara Okafor', 'Optimum Wellbeing', 'Meditation Villas', -3, 7, true, true, 'emotional', 'A day with margins', "I answered email at my son's recital. That was the moment."],
    ['Theo Brandt', 'Detox & Reset', 'Orchard Suites', 0, 7, true, true, 'nourishment', 'Cook four nights a week', 'Takeaway five nights running and I stopped tasting it.'],
    ['Priscilla Yeo', 'Optimum Wellbeing', 'Garden Rooms', 0, 5, true, false, 'sleep', 'Off the sleeping tablets', 'Two years on them; I want to know who I am without.'],
    ['Rob McAllister', 'Fitness Focus', 'Mountain View', 2, 3, false, false, 'movement', 'Back on the bike', 'Sold the bike when work took over. Buying it back.'],
    ['Hana Vasquez', 'Optimum Wellbeing', 'Meditation Villas', 3, 7, true, true, 'emotional', 'Phone down by 8', 'My daughter drew the family — I was holding a rectangle.'],
    ['Gordon Pryce', 'Detox & Reset', 'Garden Rooms', 4, 2, true, false, 'nourishment', 'Alcohol-free weekdays', "The nightly wine stopped being a choice a while ago."],
    ['Ingrid Solberg', 'Optimum Wellbeing', 'Orchard Suites', 6, 4, false, true, 'sleep', 'Wake without the 3am gap', 'The 3am hour is where my worry lives. I want it back.'],
    ['Felix Ambrose', 'Fitness Focus', 'Mountain View', 9, 0, false, false, 'movement', 'Ten thousand honest steps', "Just booked. Haven't opened the app until now."],
  ];
  return rows.map(([name, pkg, room, arrive, done, erf, taper, pillarId, goalTitle, goalWhy], i) => ({
    booking: {
      id: `booking-guest-${i}`,
      profileId: `guest-${i}`,
      confirmationNumber: String(90210 + i * 137),
      guestName: name,
      packageName: pkg,
      roomType: room,
      arrivalDate: iso(arrive),
      departureDate: iso(arrive + 5),
      arrivalWindow: '2pm – 4pm',
      hostName: 'Lucy',
      hostRole: 'Your Program Manager',
    },
    goalPillarId: pillarId,
    goalTitle,
    goalWhy,
    requiredDone: done,
    requiredTotal: 7,
    erfDone: erf,
    taperStarted: taper,
  }));
}

export const booking: Booking = {
  id: 'booking-gwinganna',
  profileId: you.id,
  confirmationNumber: '94167',
  guestName: you.fullName,
  packageName: 'Optimum Wellbeing',
  roomType: 'Meditation Villas',
  arrivalDate: days(7).slice(0, 10),
  departureDate: days(12).slice(0, 10),
  arrivalWindow: '2pm – 4pm',
  hostName: 'Lucy',
  hostRole: 'Your Program Manager',
};

export const goals: Goal[] = [
  {
    id: 'goal-jarryd-sleep',
    profileId: you.id,
    pillarId: 'sleep',
    title: 'Asleep before 10pm',
    target: '30 days',
    active: true,
    createdAt: days(-12),
  },
  {
    id: 'goal-sarah-walk',
    profileId: 'member-sarah',
    pillarId: 'movement',
    title: 'Walk before scrolling',
    active: true,
    createdAt: days(-12),
  },
  {
    id: 'goal-tom-breath',
    profileId: 'member-tom',
    pillarId: 'emotional',
    title: 'Breathe through the 3pm slump',
    active: true,
    createdAt: days(-12),
  },
  {
    id: 'goal-priya-screens',
    profileId: 'member-priya',
    pillarId: 'emotional',
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
    pillarId: 'sleep',
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
    pillarId: 'sleep',
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
    pillarId: 'sleep',
    scheduledAt: hours(36),
    status: 'upcoming',
  },
  // Sarah
  {
    id: 'ci-sarah-1',
    memberId: 'member-sarah',
    leaderId: coach.id,
    pillarId: 'movement',
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
    pillarId: 'movement',
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
    pillarId: 'movement',
    scheduledAt: hours(8),
    status: 'upcoming',
  },
  // Tom
  {
    id: 'ci-tom-1',
    memberId: 'member-tom',
    leaderId: coach.id,
    pillarId: 'emotional',
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
    pillarId: 'emotional',
    scheduledAt: hours(28),
    status: 'upcoming',
  },
  // Priya
  {
    id: 'ci-priya-1',
    memberId: 'member-priya',
    leaderId: coach.id,
    pillarId: 'emotional',
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
    pillarId: 'emotional',
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
  // Nourishment
  {
    id: 'content-recipe',
    type: 'recipe',
    pillarId: 'nourishment',
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
    id: 'content-cookalong',
    type: 'event',
    pillarId: 'nourishment',
    title: 'Group cook-along',
    description: 'Wed 6pm · with the Gwinganna chef',
    weekOf: thisMonday,
    doneBy: [],
  },
  {
    id: 'content-toxic',
    type: 'nature',
    pillarId: 'nourishment',
    themes: ['low_tox', 'environment'],
    title: 'Low-tox swap of the week',
    description: 'Swap one spa or cleaning product for a low-tox one — then 20 minutes barefoot in nature.',
    weekOf: thisMonday,
    doneBy: [],
  },
  // Movement
  {
    id: 'content-movement',
    type: 'movement',
    pillarId: 'movement',
    title: 'Morning Chi Gong · 8 min',
    description: 'A gentle flow to start the day. No equipment.',
    weekOf: thisMonday,
    doneBy: [],
  },
  // Emotional Wellbeing
  {
    id: 'content-breathwork',
    type: 'breathwork',
    pillarId: 'emotional',
    title: 'Box breathing · 4 min',
    description: 'Down-regulate the 3pm stress spike. Four counts in, hold, out, hold.',
    weekOf: thisMonday,
    doneBy: [],
  },
  // Sleep
  {
    id: 'content-sleep',
    type: 'sleep',
    pillarId: 'sleep',
    title: 'Wind-down at the same time',
    description: 'A 20-minute pre-sleep routine to anchor your body clock.',
    weekOf: thisMonday,
    doneBy: [],
  },
];

/**
 * The retreat kitchen library — plant-forward, low-tox, branded "from the
 * retreat kitchen" (Gwinganna is a committed partner). Three per time slot.
 * Tints stand in for photography; keep them muted and food-adjacent.
 */
export const meals: Meal[] = [
  // Breakfast
  {
    id: 'meal-bircher',
    title: 'Bircher muesli with poached pear',
    mealTime: 'breakfast',
    intro:
      'The retreat classic — oats soaked overnight so mornings ask nothing of you. Sweetness comes from the pear, not the packet.',
    tint: '#A8763E',
    prepMins: 10,
    cookMins: 15,
    servings: 2,
    ingredients: [
      '1 cup rolled oats',
      '1 cup almond milk',
      '1 green apple, grated',
      '1 firm pear, halved',
      '1 cinnamon quill',
      '2 tbsp natural yoghurt or coconut yoghurt',
      '1 tbsp toasted seeds (pepitas, sunflower)',
      'Squeeze of lemon',
    ],
    steps: [
      'The night before, combine oats, almond milk, grated apple and lemon in a bowl. Cover and refrigerate.',
      'Simmer the pear halves with the cinnamon quill in just enough water to cover, 12–15 minutes, until tender.',
      'In the morning, loosen the bircher with a splash more milk if needed.',
      'Top with the poached pear, yoghurt and toasted seeds.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-corn-fritters',
    title: 'Sweetcorn fritters with avocado & lime',
    mealTime: 'breakfast',
    intro:
      'A savoury start that holds you to lunch — no sugar spike, no 10am crash.',
    tint: '#C9A44A',
    prepMins: 15,
    cookMins: 10,
    servings: 2,
    ingredients: [
      '2 cobs corn, kernels sliced off',
      '2 free-range eggs',
      '⅓ cup buckwheat flour',
      '2 spring onions, finely sliced',
      'Handful coriander, chopped',
      '1 avocado',
      '1 lime',
      'Extra-virgin olive oil',
    ],
    steps: [
      'Whisk the eggs with the buckwheat flour to a smooth batter.',
      'Fold in corn kernels, spring onion and half the coriander. Season well.',
      'Heat a little olive oil in a pan over medium heat. Drop in spoonfuls and cook 2–3 minutes each side until golden.',
      'Smash the avocado with lime juice and the rest of the coriander.',
      'Stack the fritters and spoon the avocado over.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-buckwheat-porridge',
    title: 'Buckwheat porridge with stewed rhubarb',
    mealTime: 'breakfast',
    intro:
      'Gluten-free and gently warming — the kitchen serves this on cool hinterland mornings.',
    tint: '#8C5A50',
    prepMins: 5,
    cookMins: 20,
    servings: 2,
    ingredients: [
      '1 cup buckwheat groats, rinsed',
      '2 cups water or almond milk',
      '3 stalks rhubarb, chopped',
      '1 tsp vanilla',
      '1 tbsp maple syrup',
      '¼ cup roasted macadamias, crushed',
      'Pinch of sea salt',
    ],
    steps: [
      'Simmer the buckwheat in water or almond milk with a pinch of salt, 15–18 minutes, stirring now and then.',
      'Meanwhile, stew the rhubarb with vanilla, maple and a splash of water until it collapses, about 8 minutes.',
      'Spoon the porridge into bowls, top with rhubarb and crushed macadamias.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  // Lunch
  {
    id: 'meal-rainbow-bowl',
    title: 'Rainbow bowl with turmeric quinoa & tahini',
    mealTime: 'lunch',
    intro:
      'The everyday retreat lunch — build it from whatever vegetables the week gives you.',
    tint: '#C97B5A',
    prepMins: 20,
    cookMins: 15,
    servings: 2,
    ingredients: [
      '1 cup quinoa, rinsed',
      '1 tsp ground turmeric',
      '1 beetroot, grated',
      '1 carrot, ribboned',
      '1 cup shredded red cabbage',
      '1 cup cooked chickpeas',
      '2 tbsp tahini',
      '1 lemon, juiced',
      'Handful mint and parsley',
    ],
    steps: [
      'Cook the quinoa with the turmeric in 2 cups of water, 12–15 minutes, until the water is absorbed.',
      'Whisk tahini with lemon juice and 2 tbsp warm water to a pourable dressing.',
      'Arrange quinoa, beetroot, carrot, cabbage and chickpeas in bowls — keep the colours separate.',
      'Dress generously, finish with the herbs.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-zucchini-fritters',
    title: 'Zucchini & pea fritters with herbed yoghurt',
    mealTime: 'lunch',
    intro: 'Light, green and quick — the trick is squeezing the zucchini properly dry.',
    tint: '#7E9B6E',
    prepMins: 15,
    cookMins: 12,
    servings: 2,
    ingredients: [
      '2 zucchini, grated and squeezed dry',
      '1 cup peas (fresh or thawed)',
      '2 free-range eggs',
      '⅓ cup chickpea flour',
      '1 cup natural yoghurt',
      'Handful dill and mint, chopped',
      '½ lemon',
      'Extra-virgin olive oil',
    ],
    steps: [
      'Squeeze the grated zucchini in a clean tea towel until no more water comes out.',
      'Mix zucchini, peas, eggs and chickpea flour. Season well.',
      'Pan-fry spoonfuls in olive oil over medium heat, 3 minutes a side, until set and golden.',
      'Stir the herbs and lemon juice through the yoghurt.',
      'Serve the fritters warm with the herbed yoghurt.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-miso-pumpkin',
    title: 'Miso-roasted pumpkin & cavolo nero salad',
    mealTime: 'lunch',
    intro:
      'Deep savoury flavour without meat — miso does the heavy lifting.',
    tint: '#B0883B',
    prepMins: 10,
    cookMins: 30,
    servings: 2,
    ingredients: [
      '½ kent pumpkin, cut into wedges',
      '1 tbsp white miso paste',
      '1 tbsp extra-virgin olive oil',
      '1 bunch cavolo nero, stripped and torn',
      '½ cup cooked brown rice',
      '2 tbsp toasted almonds',
      '1 tbsp apple cider vinegar',
    ],
    steps: [
      'Heat the oven to 200°C. Whisk miso with olive oil and a splash of water; coat the pumpkin wedges.',
      'Roast 25–30 minutes until caramelised at the edges.',
      'Massage the cavolo nero with a little oil and the vinegar until it softens.',
      'Toss with brown rice, top with pumpkin and almonds.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  // Dinner
  {
    id: 'meal-snapper',
    title: 'Slow-baked snapper with fennel & citrus',
    mealTime: 'dinner',
    intro:
      'Dinner at the retreat is early and light — this is the dish guests ask about most.',
    tint: '#5B6B8C',
    prepMins: 15,
    cookMins: 25,
    servings: 2,
    ingredients: [
      '2 snapper fillets',
      '1 fennel bulb, finely shaved',
      '1 orange, sliced into rounds',
      '1 lemon, sliced into rounds',
      '2 tbsp extra-virgin olive oil',
      'Handful flat-leaf parsley',
      'Sea salt and black pepper',
    ],
    steps: [
      'Heat the oven to 160°C.',
      'Lay half the fennel and citrus in a baking dish, sit the snapper on top, then cover with the rest.',
      'Drizzle with olive oil, season, and cover loosely with baking paper.',
      'Bake 22–25 minutes until the fish just flakes.',
      'Rest 5 minutes, scatter with parsley and serve with the pan juices.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-chickpea-curry',
    title: 'Chickpea & sweet potato curry',
    mealTime: 'dinner',
    intro:
      'The take-home staple — one pot, pantry-friendly, better the next day.',
    tint: '#C46A3F',
    prepMins: 15,
    cookMins: 35,
    servings: 4,
    ingredients: [
      '1 onion, diced',
      '2 cloves garlic, crushed',
      '1 thumb ginger, grated',
      '2 tsp each ground cumin, coriander, turmeric',
      '2 sweet potatoes, cubed',
      '400g cooked chickpeas',
      '400ml coconut milk',
      '400g chopped tomatoes',
      '2 big handfuls spinach',
      'Brown rice, to serve',
    ],
    steps: [
      'Soften the onion in a little oil, then add garlic, ginger and spices. Cook until fragrant.',
      'Add sweet potato, chickpeas, coconut milk and tomatoes. Simmer 25–30 minutes.',
      'Stir the spinach through at the end until just wilted.',
      'Serve over brown rice.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-lentil-pie',
    title: 'Mushroom & lentil shepherd’s pie',
    mealTime: 'dinner',
    intro:
      'Comfort food, retreat rules — lentils and mushrooms under a parsnip mash.',
    tint: '#5C7470',
    prepMins: 20,
    cookMins: 45,
    servings: 4,
    ingredients: [
      '1 onion, diced',
      '2 carrots, diced',
      '2 sticks celery, diced',
      '300g mushrooms, chopped',
      '1 cup cooked puy lentils',
      '2 tbsp tomato paste',
      '1 tsp thyme leaves',
      '3 parsnips and 2 potatoes, peeled',
      'Splash of olive oil',
    ],
    steps: [
      'Boil the parsnips and potatoes until tender, then mash with olive oil and season.',
      'Sweat onion, carrot and celery until soft. Add mushrooms and cook until they release and re-absorb their liquid.',
      'Stir in lentils, tomato paste, thyme and a cup of water. Simmer 10 minutes.',
      'Spoon into a baking dish, top with the mash, rough up the surface.',
      'Bake at 200°C for 25 minutes until golden on top.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  // Snacks & drinks
  {
    id: 'meal-bliss-balls',
    title: 'Cacao & date bliss balls',
    mealTime: 'snack',
    intro:
      'The 3pm answer — sweet enough to feel like a treat, honest enough to keep you off the biscuits.',
    tint: '#7A6A8A',
    prepMins: 15,
    cookMins: 0,
    servings: 4,
    ingredients: [
      '1 cup medjool dates, pitted',
      '1 cup almonds',
      '2 tbsp raw cacao powder',
      '1 tbsp chia seeds',
      '1 tbsp coconut oil',
      'Desiccated coconut, to roll',
      'Pinch of sea salt',
    ],
    steps: [
      'Blitz the almonds to a coarse crumb.',
      'Add dates, cacao, chia, coconut oil and salt; blitz until the mix holds together when pressed.',
      'Roll into balls, then roll in coconut.',
      'Chill 30 minutes. Keeps a week in the fridge.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-dandelion-chai',
    title: 'Dandelion chai latte',
    mealTime: 'snack',
    intro:
      'The retreat’s coffee stand-in — roasted dandelion root with warming spice. Nothing to ease off from.',
    tint: '#8C6A4F',
    prepMins: 5,
    cookMins: 10,
    servings: 2,
    ingredients: [
      '2 tsp roasted dandelion root',
      '2 cups oat or almond milk',
      '1 cinnamon quill',
      '3 cardamom pods, bruised',
      '2 slices fresh ginger',
      '1 tsp honey (optional)',
    ],
    steps: [
      'Warm the milk with the dandelion root, cinnamon, cardamom and ginger.',
      'Hold just below a simmer for 8–10 minutes to draw the flavour out.',
      'Strain, sweeten with honey if you like, and pour.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
  {
    id: 'meal-beetroot-hummus',
    title: 'Seeded crackers with beetroot hummus',
    mealTime: 'snack',
    intro:
      'A low-tox pantry snack — bake a tray of crackers on Sunday and the week looks after itself.',
    tint: '#9B4A5A',
    prepMins: 15,
    cookMins: 40,
    servings: 4,
    ingredients: [
      '1 cup mixed seeds (pepitas, sunflower, sesame, chia)',
      '½ cup buckwheat flour',
      '1 tsp rosemary, chopped',
      '1 cooked beetroot',
      '400g cooked chickpeas',
      '2 tbsp tahini',
      '1 clove garlic',
      '1 lemon, juiced',
    ],
    steps: [
      'Mix seeds, flour, rosemary and ½ cup water. Rest 10 minutes until it binds.',
      'Roll thin between baking paper and bake at 170°C for 35–40 minutes until crisp. Snap into shards.',
      'Blitz beetroot, chickpeas, tahini, garlic and lemon until smooth. Season.',
      'Serve the hummus with the crackers.',
    ],
    pillarId: 'nourishment',
    saved: false,
  },
];

/**
 * A believable little earn history: check-ins on the last two days (so one
 * more today crosses the 3-day streak in a demo) plus one completed session.
 * Balance is always the ledger sum — never seed them apart.
 */
export const pointsLedger: PointsLedgerEntry[] = [
  {
    id: 'pt-checkin-2',
    action: 'daily_check_in',
    points: AWARDS.daily_check_in,
    at: days(-2),
    label: ACTION_LABELS.daily_check_in,
  },
  {
    id: 'pt-session-1',
    action: 'content_complete',
    points: AWARDS.content_complete,
    at: days(-2),
    label: ACTION_LABELS.content_complete,
  },
  {
    id: 'pt-checkin-1',
    action: 'daily_check_in',
    points: AWARDS.daily_check_in,
    at: days(-1),
    label: ACTION_LABELS.daily_check_in,
  },
];

export const pointsBalance = pointsLedger.reduce((sum, e) => sum + e.points, 0);

/**
 * The marketplace catalogue — curated, not a catalogue dump. Prices in AUD;
 * pointCost ≈ price × 10 so the wallet maths reads honestly. The Jiva shot
 * is deliberately cheap enough to redeem from a near-seed balance.
 */
export const products: Product[] = [
  // Drinks — the daily-habit SKUs
  {
    id: 'prod-jiva-shot',
    name: 'Jiva turmeric shot',
    category: 'drink',
    blurb: 'The retreat morning ritual, single shot.',
    description:
      'Cold-pressed turmeric, ginger and black pepper — the shot served at the retreat juice bar every morning. One sharp, warming hit.',
    tint: '#C9902E',
    priceAud: 6.5,
    pointCost: 30,
    pillarId: 'nourishment',
    why: 'The single most-asked-for item from the retreat kitchen — an easy daily anchor habit.',
  },
  {
    id: 'prod-jiva-week',
    name: 'Jiva shots · week of 7',
    category: 'drink',
    blurb: 'A shot a day, delivered as a box of seven.',
    description:
      'Seven cold-pressed turmeric shots — one for every morning of the week. Keep them in the fridge door where you can’t miss them.',
    tint: '#B27B24',
    priceAud: 42,
    pointCost: 420,
    pillarId: 'nourishment',
    why: 'Buying the week, not the day, is how the morning shot becomes automatic.',
  },
  {
    id: 'prod-dandelion-chai',
    name: 'Dandelion chai blend',
    category: 'drink',
    blurb: 'The retreat’s caffeine-free coffee stand-in.',
    description:
      'Roasted dandelion root with cinnamon, cardamom and ginger — the blend behind the chai latte recipe in your Nourishment library.',
    tint: '#8C6A4F',
    priceAud: 18,
    pointCost: 180,
    pillarId: 'nourishment',
    why: 'Pairs with easing off coffee — same ritual, none of the caffeine.',
  },
  // Supplements
  {
    id: 'prod-magnesium',
    name: 'Magnesium night powder',
    category: 'supplement',
    blurb: 'Wind-down support before bed.',
    description:
      'Magnesium glycinate with a touch of passionflower — stirred into warm water twenty minutes before lights out.',
    tint: '#5B6B8C',
    priceAud: 38,
    pointCost: 380,
    pillarId: 'sleep',
    why: 'Magnesium before bed supports deeper sleep — a natural pair with your Sleep pillar.',
  },
  {
    id: 'prod-ashwagandha',
    name: 'Ashwagandha capsules',
    category: 'supplement',
    blurb: 'Steady support for stressful weeks.',
    description:
      'KSM-66 ashwagandha, sixty capsules. The adaptogen the retreat naturopath talks about in the stress-resilience session.',
    tint: '#8C7B9C',
    priceAud: 29,
    pointCost: 290,
    pillarId: 'emotional',
    why: 'Backs the nervous-system regulation work in Emotional Wellbeing.',
  },
  {
    id: 'prod-greens',
    name: 'Daily greens powder',
    category: 'supplement',
    blurb: 'One scoop when the vegetables didn’t happen.',
    description:
      'Spirulina, barley grass and broccoli sprout — a safety net for travel days, not a replacement for the real thing.',
    tint: '#4E6B51',
    priceAud: 55,
    pointCost: 550,
    pillarId: 'nourishment',
    why: 'A backstop for plant-forward eating on the days life gets in the way.',
  },
  // Boxes
  {
    id: 'prod-pantry-box',
    name: 'Retreat pantry box',
    category: 'box',
    blurb: 'The staples behind the recipe library.',
    description:
      'Tahini, buckwheat, chickpeas, olive oil, seeds and spices — the pantry that makes the retreat-kitchen recipes weeknight-possible.',
    tint: '#C97B5A',
    priceAud: 89,
    pointCost: 890,
    pillarId: 'nourishment',
    why: 'Stocks the exact staples your saved recipes call for.',
  },
  {
    id: 'prod-lowtox-box',
    name: 'Low-tox home starter box',
    category: 'box',
    blurb: 'Swap the worst offenders in one go.',
    description:
      'Castile cleaner, laundry sheets, a low-tox dish bar and a room mist — the four swaps a low-tox home starts with.',
    tint: '#7E9B6E',
    priceAud: 59,
    pointCost: 590,
    pillarId: 'nourishment',
    themes: ['low_tox'],
    why: 'One box covers the first month of low-tox swaps.',
  },
  {
    id: 'prod-sleep-box',
    name: 'Sleep wind-down box',
    category: 'box',
    blurb: 'Everything for the last hour of the day.',
    description:
      'Magnesium powder, a linen eye mask, chamomile blend and a small amber lamp bulb — a ready-made wind-down kit.',
    tint: '#44536F',
    priceAud: 49,
    pointCost: 490,
    pillarId: 'sleep',
    why: 'Builds the pre-sleep routine from your Sleep pillar into objects you can’t ignore.',
  },
  // Books
  {
    id: 'prod-book-breath',
    name: 'Breath — James Nestor',
    category: 'book',
    blurb: 'The book behind the breathwork sessions.',
    description:
      'Why nose-breathing, slow exhales and CO₂ tolerance matter — the science underneath the practices your coach teaches.',
    tint: '#5C7470',
    priceAud: 24,
    pointCost: 240,
    pillarId: 'emotional',
    why: 'The reference text for the breathwork you’re already doing.',
  },
  {
    id: 'prod-book-sleep',
    name: 'Why We Sleep — Matthew Walker',
    category: 'book',
    blurb: 'The case for the ten o’clock bedtime.',
    description:
      'The research that convinced the retreat to build a pillar around sleep. Alarming in the useful way.',
    tint: '#3E4A63',
    priceAud: 27,
    pointCost: 270,
    pillarId: 'sleep',
    why: 'If the Sleep pillar needs a why, this is the book that supplies it.',
  },
  {
    id: 'prod-book-cook',
    name: 'Eat Like the Retreat',
    category: 'book',
    blurb: 'The kitchen’s cookbook, extended.',
    description:
      'Ninety plant-forward recipes from the retreat kitchen — the full version of the library in your Nourishment pillar.',
    tint: '#A8763E',
    priceAud: 39,
    pointCost: 390,
    pillarId: 'nourishment',
    why: 'Goes beyond your saved recipes when the twelve in the app stop being enough.',
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
