import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getBrowserId,
  hasSubmittedThisWeek,
  markAsSubmitted,
  getStoredSubmission,
  clearSubmission,
  clearExpiredSubmissions,
  getAllSubmissionWeekIds,
  normalizeUserName,
} from '@/lib/utils/storage';
import { STORAGE_KEYS } from '@/lib/constants/config';
import { installMockLocalStorage, MockLocalStorage } from '../../mocks/storage';

describe('Browser Storage Utility', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = installMockLocalStorage();
    mockStorage.clear();
  });

  describe('getBrowserId', () => {
    it('should generate a new ID when none exists', () => {
      const id = getBrowserId();
      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should return the same ID on subsequent calls', () => {
      const id1 = getBrowserId();
      const id2 = getBrowserId();
      expect(id1).toBe(id2);
    });

    it('should persist ID across "sessions" (stored in localStorage)', () => {
      const id1 = getBrowserId();
      // Verify it was stored
      const storedId = mockStorage.getItem(STORAGE_KEYS.BROWSER_ID);
      expect(storedId).toBe(id1);
    });

    it('should use existing ID from localStorage', () => {
      const existingId = 'existing-browser-id-123';
      mockStorage.setItem(STORAGE_KEYS.BROWSER_ID, existingId);

      const id = getBrowserId();
      expect(id).toBe(existingId);
    });
  });

  describe('hasSubmittedThisWeek', () => {
    it('should return false when no submission exists', () => {
      expect(hasSubmittedThisWeek('2025-W04')).toBe(false);
    });

    it('should return true when submission exists', () => {
      markAsSubmitted('2025-W04', 'everything');
      expect(hasSubmittedThisWeek('2025-W04')).toBe(true);
    });

    it('should return false for different week', () => {
      markAsSubmitted('2025-W04', 'everything');
      expect(hasSubmittedThisWeek('2025-W05')).toBe(false);
    });
  });

  describe('markAsSubmitted', () => {
    it('should store submission record', () => {
      const result = markAsSubmitted('2025-W04', 'plain');
      expect(result).toBe(true);
      expect(hasSubmittedThisWeek('2025-W04')).toBe(true);
    });

    it('should store custom bagel type', () => {
      markAsSubmitted('2025-W04', 'other', 'Jalapeño Cheddar');

      const stored = getStoredSubmission('2025-W04');
      expect(stored?.bagelType).toBe('other');
      expect(stored?.customBagel).toBe('Jalapeño Cheddar');
    });

    it('should include timestamp', () => {
      const before = new Date().toISOString();
      markAsSubmitted('2025-W04', 'sesame');
      const after = new Date().toISOString();

      const stored = getStoredSubmission('2025-W04');
      expect(stored?.submittedAt).toBeDefined();
      expect(stored!.submittedAt >= before).toBe(true);
      expect(stored!.submittedAt <= after).toBe(true);
    });
  });

  describe('getStoredSubmission', () => {
    it('should return null when no submission exists', () => {
      expect(getStoredSubmission('2025-W04')).toBeNull();
    });

    it('should return submission record when exists', () => {
      markAsSubmitted('2025-W04', 'everything');

      const stored = getStoredSubmission('2025-W04');
      expect(stored).not.toBeNull();
      expect(stored?.weekId).toBe('2025-W04');
      expect(stored?.bagelType).toBe('everything');
    });

    it('should handle corrupted JSON data', () => {
      // Manually store invalid JSON
      const key = `${STORAGE_KEYS.SUBMISSION_PREFIX}2025-W04`;
      mockStorage.setItem(key, 'invalid json {{{');

      const stored = getStoredSubmission('2025-W04');
      expect(stored).toBeNull();

      // Should have cleaned up the corrupted data
      expect(mockStorage.getItem(key)).toBeNull();
    });

    it('should handle missing required fields', () => {
      // Store incomplete data
      const key = `${STORAGE_KEYS.SUBMISSION_PREFIX}2025-W04`;
      mockStorage.setItem(key, JSON.stringify({ weekId: '2025-W04' })); // missing bagelType, submittedAt

      const stored = getStoredSubmission('2025-W04');
      expect(stored).toBeNull();
    });
  });

  describe('clearSubmission', () => {
    it('should remove submission for specific week', () => {
      markAsSubmitted('2025-W04', 'plain');
      expect(hasSubmittedThisWeek('2025-W04')).toBe(true);

      clearSubmission('2025-W04');
      expect(hasSubmittedThisWeek('2025-W04')).toBe(false);
    });

    it('should not affect other weeks', () => {
      markAsSubmitted('2025-W04', 'plain');
      markAsSubmitted('2025-W05', 'everything');

      clearSubmission('2025-W04');

      expect(hasSubmittedThisWeek('2025-W04')).toBe(false);
      expect(hasSubmittedThisWeek('2025-W05')).toBe(true);
    });
  });

  describe('clearExpiredSubmissions', () => {
    it('should clear submissions from previous weeks', () => {
      markAsSubmitted('2025-W01', 'plain');
      markAsSubmitted('2025-W02', 'everything');
      markAsSubmitted('2025-W03', 'sesame');
      markAsSubmitted('2025-W04', 'onion'); // Current week

      const clearedCount = clearExpiredSubmissions('2025-W04');

      expect(clearedCount).toBe(3);
      expect(hasSubmittedThisWeek('2025-W01')).toBe(false);
      expect(hasSubmittedThisWeek('2025-W02')).toBe(false);
      expect(hasSubmittedThisWeek('2025-W03')).toBe(false);
      expect(hasSubmittedThisWeek('2025-W04')).toBe(true); // Preserved
    });

    it('should not clear current week submission', () => {
      markAsSubmitted('2025-W04', 'plain');

      const clearedCount = clearExpiredSubmissions('2025-W04');

      expect(clearedCount).toBe(0);
      expect(hasSubmittedThisWeek('2025-W04')).toBe(true);
    });

    it('should not affect browser ID', () => {
      const browserId = getBrowserId();
      markAsSubmitted('2025-W01', 'plain');

      clearExpiredSubmissions('2025-W04');

      expect(mockStorage.getItem(STORAGE_KEYS.BROWSER_ID)).toBe(browserId);
    });
  });

  describe('getAllSubmissionWeekIds', () => {
    it('should return empty array when no submissions', () => {
      expect(getAllSubmissionWeekIds()).toEqual([]);
    });

    it('should return all submission week IDs', () => {
      markAsSubmitted('2025-W01', 'plain');
      markAsSubmitted('2025-W02', 'everything');
      markAsSubmitted('2025-W03', 'sesame');

      const weekIds = getAllSubmissionWeekIds();

      expect(weekIds).toHaveLength(3);
      expect(weekIds).toContain('2025-W01');
      expect(weekIds).toContain('2025-W02');
      expect(weekIds).toContain('2025-W03');
    });

    it('should not include browser ID in results', () => {
      getBrowserId();
      markAsSubmitted('2025-W04', 'plain');

      const weekIds = getAllSubmissionWeekIds();

      expect(weekIds).toHaveLength(1);
      expect(weekIds).toContain('2025-W04');
    });
  });

  describe('normalizeUserName', () => {
    it('should trim whitespace', () => {
      expect(normalizeUserName('  John D  ')).toBe('John D');
    });

    it('should capitalize first letter of each part', () => {
      expect(normalizeUserName('john d')).toBe('John D');
      expect(normalizeUserName('JANE S')).toBe('Jane S');
    });

    it('should remove trailing periods', () => {
      expect(normalizeUserName('John D.')).toBe('John D');
      expect(normalizeUserName('Jane S...')).toBe('Jane S');
    });

    it('should handle multiple spaces between parts', () => {
      expect(normalizeUserName('John    D')).toBe('John D');
    });

    it('should handle mixed case with trailing period', () => {
      expect(normalizeUserName('  JOHN d.  ')).toBe('John D');
    });

    it('should handle single name', () => {
      expect(normalizeUserName('john')).toBe('John');
    });

    it('should handle empty string', () => {
      expect(normalizeUserName('')).toBe('');
    });
  });
});
