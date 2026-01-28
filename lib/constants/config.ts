// Schedule configuration
export const SCHEDULE = {
  // Cutoff: Wednesday at 12:00 PM EST
  CUTOFF_DAY: 3, // Wednesday (0 = Sunday, 3 = Wednesday)
  CUTOFF_HOUR: 12, // 12:00 PM
  CUTOFF_MINUTE: 0,

  // Reset: Friday at 12:00 AM EST (midnight)
  RESET_DAY: 5, // Friday (0 = Sunday, 5 = Friday)
  RESET_HOUR: 0, // 12:00 AM (midnight)
  RESET_MINUTE: 0,

  // Timezone
  TIMEZONE: 'America/New_York',
} as const;

// UI configuration
export const UI = {
  // Fact carousel rotation interval in milliseconds
  FACT_ROTATION_INTERVAL: 12000, // 12 seconds

  // Real-time polling fallback interval in milliseconds
  POLLING_INTERVAL: 30000, // 30 seconds

  // Animation durations in milliseconds
  COUNTDOWN_UPDATE_INTERVAL: 1000, // 1 second
  TALLY_ANIMATION_DURATION: 300, // 0.3 seconds

  // Input limits
  SPREAD_NAME_MAX_LENGTH: 50,
  CUSTOM_BAGEL_MAX_LENGTH: 100,
  USER_NAME_MAX_LENGTH: 50,
} as const;

// Storage keys for localStorage
export const STORAGE_KEYS = {
  BROWSER_ID: 'bagel-thursdays-browser-id',
  SUBMISSION_PREFIX: 'bagel-thursdays-submission-',
  USER_NAME: 'bagel-thursdays-user-name',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  BAGELS: '/api/bagels',
  SPREADS: '/api/spreads',
} as const;
