/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Serbian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const SR_WORDS: readonly string[] = [
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

export type SrWord = (typeof SR_WORDS)[number];
