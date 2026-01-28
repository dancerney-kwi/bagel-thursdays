export const BAGEL_FACTS: string[] = [
  'The first bagels were brought to New York City by Polish immigrants in the late 1800s.',
  'A true NY bagel must be boiled before baking - that\'s what gives it the distinctive chewy texture.',
  'The hole in the middle was originally designed so bagels could be stacked on a dowel for selling.',
  'New York City tap water is often credited for the unique taste of NYC bagels due to its mineral content.',
  'The word "bagel" comes from the Yiddish word "beygl," meaning "ring" or "bracelet."',
  'In 1907, the International Bagel Bakers Union was formed in NYC, controlling bagel production for decades.',
  'A traditional NY bagel weighs about 4 ounces, larger than most commercial bagels today.',
  'The everything bagel was invented in the 1980s by a NYC baker who swept up leftover seeds.',
  'Bagels were once given as gifts to women in childbirth as a symbol of the circle of life.',
  'H&H Bagels, founded in 1972, became one of NYC\'s most famous bagel shops before closing in 2012.',
  'The average New Yorker consumes about 3 bagels per month.',
  'Bagels have fewer calories than most breads of similar size due to the boiling process.',
  'The Bagel Bakers Local 338 union once controlled who could make bagels in NYC.',
  'Murray\'s Bagels in Greenwich Village has been serving NYC since 1996.',
  'A "flagel" is a flat bagel - a NYC invention for those who prefer more crust.',
  'NYC produces over 3 million bagels daily across hundreds of bagel shops.',
  'The sesame bagel is the most popular variety in New York City.',
  'Bagels became mainstream American food in the 1970s when Lender\'s began selling frozen bagels.',
  'Traditional NYC bagels are made with high-gluten flour for that perfect chewy texture.',
  'The bialy, a bagel\'s cousin without a hole, is also a NYC Jewish bakery staple.',
];

// Helper to get a random fact
export function getRandomFact(): string {
  const index = Math.floor(Math.random() * BAGEL_FACTS.length);
  return BAGEL_FACTS[index];
}

// Helper to get fact by index (with wrapping)
export function getFactByIndex(index: number): string {
  const wrappedIndex = index % BAGEL_FACTS.length;
  return BAGEL_FACTS[wrappedIndex];
}
