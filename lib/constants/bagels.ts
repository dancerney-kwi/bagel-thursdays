import type { BagelType, BagelTypeId } from '@/lib/types';

export const BAGEL_TYPES: BagelType[] = [
  { id: 'plain', name: 'Plain', imageFile: 'plain.svg' },
  { id: 'everything', name: 'Everything', imageFile: 'everything.svg' },
  { id: 'egg', name: 'Egg', imageFile: 'egg.svg' },
  { id: 'egg-everything', name: 'Egg Everything', imageFile: 'egg-everything.svg' },
  { id: 'sesame', name: 'Sesame', imageFile: 'sesame.svg' },
  { id: 'poppy-seed', name: 'Poppy Seed', imageFile: 'poppy-seed.svg' },
  { id: 'onion', name: 'Onion', imageFile: 'onion.svg' },
  { id: 'cinnamon-raisin', name: 'Cinnamon Raisin', imageFile: 'cinnamon-raisin.svg' },
  { id: 'pumpernickel', name: 'Pumpernickel', imageFile: 'pumpernickel.svg' },
  { id: 'other', name: 'Other', imageFile: 'other.svg' },
];

// Helper to get bagel by ID
export function getBagelById(id: BagelTypeId): BagelType | undefined {
  return BAGEL_TYPES.find((bagel) => bagel.id === id);
}

// Helper to get bagel name by ID
export function getBagelName(id: BagelTypeId): string {
  return getBagelById(id)?.name ?? id;
}

// Helper to check if ID is valid
export function isValidBagelId(id: string): id is BagelTypeId {
  return BAGEL_TYPES.some((bagel) => bagel.id === id);
}
