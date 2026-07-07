/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Korean word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const KO_WORDS: readonly string[] = [
  "산",
  "강",
  "숲",
  "바다",
  "섬",
  "사자",
  "독수리",
  "상어",
  "시계",
  "왕관",
  "열쇠",
  "자물쇠",
  "방패",
  "칼",
  "성",
  "탑",
  "학교",
  "병원",
  "사과",
  "빵",
  "우유",
  "차",
  "금",
  "은",
  "철",
  "태양",
  "달",
  "별",
  "불",
  "물"
] as const;

export type KoWord = (typeof KO_WORDS)[number];
