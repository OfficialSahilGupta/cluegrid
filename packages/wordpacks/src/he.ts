/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Hebrew word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const HE_WORDS: readonly string[] = [
  "הר",
  "נהר",
  "יער",
  "אוקיינוס",
  "אי",
  "אריה",
  "עיט",
  "כריש",
  "שעון",
  "כתר",
  "מפתח",
  "מנעול",
  "מגן",
  "חרב",
  "טירה",
  "מגדل",
  "בית ספר",
  "בית חולים",
  "תפוח",
  "לחם",
  "חלב",
  "תה",
  "זהב",
  "כסף",
  "ברזل",
  "שמש",
  "ירח",
  "כוכב",
  "אש",
  "מים"
] as const;

export type HeWord = (typeof HE_WORDS)[number];
