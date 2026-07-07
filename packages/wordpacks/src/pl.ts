/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Polish word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const PL_WORDS: readonly string[] = [
  "GÓRA",
  "RZEKA",
  "LAS",
  "OCEAN",
  "WYSPA",
  "LEW",
  "ORZEŁ",
  "REKIN",
  "ZEGAR",
  "KORONA",
  "KLUCZ",
  "ZAMEK",
  "TARCZA",
  "MIECZ",
  "ZAMEK",
  "WIEŻA",
  "SZKOŁA",
  "SZPITAL",
  "JABŁKO",
  "CHLEB",
  "MLEKO",
  "HERBATA",
  "ZŁOTO",
  "SREBRO",
  "ŻELAZO",
  "SŁOŃCE",
  "KSIĘŻYC",
  "GWIAZDA",
  "OGIEŃ",
  "WODA"
] as const;

export type PlWord = (typeof PL_WORDS)[number];
