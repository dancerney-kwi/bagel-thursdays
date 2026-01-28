import { nanoid } from 'nanoid';
import { STORAGE_KEYS } from '@/lib/constants/config';
import type { BagelTypeId } from '@/lib/types';

const { BROWSER_ID, SUBMISSION_PREFIX, USER_NAME } = STORAGE_KEYS;

// Stored submission record
export interface StoredSubmission {
  weekId: string;
  bagelType: BagelTypeId;
  customBagel?: string;
  submittedAt: string; // ISO date string
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get an item from localStorage
 */
function safeGetItem(key: string): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely set an item in localStorage
 */
function safeSetItem(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // Quota exceeded or other error
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 */
function safeRemoveItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize a user name: trim whitespace and capitalize properly
 * e.g., "  john d  " -> "John D"
 */
export function normalizeUserName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get the stored user name
 */
export function getStoredUserName(): string | null {
  return safeGetItem(USER_NAME);
}

/**
 * Store the user name (persists across sessions)
 */
export function setStoredUserName(name: string): boolean {
  const normalized = normalizeUserName(name);
  return safeSetItem(USER_NAME, normalized);
}

/**
 * Clear the stored user name
 */
export function clearStoredUserName(): boolean {
  return safeRemoveItem(USER_NAME);
}

/**
 * Get or generate a unique browser identifier
 * This ID persists across sessions to identify the same browser/device
 */
export function getBrowserId(): string {
  const storedId = safeGetItem(BROWSER_ID);

  if (storedId) {
    return storedId;
  }

  // Generate a new ID (21 characters by default)
  const newId = nanoid();
  safeSetItem(BROWSER_ID, newId);

  return newId;
}

/**
 * Get the storage key for a specific week's submission
 */
function getSubmissionKey(weekId: string): string {
  return `${SUBMISSION_PREFIX}${weekId}`;
}

/**
 * Check if user has submitted for a specific week
 */
export function hasSubmittedThisWeek(weekId: string): boolean {
  const key = getSubmissionKey(weekId);
  const stored = safeGetItem(key);
  return stored !== null;
}

/**
 * Get the stored submission for a specific week
 */
export function getStoredSubmission(weekId: string): StoredSubmission | null {
  const key = getSubmissionKey(weekId);
  const stored = safeGetItem(key);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as StoredSubmission;

    // Validate the parsed data has required fields
    if (!parsed.weekId || !parsed.bagelType || !parsed.submittedAt) {
      // Corrupted data, remove it
      safeRemoveItem(key);
      return null;
    }

    return parsed;
  } catch {
    // Invalid JSON, remove corrupted data
    safeRemoveItem(key);
    return null;
  }
}

/**
 * Mark user as having submitted for a specific week
 */
export function markAsSubmitted(
  weekId: string,
  bagelType: BagelTypeId,
  customBagel?: string
): boolean {
  const key = getSubmissionKey(weekId);
  const submission: StoredSubmission = {
    weekId,
    bagelType,
    customBagel,
    submittedAt: new Date().toISOString(),
  };

  return safeSetItem(key, JSON.stringify(submission));
}

/**
 * Clear submission record for a specific week
 */
export function clearSubmission(weekId: string): boolean {
  const key = getSubmissionKey(weekId);
  return safeRemoveItem(key);
}

/**
 * Clear all expired submissions (from previous weeks)
 * Keeps only the current week's submission
 */
export function clearExpiredSubmissions(currentWeekId: string): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  let clearedCount = 0;

  try {
    const keysToRemove: string[] = [];

    // Find all submission keys that don't match current week
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(SUBMISSION_PREFIX)) {
        const weekId = key.replace(SUBMISSION_PREFIX, '');
        if (weekId !== currentWeekId) {
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired submissions
    for (const key of keysToRemove) {
      if (safeRemoveItem(key)) {
        clearedCount++;
      }
    }
  } catch {
    // Ignore errors during cleanup
  }

  return clearedCount;
}

/**
 * Get all stored submission week IDs
 */
export function getAllSubmissionWeekIds(): string[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  const weekIds: string[] = [];

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(SUBMISSION_PREFIX)) {
        const weekId = key.replace(SUBMISSION_PREFIX, '');
        weekIds.push(weekId);
      }
    }
  } catch {
    // Ignore errors
  }

  return weekIds;
}
