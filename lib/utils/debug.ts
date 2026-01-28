/**
 * Debug utilities for testing the app at different times
 * Only works in development mode
 */

/**
 * Get the debug time from URL parameter if present and in development mode
 * Usage: ?debug_time=2026-01-28T14:00:00
 *
 * @returns The debug Date if valid and in dev mode, otherwise null
 */
export function getDebugTime(): Date | null {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const debugTime = params.get('debug_time');

  if (!debugTime) {
    return null;
  }

  const parsed = new Date(debugTime);

  // Validate the date is valid
  if (isNaN(parsed.getTime())) {
    console.warn(`Invalid debug_time parameter: ${debugTime}`);
    return null;
  }

  return parsed;
}

/**
 * Get the current time, respecting debug override
 * @returns Debug time if set, otherwise current time
 */
export function getCurrentTime(): Date {
  return getDebugTime() || new Date();
}

/**
 * Check if debug mode is active
 */
export function isDebugMode(): boolean {
  return getDebugTime() !== null;
}
