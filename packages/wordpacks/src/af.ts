/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Afrikaans word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const AF_WORDS: readonly string[] = [
  "BERG",
  "RIVIER",
  "WOUD",
  "OSEAAN",
  "EILAND",
  "LEEU",
  "AREND",
  "HAAI",
  "HORLOSIE",
  "KROON",
  "SLEUTEL",
  "SLOT",
  "SKILD",
  "SWAARD",
  "KASTEEL",
  "TORING",
  "SKOOL",
  "HOSPITAAL",
  "APPEL",
  "BROOD",
  "MELK",
  "TEE",
  "GOUD",
  "SILWER",
  "YSTER",
  "SON",
  "MAAN",
  "STER",
  "VUUR",
  "WATER"
] as const;

export type AfWord = (typeof AF_WORDS)[number];
