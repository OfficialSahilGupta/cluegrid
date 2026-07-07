/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Turkish word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const TR_WORDS: readonly string[] = [
  "DAĞ",
  "NEHİR",
  "ORMAN",
  "OKYANUS",
  "ADA",
  "ASLAN",
  "KARTAL",
  "KÖPEKBALIĞI",
  "SAAT",
  "TAÇ",
  "ANAHTAR",
  "KİLİT",
  "KALKAN",
  "KILIÇ",
  "KALE",
  "KULE",
  "OKUL",
  "HASTANE",
  "ELMA",
  "EKMEK",
  "SÜT",
  "ÇAY",
  "ALTIN",
  "GÜMÜŞ",
  "DEMİR",
  "GÜNEŞ",
  "AY",
  "YILDIZ",
  "ATEŞ",
  "SU"
] as const;

export type TrWord = (typeof TR_WORDS)[number];
