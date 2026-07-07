/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Icelandic word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const IS_WORDS: readonly string[] = [
  "FJALL",
  "FLJÓT",
  "SKÓGUR",
  "HAFIÐ",
  "EYJA",
  "LJÓN",
  "ÖRN",
  "HÁKARL",
  "KLUKKA",
  "KÓRÓNA",
  "LYKILL",
  "LÁS",
  "SKJÖLDUR",
  "SVERÐ",
  "KASTALI",
  "TURN",
  "SKÓLI",
  "SJÚKRAHÚS",
  "EPLI",
  "BRAUÐ",
  "MJÓLK",
  "TE",
  "GULL",
  "SILFUR",
  "JÁRN",
  "SÓL",
  "TUNGL",
  "STJARNA",
  "ELDUR",
  "VATN"
] as const;

export type IsWord = (typeof IS_WORDS)[number];
