/**
 * Norwegian word list for ClueGrid.
 * 260+ common nouns suitable for a word-deduction game.
 */
export const NO_WORDS: readonly string[] = [
  "FJELL", "ELV", "SKOG", "ØRKEN", "HAV", "ØY", "DAL", "KANJON",
  "BRE", "VULKAN", "GROTTE", "SUMP", "JUNGEL", "KLIPPE", "REV", "DUNE",
  "ENG", "FOSS", "INNSJØ", "STJERNE", "SOL", "MÅNE", "SKY", "REGN",
  "VIND", "ILD", "JORD", "STEIN", "TRE", "BLOMST", "GRESS", "BLAD",
  "FRØ", "SAND", "BØLGE", "LØVE", "TIGER", "BJØRN", "ULV", "HJORT",
  "ELG", "KANIN", "MUS", "EKORN", "ELEFANT", "KAMEL", "APE", "GIRAFF",
  "KENGURU", "HEST", "KU", "SAU", "GRIS", "HUND", "KATT", "ØRN",
  "FALK", "UGLE", "PAPEGØYE", "PINGVIN", "AND", "FISK", "HAI", "HVAL",
  "DELFIN", "BLEKKSPRUT", "KRABBE", "FUGL", "EDDERKOPP", "BIE", "SOMMERFUGL", "MAUR",
  "STOL", "BORD", "SENG", "VINDU", "DØR", "NØKKEL", "LÅS", "KLOKKE",
  "SPEIL", "LAMPE", "STEARINLYS", "BOK", "PENN", "BLYANT", "PAPIR", "TELEFON",
  "DATAMASKIN", "KAMERA", "TV", "RADIO", "BJELLE", "TROMME", "GITAR", "PIANO",
  "FIOLIN", "TAU", "KJEDE", "HAMMER", "SPIKER", "SKRUTREKKER", "ØKS", "SAG",
  "SPADE", "KOST", "BØRSTE", "BØTTE", "SKJE", "GAFFEL", "KNIV", "TALLERKEN",
  "GLASS", "FLASKE", "KOPP", "BOLLE", "SAKS", "NÅL", "TRÅD", "HUS",
  "SKOLE", "SYKEHUS", "BIBLIOTEK", "MUSEUM", "HOTELL", "RESTAURANT", "BANK", "KONTOR",
  "BUTIKK", "MARKED", "FABRIKK", "STASJON", "FLYPLASS", "HAVN", "SLOTT", "KIRKE",
  "TÅRN", "BRO", "TUNNEL", "VEI", "GATE", "PARK", "HAGE", "GÅRD",
  "DYREPARK", "FENGSEL", "TEATER", "BRØD", "MELK", "OST", "SMØR", "EGG",
  "KJØTT", "RIS", "PASTA", "POTET", "TOMAT", "LØK", "HVITLØK", "GULROT",
  "EPLE", "BANAN", "APPELSIN", "SITRON", "DRUE", "JORDBÆR", "KIRSEBÆR", "FERSKEN",
  "SUKKER", "SALT", "PEPPER", "HONNING", "VANN", "TE", "KAFFE", "JUICE",
  "ØL", "VIN", "LEGE", "SYKEPLEIER", "LÆRER", "ELEV", "PILOT", "SJÅFØR",
  "SJØMANN", "SOLDAT", "POLITI", "BRANNMANN", "KONGE", "DRONNING", "PRINS", "SKUESPILLER",
  "SANGER", "KUNSTNER", "FORFATTER", "KOKK", "BAKER", "BONDE", "ADVOKAT", "DOMMER",
  "PREST", "VENN", "FAMILIE", "FAR", "MOR", "BARN", "BROR", "SØSTER",
  "MANN", "KVINNE", "HODE", "HÅR", "ØYE", "ØRE", "NESE", "MUNN",
  "TANN", "HÅND", "FOT", "HJERTE", "BLOD", "KROPP", "SJEL", "GULL",
  "SØLV", "JERN", "KOPPER", "PLAST", "TREVERK", "METALL", "FARGE", "RØD",
  "BLÅ", "GRØNN", "GUL", "SVART", "HVIT", "MORGEN", "ETTERMIDDAG", "KVELD",
  "NATT", "DAG", "UKE", "MÅNED", "ÅR", "ÅRSTID", "VÅR", "SOMMER",
  "HØST", "VINTER", "GRENSE", "KRIG", "FRED", "SEIER", "TAP", "SPILL",
  "BALL", "SKJOLD", "PIL", "SVERD", "GRAV", "FLAGG", "KART", "KOMPASS",
  "KRONE", "TRONE", "STATUE", "KRYSTALL", "DIAMANT"
] as const;

export type NoWord = (typeof NO_WORDS)[number];
