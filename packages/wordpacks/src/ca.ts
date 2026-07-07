/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Catalan word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const CA_WORDS: readonly string[] = [
  "MUNTANYA",
  "RIU",
  "BOSC",
  "OCEÀ",
  "ILLA",
  "LLEÓ",
  "ÀLIGA",
  "TAURÓ",
  "RELLOTGE",
  "CORONA",
  "CLAU",
  "PANNY",
  "ESCUT",
  "ESPASA",
  "CASTELL",
  "TORRE",
  "ESCOLA",
  "HOSPITAL",
  "POMA",
  "PA",
  "LLET",
  "TE",
  "OR",
  "PLATA",
  "FERRO",
  "SOL",
  "LLUNA",
  "ESTRELLA",
  "FOC",
  "AIGUA"
] as const;

export type CaWord = (typeof CA_WORDS)[number];
