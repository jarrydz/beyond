import { createContext, useContext } from 'react';
import type {
  CheckIn,
  Cohort,
  ContentItem,
  Goal,
  Post,
  Profile,
  Subscription,
} from '@/types';
import {
  affirmations as seedAffirmations,
  checkIns as seedCheckIns,
  cohort as seedCohort,
  content as seedContent,
  goals as seedGoals,
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
  subscriptions: Subscription[];
  affirmations: string[];
  currentUserId: string;
  // session-only — not modelled in the schema but needed by Phase 2's role switcher
  activeRole: 'member' | 'coach';
  signedIn: boolean;
}

export const initialState = (): StoreState => ({
  cohort: seedCohort,
  profiles: seedProfiles.map((p) => ({ ...p })),
  goals: seedGoals.map((g) => ({ ...g })),
  checkIns: seedCheckIns.map((c) => ({ ...c })),
  posts: seedPosts.map((p) => ({ ...p, likedBy: [...p.likedBy] })),
  content: seedContent.map((c) => ({ ...c, doneBy: [...c.doneBy] })),
  subscriptions: seedSubscriptions.map((s) => ({ ...s })),
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
