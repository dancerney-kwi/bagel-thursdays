import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentCycleState,
  getNextCutoffTime,
  getNextResetTime,
  getCountdownValues,
  isBeforeCutoff,
  getCurrentWeekId,
  formatCountdown,
} from '@/lib/utils/dates';

describe('Date/Time Utilities', () => {
  describe('getCurrentCycleState', () => {
    it('should return "collecting" on Monday', () => {
      // Monday, January 27, 2025 at 10:00 AM EST
      const monday = new Date('2025-01-27T15:00:00.000Z'); // 10 AM EST
      expect(getCurrentCycleState(monday)).toBe('collecting');
    });

    it('should return "collecting" on Tuesday', () => {
      // Tuesday
      const tuesday = new Date('2025-01-28T15:00:00.000Z');
      expect(getCurrentCycleState(tuesday)).toBe('collecting');
    });

    it('should return "collecting" on Wednesday morning', () => {
      // Wednesday at 10:00 AM EST
      const wednesdayMorning = new Date('2025-01-29T15:00:00.000Z'); // 10 AM EST
      expect(getCurrentCycleState(wednesdayMorning)).toBe('collecting');
    });

    it('should return "closed" on Wednesday afternoon', () => {
      // Wednesday at 2:00 PM EST (after noon cutoff)
      const wednesdayAfternoon = new Date('2025-01-29T19:00:00.000Z'); // 2 PM EST
      expect(getCurrentCycleState(wednesdayAfternoon)).toBe('closed');
    });

    it('should return "closed" on Thursday', () => {
      // Thursday at 10:00 AM EST
      const thursday = new Date('2025-01-30T15:00:00.000Z'); // 10 AM EST
      expect(getCurrentCycleState(thursday)).toBe('closed');
    });

    it('should return "collecting" on Friday', () => {
      // Friday at 10:00 AM EST
      const friday = new Date('2025-01-31T15:00:00.000Z'); // 10 AM EST
      expect(getCurrentCycleState(friday)).toBe('collecting');
    });

    it('should return "collecting" on Saturday', () => {
      // Saturday
      const saturday = new Date('2025-02-01T15:00:00.000Z');
      expect(getCurrentCycleState(saturday)).toBe('collecting');
    });

    it('should return "collecting" on Sunday', () => {
      // Sunday
      const sunday = new Date('2025-02-02T15:00:00.000Z');
      expect(getCurrentCycleState(sunday)).toBe('collecting');
    });
  });

  describe('isBeforeCutoff', () => {
    it('should return true on Monday', () => {
      const monday = new Date('2025-01-27T15:00:00.000Z');
      expect(isBeforeCutoff(monday)).toBe(true);
    });

    it('should return true on Wednesday at 11:59 AM EST', () => {
      // Wednesday at 11:59 AM EST (1 minute before cutoff)
      const beforeCutoff = new Date('2025-01-29T16:59:00.000Z');
      expect(isBeforeCutoff(beforeCutoff)).toBe(true);
    });

    it('should return false on Wednesday at 12:00 PM EST', () => {
      // Wednesday at 12:00 PM EST (exactly at cutoff)
      const atCutoff = new Date('2025-01-29T17:00:00.000Z');
      expect(isBeforeCutoff(atCutoff)).toBe(false);
    });

    it('should return false on Wednesday at 12:01 PM EST', () => {
      // Wednesday at 12:01 PM EST (after cutoff)
      const afterCutoff = new Date('2025-01-29T17:01:00.000Z');
      expect(isBeforeCutoff(afterCutoff)).toBe(false);
    });

    it('should return false on Thursday', () => {
      const thursday = new Date('2025-01-30T15:00:00.000Z');
      expect(isBeforeCutoff(thursday)).toBe(false);
    });

    it('should return true on Friday (new cycle)', () => {
      const friday = new Date('2025-01-31T15:00:00.000Z');
      expect(isBeforeCutoff(friday)).toBe(true);
    });
  });

  describe('getNextCutoffTime', () => {
    it('should return next Wednesday noon from Monday', () => {
      const monday = new Date('2025-01-27T15:00:00.000Z'); // Monday 10 AM EST
      const cutoff = getNextCutoffTime(monday);

      // Should be Wednesday Jan 29 at 12:00 PM EST (5:00 PM UTC)
      expect(cutoff.getUTCDay()).toBe(3); // Wednesday
      expect(cutoff.getUTCHours()).toBe(17); // 12 PM EST = 5 PM UTC
    });

    it('should return next week Wednesday from Thursday', () => {
      const thursday = new Date('2025-01-30T15:00:00.000Z');
      const cutoff = getNextCutoffTime(thursday);

      // Should be next Wednesday Feb 5
      expect(cutoff.getUTCDay()).toBe(3);
      expect(cutoff > thursday).toBe(true);
    });
  });

  describe('getNextResetTime', () => {
    it('should return next Friday midnight from Monday', () => {
      const monday = new Date('2025-01-27T15:00:00.000Z');
      const reset = getNextResetTime(monday);

      // Should be Friday Jan 31 at 12:00 AM EST (5:00 AM UTC)
      expect(reset.getUTCDay()).toBe(5); // Friday
      expect(reset.getUTCHours()).toBe(5); // 12 AM EST = 5 AM UTC
    });

    it('should return next week Friday from Saturday', () => {
      const saturday = new Date('2025-02-01T15:00:00.000Z');
      const reset = getNextResetTime(saturday);

      // Should be next Friday Feb 7
      expect(reset.getUTCDay()).toBe(5);
      expect(reset > saturday).toBe(true);
    });
  });

  describe('getCountdownValues', () => {
    it('should calculate correct countdown for 1 day', () => {
      const now = new Date('2025-01-27T12:00:00.000Z');
      const target = new Date('2025-01-28T12:00:00.000Z');

      const countdown = getCountdownValues(target, now);

      expect(countdown.days).toBe(1);
      expect(countdown.hours).toBe(0);
      expect(countdown.minutes).toBe(0);
      expect(countdown.seconds).toBe(0);
    });

    it('should calculate correct countdown for hours, minutes, seconds', () => {
      const now = new Date('2025-01-27T12:00:00.000Z');
      const target = new Date('2025-01-27T15:30:45.000Z'); // 3 hours, 30 min, 45 sec later

      const countdown = getCountdownValues(target, now);

      expect(countdown.days).toBe(0);
      expect(countdown.hours).toBe(3);
      expect(countdown.minutes).toBe(30);
      expect(countdown.seconds).toBe(45);
    });

    it('should return zeros when target is in the past', () => {
      const now = new Date('2025-01-28T12:00:00.000Z');
      const target = new Date('2025-01-27T12:00:00.000Z'); // 1 day ago

      const countdown = getCountdownValues(target, now);

      expect(countdown.days).toBe(0);
      expect(countdown.hours).toBe(0);
      expect(countdown.minutes).toBe(0);
      expect(countdown.seconds).toBe(0);
    });

    it('should handle multi-day countdown', () => {
      const now = new Date('2025-01-27T12:00:00.000Z');
      const target = new Date('2025-01-30T18:30:00.000Z'); // 3 days, 6 hours, 30 min later

      const countdown = getCountdownValues(target, now);

      expect(countdown.days).toBe(3);
      expect(countdown.hours).toBe(6);
      expect(countdown.minutes).toBe(30);
      expect(countdown.seconds).toBe(0);
    });
  });

  describe('getCurrentWeekId', () => {
    it('should return week identifier in correct format', () => {
      const date = new Date('2025-01-27T15:00:00.000Z');
      const weekId = getCurrentWeekId(date);

      expect(weekId).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('should return same week ID for dates in same bagel week (Friday-Thursday)', () => {
      // Bagel week runs Friday 12AM to Thursday 11:59PM
      // Friday Jan 31, 2025 starts a new bagel week
      const friday = new Date('2025-01-31T15:00:00.000Z');
      const saturday = new Date('2025-02-01T15:00:00.000Z');
      const monday = new Date('2025-02-03T15:00:00.000Z');
      const thursday = new Date('2025-02-06T15:00:00.000Z');

      // All should be in the same bagel week (started Friday Jan 31)
      expect(getCurrentWeekId(friday)).toBe(getCurrentWeekId(saturday));
      expect(getCurrentWeekId(friday)).toBe(getCurrentWeekId(monday));
      expect(getCurrentWeekId(friday)).toBe(getCurrentWeekId(thursday));
    });

    it('should return different week ID when bagel week changes on Friday', () => {
      // Thursday Jan 30 is in previous week, Friday Jan 31 starts new week
      const thursdayPrevWeek = new Date('2025-01-30T15:00:00.000Z');
      const fridayNewWeek = new Date('2025-01-31T15:00:00.000Z');

      expect(getCurrentWeekId(thursdayPrevWeek)).not.toBe(getCurrentWeekId(fridayNewWeek));
    });
  });

  describe('formatCountdown', () => {
    it('should format countdown with padding', () => {
      const values = { days: 1, hours: 2, minutes: 3, seconds: 4 };
      expect(formatCountdown(values)).toBe('01 : 02 : 03 : 04');
    });

    it('should format countdown with double digits', () => {
      const values = { days: 10, hours: 23, minutes: 59, seconds: 59 };
      expect(formatCountdown(values)).toBe('10 : 23 : 59 : 59');
    });

    it('should format zeros correctly', () => {
      const values = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      expect(formatCountdown(values)).toBe('00 : 00 : 00 : 00');
    });
  });
});
