/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Macedonian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const MK_WORDS: readonly string[] = [
  "ПЛАНИНА",
  "РЕКА",
  "ШУМА",
  "ОКЕАН",
  "ОСТРОВ",
  "ЛАВ",
  "ОРЕЛ",
  "АЈКУЛА",
  "ЧАСОВНИК",
  "КРУНА",
  "КЛУЧ",
  "БРАВА",
  "ШТИТ",
  "МЕЧ",
  "ЗАМОК",
  "КУЛА",
  "УЧИЛИШТЕ",
  "БОЛНИЦА",
  "ЈАБОЛКО",
  "ЛЕБ",
  "МЛЕКО",
  "ЧАЈ",
  "ЗЛАТО",
  "СРЕБРО",
  "ЖЕЛЕЗО",
  "СОНЦЕ",
  "ВЕТЕР",
  "ЅВЕЗДА",
  "ОГАН",
  "ВОДА"
] as const;

export type MkWord = (typeof MK_WORDS)[number];
