// Phase 1: backed by the in-memory store. Phase 2: swap body for Supabase.
// Screens import only this module — never the store directly.

import type {
  Booking,
  CheckIn,
  ContentItem,
  DailyCheckInEntry,
  Goal,
  JourneyStage,
  Meal,
  Order,
  PillarId,
  PointsLedgerEntry,
  Post,
  PrepTask,
  Product,
  Profile,
  RecordCheckInInput,
  Role,
  Subscription,
} from '@/types';
import { MemoryStore } from '@/store/memoryStore';
import { clearOnboarded, writeOnboarded } from '@/store/onboardingStorage';
import {
  clearJourney,
  writeContentDone,
  writeDailyCheckIns,
  writeDemoOffset,
  writeDoneTasks,
  writeGoalWhy,
  writePlannerTicks,
  writeTaperTicks,
} from '@/store/journeyStorage';
import { daysUntil, stageFor, today } from '@/utils/journey';
import { prepTasks as prepTaskSeeds, type TaperSubstance } from '@/config/prepTasks';
import { goals as seedGoals, profiles as seedProfiles, seedCohortBookings, seedDailyHistory } from '@/store/seed';
import { FOCUS_INSIGHT } from '@/config/focusQuestions';
import type { GuestBooking } from '@/types';
import { ACTION_LABELS, AWARDS, STREAK, type EarnAction } from '@/config/points';

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2, 10)}`;

export function createDataService(store: MemoryStore) {
  /**
   * "Now" on the simulated clock: today(demoDayOffset)'s date with the real
   * time of day. Timestamps written with this stay consistent with what the
   * stage switcher shows — a check-in logged on a canonical day belongs to
   * that day, not to the real one.
   */
  const simNow = () => {
    const d = today(store.get().demoDayOffset);
    const real = new Date();
    d.setHours(real.getHours(), real.getMinutes(), real.getSeconds());
    return d.toISOString();
  };
  const sameSimDay = (iso: string) =>
    new Date(iso).toDateString() === today(store.get().demoDayOffset).toDateString();
  /** A member's true balance: the sum of their own ledger entries (D1/D2). */
  const memberBalance = (entries: PointsLedgerEntry[], memberId: string) =>
    entries.filter((e) => e.memberId === memberId).reduce((sum, e) => sum + e.points, 0);

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
        if (role === 'member') {
          clearOnboarded(userId);
        }
        return {
          ...s,
          signedIn: true,
          activeRole: role,
          currentUserId: userId,
          // Wallet context follows the member (D1/D2).
          pointsBalance: memberBalance(s.pointsLedger, userId),
          profiles:
            role === 'member'
              ? s.profiles.map((p) =>
                  p.id === userId ? { ...p, onboarded: false } : p,
                )
              : s.profiles,
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
      writeOnboarded(profileId);
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
      // The consult reviews the focus (PRD-06 decision 4): confirm or change,
      // same provenance either way. Review monthly, change rarely.
      if (input.focusPillarId) {
        this.setFocus(input.memberId, input.focusPillarId, 'coach', input.focusNote);
      }
      return ci;
    },

    // goals
    getGoals(memberId: string): Goal[] {
      return store.get().goals.filter((g) => g.profileId === memberId);
    },
    setActiveGoal(
      profileId: string,
      pillarId: PillarId,
      title: string,
      target?: string,
      why?: string,
    ): Goal {
      // Rewording a goal on the same pillar is not a new focus — the day
      // counter must survive a "Change", or the UI lies about progress.
      const prior = store
        .get()
        .goals.find((g) => g.profileId === profileId && g.active);
      const samePillar = prior?.pillarId === pillarId;
      const goal: Goal = {
        id: uid(),
        profileId,
        pillarId,
        title,
        target,
        why,
        // The member's own pick is a focus decision too — it starts the 60-day clock.
        focusSetBy: 'member',
        focusSetAt: samePillar ? prior?.focusSetAt ?? simNow() : simNow(),
        active: true,
        createdAt: new Date().toISOString(),
      };
      // The why is reintegration's payoff — it must survive a refresh.
      if (why)
        writeGoalWhy(profileId, {
          title,
          pillarId,
          why,
          focusSetBy: 'member',
          focusSetAt: goal.focusSetAt,
        });
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
        const mark = (c: ContentItem) =>
          c.id === contentId && !c.doneBy.includes(me)
            ? { ...c, doneBy: [...c.doneBy, me] }
            : c;
        const library = s.library.map(mark);
        // Library completion survives a refresh (PRD-07); weekly programming
        // stays session-scoped as it always has.
        writeContentDone(
          me,
          library.filter((c) => c.doneBy.includes(me)).map((c) => c.id),
        );
        return { ...s, content: s.content.map(mark), library };
      });
    },

    // ——— PRD-07: the content library ———
    getLibrary(): ContentItem[] {
      return store.get().library;
    },
    getLibraryItem(id: string): ContentItem | undefined {
      return store.get().library.find((c) => c.id === id);
    },
    /** Toggle one week-planner commitment. Persisted — a plan that vanishes isn't a plan. */
    setPlannerCell(dayIndex: number, sessionKey: string, on: boolean): void {
      const cell = `${dayIndex}:${sessionKey}`;
      store.set((s) => {
        const plannerTicks = on
          ? s.plannerTicks.includes(cell)
            ? s.plannerTicks
            : [...s.plannerTicks, cell]
          : s.plannerTicks.filter((t) => t !== cell);
        writePlannerTicks(s.currentUserId, plannerTicks);
        return { ...s, plannerTicks };
      });
    },

    // meals (retreat kitchen library)
    getMeals(): Meal[] {
      return store.get().meals;
    },
    getMeal(id: string): Meal | undefined {
      return store.get().meals.find((m) => m.id === id);
    },
    toggleSaveMeal(id: string): void {
      store.set((s) => ({
        ...s,
        meals: s.meals.map((m) => (m.id === id ? { ...m, saved: !m.saved } : m)),
      }));
    },

    // points wallet
    /**
     * Award points for a real wellbeing action. Values come from
     * config/points.ts only. Guarded so awards reinforce behaviour rather
     * than being farmable: one check-in award per calendar day, and
     * refId-carrying actions (save a specific recipe, complete a specific
     * session) pay once per thing. Returns what was earned for the toast,
     * or null when a guard swallowed it.
     */
    awardPoints(action: EarnAction, refId?: string): { points: number; label: string } | null {
      const s = store.get();
      if (action === 'daily_check_in') {
        // One award per SIMULATED day — the stage switcher moves this too.
        const already = s.pointsLedger.some(
          (e) =>
            e.memberId === s.currentUserId &&
            e.action === 'daily_check_in' &&
            sameSimDay(e.at),
        );
        if (already) return null;
      }
      if (refId && s.pointsLedger.some((e) => e.action === action && e.refId === refId)) {
        return null;
      }
      const entry = {
        id: uid(),
        memberId: s.currentUserId,
        action,
        points: AWARDS[action],
        at: simNow(),
        label: ACTION_LABELS[action],
        refId,
      };
      store.set((s) => ({
        ...s,
        pointsBalance: s.pointsBalance + entry.points,
        pointsLedger: [...s.pointsLedger, entry],
      }));

      // The single v1 milestone: pay the streak bonus exactly when the
      // consecutive-day run reaches the threshold — not again on day 4+.
      if (action === STREAK.action) {
        // The streak walk counts only THIS member's entries (D1/D2) — a
        // first-ever check-in must never inherit someone else's run.
        const days = new Set(
          store
            .get()
            .pointsLedger.filter(
              (e) => e.memberId === s.currentUserId && e.action === STREAK.action,
            )
            .map((e) => new Date(e.at).toDateString()),
        );
        let run = 0;
        const d = today(store.get().demoDayOffset);
        while (days.has(d.toDateString())) {
          run++;
          d.setDate(d.getDate() - 1);
        }
        if (run === STREAK.days) {
          const bonus = {
            id: uid(),
            memberId: s.currentUserId,
            action: STREAK.action,
            points: STREAK.bonus,
            at: simNow(),
            label: STREAK.label,
          };
          store.set((s) => ({
            ...s,
            pointsBalance: s.pointsBalance + bonus.points,
            pointsLedger: [...s.pointsLedger, bonus],
          }));
          return {
            points: entry.points + bonus.points,
            label: `${entry.label} + ${STREAK.label}`,
          };
        }
      }

      return { points: entry.points, label: entry.label };
    },
    /**
     * Spend from the wallet — the PRD-03 marketplace seam. Hard guard:
     * never a negative balance — insufficient funds no-ops and returns
     * false. Spends land in the ledger as negative entries so the history
     * stays a complete explanation of the balance.
     */
    spendPoints(n: number, label = ACTION_LABELS.marketplace_spend): boolean {
      if (!Number.isFinite(n) || n <= 0) return false;
      if (store.get().pointsBalance < n) return false;
      const entry = {
        id: uid(),
        action: 'marketplace_spend' as const,
        points: -n,
        at: new Date().toISOString(),
        label,
      };
      store.set((s) => ({
        ...s,
        pointsBalance: s.pointsBalance - n,
        pointsLedger: [...s.pointsLedger, entry],
      }));
      return true;
    },
    getPointsBalance(): number {
      return store.get().pointsBalance;
    },
    getPointsLedger(): PointsLedgerEntry[] {
      // Newest first, and only the current member's entries (D1/D2).
      const s = store.get();
      return s.pointsLedger
        .filter((e) => e.memberId === s.currentUserId)
        .sort((a, b) => b.at.localeCompare(a.at));
    },

    // marketplace (mock — nothing charges, nothing ships)
    getProducts(): Product[] {
      return store.get().products;
    },
    getProduct(id: string): Product | undefined {
      return store.get().products.find((p) => p.id === id);
    },
    getOrders(): Order[] {
      return [...store.get().orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
    },
    /**
     * Place a mock order. 'points' goes through the guarded spendPoints seam —
     * insufficient balance returns null and records nothing; the wallet can
     * never go negative from here.
     */
    placeOrder(productId: string, method: 'cash' | 'points'): Order | null {
      const product = store.get().products.find((p) => p.id === productId);
      if (!product) return null;
      if (method === 'points') {
        if (product.pointCost == null) return null;
        const ok = this.spendPoints(product.pointCost, `Redeemed: ${product.name}`);
        if (!ok) return null;
      }
      const order: Order = {
        id: uid(),
        productId,
        placedAt: new Date().toISOString(),
        method,
        status: 'placed',
      };
      store.set((s) => ({ ...s, orders: [...s.orders, order] }));
      return order;
    },

    // meal delivery (PRD-04 painted door — records intent, nothing ships)
    /**
     * Join the meal-delivery list. Idempotent: a no-op returning null once
     * registered, and the +5 rides the per-refId award guard, so un-join/
     * re-join farming is impossible even if the flag is ever reset.
     */
    registerMealDeliveryInterest(): { points: number; label: string } | null {
      if (store.get().mealDeliveryInterest) return null;
      store.set((s) => ({ ...s, mealDeliveryInterest: true }));
      return this.awardPoints('meal_delivery_interest', 'meal-delivery');
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
    addDailyCheckIn(
      input: {
        videoUrl?: string;
        mood?: number;
        note?: string;
        focusAnswers?: Record<string, number>;
      } = {},
    ): DailyCheckInEntry {
      const s = store.get();
      // Denormalise the focus pillar at logging time (PRD-06) — history must
      // stay true if the coach changes focus at a later consult.
      const activeGoal = s.goals.find((g) => g.profileId === s.currentUserId && g.active);
      const entry: DailyCheckInEntry = {
        id: uid(),
        memberId: s.currentUserId,
        recordedAt: simNow(),
        videoUrl: input.videoUrl,
        mood: input.mood,
        note: input.note,
        pillarId: activeGoal?.pillarId,
        focusAnswers: input.focusAnswers,
      };
      store.set((st) => {
        const dailyCheckIns = [...st.dailyCheckIns, entry];
        writeDailyCheckIns(
          st.currentUserId,
          dailyCheckIns.filter((d) => d.memberId === st.currentUserId) as unknown as Array<
            Record<string, unknown>
          >,
        );
        return { ...st, dailyCheckIns };
      });
      return entry;
    },

    // affirmations (small thing, but it's seeded data)
    getAffirmations(): string[] {
      return store.get().affirmations;
    },

    // ——— PRD-05: the retreat journey ———

    /** The current user's reservation, or null — the anchor stageFor derives from. */
    getBooking(): Booking | null {
      const s = store.get();
      return s.booking && s.booking.profileId === s.currentUserId ? s.booking : null;
    },
    /** Derived, never stored (decision 6). */
    getJourneyStage(): JourneyStage {
      const s = store.get();
      return stageFor(this.getBooking(), s.demoDayOffset);
    },
    getPrepTasks(): PrepTask[] {
      return store.get().prepTasks;
    },
    /**
     * The T-21 connect step. Validates the confirmation number + surname
     * against the seeded reservation (mock — no network). Success marks the
     * connect task done; failure returns null and changes nothing.
     */
    connectBooking(confirmationNumber: string, surname: string): Booking | null {
      const booking = this.getBooking();
      if (!booking) return null;
      const surnameOnFile = booking.guestName.trim().split(/\s+/).at(-1) ?? '';
      const ok =
        confirmationNumber.trim() === booking.confirmationNumber &&
        surname.trim().toLowerCase() === surnameOnFile.toLowerCase();
      if (!ok) return null;
      this.completePrepTask('prep-connect');
      return booking;
    },
    /** Mark a prep task done. No points before arrival (decision 5). */
    completePrepTask(taskId: string): void {
      store.set((s) => {
        const prepTasks = s.prepTasks.map((t) =>
          t.id === taskId ? { ...t, done: true } : t,
        );
        writeDoneTasks(
          s.currentUserId,
          prepTasks.filter((t) => t.done).map((t) => t.id),
        );
        return { ...s, prepTasks };
      });
    },
    /**
     * Tick/untick one cell of the 7×3 taper grid. The Step down task counts
     * as done once any cell is ticked on the CURRENT day — never only when
     * the whole grid is full, or it could never complete before arrival.
     */
    setTaperCell(daysBeforeArrival: number, substance: TaperSubstance, on: boolean): void {
      const cell = `${daysBeforeArrival}:${substance}`;
      store.set((s) => {
        const taperTicks = on
          ? s.taperTicks.includes(cell)
            ? s.taperTicks
            : [...s.taperTicks, cell]
          : s.taperTicks.filter((t) => t !== cell);
        writeTaperTicks(s.currentUserId, taperTicks);
        return { ...s, taperTicks };
      });
      const s = store.get();
      const booking = this.getBooking();
      if (!booking) return;
      const todayCell = daysUntil(booking.arrivalDate, s.demoDayOffset);
      const tickedToday = s.taperTicks.some((t) => t.startsWith(`${todayCell}:`));
      if (tickedToday && !s.prepTasks.find((t) => t.id === 'prep-taper')?.done) {
        this.completePrepTask('prep-taper');
      }
    },
    getTaperTicks(): string[] {
      return store.get().taperTicks;
    },
    /** Demo-only: move the simulated clock. The whole app recomputes from this. */
    setDemoDayOffset(offset: number): void {
      writeDemoOffset(offset);
      store.set((s) => ({ ...s, demoDayOffset: offset }));
    },
    // ——— PRD-06: focus ———

    /**
     * The second (and only other) setter of focus. Member proposes at T-21
     * via GoalWhyForm; the coach decides here — at departure or at the
     * monthly consult. Writes provenance; keeps the member's title and why.
     */
    setFocus(
      memberId: string,
      pillarId: PillarId,
      setBy: 'member' | 'coach',
      note?: string,
    ): void {
      const at = simNow();
      store.set((s) => ({
        ...s,
        goals: s.goals.map((g) =>
          g.profileId === memberId && g.active
            ? {
                ...g,
                pillarId,
                focusSetBy: setBy,
                focusNote: note?.trim() || undefined,
                focusSetAt: at,
              }
            : g,
        ),
      }));
      const goal = store.get().goals.find((g) => g.profileId === memberId && g.active);
      if (goal?.why || goal?.focusNote) {
        writeGoalWhy(memberId, {
          title: goal.title,
          pillarId: goal.pillarId,
          why: goal.why ?? '',
          focusSetBy: goal.focusSetBy,
          focusNote: goal.focusNote,
          focusSetAt: goal.focusSetAt,
        });
      }
    },
    /**
     * Check-in history for the current user on the simulated clock: the
     * seeded back-history (generated relative to today(offset) so every
     * canonical demo day has a true story) merged with real logged entries.
     */
    getFocusHistory(): DailyCheckInEntry[] {
      const s = store.get();
      const seeded =
        s.currentUserId === 'member-jarryd' ? seedDailyHistory(today(s.demoDayOffset)) : [];
      const real = s.dailyCheckIns.filter((d) => d.memberId === s.currentUserId);
      return [...seeded, ...real].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    },
    /** The real entry logged on the simulated today, if any — drives the Today card's state. */
    getTodayCheckIn(): DailyCheckInEntry | undefined {
      const s = store.get();
      return s.dailyCheckIns.find(
        (d) => d.memberId === s.currentUserId && sameSimDay(d.recordedAt),
      );
    },
    /** Deterministic guidance index: whole days since the epoch of the simulated today. */
    getFocusDayIndex(): number {
      return Math.floor(today(store.get().demoDayOffset).getTime() / 86_400_000);
    },
    /**
     * The one insight line (decision 6): descriptive only — counting and
     * ranging over the member's own log. Null below four entries in the
     * last fourteen days; nothing beats a thin claim. No causal language.
     */
    getFocusInsight(pillarId: PillarId): string | null {
      const s = store.get();
      const now = today(s.demoDayOffset).getTime();
      const cutoff = now - 13 * 86_400_000;
      const window = this.getFocusHistory().filter((d) => {
        const t = new Date(d.recordedAt).getTime();
        return d.pillarId === pillarId && t >= cutoff && t < now + 86_400_000;
      });
      if (window.length < 4) return null;
      const rule = FOCUS_INSIGHT[pillarId];
      const recent = window.slice(-7);
      const answered = recent.filter((d) => d.focusAnswers?.[rule.questionId] != null);
      const hits = answered.filter((d) =>
        rule.hit.includes(d.focusAnswers![rule.questionId]),
      ).length;
      if (answered.length >= 4 && hits >= 3) return rule.line(hits, answered.length);
      return `You've logged ${window.length} of the last fourteen days.`;
    },

    /**
     * The coach's working board (PRD-06): today's arrivals, this week's
     * departures, and the roll-up strip Gwinganna reads over her shoulder.
     * Everything is computed from booking + prep state — Lucy does nothing
     * extra to produce it; that is the design. The demo member is assembled
     * live from the store; the seeded cohort slides with the sim clock.
     */
    getCoachBoard(): {
      arrivingToday: GuestBooking[];
      departingSoon: Array<GuestBooking & { departsInDays: number }>;
      rollup: { arrivingNext7: number; readyPct: number; erfDone: number; tapersStarted: number };
    } {
      const s = store.get();
      const du = (iso: string) => daysUntil(iso, s.demoDayOffset);
      const guests = seedCohortBookings(today(s.demoDayOffset)).map((g) => {
        const set = s.guestFocus[g.booking.id];
        return set ? { ...g, goalPillarId: set.pillarId, focusSet: true } : g;
      });
      const all: GuestBooking[] = [...guests];
      const memberGoal = s.goals.find((g) => g.profileId === 'member-jarryd' && g.active);
      if (s.booking && memberGoal) {
        const required = s.prepTasks.filter((t) => t.required);
        all.push({
          booking: s.booking,
          goalPillarId: memberGoal.pillarId,
          goalTitle: memberGoal.title,
          goalWhy: memberGoal.why ?? '',
          requiredDone: required.filter((t) => t.done).length,
          requiredTotal: required.length,
          erfDone: s.prepTasks.some((t) => t.id === 'prep-reservation-form' && t.done),
          taperStarted: s.taperTicks.length > 0,
          focusSet: memberGoal.focusSetBy === 'coach',
        });
      }
      const arrivingToday = all.filter((g) => du(g.booking.arrivalDate) === 0);
      const departingSoon = all
        .filter((g) => du(g.booking.arrivalDate) < 0 && du(g.booking.departureDate) >= 0)
        .map((g) => ({ ...g, departsInDays: du(g.booking.departureDate) }))
        .sort((a, b) => a.departsInDays - b.departsInDays);
      const next7 = all.filter((g) => {
        const d = du(g.booking.arrivalDate);
        return d >= 0 && d <= 7;
      });
      const ready = next7.filter((g) => g.requiredDone === g.requiredTotal).length;
      return {
        arrivingToday,
        departingSoon,
        rollup: {
          arrivingNext7: next7.length,
          readyPct: next7.length ? Math.round((100 * ready) / next7.length) : 0,
          erfDone: next7.filter((g) => g.erfDone).length,
          tapersStarted: next7.filter((g) => g.taperStarted).length,
        },
      };
    },
    /**
     * The departure handoff. For the demo member this is the real thing —
     * provenance on the Goal, persisted, restated on day 1 home. For seeded
     * cohort guests it updates the session board only (set dressing).
     */
    setGuestFocus(bookingId: string, pillarId: PillarId, note?: string): void {
      const s = store.get();
      if (s.booking && s.booking.id === bookingId) {
        this.setFocus(s.booking.profileId, pillarId, 'coach', note);
        return;
      }
      store.set((st) => ({
        ...st,
        guestFocus: { ...st.guestFocus, [bookingId]: { pillarId, note } },
      }));
    },

    /**
     * Demo-only (2026-08-18): flip between the two demo personas — Andrew
     * (booked, the guest story) and Evelyn (alumna, no booking, the
     * subscriber story). A no-booking member replays onboarding on every
     * visit, mirroring the deliberate reset signIn() performs for Andrew.
     */
    demoSwitchMember(profileId: string): void {
      const s = store.get();
      if (s.currentUserId === profileId) return;
      const target = s.profiles.find((p) => p.id === profileId);
      if (!target || target.role !== 'member') return;
      const hasBooking = s.booking?.profileId === profileId;
      if (!hasBooking) clearOnboarded(profileId);
      store.set((st) => ({
        ...st,
        currentUserId: profileId,
        // Swap the wallet context with the member: the stored balance always
        // equals the current member's ledger sum, so spendPoints' guard stays
        // correct without its logic changing (D1/D2, scoped fix).
        pointsBalance: memberBalance(st.pointsLedger, profileId),
        profiles: hasBooking
          ? st.profiles
          : st.profiles.map((p) => (p.id === profileId ? { ...p, onboarded: false } : p)),
      }));
    },

    /**
     * Demo-only: wipe journey state for a clean run with the next viewer —
     * persistence survives refresh by design, so the switcher alone can
     * move time but never un-live it. Resets tasks, taper, the goal + why
     * and the clock (offset 0 = the T-7 default open).
     */
    resetJourneyDemo(): void {
      // A clean run for the next viewer means BOTH personas start clean,
      // whoever was signed in when reset was pressed (2026-08-18).
      for (const p of store.get().profiles) {
        if (p.role !== 'member') continue;
        clearJourney(p.id);
        clearOnboarded(p.id);
      }
      store.set((s) => ({
        ...s,
        currentUserId: 'member-jarryd',
        pointsBalance: memberBalance(s.pointsLedger, 'member-jarryd'),
        profiles: seedProfiles.map((p) => ({ ...p })),
        prepTasks: prepTaskSeeds.map((t) => ({ ...t, done: false })),
        taperTicks: [],
        demoDayOffset: 0,
        goals: seedGoals.map((g) => ({ ...g })),
        dailyCheckIns: [],
        guestFocus: {},
        plannerTicks: [],
        library: s.library.map((c) => ({ ...c, doneBy: [] })),
      }));
    },
  };
}

export type DataService = ReturnType<typeof createDataService>;
