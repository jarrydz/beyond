import { createContext, useContext } from 'react';
import type {
  CheckIn,
  Cohort,
  ContentItem,
  DailyCheckInEntry,
  Goal,
  Meal,
  PointsLedgerEntry,
  Post,
  Profile,
  Subscription,
} from '@/types';
import { readOnboarded } from './onboardingStorage';
import {
  affirmations as seedAffirmations,
  checkIns as seedCheckIns,
  cohort as seedCohort,
  content as seedContent,
  goals as seedGoals,
  meals as seedMeals,
  pointsBalance as seedPointsBalance,
  pointsLedger as seedPointsLedger,
  posts as seedPosts,
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
  subscriptions: Subscription[];
  dailyCheckIns: DailyCheckInEntry[];
  affirmations: string[];
  currentUserId: string;
  // session-only — not modelled in the schema but needed by Phase 2's role switcher
  activeRole: 'member' | 'coach';
  signedIn: boolean;
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
  subscriptions: seedSubscriptions.map((s) => ({ ...s })),
  dailyCheckIns: [],
  affirmations: [...seedAffirmations],
  currentUserId: seedYou.id,
  activeRole: 'member',
  signedIn: false,
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
