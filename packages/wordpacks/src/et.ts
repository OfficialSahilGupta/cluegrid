/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Estonian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const ET_WORDS: readonly string[] = [
  "MÄGI",
  "JÕGI",
  "METS",
  "OKEAN",
  "SAAR",
  "LÕVI",
  "KOTKAS",
  "HAI",
  "KELL",
  "KROON",
  "VÕTI",
  "LUKK",
  "KILP",
  "MÕÕK",
  "LOSS",
  "TORN",
  "KOOL",
  "HAIGLA",
  "ÕUN",
  "LEIB",
  "PIIM",
  "TEE",
  "KULD",
  "HÕBE",
  "RAUD",
  "PÄIKE",
  "KUU",
  "TÄHT",
  "TULI",
  "VESI"
] as const;

export type EtWord = (typeof ET_WORDS)[number];
