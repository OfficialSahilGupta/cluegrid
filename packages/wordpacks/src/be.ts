/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Belarusian word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const BE_WORDS: readonly string[] = [
  "ГАРА",
  "РАКА",
  "ЛЕС",
  "АКІЯН",
  "АСТРОЎ",
  "ЛЕЎ",
  "АРОЛ",
  "АКУЛА",
  "ГАЗІННІК",
  "КАРОНА",
  "КЛЮЧ",
  "ЗАМОК",
  "ШЧЫТ",
  "МЯЧ",
  "ЗАМАК",
  "ВЕЖА",
  "ШКОЛА",
  "Б KÓЛЬНІЦА",
  "ЯБЛЫКА",
  "ХЛЕБ",
  "МАЛАКО",
  "ЧАЙ",
  "ЗОЛАТА",
  "СЭРЭБРА",
  "ЖАЛЕЗА",
  "СОНЦА",
  "МЕСЯЦ",
  "ЗОРКА",
  "АГОНЬ",
  "ВАДА"
] as const;

export type BeWord = (typeof BE_WORDS)[number];
