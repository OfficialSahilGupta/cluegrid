/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Albanian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const SQ_WORDS: readonly string[] = [
  "MAL",
  "LUMI",
  "PYLL",
  "OKEAN",
  "ISHULL",
  "LUAN",
  "SHQIPONJË",
  "PESHQARK",
  "ORË",
  "KORONË",
  "ÇELËS",
  "DOLLAP",
  "MBROJTËS",
  "SHPATË",
  "KASTELL",
  "KULLË",
  "SHKOLLË",
  "SPITAL",
  "MOLLË",
  "BUKË",
  "QUMËSHT",
  "ÇAJ",
  "AR",
  "ARGJEND",
  "HEKUR",
  "DIELL",
  "HËNË",
  "YLL",
  "ZJARR",
  "UJI"
] as const;

export type SqWord = (typeof SQ_WORDS)[number];
