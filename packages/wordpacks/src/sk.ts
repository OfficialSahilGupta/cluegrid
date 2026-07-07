/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Slovak word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const SK_WORDS: readonly string[] = [
  "HORA",
  "RIEKA",
  "LES",
  "OCEÁN",
  "OSTROV",
  "LEV",
  "OROL",
  "ŽRALOK",
  "HODINY",
  "KORUNA",
  "KĽÚČ",
  "ZÁMOK",
  "ŠTÍT",
  "MEČ",
  "HRAD",
  "VEŽA",
  "ŠKOLA",
  "NEMOCNICA",
  "JABLKO",
  "CHLIEB",
  "MLIEKO",
  "ČAJ",
  "ZLATO",
  "STRIEBRO",
  "ŽELEZO",
  "SLNCE",
  "MESIAC",
  "HVIEZDA",
  "OHEŇ",
  "VODA"
] as const;

export type SkWord = (typeof SK_WORDS)[number];
