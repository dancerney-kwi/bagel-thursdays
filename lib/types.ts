// Bagel type identifiers
export const BAGEL_TYPE_IDS = [
  'plain',
  'everything',
  'egg',
  'egg-everything',
  'sesame',
  'poppy-seed',
  'onion',
  'cinnamon-raisin',
  'pumpernickel',
  'other',
] as const;

export type BagelTypeId = (typeof BAGEL_TYPE_IDS)[number];

// Bagel type with display info
export interface BagelType {
  id: BagelTypeId;
  name: string;
  imageFile: string;
}

// Weekly cycle tracking
export interface WeeklyCycle {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  cutoffTime: Date;
  isActive: boolean;
  createdAt: Date;
}

// Bagel submission record
export interface BagelSubmission {
  id: string;
  cycleId: string;
  browserId: string;
  bagelType: BagelTypeId;
  customBagel?: string;
  submittedAt: Date;
}

// Spread request record
export interface SpreadRequest {
  id: string;
  cycleId: string;
  spreadName: string;
  requesterBrowserId: string;
  createdAt: Date;
  upvoteCount?: number;
  userHasUpvoted?: boolean;
}

// Spread upvote record
export interface SpreadUpvote {
  id: string;
  spreadRequestId: string;
  browserId: string;
  createdAt: Date;
}

// Aggregated tally for display
export interface BagelTally {
  bagelType: BagelTypeId;
  bagelName: string;
  count: number;
}

// API response types
export interface TallyResponse {
  tallies: BagelTally[];
  total: number;
  cycleId: string;
}

export interface SubmitBagelRequest {
  browserId: string;
  bagelType: BagelTypeId;
  customBagel?: string;
}

export interface SubmitBagelResponse {
  success: boolean;
  submission: BagelSubmission;
}

export interface SpreadsResponse {
  spreads: SpreadRequest[];
}

export interface SubmitSpreadRequest {
  browserId: string;
  spreadName: string;
}

export interface UpvoteRequest {
  browserId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Cycle state for UI
export type CycleState = 'collecting' | 'closed' | 'reset-pending';

// Countdown values
export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
