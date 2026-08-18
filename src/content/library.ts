import type { ContentItem } from '@/types';

/**
 * The content library (PRD-07) — twelve pieces, three per pillar, from the
 * 17 Aug '26 pillar content plan. PURE DATA by decision 4: no JSX, no
 * functions, no imports from components. If you can't JSON.stringify it,
 * it's in the wrong file. When PRD-08 puts a loader in front of content,
 * this file becomes the fixture and nothing else moves.
 *
 * posterUrl/mediaUrl are deliberately absent this round — the tint gradient
 * and the honest placeholder stand in until the film shoot, which is then a
 * data edit here and nowhere else.
 *
 * Copy rule: describes practice, never outcome. "This is what we do at the
 * retreat", never a health claim.
 */
export const library: ContentItem[] = [
  // ——— Sleep ———
  {
    id: 'lib-sleep-winddown',
    type: 'sleep',
    pillarId: 'sleep',
    format: 'interactive',
    componentKey: 'step_sequence',
    title: 'Your wind-down, hour by hour',
    description: 'The retreat evening, mapped onto yours — anchored to your lights-out time.',
    presenter: 'Lucy',
    tint: '#5B6B8C',
    config: {
      steps: [
        {
          title: 'One hour out',
          detail:
            'Big lights off, lamps on. You said lights out {lightsOut} — the hour before it is where the night is decided.',
        },
        {
          title: 'Forty minutes out',
          detail: 'Kitchen closed, screens down. The phone goes to its charger in the hall — reach is the whole game.',
        },
        {
          title: 'Twenty minutes out',
          detail: 'The retreat sequence: warm shower, an easy stretch, cooler bedroom than feels natural.',
        },
        {
          title: 'Ten minutes out',
          detail: 'Paper, not glass. A few pages of anything. Boring is an advantage here.',
        },
        {
          title: 'Lights out {lightsOut}',
          detail: 'Same time again tomorrow, even after a rough night. The rhythm is built on the mornings you keep.',
        },
      ],
    },
    doneBy: [],
  },
  {
    id: 'lib-sleep-meditation',
    type: 'sleep',
    pillarId: 'sleep',
    format: 'audio',
    title: 'Settle — a sleep meditation',
    description: 'Lucy talks the body down, one region at a time. For the minutes after lights out.',
    presenter: 'Lucy',
    durationMin: 12,
    tint: '#44536F',
    doneBy: [],
  },
  {
    id: 'lib-sleep-acupressure',
    type: 'sleep',
    pillarId: 'sleep',
    format: 'interactive',
    componentKey: 'step_sequence',
    title: 'Acupressure you can do yourself',
    description: 'Five points from the spa table, a minute each. Firm, slow, no equipment.',
    presenter: 'The Gwinganna spa team',
    durationMin: 6,
    tint: '#6B7A9E',
    config: {
      steps: [
        {
          title: 'Between the brows',
          detail: 'One fingertip, slow circles, eyes closed. Lighter than you think you need.',
          seconds: 60,
        },
        {
          title: 'The jaw hinge',
          detail: 'Where the teeth clench. Small circles while you let the mouth hang slightly open.',
          seconds: 60,
        },
        {
          title: 'Base of the skull',
          detail: 'Thumbs into the hollows either side of the spine. Tilt the head back into them.',
          seconds: 60,
        },
        {
          title: 'The wrist crease',
          detail: 'Three fingers below the palm, inside the wrist. Steady pressure, slow breath.',
          seconds: 60,
        },
        {
          title: 'The web of the hand',
          detail: 'Between thumb and finger, squeezed slowly from both sides. Swap hands halfway.',
          seconds: 60,
        },
      ],
    },
    doneBy: [],
  },

  // ——— Nourishment ———
  {
    id: 'lib-nourish-cookalong',
    type: 'recipe',
    pillarId: 'nourishment',
    format: 'interactive',
    componentKey: 'step_sequence',
    title: 'Cook along: a retreat dinner',
    description: 'The chickpea and sweet potato curry, step by step at your own stove.',
    presenter: 'The Gwinganna kitchen',
    durationMin: 50,
    tint: '#C97B5A',
    config: {
      mealId: 'meal-chickpea-curry',
      steps: [
        {
          title: 'Set up',
          detail: 'Everything chopped before the heat goes on — the kitchen calls it mise en place; we call it not rushing.',
        },
        {
          title: 'The base',
          detail: 'Onion soft and sweet in olive oil, then garlic, ginger and the spices until the kitchen smells like the retreat.',
          seconds: 300,
        },
        {
          title: 'Build it',
          detail: 'Sweet potato, chickpeas, tomatoes, coconut milk. Bring it just to the edge of a boil.',
          seconds: 120,
        },
        {
          title: 'Let it work',
          detail: 'Lid half on, low heat. This is the step where you set the table and do nothing else.',
          seconds: 900,
        },
        {
          title: 'Finish',
          detail: 'Spinach folded through at the end, lime over the top. Taste before you salt.',
          seconds: 120,
        },
      ],
    },
    doneBy: [],
  },
  {
    id: 'lib-nourish-herbs',
    type: 'mindset',
    pillarId: 'nourishment',
    format: 'video',
    title: 'Herbs, salt, and what actually matters',
    description: 'The naturopathy team on the pantry shelf — what earns its place and what is mostly label.',
    presenter: 'The naturopathy team',
    durationMin: 9,
    tint: '#A8763E',
    doneBy: [],
  },
  {
    id: 'lib-nourish-fads',
    type: 'mindset',
    pillarId: 'nourishment',
    format: 'read',
    title: 'Food fads, dispelled',
    description: 'Five claims from the feed, held up to the light. No scolding — just what holds.',
    presenter: 'The naturopathy team',
    tint: '#B5663F',
    body: [
      'Celery juice resets nothing. Celery is fine — it is water, fibre and a pleasant crunch. The "reset" it promises is not a thing your liver has ever asked for; your liver resets itself, continuously, for free. Drink it because you like it.',
      'Carbs after dark are not a rule. The evidence on meal timing is far weaker than the certainty around it. What we see at the retreat: a modest dinner eaten slowly beats a perfectly-timed one eaten standing up.',
      'Detox teas mostly work on your wallet, and some work on your bowels — which is not detoxification, it is a laxative with marketing. If a tea makes big promises, read the ingredients before the testimonials.',
      '"Superfood" is a shelf label, not a science category. Blueberries are good. So are frozen ones, and so are the ordinary vegetables that never made the poster. Variety and regularity beat any single hero ingredient.',
      'Cutting whole food groups without a diagnosed reason usually trades a vague worry for a real gap. If gluten or dairy genuinely disagrees with you, that is worth exploring properly — with the reservation form and a professional, not an elimination trend.',
      'The quiet pattern behind all of these: the less a claim promises, the more likely it is to hold. Mostly plants, mostly cooked by you, mostly eaten sitting down — that is the whole trick, and nobody can sell it to you.',
    ],
    doneBy: [],
  },

  // ——— Movement ———
  {
    id: 'lib-move-qigong',
    type: 'movement',
    pillarId: 'movement',
    format: 'interactive',
    componentKey: 'step_sequence',
    title: 'Qi gong: the morning sequence',
    description: 'The eight movements from the lawn, exactly as Leo teaches them. No equipment.',
    presenter: 'Leo',
    durationMin: 8,
    tint: '#5C7470',
    config: {
      steps: [
        { title: 'Standing still', detail: 'Feet hip-width, knees soft, arms heavy. Three slow breaths before anything moves.', seconds: 45 },
        { title: 'Lifting the sky', detail: 'Palms rise together on the inhale, float down on the exhale. Slower than feels useful.', seconds: 45 },
        { title: 'Opening the chest', detail: 'Arms wide as you breathe in, wrapping forward as you breathe out.', seconds: 45 },
        { title: 'Painting the rainbow', detail: 'Weight shifts side to side, one arm arcing overhead. Let the waist do the work.', seconds: 45 },
        { title: 'Rolling the ball', detail: 'Hands hold an invisible ball, circling with the breath. Knees follow.', seconds: 45 },
        { title: 'Turning to look back', detail: 'A slow turn through the spine on each side. The gaze leads, the hips stay.', seconds: 45 },
        { title: 'Bouncing on the heels', detail: 'Small, loose bounces, arms slack. This one is allowed to feel silly.', seconds: 45 },
        { title: 'Closing', detail: 'Hands rest on the lower belly. Stand in the finish for three breaths before you move on.', seconds: 45 },
      ],
    },
    doneBy: [],
  },
  {
    id: 'lib-move-leo-class',
    type: 'movement',
    pillarId: 'movement',
    format: 'video',
    title: "Leo's class: full body, 30 minutes",
    description: 'The gym session from the retreat, scaled for a living room. Leo cues every option.',
    presenter: 'Leo',
    durationMin: 30,
    tint: '#4E6B51',
    doneBy: [],
  },
  {
    id: 'lib-move-planner',
    type: 'movement',
    pillarId: 'movement',
    format: 'interactive',
    componentKey: 'week_planner',
    title: 'Plan your week',
    description: 'Seven days, three kinds of session. Tap what you will actually do — it keeps.',
    tint: '#6B8271',
    config: {
      sessions: [
        { key: 'move', label: 'Move' },
        { key: 'strength', label: 'Strength' },
        { key: 'mobility', label: 'Mobility' },
      ],
    },
    doneBy: [],
  },

  // ——— Emotional Wellbeing ———
  {
    id: 'lib-emotional-breathe',
    type: 'breathwork',
    pillarId: 'emotional',
    format: 'interactive',
    componentKey: 'breath_pacer',
    title: 'Breathe with me',
    description: 'Box breathing, the way Lucy runs it in the pavilion. Four sides, four counts each.',
    presenter: 'Lucy',
    durationMin: 2,
    tint: '#8C7B9C',
    config: { inhale: 4, hold1: 4, exhale: 4, hold2: 4, cycles: 6 },
    doneBy: [],
  },
  {
    id: 'lib-emotional-breath-states',
    type: 'breathwork',
    pillarId: 'emotional',
    format: 'interactive',
    componentKey: 'breath_pacer',
    title: 'Breathwork for how you feel',
    description: 'Three patterns for three states. Pick the one that matches, not the one that sounds best.',
    presenter: 'Lucy',
    durationMin: 3,
    tint: '#7B6B8E',
    config: {
      modes: [
        {
          key: 'anxious',
          label: 'Wound up',
          detail: 'A long exhale asks the body to come down. In for four, out for eight.',
          pattern: { inhale: 4, hold1: 2, exhale: 8, hold2: 0, cycles: 6 },
        },
        {
          key: 'flat',
          label: 'Flat',
          detail: 'A longer inhale brings the system up. In for six, out for four.',
          pattern: { inhale: 6, hold1: 2, exhale: 4, hold2: 0, cycles: 6 },
        },
        {
          key: 'overwhelmed',
          label: 'Overwhelmed',
          detail: 'Long and even — nothing to optimise, just a slower metronome than the day.',
          pattern: { inhale: 6, hold1: 3, exhale: 6, hold2: 3, cycles: 5 },
        },
      ],
    },
    doneBy: [],
  },
  {
    id: 'lib-emotional-peace',
    type: 'mindset',
    pillarId: 'emotional',
    format: 'audio',
    title: 'Protect your peace — morning meditation',
    description: 'Eight minutes before the day gets a say. Lucy, a chair, and nothing else required.',
    presenter: 'Lucy',
    durationMin: 8,
    tint: '#9C8BAD',
    doneBy: [],
  },
];
