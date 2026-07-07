/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Spanish word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const ES_WORDS: readonly string[] = [
  "MONTAÑA",
  "RIO",
  "BOSQUE",
  "OCEANO",
  "ISLA",
  "LEON",
  "AGUILA",
  "TIBURON",
  "RELOJ",
  "CORONA",
  "LLAVE",
  "CANDADO",
  "ESCUDO",
  "ESPADA",
  "CASTILLO",
  "TORRE",
  "ESCUELA",
  "HOSPITAL",
  "MANZANA",
  "PAN",
  "LECHE",
  "TE",
  "ORO",
  "PLATA",
  "HIERRO",
  "SOL",
  "LUNA",
  "ESTRELLA",
  "FUEGO",
  "AGUA"
] as const;

export type EsWord = (typeof ES_WORDS)[number];
