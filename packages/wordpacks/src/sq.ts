/**
 * Albanian word list for ClueGrid.
 * 260+ common nouns suitable for a word-deduction game.
 */
export const SQ_WORDS: readonly string[] = [
  "MAL", "LUM", "PYLL", "SHKRETËTIRË", "OQEAN", "ISHULL", "LUGINË", "KANION",
  "AKULLNAJË", "VULLKAN", "SHPELLË", "KËNETË", "XHUNGËL", "SHKËMB", "RIF", "DUNË",
  "LIVADH", "UJËVARË", "LIQEN", "YLL", "DIELL", "HËNË", "RE", "SHI",
  "ERË", "ZJARR", "TOKË", "GUR", "PEMË", "LULE", "BAR", "GJETHE",
  "FARË", "RËRË", "VALË", "LUAN", "TIGËR", "ARI", "UJK", "DHELPËR",
  "DRER", "LEPUR", "MI", "KETËR", "ELEFANT", "DEVE", "MAJMUN", "ZHIRAFË",
  "KANGUR", "KAL", "LOPË", "DELE", "DERR", "QEN", "MACE", "SHQIPONJË",
  "SKIFTER", "BUF", "PAPAGALL", "PINGUIN", "ROSË", "PESHK", "PESHKAQEN", "BALENË",
  "DELFIN", "OKTAPOD", "GAFORRE", "ZOG", "MERIMANGË", "BLETË", "FLUTUR", "MILINGONË",
  "KARRIGE", "TRYEZË", "SHTRAT", "DRITARE", "DERË", "ÇELËS", "BRAVË", "ORË",
  "PASQYRË", "LLAMPË", "QIRI", "LIBËR", "LAPS", "STILOLAPS", "LETËR", "TELEFON",
  "KOMPJUTER", "KAMERË", "TELEVIZOR", "RADIO", "ZILE", "DAULLË", "GITARË", "PIANO",
  "VIOLINË", "LITAR", "ZINGJIR", "ÇEKAN", "GOZHDË", "KAÇAVIDË", "SËPATË", "SHARRË",
  "LOPATË", "FSHESË", "FURÇË", "KOVË", "LUGË", "PIRUN", "THIKË", "PJATË",
  "GOTË", "SHISHE", "FILXHÀN", "TAS", "GËRSHËRË", "GJILPËRË", "PE", "SHTËPI",
  "SHKOLLË", "SPITAL", "BIBLIOTEKË", "MUZE", "HOTEL", "RESTORANT", "BANKË", "ZYRË",
  "DYQAN", "TREG", "FABRIKË", "STACION", "AEROPORT", "PORT", "KËSHTJELLË", "KISHË",
  "XHAMI", "TEMPULL", "KULLË", "URË", "TUNEL", "RRUGË", "RRUGICË", "PARK",
  "KOPSHT", "FERMË", "BURG", "TEATRË", "PALAT", "BUKË", "QUMËSHT", "DJATHË",
  "GJALPË", "VEZË", "MISH", "ORIZ", "MAKARONA", "PATATE", "DOMATE", "QEPË",
  "HUDHËR", "KAROTË", "MOLLË", "BANANE", "PORTOKALL", "LIMON", "RUSH", "DREDHËZ",
  "QERSHI", "PJESHKË", "SHEQER", "KRYPË", "PIPER", "MJALTË", "UJË", "ÇAJ",
  "KAFE", "LËNG", "BIRRË", "VERË", "MJEK", "INFERMIER", "MËSUES", "NXËNËS",
  "PILOT", "SHOFER", "DETAR", "USHTAR", "POLIC", "ZJARRFIKËS", "MBRET", "MBRETËRESHË",
  "PRINC", "AKTOR", "KËNGËTAR", "ARTIST", "SHKRIMTAR", "KUZHINIER", "BUKËPJEKËS", "FERMER",
  "AVOKAT", "GJYQTAR", "PRIFT", "MIK", "FAMILJE", "BABA", "NËNË", "FËMIJË",
  "VËLLA", "MOTËR", "BURRË", "GRUA", "KOKË", "FLOKË", "SY", "VESH",
  "HUNDË", "GOJË", "DHËMB", "DORË", "KËMBË", "ZEMËR", "GJAK", "TRUP",
  "SHPIRT", "FLORI", "ARGJEND", "HEKUR", "BAKËR", "PLASTIKË", "DRU", "METAL",
  "NGJYRË", "MËNGJES", "PASDITE", "MBRËMJE", "NATË", "DITË", "JAVË", "MUAJ",
  "VIT", "STINË", "PRANVERË", "VJESHTË", "DIMËR", "KUFIR", "LUFTË", "PAQE",
  "FITORE", "HUMBJE", "LOJË", "TOP", "MBROJTËSE", "SHIGJETË", "SHPATË", "VARR",
  "FLAMUR", "HARTË", "BUSULL", "KORONË", "TRON", "STATUJË", "KRISTAL", "DIAMANT"
] as const;

export type SqWord = (typeof SQ_WORDS)[number];
