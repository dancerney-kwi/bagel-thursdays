import { describe, it, expect } from 'vitest';
import { BAGEL_TYPES, getBagelById, getBagelName, isValidBagelId } from '@/lib/constants/bagels';
import { BAGEL_FACTS, getRandomFact, getFactByIndex } from '@/lib/constants/facts';
import { SCHEDULE, UI, STORAGE_KEYS, API_ENDPOINTS } from '@/lib/constants/config';
import { BAGEL_TYPE_IDS } from '@/lib/types';

describe('Bagel Types', () => {
  it('should have 10 bagel types', () => {
    expect(BAGEL_TYPES).toHaveLength(10);
  });

  it('should include all required bagel types', () => {
    const expectedTypes = [
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
    ];

    const actualIds = BAGEL_TYPES.map((b) => b.id);
    expect(actualIds).toEqual(expectedTypes);
  });

  it('should have valid image files for all types', () => {
    BAGEL_TYPES.forEach((bagel) => {
      expect(bagel.imageFile).toMatch(/\.svg$/);
      expect(bagel.imageFile.length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty names for all types', () => {
    BAGEL_TYPES.forEach((bagel) => {
      expect(bagel.name.length).toBeGreaterThan(0);
    });
  });

  describe('getBagelById', () => {
    it('should return bagel for valid ID', () => {
      const bagel = getBagelById('everything');
      expect(bagel).toBeDefined();
      expect(bagel?.name).toBe('Everything');
    });

    it('should return undefined for invalid ID', () => {
      // @ts-expect-error Testing invalid input
      const bagel = getBagelById('invalid');
      expect(bagel).toBeUndefined();
    });
  });

  describe('getBagelName', () => {
    it('should return name for valid ID', () => {
      expect(getBagelName('plain')).toBe('Plain');
      expect(getBagelName('cinnamon-raisin')).toBe('Cinnamon Raisin');
    });

    it('should return ID as fallback for invalid ID', () => {
      // @ts-expect-error Testing invalid input
      expect(getBagelName('unknown')).toBe('unknown');
    });
  });

  describe('isValidBagelId', () => {
    it('should return true for valid IDs', () => {
      expect(isValidBagelId('plain')).toBe(true);
      expect(isValidBagelId('everything')).toBe(true);
      expect(isValidBagelId('other')).toBe(true);
    });

    it('should return false for invalid IDs', () => {
      expect(isValidBagelId('invalid')).toBe(false);
      expect(isValidBagelId('')).toBe(false);
      expect(isValidBagelId('PLAIN')).toBe(false);
    });
  });
});

describe('Bagel Type IDs', () => {
  it('should have 10 type IDs', () => {
    expect(BAGEL_TYPE_IDS).toHaveLength(10);
  });

  it('should match BAGEL_TYPES IDs', () => {
    const typeIds = BAGEL_TYPES.map((b) => b.id);
    expect([...BAGEL_TYPE_IDS]).toEqual(typeIds);
  });
});

describe('Bagel Facts', () => {
  it('should have 20 facts', () => {
    expect(BAGEL_FACTS).toHaveLength(20);
  });

  it('should have non-empty facts', () => {
    BAGEL_FACTS.forEach((fact) => {
      expect(fact.length).toBeGreaterThan(0);
    });
  });

  it('should not have duplicate facts', () => {
    const uniqueFacts = new Set(BAGEL_FACTS);
    expect(uniqueFacts.size).toBe(BAGEL_FACTS.length);
  });

  describe('getRandomFact', () => {
    it('should return a string from the facts array', () => {
      const fact = getRandomFact();
      expect(BAGEL_FACTS).toContain(fact);
    });
  });

  describe('getFactByIndex', () => {
    it('should return correct fact for valid index', () => {
      expect(getFactByIndex(0)).toBe(BAGEL_FACTS[0]);
      expect(getFactByIndex(5)).toBe(BAGEL_FACTS[5]);
    });

    it('should wrap around for index >= length', () => {
      expect(getFactByIndex(20)).toBe(BAGEL_FACTS[0]);
      expect(getFactByIndex(21)).toBe(BAGEL_FACTS[1]);
      expect(getFactByIndex(40)).toBe(BAGEL_FACTS[0]);
    });
  });
});

describe('Configuration', () => {
  describe('SCHEDULE', () => {
    it('should have Wednesday as cutoff day', () => {
      expect(SCHEDULE.CUTOFF_DAY).toBe(3);
    });

    it('should have 12:00 PM as cutoff time', () => {
      expect(SCHEDULE.CUTOFF_HOUR).toBe(12);
      expect(SCHEDULE.CUTOFF_MINUTE).toBe(0);
    });

    it('should have Friday as reset day', () => {
      expect(SCHEDULE.RESET_DAY).toBe(5);
    });

    it('should have 12:00 AM as reset time', () => {
      expect(SCHEDULE.RESET_HOUR).toBe(0);
      expect(SCHEDULE.RESET_MINUTE).toBe(0);
    });

    it('should use America/New_York timezone', () => {
      expect(SCHEDULE.TIMEZONE).toBe('America/New_York');
    });
  });

  describe('UI', () => {
    it('should have 12 second fact rotation interval', () => {
      expect(UI.FACT_ROTATION_INTERVAL).toBe(12000);
    });

    it('should have reasonable polling interval', () => {
      expect(UI.POLLING_INTERVAL).toBe(30000);
    });

    it('should have spread name max length of 50', () => {
      expect(UI.SPREAD_NAME_MAX_LENGTH).toBe(50);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have browser ID key', () => {
      expect(STORAGE_KEYS.BROWSER_ID).toBeDefined();
      expect(STORAGE_KEYS.BROWSER_ID.length).toBeGreaterThan(0);
    });

    it('should have submission prefix', () => {
      expect(STORAGE_KEYS.SUBMISSION_PREFIX).toBeDefined();
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should have bagels endpoint', () => {
      expect(API_ENDPOINTS.BAGELS).toBe('/api/bagels');
    });

    it('should have spreads endpoint', () => {
      expect(API_ENDPOINTS.SPREADS).toBe('/api/spreads');
    });
  });
});
