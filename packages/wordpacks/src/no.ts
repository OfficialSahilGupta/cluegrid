/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Norwegian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const NO_WORDS: readonly string[] = [
  "FJELL",
  "ELV",
  "SKOG",
  "HAV",
  "ØY",
  "LØVE",
  "ØRN",
  "HAI",
  "KLOKKE",
  "KRONA",
  "NØKKEL",
  "LÅS",
  "SKJOLD",
  "SVERD",
  "SLOTT",
  "TÅRN",
  "SKOLE",
  "SYKEHUS",
  "EPLE",
  "BRØD",
  "MELK",
  "TE",
  "GULL",
  "SØLV",
  "JERN",
  "SOL",
  "MÅNE",
  "STJERNE",
  "ILD",
  "VANN"
] as const;

export type NoWord = (typeof NO_WORDS)[number];
