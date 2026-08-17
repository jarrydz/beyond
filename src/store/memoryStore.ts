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
  PointsLedgerEntry,
  Post,
  PrepTask,
  Product,
  Profile,
  Subscription,
} from '@/types';
import { readOnboarded } from './onboardingStorage';
import { prepTasks as seedPrepTasks } from '@/config/prepTasks';
import {
  affirmations as seedAffirmations,
  booking as seedBooking,
  checkIns as seedCheckIns,
  cohort as seedCohort,
  content as seedContent,
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
}

export const initialState = (): StoreState => ({
  cohort: seedCohort,
  profiles: seedProfiles.map((p) => ({
    ...p,
    onboarded: p.onboarded || readOnboarded(p.id),
  })),
  goals: seedGoals.map((g) => ({ ...g })),
  checkIns: seedCheckIns.map((c) => ({ ...c })),
  posts: seedPosts.map((p) => ({ ...p, likedBy: [...p.likedBy] })),
  content: seedContent.map((c) => ({ ...c, doneBy: [...c.doneBy] })),
  meals: seedMeals.map((m) => ({ ...m, ingredients: [...m.ingredients], steps: [...m.steps] })),
  pointsBalance: seedPointsBalance,
  pointsLedger: seedPointsLedger.map((e) => ({ ...e })),
  products: seedProducts.map((p) => ({ ...p })),
  orders: [],
  mealDeliveryInterest: false,
  subscriptions: seedSubscriptions.map((s) => ({ ...s })),
  dailyCheckIns: [],
  affirmations: [...seedAffirmations],
  currentUserId: seedYou.id,
  activeRole: 'member',
  signedIn: false,
  booking: seedBooking,
  prepTasks: seedPrepTasks.map((t) => ({ ...t, done: false })),
  taperTicks: [],
  demoDayOffset: 0,
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
