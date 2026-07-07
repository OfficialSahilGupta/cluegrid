/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Dutch word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const NL_WORDS: readonly string[] = [
  "BERG",
  "RIVIER",
  "BOS",
  "OCEAAN",
  "EILAND",
  "LEEUW",
  "AREND",
  "HAAI",
  "KLOK",
  "KROON",
  "SLEUTEL",
  "SLOT",
  "SCHILD",
  "ZWAARD",
  "KASTEEL",
  "TOREN",
  "SCHOOL",
  "ZIEKENHUIS",
  "APPEL",
  "BROOD",
  "MELK",
  "THEE",
  "GOUD",
  "ZILVER",
  "IJZER",
  "ZON",
  "MAAN",
  "STER",
  "VUUR",
  "WATER"
] as const;

export type NlWord = (typeof NL_WORDS)[number];
