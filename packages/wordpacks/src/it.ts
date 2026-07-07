/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Italian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const IT_WORDS: readonly string[] = [
  "MONTAGNA",
  "FIUME",
  "FORESTA",
  "OCEANO",
  "ISOLA",
  "LEONE",
  "AQUILA",
  "SQUALO",
  "OROLOGIO",
  "CORONA",
  "CHIAVE",
  "SERRATURA",
  "SCUDO",
  "SPADA",
  "CASTELLO",
  "TORRE",
  "SCUOLA",
  "OSPEDALE",
  "MELA",
  "PANE",
  "LATTE",
  "TE",
  "ORO",
  "ARGENTO",
  "FERRO",
  "SOLE",
  "LUNA",
  "STELLA",
  "FUOCO",
  "ACQUA"
] as const;

export type ItWord = (typeof IT_WORDS)[number];
