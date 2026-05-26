export type Role = 'member' | 'coach';

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

export type ContentType = 'recipe' | 'movement' | 'affirmation' | 'event';

export interface ContentItem {
  id: string;
  type: ContentType;
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
