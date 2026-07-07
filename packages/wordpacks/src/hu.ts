/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Hungarian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const HU_WORDS: readonly string[] = [
  "HEGY",
  "FOLYÓ",
  "ERDŐ",
  "ÓCEÁN",
  "SZIGET",
  "OROSZLÁN",
  "SAS",
  "CÁPA",
  "ÓRA",
  "KORONA",
  "KULCS",
  "ZÁR",
  "PAJZS",
  "KARD",
  "KASTÉLY",
  "TORONY",
  "ISKOLA",
  "KÓRHÁZ",
  "ALMA",
  "KENYÉR",
  "TEJ",
  "TEA",
  "ARANY",
  "EZÜST",
  "VAS",
  "NAP",
  "HOLD",
  "CSILLAG",
  "TŰZ",
  "VÍZ"
] as const;

export type HuWord = (typeof HU_WORDS)[number];
