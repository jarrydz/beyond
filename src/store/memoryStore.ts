import { createContext, useContext } from 'react';
import type {
  Booking,
  CheckIn,
  Cohort,
  ContentItem,
  DailyCheckInEntry,
  Goal,
  Meal,
  Order,
  PillarId,
  PointsLedgerEntry,
  Post,
  PrepTask,
  Product,
  Profile,
  Subscription,
} from '@/types';
import { readOnboarded } from './onboardingStorage';
import {
  readContentDone,
  readDailyCheckIns,
  readDemoOffset,
  readDoneTasks,
  readGoalWhy,
  readPlannerTicks,
  readTaperTicks,
} from './journeyStorage';
import { prepTasks as seedPrepTasks } from '@/config/prepTasks';
import { pillars } from '@/config/pillars';
import {
  affirmations as seedAffirmations,
  booking as seedBooking,
  checkIns as seedCheckIns,
  cohort as seedCohort,
  content as seedContent,
  library as seedLibrary,
  goals as seedGoals,
  meals as seedMeals,
  pointsBalance as seedPointsBalance,
  pointsLedger as seedPointsLedger,
  posts as seedPosts,
  products as seedProducts,
  profiles as seedProfiles,
  subscriptions as seedSubscriptions,
  you as seedYou,
} from './seed';

export interface StoreState {
  cohort: Cohort;
  profiles: Profile[];
  goals: Goal[];
  checkIns: CheckIn[];
  posts: Post[];
  content: ContentItem[];
  /** PRD-07: the permanent content library — twelve pieces, three per pillar. */
  library: ContentItem[];
  /** Week-planner commitments, keyed `${dayIndex}:${sessionKey}` (PRD-07). */
  plannerTicks: string[];
  meals: Meal[];
  pointsBalance: number;
  pointsLedger: PointsLedgerEntry[];
  products: Product[];
  orders: Order[];
  /** Painted-door flag (PRD-04) — has the member joined the meal-delivery list? */
  mealDeliveryInterest: boolean;
  subscriptions: Subscription[];
  dailyCheckIns: DailyCheckInEntry[];
  affirmations: string[];
  currentUserId: string;
  // session-only — not modelled in the schema but needed by Phase 2's role switcher
  activeRole: 'member' | 'coach';
  signedIn: boolean;
  // PRD-05 — the retreat journey
  /** The seeded reservation (Gwinganna's side). Connection happens via the T-21 prep task. */
  booking: Booking | null;
  prepTasks: PrepTask[];
  /** Ticked taper cells, keyed `${daysBeforeArrival}:${substance}` — e.g. '5:caffeine'. */
  taperTicks: string[];
  /** Demo-only simulated clock: whole app computes dates as real today + this many days. */
  demoDayOffset: number;
  /**
   * PRD-06: focus set by the coach for seeded cohort guests, keyed by
   * booking id. Set dressing for the departure board — the real member's
   * focus lives on their Goal with provenance. Session-only by design.
   */
  guestFocus: Record<string, { pillarId: PillarId; note?: string }>;
}

/**
 * Restore the goal + why typed at the T-21 prep task. Reintegration's payoff
 * is the why restated verbatim — it must survive a refresh even though the
 * in-memory store resets.
 */
function restoredGoals(): Goal[] {
  const base = seedGoals.map((g) => ({ ...g }));
  const stored = readGoalWhy(seedYou.id);
  if (!stored || !pillars.some((p) => p.id === stored.pillarId)) return base;
  return [
    ...base.map((g) => (g.profileId === seedYou.id ? { ...g, active: false } : g)),
    {
      id: 'goal-journey-restored',
      profileId: seedYou.id,
      pillarId: stored.pillarId as Goal['pillarId'],
      title: stored.title,
      why: stored.why || undefined,
      focusSetBy: stored.focusSetBy,
      focusNote: stored.focusNote,
      focusSetAt: stored.focusSetAt,
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

export const initialState = (): StoreState => ({
  cohort: seedCohort,
  profiles: seedProfiles.map((p) => ({
    ...p,
    onboarded: p.onboarded || readOnboarded(p.id),
  })),
  goals: restoredGoals(),
  checkIns: seedCheckIns.map((c) => ({ ...c })),
  posts: seedPosts.map((p) => ({ ...p, likedBy: [...p.likedBy] })),
  content: seedContent.map((c) => ({ ...c, doneBy: [...c.doneBy] })),
  library: (() => {
    const done = new Set(readContentDone(seedYou.id));
    return seedLibrary.map((it) => ({
      ...it,
      doneBy: done.has(it.id) ? [seedYou.id] : [],
    }));
  })(),
  plannerTicks: readPlannerTicks(seedYou.id),
  meals: seedMeals.map((m) => ({ ...m, ingredients: [...m.ingredients], steps: [...m.steps] })),
  pointsBalance: seedPointsBalance,
  pointsLedger: seedPointsLedger.map((e) => ({ ...e })),
  products: seedProducts.map((p) => ({ ...p })),
  orders: [],
  mealDeliveryInterest: false,
  subscriptions: seedSubscriptions.map((s) => ({ ...s })),
  dailyCheckIns: readDailyCheckIns(seedYou.id) as DailyCheckInEntry[],
  affirmations: [...seedAffirmations],
  currentUserId: seedYou.id,
  activeRole: 'member',
  signedIn: false,
  guestFocus: {},
  booking: seedBooking,
  prepTasks: (() => {
    const done = new Set(readDoneTasks(seedYou.id));
    return seedPrepTasks.map((t) => ({ ...t, done: done.has(t.id) }));
  })(),
  taperTicks: readTaperTicks(seedYou.id),
  demoDayOffset: readDemoOffset(),
});

export type StoreListener = (s: StoreState) => void;

export class MemoryStore {
  private state: StoreState;
  private listeners = new Set<StoreListener>();

  constructor(initial: StoreState = initialState()) {
    this.state = initial;
  }

  get(): StoreState {
    return this.state;
  }

  set(updater: (s: StoreState) => StoreState): void {
    this.state = updater(this.state);
    this.emit();
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l(this.state);
  }
}

export const StoreContext = createContext<MemoryStore | null>(null);

export function useStore(): MemoryStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
