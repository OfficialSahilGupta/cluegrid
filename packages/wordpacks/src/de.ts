/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * German word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const DE_WORDS: readonly string[] = [
  "BERG",
  "FLUSS",
  "WALD",
  "OZEAN",
  "INSEL",
  "LÖWE",
  "ADLER",
  "HAI",
  "UHR",
  "KRONE",
  "SCHLÜSSEL",
  "SCHLOSS",
  "SCHILD",
  "SCHWERT",
  "BURG",
  "TURM",
  "SCHULE",
  "KRANKENHAUS",
  "APFEL",
  "BROT",
  "MILCH",
  "TEE",
  "GOLD",
  "SILBER",
  "EISEN",
  "SONNE",
  "MOND",
  "STERN",
  "FEUER",
  "WASSER"
] as const;

export type DeWord = (typeof DE_WORDS)[number];
