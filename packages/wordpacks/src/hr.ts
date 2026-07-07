/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Croatian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const HR_WORDS: readonly string[] = [
  "PLANINA",
  "RIJEKA",
  "ŠUMA",
  "OKEAN",
  "OTOK",
  "LAV",
  "ORAO",
  "MORSKI PAS",
  "SAT",
  "KRUNA",
  "KLJUČ",
  "BRAVA",
  "ŠTIT",
  "MAČ",
  "DVORAC",
  "TORANJ",
  "ŠKOLA",
  "BOLNICA",
  "JABUKA",
  "KRUH",
  "MLIJEKO",
  "ČAJ",
  "ZLATO",
  "SREBRO",
  "ŽELJEZO",
  "SUNCE",
  "MJESEC",
  "ZVIJEZDA",
  "VATRA",
  "VODA"
] as const;

export type HrWord = (typeof HR_WORDS)[number];
