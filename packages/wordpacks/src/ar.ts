/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Arabic word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const AR_WORDS: readonly string[] = [
  "جبل",
  "نهر",
  "غابة",
  "محيط",
  "جزيرة",
  "أسد",
  "نسر",
  "قرش",
  "ساعة",
  "تاج",
  "مفتاح",
  "قفل",
  "درع",
  "سيف",
  "قلعة",
  "برج",
  "مدرسة",
  "مستشفى",
  "تفاحة",
  "خبز",
  "حليب",
  "شاي",
  "ذهب",
  "فضة",
  "حديد",
  "شمس",
  "قمر",
  "نجمة",
  "نار",
  "ماء"
] as const;

export type ArWord = (typeof AR_WORDS)[number];
