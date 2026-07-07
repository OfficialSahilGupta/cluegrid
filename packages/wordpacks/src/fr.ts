/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * French word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const FR_WORDS: readonly string[] = [
  "MONTAGNE",
  "RIVIERE",
  "FORET",
  "OCEAN",
  "ILE",
  "LION",
  "AIGLE",
  "REQUIN",
  "HORLOGE",
  "COURONNE",
  "CLE",
  "SERRURE",
  "BOUCLIER",
  "EPEE",
  "CHATEAU",
  "TOUR",
  "ECOLE",
  "HOPITAL",
  "POMME",
  "PAIN",
  "LAIT",
  "THE",
  "OR",
  "ARGENT",
  "FER",
  "SOLEIL",
  "LUNE",
  "ETOILE",
  "FEU",
  "EAU"
] as const;

export type FrWord = (typeof FR_WORDS)[number];
