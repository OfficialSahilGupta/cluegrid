/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Esperanto word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const EO_WORDS: readonly string[] = [
  "MONTO",
  "RIVERETO",
  "ARBARO",
  "OCEANO",
  "INSULO",
  "LEONO",
  "AGLO",
  "ŜARKO",
  "HORLOĜO",
  "KORONO",
  "ŜLOSILO",
  "SERRILO",
  "ŜILDO",
  "GLAVO",
  "KASTELO",
  "TURNO",
  "LERNEJO",
  "HOSPITALO",
  "POMO",
  "PANO",
  "LAKTO",
  "TEO",
  "ORO",
  "ARĜENTO",
  "FERO",
  "SUNO",
  "LUNO",
  "STELO",
  "FAJRO",
  "AKVO"
] as const;

export type EoWord = (typeof EO_WORDS)[number];
