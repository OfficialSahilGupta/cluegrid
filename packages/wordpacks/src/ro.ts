/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Romanian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const RO_WORDS: readonly string[] = [
  "MUNTE",
  "RÂU",
  "PĂDURE",
  "OCEAN",
  "INSULĂ",
  "LEU",
  "VULTUR",
  "RECHIN",
  "CEAS",
  "COROANĂ",
  "CHEIE",
  "LACĂT",
  "SCUT",
  "SPADĂ",
  "CASTEL",
  "TURN",
  "ȘCOALĂ",
  "SPITAL",
  "MĂR",
  "PÂINE",
  "LAPTE",
  "CEAI",
  "AUR",
  "ARGINT",
  "FIER",
  "SOARE",
  "LUNĂ",
  "STEAUĂ",
  "FOC",
  "APĂ"
] as const;

export type RoWord = (typeof RO_WORDS)[number];
