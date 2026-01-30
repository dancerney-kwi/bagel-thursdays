import {
  addDays,
  differenceInSeconds,
  getDay,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  startOfWeek,
  format,
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { SCHEDULE } from '@/lib/constants/config';
import type { CycleState, CountdownValues } from '@/lib/types';

const { TIMEZONE, CUTOFF_DAY, CUTOFF_HOUR, CUTOFF_MINUTE, RESET_DAY, RESET_HOUR, RESET_MINUTE } =
  SCHEDULE;

/**
 * Get current time in EST/EDT timezone
 */
export function getNowInTimezone(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Create a date in EST/EDT timezone and convert to UTC
 */
function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  // Create the date as if in the target timezone, then convert to UTC
  const dateInTz = new Date(year, month, day, hour, minute, 0, 0);
  return fromZonedTime(dateInTz, TIMEZONE);
}

/**
 * Get the next occurrence of a specific day/time
 */
function getNextOccurrence(
  targetDay: number,
  targetHour: number,
  targetMinute: number,
  referenceDate: Date = new Date()
): Date {
  const nowInTz = toZonedTime(referenceDate, TIMEZONE);
  const currentDay = getDay(nowInTz);

  // Calculate days until target day
  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) {
    daysUntil += 7;
  }

  // Get the target date
  let targetDate = addDays(nowInTz, daysUntil);
  targetDate = setHours(targetDate, targetHour);
  targetDate = setMinutes(targetDate, targetMinute);
  targetDate = setSeconds(targetDate, 0);
  targetDate = setMilliseconds(targetDate, 0);

  // If target is today but time has passed, move to next week
  if (daysUntil === 0 && nowInTz >= targetDate) {
    targetDate = addDays(targetDate, 7);
  }

  // Convert back to UTC
  return fromZonedTime(targetDate, TIMEZONE);
}

/**
 * Get the next Wednesday 12:00 PM EST cutoff time
 */
export function getNextCutoffTime(referenceDate: Date = new Date()): Date {
  return getNextOccurrence(CUTOFF_DAY, CUTOFF_HOUR, CUTOFF_MINUTE, referenceDate);
}

/**
 * Get the next Friday 12:00 AM EST reset time
 */
export function getNextResetTime(referenceDate: Date = new Date()): Date {
  return getNextOccurrence(RESET_DAY, RESET_HOUR, RESET_MINUTE, referenceDate);
}

/**
 * Check if current time is before the cutoff (submissions allowed)
 */
export function isBeforeCutoff(referenceDate: Date = new Date()): boolean {
  const nowInTz = toZonedTime(referenceDate, TIMEZONE);
  const currentDay = getDay(nowInTz);
  const currentHour = nowInTz.getHours();
  const currentMinute = nowInTz.getMinutes();

  // Friday through Tuesday: before cutoff (collecting)
  if (currentDay === 5 || currentDay === 6 || currentDay === 0 || currentDay === 1 || currentDay === 2) {
    return true;
  }

  // Wednesday: before noon is collecting, after noon is closed
  if (currentDay === 3) {
    if (currentHour < CUTOFF_HOUR) {
      return true;
    }
    if (currentHour === CUTOFF_HOUR && currentMinute < CUTOFF_MINUTE) {
      return true;
    }
    return false;
  }

  // Thursday: after cutoff (closed)
  if (currentDay === 4) {
    return false;
  }

  return false;
}

/**
 * Get the current cycle state
 * - 'collecting': Friday 12AM - Wednesday 12PM (submissions open)
 * - 'closed': Wednesday 12PM - Thursday 11:59PM (submissions closed, waiting for delivery)
 * - 'reset-pending': N/A (reset happens instantly at Friday 12AM)
 */
export function getCurrentCycleState(referenceDate: Date = new Date()): CycleState {
  const nowInTz = toZonedTime(referenceDate, TIMEZONE);
  const currentDay = getDay(nowInTz);
  const currentHour = nowInTz.getHours();

  // Thursday: always closed (bagels arriving)
  if (currentDay === 4) {
    return 'closed';
  }

  // Wednesday after noon: closed
  if (currentDay === 3 && currentHour >= CUTOFF_HOUR) {
    return 'closed';
  }

  // All other times: collecting
  return 'collecting';
}

/**
 * Calculate countdown values from now to target date
 */
export function getCountdownValues(
  targetDate: Date,
  referenceDate: Date = new Date()
): CountdownValues {
  const totalSeconds = Math.max(0, differenceInSeconds(targetDate, referenceDate));

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

/**
 * Get the bagel cycle week identifier
 * Format: YYYY-MM-DD (the Friday that starts the week, e.g., "2026-01-30")
 *
 * The bagel week runs Friday 12AM EST to Thursday 11:59PM EST.
 * Using the Friday date as the ID eliminates week number ambiguity.
 *
 * Examples:
 * - Friday Jan 30 through Thursday Feb 5 → "2026-01-30"
 * - On Thursday Feb 5, we're still in week "2026-01-30"
 */
export function getCurrentWeekId(referenceDate: Date = new Date()): string {
  const nowInTz = toZonedTime(referenceDate, TIMEZONE);
  const currentDay = getDay(nowInTz); // 0=Sunday, 5=Friday

  // Calculate days back to the most recent Friday (start of bagel week)
  // Friday=5, Saturday=6, Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4
  let daysBackToFriday: number;
  if (currentDay >= 5) {
    // Friday or Saturday: current week started this Friday or yesterday
    daysBackToFriday = currentDay - 5;
  } else {
    // Sunday through Thursday: week started last Friday
    daysBackToFriday = currentDay + 2; // Sunday=2, Monday=3, ..., Thursday=6
  }

  // Get the Friday that started this bagel week
  const bagelWeekStart = addDays(nowInTz, -daysBackToFriday);

  // Use the Friday date as the week ID (unambiguous)
  return format(bagelWeekStart, 'yyyy-MM-dd');
}

/**
 * Format a countdown for display
 */
export function formatCountdown(values: CountdownValues): string {
  const { days, hours, minutes, seconds } = values;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(days)} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
}
