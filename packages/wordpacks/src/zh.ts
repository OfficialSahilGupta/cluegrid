/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Chinese word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const ZH_WORDS: readonly string[] = [
  "山",
  "河",
  "森林",
  "海洋",
  "岛屿",
  "狮子",
  "老鹰",
  "鲨鱼",
  "钟表",
  "皇冠",
  "钥匙",
  "锁",
  "盾牌",
  "宝剑",
  "城堡",
  "塔楼",
  "学校",
  "医院",
  "苹果",
  "面包",
  "牛奶",
  "茶",
  "黄金",
  "白银",
  "铁",
  "太阳",
  "月亮",
  "星星",
  "火",
  "水"
] as const;

export type ZhWord = (typeof ZH_WORDS)[number];
