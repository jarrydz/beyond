// Phase 1: backed by the in-memory store. Phase 2: swap body for Supabase.
// Screens import only this module — never the store directly.

import type {
  CheckIn,
  ContentItem,
  DailyCheckInEntry,
  Goal,
  Post,
  Profile,
  RecordCheckInInput,
  Role,
  Subscription,
} from '@/types';
import { MemoryStore } from '@/store/memoryStore';

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2, 10)}`;

export function createDataService(store: MemoryStore) {
  return {
    // identity & session
    getCurrentUser(): Profile {
      const s = store.get();
      const p = s.profiles.find((p) => p.id === s.currentUserId);
      if (!p) throw new Error('current user not found in store');
      return p;
    },
    setCurrentUser(profileId: string): void {
      store.set((s) => ({ ...s, currentUserId: profileId }));
    },
    setActiveRole(role: Role): void {
      store.set((s) => ({ ...s, activeRole: role }));
    },
    isSignedIn(): boolean {
      return store.get().signedIn;
    },
    signIn(role: Role): void {
      // Phase 1: any PIN works, role picks which seeded profile we sign in as.
      store.set((s) => {
        const userId =
          role === 'coach'
            ? s.profiles.find((p) => p.role === 'coach')?.id ?? s.currentUserId
            : s.profiles.find((p) => p.id === 'member-jarryd')?.id ?? s.currentUserId;
        const alreadySubbed = s.subscriptions.some((x) => x.profileId === userId);
        return {
          ...s,
          signedIn: true,
          activeRole: role,
          currentUserId: userId,
          subscriptions: alreadySubbed
            ? s.subscriptions
            : [...s.subscriptions, { profileId: userId, plan: 'monthly', status: 'mock' as const, startedAt: new Date().toISOString() }],
        };
      });
    },
    signOut(): void {
      store.set((s) => ({ ...s, signedIn: false }));
    },
    switchRole(role: Role): void {
      // Live demo switcher — flip role + active profile without re-signing in.
      store.set((s) => {
        const userId =
          role === 'coach'
            ? s.profiles.find((p) => p.role === 'coach')?.id ?? s.currentUserId
            : s.profiles.find((p) => p.id === 'member-jarryd')?.id ?? s.currentUserId;
        return { ...s, activeRole: role, currentUserId: userId };
      });
    },
    setOnboarded(profileId: string): void {
      store.set((s) => ({
        ...s,
        profiles: s.profiles.map((p) =>
          p.id === profileId ? { ...p, onboarded: true } : p,
        ),
      }));
    },

    // cohort feed
    getCohortFeed(): Post[] {
      const s = store.get();
      return [...s.posts]
        .filter((p) => p.cohortId === s.cohort.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    addPost(body: string): Post {
      const text = body.trim();
      if (!text) throw new Error('post body required');
      const s = store.get();
      const post: Post = {
        id: uid(),
        authorId: s.currentUserId,
        cohortId: s.cohort.id,
        body: text,
        createdAt: new Date().toISOString(),
        likedBy: [],
      };
      store.set((s) => ({ ...s, posts: [post, ...s.posts] }));
      return post;
    },
    toggleLike(postId: string): void {
      store.set((s) => {
        const me = s.currentUserId;
        return {
          ...s,
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const liked = p.likedBy.includes(me);
            return {
              ...p,
              likedBy: liked ? p.likedBy.filter((id) => id !== me) : [...p.likedBy, me],
            };
          }),
        };
      });
    },

    // check-ins
    getCheckIns(memberId: string): CheckIn[] {
      return store
        .get()
        .checkIns.filter((c) => c.memberId === memberId)
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    },
    bookCheckIn(slot: Date): CheckIn {
      const s = store.get();
      const coach = s.profiles.find((p) => p.role === 'coach');
      if (!coach) throw new Error('no coach in cohort');
      const ci: CheckIn = {
        id: uid(),
        memberId: s.currentUserId,
        leaderId: coach.id,
        scheduledAt: slot.toISOString(),
        status: 'upcoming',
      };
      store.set((s) => ({ ...s, checkIns: [...s.checkIns, ci] }));
      return ci;
    },
    recordCheckIn(input: RecordCheckInInput): CheckIn {
      const s = store.get();
      const coach = s.profiles.find((p) => p.role === 'coach');
      if (!coach) throw new Error('no coach in cohort');
      const ci: CheckIn = {
        id: uid(),
        memberId: input.memberId,
        leaderId: coach.id,
        scheduledAt: new Date().toISOString(),
        status: 'completed',
        goalScore: input.goalScore,
        topBlocker: input.topBlocker,
        commitment: input.commitment,
        notes: input.notes,
      };
      store.set((s) => ({ ...s, checkIns: [...s.checkIns, ci] }));
      return ci;
    },

    // goals
    getGoals(memberId: string): Goal[] {
      return store.get().goals.filter((g) => g.profileId === memberId);
    },
    setActiveGoal(profileId: string, title: string, target?: string): Goal {
      const goal: Goal = {
        id: uid(),
        profileId,
        title,
        target,
        active: true,
        createdAt: new Date().toISOString(),
      };
      store.set((s) => ({
        ...s,
        goals: [
          ...s.goals.map((g) =>
            g.profileId === profileId ? { ...g, active: false } : g,
          ),
          goal,
        ],
      }));
      return goal;
    },

    // content
    getContentForWeek(): ContentItem[] {
      // Phase 1: there's only one week of seeded content.
      return store.get().content;
    },
    markContentDone(contentId: string): void {
      store.set((s) => {
        const me = s.currentUserId;
        return {
          ...s,
          content: s.content.map((c) =>
            c.id === contentId && !c.doneBy.includes(me)
              ? { ...c, doneBy: [...c.doneBy, me] }
              : c,
          ),
        };
      });
    },

    // members (coach side)
    getMembers(): Profile[] {
      const s = store.get();
      return s.profiles.filter((p) => p.role === 'member' && p.cohortId === s.cohort.id);
    },
    getProfile(id: string): Profile | undefined {
      return store.get().profiles.find((p) => p.id === id);
    },
    getCoach(): Profile {
      const s = store.get();
      const c = s.profiles.find((p) => p.role === 'coach' && p.cohortId === s.cohort.id);
      if (!c) throw new Error('no coach for cohort');
      return c;
    },

    // subscription
    getSubscription(): Subscription | undefined {
      const s = store.get();
      return s.subscriptions.find((x) => x.profileId === s.currentUserId);
    },
    startMockSubscription(): Subscription {
      const s = store.get();
      const sub: Subscription = {
        profileId: s.currentUserId,
        plan: 'monthly',
        status: 'mock',
        startedAt: new Date().toISOString(),
      };
      store.set((s) => ({
        ...s,
        subscriptions: [
          ...s.subscriptions.filter((x) => x.profileId !== sub.profileId),
          sub,
        ],
      }));
      return sub;
    },

    // daily check-ins (selfie video)
    getDailyCheckIns(): DailyCheckInEntry[] {
      const s = store.get();
      return s.dailyCheckIns.filter((d) => d.memberId === s.currentUserId);
    },
    addDailyCheckIn(videoUrl?: string): DailyCheckInEntry {
      const s = store.get();
      const entry: DailyCheckInEntry = {
        id: uid(),
        memberId: s.currentUserId,
        recordedAt: new Date().toISOString(),
        videoUrl,
      };
      store.set((s) => ({
        ...s,
        dailyCheckIns: [...s.dailyCheckIns, entry],
      }));
      return entry;
    },

    // affirmations (small thing, but it's seeded data)
    getAffirmations(): string[] {
      return store.get().affirmations;
    },
  };
}

export type DataService = ReturnType<typeof createDataService>;
