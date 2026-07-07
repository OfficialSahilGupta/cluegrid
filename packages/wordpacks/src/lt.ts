/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Lithuanian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const LT_WORDS: readonly string[] = [
  "KALNAS",
  "UPĖ",
  "MIŠKAS",
  "VANDENYNAS",
  "SALA",
  "LIŪTAS",
  "ERELIS",
  "RYKLYS",
  "LAIKRODIS",
  "KARŪNA",
  "RAKTAS",
  "SPYNA",
  "SKYDAS",
  "KARDAS",
  "PILIS",
  "BOKŠTAS",
  "MOKYKLA",
  "LIGONINĖ",
  "OBUOLYS",
  "DUONA",
  "PIENAS",
  "ARBATA",
  "AUKSAS",
  "SIDABRAS",
  "GELEŽIS",
  "SAULĖ",
  "MĖNULIS",
  "ŽVAIGŽDĖ",
  "UGNIS",
  "VANDUO"
] as const;

export type LtWord = (typeof LT_WORDS)[number];
