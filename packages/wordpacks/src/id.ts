/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Indonesian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const ID_WORDS: readonly string[] = [
  "GUNUNG",
  "SUNGAI",
  "HUTAN",
  "SAMUDERA",
  "PULAU",
  "SINGA",
  "ELANG",
  "HIU",
  "JAM",
  "MAHKOTA",
  "KUNCI",
  "GEMBOK",
  "PERISAI",
  "PEDANG",
  "KASTIL",
  "MENARA",
  "SEKOLAH",
  "RUMAH SAKIT",
  "APEL",
  "ROTI",
  "SUSU",
  "TEH",
  "EMAS",
  "PERAK",
  "BESI",
  "MATAHARI",
  "BULAN",
  "BINTANG",
  "API",
  "AIR"
] as const;

export type IdWord = (typeof ID_WORDS)[number];
