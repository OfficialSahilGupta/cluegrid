/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Ukrainian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const UK_WORDS: readonly string[] = [
  "ГОРА",
  "РІЧКА",
  "ЛІС",
  "ОКЕАН",
  "ОСТРІВ",
  "ЛЕВ",
  "ОРЕЛ",
  "АКУЛА",
  "ГОДИННИК",
  "КОРОНА",
  "КЛЮЧ",
  "ЗАМОК",
  "ЩИТ",
  "МЕЧ",
  "ЗАМОК",
  "ВЕЖА",
  "ШКОЛА",
  "ЛІКАРНЯ",
  "ЯБЛУКО",
  "ХЛІБ",
  "МОЛОКО",
  "ЧАЙ",
  "ЗОЛОТО",
  "СРІБЛО",
  "ЗАЛІЗО",
  "СОНЦЕ",
  "МІСЯЦЬ",
  "ЗІРКА",
  "ВОГОНЬ",
  "ВОДА"
] as const;

export type UkWord = (typeof UK_WORDS)[number];
