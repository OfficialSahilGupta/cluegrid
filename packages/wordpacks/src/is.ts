/**
 * Icelandic word list for ClueGrid.
 * 260+ common nouns suitable for a word-deduction game.
 */
export const IS_WORDS: readonly string[] = [
  "FJALL", "FLJÓT", "SKÓGUR", "EYÐIMÖRK", "HAF", "EYJA", "DALUR", "GLJÚFUR",
  "JÖKULL", "ELDFJALL", "HELLIR", "MÝRI", "FRUMSKÓGUR", "KLETTUR", "RIF", "SÓL",
  "TÚNDRA", "HÁSLÉTTA", "STJARNA", "TUNGL", "SKÝ", "REGN", "VINDUR", "ELDUR",
  "JÖRÐ", "STEINN", "TRÉ", "BLÓM", "GRAS", "LAUF", "FRÆ", "SANDUR",
  "ALDA", "LJÓN", "TÍGUR", "BJÖRN", "ÚLFUR", "REFUR", "HIND", "ELGUR",
  "KANÍNA", "MÚS", "ÍKORNI", "FÍLL", "ÚLFALDI", "API", "GÍRAFFI", "KENGÚRA",
  "HESTUR", "KÝR", "SVÍN", "HUNDUR", "KÖTTUR", "ÖRN", "FALKI", "UGLA",
  "PÁFAUGLI", "MÁFUR", "PINGÚÍN", "ÖND", "LAX", "HÁKARL", "HVALUR", "HÖFRUNGUR",
  "KOLKABBI", "KRABBI", "KÖNGULÓ", "BÝFLUGA", "FIÐRILDI", "MAUR", "STÓLL", "BORÐ",
  "RÚM", "GLUGGI", "DYR", "LYKILL", "LÁS", "KLUKKA", "SPEGILL", "LAMPI",
  "KETILL", "KASSA", "TÖSKA", "BÓK", "PENNI", "BLÝANTUR", "PAPÍR", "SÍMI",
  "TÖLVA", "MYNDAVÉL", "SJÓNVARP", "ÚTVARP", "REIP", "KEÐJA", "HAMAR", "NÖGL",
  "SKRÚFA", "ÖX", "SÖG", "SKÓFLA", "SÓPUR", "BURSTI", "FATA", "SKEIÐ",
  "GAFFALL", "HNÍFUR", "DISKUR", "GLAS", "FLASKA", "BOLLI", "SKÁL", "SKÆRI",
  "NÁL", "ÞRÁÐUR", "HÚS", "SKÓLI", "SPÍTALI", "BÓKASAFN", "SAFN", "HÓTEL",
  "VEITINGASTAÐUR", "BANKI", "SKRIFSTOFA", "BÚÐ", "MARKAÐUR", "VERKSMIÐJA", "STÖÐ", "FLUGVÖLLUR",
  "HÖFN", "KASTALI", "KIRKJA", "TURN", "BRÚ", "GÖNG", "VEGUR", "GATA",
  "GARÐUR", "BÚGARÐUR", "HÚSDÝRAGARÐUR", "FANGELSI", "LEIKHÚS", "HÖLL", "BRAUÐ", "MJÓLK",
  "OSTUR", "SMJÖR", "EGG", "KJÖT", "HRÍSGRJÓN", "PASTA", "KARTAFLA", "TÓMATUR",
  "LAUKUR", "HVÍTLAUKUR", "GULRÓT", "EPLI", "BANANI", "APPELSÍNA", "SÍTRÓNA", "VÍNBER",
  "JARÐARBER", "KIRSUBER", "FERSKJA", "SYKUR", "SALT", "PIPAR", "HUNANG", "VATN",
  "TE", "KAFFI", "SAFI", "BJÓR", "VÍN", "LÆKNIR", "KENNARI", "NEMANDI",
  "FLUGMAÐUR", "BÍLSTJÓRI", "SJÓMAÐUR", "HERMAÐUR", "KONUNGUR", "DROTTNING", "PRINS", "LEIKARI",
  "SÖNGVARI", "LISTAMAÐUR", "HÖFUNDUR", "KOKKUR", "BAKARI", "BÓNDI", "LÖGFRÆÐINGUR", "DÓMARI",
  "PRESTUR", "VINUR", "FJÖLSKYLDA", "FAÐIR", "MÓÐIR", "BARN", "BRÓÐIR", "SYSTIR",
  "MAÐUR", "KONA", "HÖFUÐ", "HÁR", "AUGA", "EYRA", "NEF", "MUNNUR",
  "TÖNN", "HÖND", "FÓTUR", "HJARTA", "BLÓÐ", "LÍKAMI", "SÁL", "GULL",
  "SILFUR", "JÁRN", "KOPAR", "GLER", "PLAST", "TIMBUR", "MÁLMUR", "LITUR",
  "RAUÐUR", "BLÁR", "GRÆNN", "GULUR", "SVARTUR", "HVÍTUR", "MORGUNN", "SÍÐDEGI",
  "KVÖLD", "NÓTT", "DAGUR", "VIKA", "MÁNUÐUR", "ÁR", "ÁRSTÍÐ", "VOR",
  "SUMAR", "HAUST", "VETUR", "LANDAMÆRI", "STRÍÐ", "FRIÐUR", "SIGUR", "TAP",
  "LEIKUR", "BOLTI", "SKJÖLDUR", "ÖR", "SVERÐ", "GRÖF", "FÁNI", "KORT",
  "ÁTTAVITI", "KÓRONA", "HÁSÆTI", "STYTTA", "KRISTALL", "DEMANTUR"
] as const;

export type IsWord = (typeof IS_WORDS)[number];
