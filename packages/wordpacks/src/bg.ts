/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Bulgarian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const BG_WORDS: readonly string[] = [
  "ПЛАНИНА",
  "РЕКА",
  "ГОРА",
  "ОКЕАН",
  "ОСТРОВ",
  "ЛЪВ",
  "ОРЕЛ",
  "АКУЛА",
  "ЧАСОВНИК",
  "КОРОНА",
  "КЛЮЧ",
  "КЛЮЧАЛКА",
  "ЩИТ",
  "МЕЧ",
  "ЗАМЪК",
  "КУЛА",
  "УЧИЛИЩЕ",
  "БОЛНИЦА",
  "ЯБЪЛКА",
  "ХЛЯБ",
  "МЛЯКО",
  "ЧАЙ",
  "ЗЛАТО",
  "СРЕБРО",
  "ЖЕЛЯЗО",
  "СЛЪНЦЕ",
  "ЛУНА",
  "ЗВЕЗДА",
  "ОГЪН",
  "ВОДА"
] as const;

export type BgWord = (typeof BG_WORDS)[number];
