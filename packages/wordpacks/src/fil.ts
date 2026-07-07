/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Filipino word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const FIL_WORDS: readonly string[] = [
  "BUNDOK",
  "ILOG",
  "GUBAT",
  "KARAGATAN",
  "ISLA",
  "LEON",
  "AGILA",
  "PATING",
  "ORASAN",
  "KORONA",
  "SUSI",
  "PADLOCK",
  "KALASAG",
  "ESPADA",
  "KASTILYO",
  "TORE",
  "PAARALAN",
  "OSPITAL",
  "APAT",
  "TINAPAY",
  "GATAS",
  "TSAA",
  "GINTO",
  "PILAK",
  "BAKAL",
  "ARAW",
  "BUWAN",
  "BITUIN",
  "APOY",
  "TUBIG"
] as const;

export type FilWord = (typeof FIL_WORDS)[number];
