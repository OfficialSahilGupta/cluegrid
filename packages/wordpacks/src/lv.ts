/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Latvian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const LV_WORDS: readonly string[] = [
  "KALNS",
  "UPE",
  "MEŽS",
  "OKEĀNS",
  "SALA",
  "LAUVA",
  "ĒRGLIS",
  "HAJAS",
  "PULKSTENIS",
  "KRONIS",
  "ATSLEGA",
  "SLĒDZENIS",
  "PAVAIROGS",
  "ZOBENS",
  "PILS",
  "TORNIS",
  "SKOLA",
  "SLIMNĪCA",
  "ĀBOLS",
  "MAIZE",
  "PIENS",
  "TĒJA",
  "ZELTS",
  "SUDRABS",
  "DZELZS",
  "SAULE",
  "MĒNESS",
  "ZVAIGZNE",
  "UGUNS",
  "ŪDENS"
] as const;

export type LvWord = (typeof LV_WORDS)[number];
