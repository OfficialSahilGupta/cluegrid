/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Finnish word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const FI_WORDS: readonly string[] = [
  "VUORI",
  "JOKI",
  "METSÄ",
  "VALTAMERI",
  "SAARI",
  "LEIJONA",
  "KOTKA",
  "HAI",
  "KELLO",
  "KRUUNU",
  "AVAIN",
  "LUKKO",
  "KILPI",
  "MIEKKA",
  "LINNA",
  "TORNI",
  "KOULU",
  "SAIRAALA",
  "OMPPU",
  "LEIPÄ",
  "MAITO",
  "TEE",
  "KULTA",
  "HOPEA",
  "RAUTA",
  "AURINKO",
  "KUU",
  "TÄHTI",
  "TULI",
  "VESI"
] as const;

export type FiWord = (typeof FI_WORDS)[number];
