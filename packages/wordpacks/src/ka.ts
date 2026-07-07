/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Georgian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const KA_WORDS: readonly string[] = [
  "ᲛᲗᲐ",
  "ᲛᲓᲘᲜᲐᲠᲔ",
  "ᲢᲧᲔ",
  "ᲝᲙᲔᲐᲜᲔ",
  "ᲙᲣᲜᲫᲣᲚᲘ",
  "ᲚᲝᲛᲘ",
  "ᲐᲠᲬᲘᲕᲘ",
  "ᲖᲕᲘᲒᲔᲜᲘ",
  "ᲡᲐᲐᲗᲘ",
  "ᲒᲕᲘᲠᲒᲕᲘᲜᲘ",
  "ᲒᲐᲡᲐᲦᲔᲑᲘ",
  "ᲑᲝᲥᲚᲝᲛᲘ",
  "ᲤᲐᲠᲘ",
  "ᲮᲛᲐᲚᲘ",
  "ᲪᲘᲮᲔᲡᲘᲛᲐᲒᲠᲔ",
  "ᲙᲝᲨᲙᲘ",
  "ᲡᲙᲝᲚᲐ",
  "ᲡᲐᲐᲕᲐᲓᲛᲧᲝᲤᲝ",
  "ᲕᲐᲨᲚᲘ",
  "ᲞᲣᲠᲘ",
  "ᲠᲫᲔ",
  "ᲩᲐᲘ",
  "ᲝᲥᲠᲝ",
  "ᲕᲔᲠᲪᲮᲚᲘ",
  "ᲠᲙᲘᲜᲐ",
  "ᲛᲖᲔ",
  "ᲛᲗᲕᲐᲠᲔ",
  "ᲕᲐᲠᲡᲙᲕᲚᲐᲕᲘ",
  "ᲪᲔᲪᲮᲚᲘ",
  "ᲬᲧᲐᲚᲘ"
] as const;

export type KaWord = (typeof KA_WORDS)[number];
