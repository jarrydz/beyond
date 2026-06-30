export type Role = 'member' | 'coach';

/**
 * The Five Pillars — the WHAT members work on, delivered by the Three Enablers
 * (Coach, Community, Platform). Key off this stable id, never the display label.
 * Source of truth for copy/accent/order: src/config/pillars.ts.
 */
export type PillarId =
  | 'nourishment'
  | 'movement'
  | 'emotional'
  | 'sleep'
  | 'toxic_load';

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
  weekOf: string;
  doneBy: string[];
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
}
