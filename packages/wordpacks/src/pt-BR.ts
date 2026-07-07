/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Portuguese (Brazil) word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const PT_BR_WORDS: readonly string[] = [
  "MONTANHA",
  "RIO",
  "FLORESTA",
  "OCEANO",
  "ILHA",
  "LEÃO",
  "ÁGUIA",
  "TUBARÃO",
  "RELÓGIO",
  "COROA",
  "CHAVE",
  "FECHADURA",
  "ESCUDO",
  "ESPADA",
  "CASTELO",
  "TORRE",
  "ESCOLA",
  "HOSPITAL",
  "MAÇÃ",
  "PÃO",
  "LEITE",
  "CHÁ",
  "OURO",
  "PRATA",
  "FERRO",
  "SOL",
  "LUA",
  "ESTRELA",
  "FOGO",
  "ÁGUA"
] as const;

export type PtBrWord = (typeof PT_BR_WORDS)[number];
