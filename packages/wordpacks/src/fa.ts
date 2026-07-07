/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Persian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const FA_WORDS: readonly string[] = [
  "کوه",
  "رودخانه",
  "جنگل",
  "اقیانوس",
  "جزیره",
  "شیر",
  "عقاب",
  "کوسه",
  "ساعت",
  "تاج",
  "کلید",
  "قفل",
  "سپر",
  "شمشیر",
  "قلعه",
  "برج",
  "مدرسه",
  "بیمارستان",
  "سیب",
  "نان",
  "شیر",
  "چای",
  "طلا",
  "نقره",
  "آهن",
  "خورشید",
  "ماه",
  "ستاره",
  "آتش",
  "آب"
] as const;

export type FaWord = (typeof FA_WORDS)[number];
