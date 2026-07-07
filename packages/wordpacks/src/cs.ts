/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Czech word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const CS_WORDS: readonly string[] = [
  "HORA",
  "ŘEKA",
  "LES",
  "OCEÁN",
  "OSTROV",
  "LEV",
  "OREL",
  "ŽRALOK",
  "HODINY",
  "KORUNA",
  "KLÍČ",
  "ZÁMEK",
  "ŠTÍT",
  "MEČ",
  "HRAD",
  "VĚŽ",
  "ŠKOLA",
  "NEMOCNICE",
  "JABLKO",
  "CHLÉB",
  "MLÉKO",
  "ČAJ",
  "ZLATO",
  "STŘÍBRO",
  "ŽELEZO",
  "SLUNCE",
  "MĚSÍC",
  "HVĚZDA",
  "OHEŇ",
  "VODA"
] as const;

export type CsWord = (typeof CS_WORDS)[number];
