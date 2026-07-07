/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Slovenian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const SL_WORDS: readonly string[] = [
  "GORA",
  "REKA",
  "GOZD",
  "OCEAN",
  "OTOK",
  "LEV",
  "OREL",
  "MORSKI PSI",
  "URA",
  "KRONA",
  "KLJUČ",
  "KLJUČAVNICA",
  "ŠČIT",
  "MEČ",
  "GRAD",
  "STOLP",
  "ŠOLA",
  "BOLNIŠNICA",
  "JABOLKO",
  "KRUH",
  "MLEKO",
  "ČAJ",
  "ZLATO",
  "SREBRO",
  "ŽELEZO",
  "SONCE",
  "MESEC",
  "ZVEZDA",
  "OGENJ",
  "VODA"
] as const;

export type SlWord = (typeof SL_WORDS)[number];
