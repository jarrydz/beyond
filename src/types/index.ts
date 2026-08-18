export type Role = 'member' | 'coach';

/**
 * The Pillars — the WHAT members work on, delivered by the Enablers
 * (Coach, Community, Platform). Key off this stable id, never the display label.
 * Source of truth for copy/accent/order: src/config/pillars.ts.
 */
export type PillarId =
  | 'nourishment'
  | 'movement'
  | 'emotional'
  | 'sleep';

/**
 * Cross-cutting themes — additive metadata on content and products, not a
 * second navigation axis. Every item still resolves to exactly one PillarId.
 * `low_tox`: organic / no-preservative food, low-tox spa and cleaning products.
 * `environment`: nature immersion, the member's physical surroundings.
 */
export type ContentTheme = 'low_tox' | 'environment';

export interface Pillar {
  id: PillarId;
  order: number;
  label: string; // e.g. 'Emotional Wellbeing'
  tagline: string; // one-liner
  detail: string[]; // member-facing bullets
  accent: string; // brand accent (hex) used for icon tint / progress fill
}

export interface Profile {
  id: string;
  fullName: string;
  avatarInitial: string;
  /** Portrait photo — same contract as posterUrl: set it and the initials fall away. */
  photoUrl?: string;
  role: Role;
  cohortId: string;
  onboarded: boolean;
}

export interface Cohort {
  id: string;
  name: string;
  retreatName: string;
}

export interface Goal {
  id: string;
  profileId: string;
  pillarId: PillarId;
  title: string;
  target?: string;
  /** The member's why, in their own words — captured at T-21, restated at the handoff and in reintegration. */
  why?: string;
  /**
   * Focus provenance (PRD-06). The pillar IS the focus — no parallel concept.
   * Who last set it: absent = the member, at T-21.
   */
  focusSetBy?: 'member' | 'coach';
  /** The coach's one line on why this pillar, in her words. Shown on day 1 home. */
  focusNote?: string;
  /** ISO timestamp of the last focus decision — drives the 60-day stale check. */
  focusSetAt?: string;
  active: boolean;
  createdAt: string;
}

/**
 * The journey lifecycle (PRD-05). Always DERIVED from the booking and the
 * simulated clock via utils/journey.ts stageFor() — never stored as a flag.
 * `member` is the fallback: no booking, or departure + 15d onward.
 */
export type JourneyStage = 'pre_retreat' | 'on_retreat' | 'reintegration' | 'member';

/** A Gwinganna reservation — the anchor every journey date derives from. */
export interface Booking {
  id: string;
  profileId: string;
  confirmationNumber: string; // e.g. '94167'
  guestName: string;
  packageName: string; // e.g. 'Optimum Wellbeing'
  roomType: string; // e.g. 'Meditation Villas'
  arrivalDate: string; // ISO date
  departureDate: string; // ISO date
  arrivalWindow: string; // e.g. '2pm – 4pm'
  hostName: string; // the Program Manager — e.g. 'Lucy'
  hostRole: string; // e.g. 'Your Program Manager'
}

/**
 * One row of the coach's arrivals/departures board (PRD-06) — a booking
 * plus the guest's goal and prep standing. Synthetic guests come from the
 * seeded cohort; the demo member is assembled from live store state.
 */
export interface GuestBooking {
  booking: Booking;
  goalPillarId: PillarId;
  goalTitle: string;
  goalWhy: string;
  requiredDone: number;
  requiredTotal: number;
  erfDone: boolean;
  taperStarted: boolean;
  /** True once the coach has set this guest's focus at departure. */
  focusSet?: boolean;
}

export type PrepKind = 'video' | 'form' | 'choice' | 'reflect' | 'read' | 'track';

/**
 * One step of the pre-retreat countdown. Copy lives in config/prepTasks.ts —
 * the same single-source-of-truth pattern as config/pillars.ts.
 */
export interface PrepTask {
  id: string;
  /** Days before arrival this unlocks. 21, 14, 10, 7, 5, 3, 1. */
  unlocksAt: number;
  title: string;
  blurb: string;
  kind: PrepKind;
  /** true = Gwinganna needs this done. false = preparation, not admin. */
  required: boolean;
  /** Label for the external deep-link sheet, for kind: 'form'. */
  externalLabel?: string;
  /** Ties prep to the pillar taxonomy where one fits. Optional by design. */
  pillarId?: PillarId;
  done: boolean;
}

export type CheckInStatus = 'upcoming' | 'completed' | 'cancelled';

export interface CheckIn {
  id: string;
  memberId: string;
  leaderId: string;
  scheduledAt: string;
  status: CheckInStatus;
  /** Optional — a check-in may span pillars; set when it's clearly about one. */
  pillarId?: PillarId;
  goalScore?: number;
  topBlocker?: string;
  commitment?: string;
  notes?: string;
}

export interface Post {
  id: string;
  authorId: string;
  cohortId: string;
  body: string;
  createdAt: string;
  likedBy: string[];
}

/**
 * Legacy kind field — muddles pillar with kind now that pillarId + format
 * both exist. Retirement PARKED by decision (JZ, 2026-08-18) until PRD-08
 * touches this layer. When retiring: format keeps the medium; scheduling
 * gets `liveAt?: string` (an item with a liveAt is an event, and it carries
 * the when an RSVP needs). Do NOT fold 'event' into ContentFormat — a live
 * cook-along is a video delivered synchronously; collapsing medium into
 * scheduling recreates the category error this retirement exists to fix.
 */
export type ContentType =
  | 'recipe'
  | 'movement'
  | 'affirmation'
  | 'event'
  | 'sleep'
  | 'breathwork'
  | 'nature'
  | 'mindset';

/**
 * How a piece of content is delivered (PRD-07) — the modalities band from
 * the Aug '26 deck as a field, minus SMS/WhatsApp which are outbound-only
 * and correctly absent from the app.
 */
export type ContentFormat = 'video' | 'audio' | 'read' | 'interactive';

/** Keys into the local interactive-component registry (src/content/registry.ts). */
export type InteractiveKey = 'breath_pacer' | 'step_sequence' | 'week_planner';

export interface ContentItem {
  id: string;
  type: ContentType;
  /** Every content item resolves to exactly one pillar (source of truth, not `type`). */
  pillarId: PillarId;
  title: string;
  description?: string;
  payload?: any;
  /** Cross-cutting themes (additive metadata) — see ContentTheme. */
  themes?: ContentTheme[];
  /** How this is delivered. The modalities band as a field. */
  format: ContentFormat;
  /** Minutes, for the library row. Optional on `read`. */
  durationMin?: number;
  /** Who's delivering it — 'Leo', 'Lucy', 'The Gwinganna kitchen'. */
  presenter?: string;
  /**
   * The media contract (PRD-07 decision 2). Real assets when they exist;
   * absent → the tint gradient poster and the honest placeholder sheet.
   * The film shoot becomes a data edit, not a code change.
   */
  posterUrl?: string;
  mediaUrl?: string;
  /** Documented photography stand-in, same pattern as Meal.tint / Product.tint. */
  tint: string;
  /** `format: 'read'` — plain-text paragraphs. No markdown, no HTML. */
  body?: string[];
  /** `format: 'interactive'` — key into the local component registry. */
  componentKey?: InteractiveKey;
  /** Config the registered component reads. Per-component shape; JSON-serialisable. */
  config?: Record<string, unknown>;
  /** Set on weekly programming; absent on permanent library items. Nothing reads it yet. */
  weekOf?: string;
  doneBy: string[];
}

/** The four kitchen slots the meal library is grouped by — matches how members plan a day. */
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * A recipe from the retreat kitchen. Meals live beside ContentItem rather than
 * inside it — they're a permanent library, not weekly programming.
 */
export interface Meal {
  id: string;
  title: string;
  mealTime: MealTime;
  intro: string;
  /** Hero tint (hex) — the fallback when no photo has landed yet. */
  tint: string;
  /** Food photography — same contract as posterUrl: set it and the tint falls away. */
  photoUrl?: string;
  prepMins: number;
  cookMins: number;
  servings: number;
  ingredients: string[];
  steps: string[];
  pillarId: 'nourishment';
  saved: boolean;
}

/**
 * Everything that can move the points balance. Earn actions reward real
 * wellbeing behaviour (see config/points.ts for values + design intent);
 * marketplace_spend is the PRD-03 debit side.
 */
export type PointsAction =
  | 'daily_check_in'
  | 'content_complete'
  | 'save_recipe'
  | 'goal_30_day'
  | 'goal_100_day'
  | 'meal_delivery_interest'
  | 'marketplace_spend';

export interface PointsLedgerEntry {
  id: string;
  /**
   * Who earned or spent it (cold-start audit D1/D2). Views, the daily guard
   * and the streak walk are scoped by this; PRD-08's restructure should make
   * it required and key the whole wallet by it.
   */
  memberId?: string;
  action: PointsAction;
  points: number; // positive = earned, negative = spent
  at: string; // ISO timestamp
  label: string; // human-readable, for the earn history
  /** Optional subject (meal/content id) so awards can be once-per-thing, not farmable. */
  refId?: string;
}

export type ProductCategory = 'box' | 'supplement' | 'book' | 'drink';

/**
 * A curated marketplace product — mock, local-first, nothing charges or
 * ships. Curation over catalogue: every product carries an editorial
 * "recommended because" line, tied to a pillar where one fits.
 */
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  blurb: string; // one line for the tile
  description: string;
  /** Hero tint (hex) — stands in for product photography (local-first, no remote assets). */
  tint: string;
  priceAud: number;
  /** Redeemable with PRD-02 points when set. */
  pointCost?: number;
  /** Set when the recommendation ties to a pillar (shows the badge + contextual placement). */
  pillarId?: PillarId;
  /** Cross-cutting themes (additive metadata) — see ContentTheme. */
  themes?: ContentTheme[];
  /** The editorial "recommended because…" line. */
  why: string;
}

export interface Order {
  id: string;
  productId: string;
  placedAt: string; // ISO
  method: 'cash' | 'points';
  status: 'placed';
}

export interface Subscription {
  profileId: string;
  plan: string;
  status: 'mock' | 'active' | 'cancelled';
  startedAt: string;
}

export interface AiSummary {
  memberId: string;
  generatedAt: string;
  headline: string;
  wins: string[];
  watchOuts: string[];
  suggestedFocus: string;
}

export interface RecordCheckInInput {
  memberId: string;
  goalScore: number;
  topBlocker?: string;
  commitment?: string;
  notes?: string;
  /**
   * PRD-06: the consult is the focus review trigger. The recording sheet
   * always sends the pillar — unchanged = confirm (the default), different
   * = a deliberate change. Both write provenance.
   */
  focusPillarId?: PillarId;
  focusNote?: string;
}

export interface DailyCheckInEntry {
  id: string;
  memberId: string;
  recordedAt: string;
  /** Object URL to the recorded video blob (ephemeral, demo only). */
  videoUrl?: string;
  /** 1 (rough) – 5 (great) — set by the no-camera text/mood path. */
  mood?: number;
  /** Optional short note from the no-camera path. */
  note?: string;
  /**
   * The focus pillar at the time of logging — denormalised so history stays
   * true if focus changes. Month one's sleep history must not re-label
   * itself as movement data at the month-two consult.
   */
  pillarId?: PillarId;
  /** Answers to the two focus questions, keyed by question id. 0–4 scale index. */
  focusAnswers?: Record<string, number>;
}
