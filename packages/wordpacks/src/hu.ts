/**
 * Hungarian word list for ClueGrid.
 * 250+ common nouns suitable for a word-deduction game.
 */
export const HU_WORDS: readonly string[] = [
  "HEGY", "FOLYÓ", "ERDŐ", "SIVATAG", "ÓCEÁN", "SZIGET", "VÖLGY", "KANYON",
  "GLECCSER", "VULKÁN", "BARLANG", "MOCSÁR", "DZSONGEL", "SZIRT", "ZÁTONY", "DŰNE",
  "RÉT", "VÍZESÉS", "TÓ", "CSILLAG", "NAP", "HOLD", "FELHŐ", "ESŐ",
  "SZÉL", "TŰZ", "FÖLD", "KŐ", "FA", "VIRÁG", "FŰ", "LEVÉL",
  "MAG", "HOMOK", "HULLÁM", "OROSZLÁN", "TIGRIS", "MEDVE", "FARKAS", "RÓKA",
  "SZARVAS", "NYÚL", "EGÉR", "MÓKUS", "ELEFÁNT", "TEVE", "MAJOM", "ZSIRÁF",
  "KENGURU", "LÓ", "TEHÉN", "JUH", "MALAC", "KUTYA", "MACSKA", "SAS",
  "BAGOLY", "PAPAGÁJ", "PINGVIN", "KACSA", "HAL", "CÁPA", "BÁLNA", "DELFIN",
  "POLIP", "RÁK", "PÓK", "MÉH", "PILLANGÓ", "HANGYA", "SZÉK", "ASZTAL",
  "ÁGY", "ABLAK", "AJTÓ", "KULCS", "ZÁR", "ÓRA", "TÜKÖR", "LÁMPA",
  "GYERTYA", "KÖNYV", "TOLL", "CERUZA", "PAPÍR", "TELEFON", "SZÁMÍTÓGÉP", "KAMERA",
  "TÉVÉ", "RÁDIÓ", "HARANG", "DOB", "GITÁR", "ZONGORA", "HEGEDŰ", "KÖTÉL",
  "LÁNC", "KALAPÁCS", "SZÖG", "CSAVARHÚZÓ", "FEJSZE", "FŰRÉSZ", "LAPÁT", "SEPRŰ",
  "KEFE", "VÖDÖR", "KANÁL", "VILLA", "KÉS", "TÁNYÉR", "POHÁR", "PALACK",
  "CSÉSZE", "TÁL", "OLLÓ", "TŰ", "CÉRNA", "HÁZ", "ISKOLA", "KÓRHÁZ",
  "KÖNYVTÁR", "MÚZEUM", "SZÁLLODA", "ÉTTEREM", "BANK", "IRODA", "BOLT", "PIAC",
  "GYÁR", "ÁLLOMÁS", "REPÜLŐTÉR", "KIKÖTŐ", "KASTÉLY", "TEMPLOM", "TORONY", "HÍD",
  "ALAGÚT", "ÚT", "UTCA", "PARK", "KERT", "GAZDASÁG", "ÁLLATKERT", "BÖRTÖN",
  "SZÍNHÁZ", "PALOTA", "KENYÉR", "TEJ", "SAJT", "VAJ", "TOJÁS", "HÚS",
  "RIZS", "TÉSZTA", "BURGONYA", "PARADICSOM", "HAGYMA", "FOKHAGYMA", "SÁRGARÉPA", "ALMA",
  "BANÁN", "NARANCS", "CITROM", "SZŐLŐ", "EPER", "CSERESZNYE", "ŐSZIBARACK", "CUKOR",
  "SÓ", "BORS", "MÉZ", "VÍZ", "TEA", "KÁVÉ", "GYÜMÖLCSLÉ", "SÖR",
  "BOR", "ORVOS", "NÖVÉR", "TANÁR", "DIÁK", "PILÓTA", "SOFŐR", "TENGERÉSZ",
  "KATONA", "RENDŐR", "TŰZOLTÓ", "KIRÁLY", "KIRÁLYNŐ", "HERCEG", "SZÍNÉSZ", "ÉNEKES",
  "MŰVÉSZ", "ÍRÓ", "SZAKÁCS", "PÉK", "JOGÁSZ", "BÍRÓ", "PAP", "BARÁT",
  "CSALÁD", "APA", "ANYA", "GYERMEK", "TESTVÉR", "FÉRFI", "NŐ", "FEJ",
  "HAJ", "SZEM", "FÜL", "ORR", "SZÁJ", "FOG", "KÉZ", "LÁB",
  "SZÍV", "VÉR", "TEST", "LÉLEK", "ARANY", "EZÜST", "VAS", "RÉZ",
  "ÜVEG", "MŰANYAG", "FÉM", "SZÍN", "REGGEL", "DÉLUTÁN", "ESTE", "ÉJSZAKA",
  "HÉT", "HÓNAP", "ÉV", "TAVASZ", "NYÁR", "ŐSZ", "TÉL", "HATÁR",
  "HÁBORÚ", "BÉKE", "GYŐZELEM", "VESZTESÉG", "JÁTÉK", "LABDA", "PAJZS", "NYÍL",
  "KARD", "SÍR", "ZÁSZLÓ", "TÉRKÉP", "IRÁNYTŰ", "KORONA", "TRÓN", "SZOBOR",
  "KRISTÁLY", "GYÉMÁNT"
] as const;

export type HuWord = (typeof HU_WORDS)[number];
