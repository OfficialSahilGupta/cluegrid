/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Swedish word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const SV_WORDS: readonly string[] = [
  "BERG",
  "FLOD",
  "SKOG",
  "HAV",
  "Ö",
  "LEJON",
  "ÖRN",
  "HAJ",
  "KLOCKA",
  "KRONA",
  "NYCKEL",
  "LÅS",
  "SKÖLD",
  "SVÄRD",
  "SLOTT",
  "TORN",
  "SKOLA",
  "SJUKHUS",
  "ÄPPLE",
  "BRÖD",
  "MJÖLK",
  "TE",
  "GULD",
  "SILVER",
  "JÄRN",
  "SOL",
  "MÅNE",
  "STJÄRNA",
  "ELD",
  "VATTEN"
] as const;

export type SvWord = (typeof SV_WORDS)[number];
