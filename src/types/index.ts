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
  active: boolean;
  createdAt: string;
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

export type ContentType =
  | 'recipe'
  | 'movement'
  | 'affirmation'
  | 'event'
  | 'sleep'
  | 'breathwork'
  | 'nature'
  | 'mindset';

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
  weekOf: string;
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
  /** Hero tint (hex) — stands in for food photography while the prototype ships no remote assets. */
  tint: string;
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
}
