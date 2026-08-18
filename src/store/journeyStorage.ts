/**
 * PRD-05 persistence — same pattern as onboardingStorage.ts. A countdown
 * that resets on refresh is worse than no countdown, and the in-memory
 * store resets every session, so: done prep tasks, taper ticks, the demo
 * clock offset, and the goal + why typed at T-21 all survive a refresh.
 */

const doneKey = (profileId: string) => `journey:done:${profileId}`;
const taperKey = (profileId: string) => `journey:taper:${profileId}`;
const offsetKey = 'journey:demoOffset';
const whyKey = (profileId: string) => `journey:goalWhy:${profileId}`;

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // localStorage can be unavailable in private modes
  }
}

export function readDoneTasks(profileId: string): string[] {
  return readList(doneKey(profileId));
}
export function writeDoneTasks(profileId: string, ids: string[]): void {
  writeList(doneKey(profileId), ids);
}

export function readTaperTicks(profileId: string): string[] {
  return readList(taperKey(profileId));
}
export function writeTaperTicks(profileId: string, ticks: string[]): void {
  writeList(taperKey(profileId), ticks);
}

export function readDemoOffset(): number {
  try {
    const n = Number(localStorage.getItem(offsetKey));
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
export function writeDemoOffset(offset: number): void {
  try {
    localStorage.setItem(offsetKey, String(offset));
  } catch {
    // localStorage can be unavailable in private modes
  }
}

export interface StoredGoalWhy {
  title: string;
  pillarId: string;
  why: string;
  /** PRD-06 focus provenance — Lucy's read must survive a refresh. */
  focusSetBy?: 'member' | 'coach';
  focusNote?: string;
  focusSetAt?: string;
}

export function readGoalWhy(profileId: string): StoredGoalWhy | null {
  try {
    const raw = localStorage.getItem(whyKey(profileId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.title === 'string' ? parsed : null;
  } catch {
    return null;
  }
}
export function writeGoalWhy(profileId: string, value: StoredGoalWhy): void {
  try {
    localStorage.setItem(whyKey(profileId), JSON.stringify(value));
  } catch {
    // localStorage can be unavailable in private modes
  }
}

const checkInsKey = (profileId: string) => `journey:checkIns:${profileId}`;
const contentDoneKey = (profileId: string) => `content:done:${profileId}`;
const plannerKey = (profileId: string) => `content:planner:${profileId}`;

/** Completed library items (PRD-07) — a finished practice must survive a refresh. */
export function readContentDone(profileId: string): string[] {
  return readList(contentDoneKey(profileId));
}
export function writeContentDone(profileId: string, ids: string[]): void {
  writeList(contentDoneKey(profileId), ids);
}

/** Week-planner commitments (PRD-07), keyed `${dayIndex}:${sessionKey}`. */
export function readPlannerTicks(profileId: string): string[] {
  return readList(plannerKey(profileId));
}
export function writePlannerTicks(profileId: string, ticks: string[]): void {
  writeList(plannerKey(profileId), ticks);
}

/**
 * Logged daily check-ins (PRD-06) — focus answers are worthless if they
 * vanish on reload. videoUrl is stripped before writing: an object URL is
 * dead in the next session anyway.
 */
export function readDailyCheckIns(profileId: string): unknown[] {
  try {
    const raw = localStorage.getItem(checkInsKey(profileId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function writeDailyCheckIns(
  profileId: string,
  entries: Array<Record<string, unknown>>,
): void {
  try {
    localStorage.setItem(
      checkInsKey(profileId),
      JSON.stringify(entries.map(({ videoUrl: _videoUrl, ...rest }) => rest)),
    );
  } catch {
    // localStorage can be unavailable in private modes
  }
}

/** Demo reset — wipe everything the journey persisted for this profile. */
export function clearJourney(profileId: string): void {
  try {
    localStorage.removeItem(doneKey(profileId));
    localStorage.removeItem(taperKey(profileId));
    localStorage.removeItem(whyKey(profileId));
    localStorage.removeItem(checkInsKey(profileId));
    localStorage.removeItem(contentDoneKey(profileId));
    localStorage.removeItem(plannerKey(profileId));
    localStorage.removeItem(offsetKey);
  } catch {
    // localStorage can be unavailable in private modes
  }
}
