/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Thai word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const TH_WORDS: readonly string[] = [
  "ภูเขา",
  "แม่น้ำ",
  "ป่า",
  "มหาสมุทร",
  "เกาะ",
  "สิงโต",
  "นกอินทรี",
  "ฉลาม",
  "นาฬิกา",
  "มงกุฎ",
  "กุญแจ",
  "แม่กุญแจ",
  "โล่",
  "ดาบ",
  "ปราสาท",
  "หอคอย",
  "โรงเรียน",
  "โรงพยาบาล",
  "แอปเปิ้ล",
  "ขนมปัง",
  "นม",
  "ชา",
  "ทอง",
  "เงิน",
  "เหล็ก",
  "ดวงอาทิตย์",
  "ดวงจันทร์",
  "ดวงดาว",
  "ไฟ",
  "น้ำ"
] as const;

export type ThWord = (typeof TH_WORDS)[number];
