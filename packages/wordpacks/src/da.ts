/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Danish word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const DA_WORDS: readonly string[] = [
  "BJERG",
  "FLOD",
  "SKOV",
  "HAV",
  "Ø",
  "LØVE",
  "ØRN",
  "HAJ",
  "UR",
  "KRONE",
  "NØGLE",
  "LÅS",
  "SKJOLD",
  "SVÆRD",
  "SLOT",
  "TÅRN",
  "SKOLE",
  "HOSPITAL",
  "ÆBLE",
  "BRØD",
  "MÆLK",
  "TE",
  "GULD",
  "SØLV",
  "JERN",
  "SOL",
  "MÅNE",
  "STJERNE",
  "ILD",
  "VAND"
] as const;

export type DaWord = (typeof DA_WORDS)[number];
