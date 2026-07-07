/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Russian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const RU_WORDS: readonly string[] = [
  "ГОРА",
  "РЕКА",
  "ЛЕС",
  "ОКЕАН",
  "ОСТРОВ",
  "ЛЕВ",
  "ОРЕЛ",
  "АКУЛА",
  "ЧАСЫ",
  "КОРОНА",
  "КЛЮЧ",
  "ЗАМОК",
  "ЩИТ",
  "МЕЧ",
  "ЗАМОК",
  "БАШНЯ",
  "ШКОЛА",
  "БОЛЬНИЦА",
  "ЯБЛОКО",
  "ХЛЕБ",
  "МОЛОКО",
  "ЧАЙ",
  "ЗОЛОТО",
  "СЕРЕБРО",
  "ЖЕЛЕЗО",
  "СОЛНЦЕ",
  "ЛУНА",
  "ЗВЕЗДА",
  "ОГОНЬ",
  "ВОДА"
] as const;

export type RuWord = (typeof RU_WORDS)[number];
