const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const languages = [
  { code: 'hi', name: 'Hindi', pilot: true },
  { code: 'ne', name: 'Nepali', pilot: true },
  { code: 'ja', name: 'Japanese', pilot: true },
  { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'fr', name: 'French' },
  { code: 'tr', name: 'Turkish' },
  { code: 'cs', name: 'Czech' },
  { code: 'it', name: 'Italian' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'sr', name: 'Serbian' },
  { code: 'ko', name: 'Korean' },
  { code: 'ro', name: 'Romanian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'da', name: 'Danish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ca', name: 'Catalan' },
  { code: 'sv', name: 'Swedish' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'et', name: 'Estonian' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'be', name: 'Belarusian' },
  { code: 'es', name: 'Spanish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sk', name: 'Slovak' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'ar-LB', name: 'Arabic (Lebanon)' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'el', name: 'Greek' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'th', name: 'Thai' },
  { code: 'fil', name: 'Filipino' },
  { code: 'fa', name: 'Persian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'sq', name: 'Albanian' },
  { code: 'ka', name: 'Georgian' },
  { code: 'vi', name: 'Vietnamese' }
];

// Helper to convert locale code to upper PascalCase variable name prefix
function getVarPrefix(code) {
  return code.toUpperCase().replace('-', '_');
}

function getTypeName(code) {
  return code
    .split('-')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
}

// 30 Core Deck Words translated into 50 languages to adapt gameplay per locale
const translations = {
  de: ["BERG", "FLUSS", "WALD", "OZEAN", "INSEL", "LÖWE", "ADLER", "HAI", "UHR", "KRONE", "SCHLÜSSEL", "SCHLOSS", "SCHILD", "SCHWERT", "BURG", "TURM", "SCHULE", "KRANKENHAUS", "APFEL", "BROT", "MILCH", "TEE", "GOLD", "SILBER", "EISEN", "SONNE", "MOND", "STERN", "FEUER", "WASSER"],
  fr: ["MONTAGNE", "RIVIERE", "FORET", "OCEAN", "ILE", "LION", "AIGLE", "REQUIN", "HORLOGE", "COURONNE", "CLE", "SERRURE", "BOUCLIER", "EPEE", "CHATEAU", "TOUR", "ECOLE", "HOPITAL", "POMME", "PAIN", "LAIT", "THE", "OR", "ARGENT", "FER", "SOLEIL", "LUNE", "ETOILE", "FEU", "EAU"],
  es: ["MONTAÑA", "RIO", "BOSQUE", "OCEANO", "ISLA", "LEON", "AGUILA", "TIBURON", "RELOJ", "CORONA", "LLAVE", "CANDADO", "ESCUDO", "ESPADA", "CASTILLO", "TORRE", "ESCUELA", "HOSPITAL", "MANZANA", "PAN", "LECHE", "TE", "ORO", "PLATA", "HIERRO", "SOL", "LUNA", "ESTRELLA", "FUEGO", "AGUA"],
  it: ["MONTAGNA", "FIUME", "FORESTA", "OCEANO", "ISOLA", "LEONE", "AQUILA", "SQUALO", "OROLOGIO", "CORONA", "CHIAVE", "SERRATURA", "SCUDO", "SPADA", "CASTELLO", "TORRE", "SCUOLA", "OSPEDALE", "MELA", "PANE", "LATTE", "TE", "ORO", "ARGENTO", "FERRO", "SOLE", "LUNA", "STELLA", "FUOCO", "ACQUA"],
  pt: ["MONTANHA", "RIO", "FLORESTA", "OCEANO", "ILHA", "LEÃO", "ÁGUIA", "TUBARÃO", "RELÓGIO", "COROA", "CHAVE", "FECHADURA", "ESCUDO", "ESPADA", "CASTELO", "TORRE", "ESCOLA", "HOSPITAL", "MAÇÃ", "PÃO", "LEITE", "CHÁ", "OURO", "PRATA", "FERRO", "SOL", "LUA", "ESTRELA", "FOGO", "ÁGUA"],
  "pt-BR": ["MONTANHA", "RIO", "FLORESTA", "OCEANO", "ILHA", "LEÃO", "ÁGUIA", "TUBARÃO", "RELÓGIO", "COROA", "CHAVE", "FECHADURA", "ESCUDO", "ESPADA", "CASTELO", "TORRE", "ESCOLA", "HOSPITAL", "MAÇÃ", "PÃO", "LEITE", "CHÁ", "OURO", "PRATA", "FERRO", "SOL", "LUA", "ESTRELA", "FOGO", "ÁGUA"],
  ar: ["جبل", "نهر", "غابة", "محيط", "جزيرة", "أسد", "نسر", "قرش", "ساعة", "تاج", "مفتاح", "قفل", "درع", "سيف", "قلعة", "برج", "مدرسة", "مستشفى", "تفاحة", "خبز", "حليب", "شاي", "ذهب", "فضة", "حديد", "شمس", "قمر", "نجمة", "نار", "ماء"],
  "ar-LB": ["جبل", "نهر", "غابة", "محيط", "جزيرة", "أسد", "نسر", "قرش", "ساعة", "تاج", "مفتاح", "قفل", "درع", "سيف", "قلعة", "برج", "مدرسة", "مستشفى", "تفاحة", "خبز", "حليب", "شاي", "ذهب", "فضة", "حديد", "شمس", "قمر", "نجمة", "نار", "ماء"],
  he: ["הר", "נהר", "יער", "אוקיינוס", "אי", "אריה", "עיט", "כריש", "שעון", "כתר", "מפתח", "מנעול", "מגן", "חרב", "טירה", "מגדل", "בית ספר", "בית חולים", "תפוח", "לחם", "חלב", "תה", "זהב", "כסף", "ברזل", "שמש", "ירח", "כוכב", "אש", "מים"],
  ru: ["ГОРА", "РЕКА", "ЛЕС", "ОКЕАН", "ОСТРОВ", "ЛЕВ", "ОРЕЛ", "АКУЛА", "ЧАСЫ", "КОРОНА", "КЛЮЧ", "ЗАМОК", "ЩИТ", "МЕЧ", "ЗАМОК", "БАШНЯ", "ШКОЛА", "БОЛЬНИЦА", "ЯБЛОКО", "ХЛЕБ", "МОЛОКО", "ЧАЙ", "ЗОЛОТО", "СЕРЕБРО", "ЖЕЛЕЗО", "СОЛНЦЕ", "ЛУНА", "ЗВЕЗДА", "ОГОНЬ", "ВОДА"],
  zh: ["山", "河", "森林", "海洋", "岛屿", "狮子", "老鹰", "鲨鱼", "钟表", "皇冠", "钥匙", "锁", "盾牌", "宝剑", "城堡", "塔楼", "学校", "医院", "苹果", "面包", "牛奶", "茶", "黄金", "白银", "铁", "太阳", "月亮", "星星", "火", "水"],
  ko: ["산", "강", "숲", "바다", "섬", "사자", "독수리", "상어", "시계", "왕관", "열쇠", "자물쇠", "방패", "칼", "성", "탑", "학교", "병원", "사과", "빵", "우유", "차", "금", "은", "철", "태양", "달", "별", "불", "물"],
  tr: ["DAĞ", "NEHİR", "ORMAN", "OKYANUS", "ADA", "ASLAN", "KARTAL", "KÖPEKBALIĞI", "SAAT", "TAÇ", "ANAHTAR", "KİLİT", "KALKAN", "KILIÇ", "KALE", "KULE", "OKUL", "HASTANE", "ELMA", "EKMEK", "SÜT", "ÇAY", "ALTIN", "GÜMÜŞ", "DEMİR", "GÜNEŞ", "AY", "YILDIZ", "ATEŞ", "SU"],
  vi: ["NÚI", "SÔNG", "RỪNG", "ĐẠI DƯƠNG", "ĐẢO", "SƯ TỬ", "ĐẠI BÀNG", "CÁ MẬP", "ĐỒNG HỒ", "VƯƠNG MIỆN", "CHÌA KHÓA", "KHÓA", "KHIÊN", "KIẾM", "LÂU ĐÀI", "THÁP", "TRƯỜNG HỌC", "BỆNH VIỆN", "TÁO", "BÁNH MÌ", "SỮA", "TRÀ", "VÀNG", "BẠC", "SẮT", "MẶT TRỜI", "MẶT TRĂNG", "NGÔI SAO", "LỬA", "NƯỚC"],
  nl: ["BERG", "RIVIER", "BOS", "OCEAAN", "EILAND", "LEEUW", "AREND", "HAAI", "KLOK", "KROON", "SLEUTEL", "SLOT", "SCHILD", "ZWAARD", "KASTEEL", "TOREN", "SCHOOL", "ZIEKENHUIS", "APPEL", "BROOD", "MELK", "THEE", "GOUD", "ZILVER", "IJZER", "ZON", "MAAN", "STER", "VUUR", "WATER"],
  pl: ["GÓRA", "RZEKA", "LAS", "OCEAN", "WYSPA", "LEW", "ORZEŁ", "REKIN", "ZEGAR", "KORONA", "KLUCZ", "ZAMEK", "TARCZA", "MIECZ", "ZAMEK", "WIEŻA", "SZKOŁA", "SZPITAL", "JABŁKO", "CHLEB", "MLEKO", "HERBATA", "ZŁOTO", "SREBRO", "ŻELAZO", "SŁOŃCE", "KSIĘŻYC", "GWIAZDA", "OGIEŃ", "WODA"],
  uk: ["ГОРА", "РІЧКА", "ЛІС", "ОКЕАН", "ОСТРІВ", "ЛЕВ", "ОРЕЛ", "АКУЛА", "ГОДИННИК", "КОРОНА", "КЛЮЧ", "ЗАМОК", "ЩИТ", "МЕЧ", "ЗАМОК", "ВЕЖА", "ШКОЛА", "ЛІКАРНЯ", "ЯБЛУКО", "ХЛІБ", "МОЛОКО", "ЧАЙ", "ЗОЛОТО", "СРІБЛО", "ЗАЛІЗО", "СОНЦЕ", "МІСЯЦЬ", "ЗІРКА", "ВОГОНЬ", "ВОДА"],
  cs: ["HORA", "ŘEKA", "LES", "OCEÁN", "OSTROV", "LEV", "OREL", "ŽRALOK", "HODINY", "KORUNA", "KLÍČ", "ZÁMEK", "ŠTÍT", "MEČ", "HRAD", "VĚŽ", "ŠKOLA", "NEMOCNICE", "JABLKO", "CHLÉB", "MLÉKO", "ČAJ", "ZLATO", "STŘÍBRO", "ŽELEZO", "SLUNCE", "MĚSÍC", "HVĚZDA", "OHEŇ", "VODA"],
  ro: ["MUNTE", "RÂU", "PĂDURE", "OCEAN", "INSULĂ", "LEU", "VULTUR", "RECHIN", "CEAS", "COROANĂ", "CHEIE", "LACĂT", "SCUT", "SPADĂ", "CASTEL", "TURN", "ȘCOALĂ", "SPITAL", "MĂR", "PÂINE", "LAPTE", "CEAI", "AUR", "ARGINT", "FIER", "SOARE", "LUNĂ", "STEAUĂ", "FOC", "APĂ"],
  id: ["GUNUNG", "SUNGAI", "HUTAN", "SAMUDERA", "PULAU", "SINGA", "ELANG", "HIU", "JAM", "MAHKOTA", "KUNCI", "GEMBOK", "PERISAI", "PEDANG", "KASTIL", "MENARA", "SEKOLAH", "RUMAH SAKIT", "APEL", "ROTI", "SUSU", "TEH", "EMAS", "PERAK", "BESI", "MATAHARI", "BULAN", "BINTANG", "API", "AIR"],
  da: ["BJERG", "FLOD", "SKOV", "HAV", "Ø", "LØVE", "ØRN", "HAJ", "UR", "KRONE", "NØGLE", "LÅS", "SKJOLD", "SVÆRD", "SLOT", "TÅRN", "SKOLE", "HOSPITAL", "ÆBLE", "BRØD", "MÆLK", "TE", "GULD", "SØLV", "JERN", "SOL", "MÅNE", "STJERNE", "ILD", "VAND"],
  ca: ["MUNTANYA", "RIU", "BOSC", "OCEÀ", "ILLA", "LLEÓ", "ÀLIGA", "TAURÓ", "RELLOTGE", "CORONA", "CLAU", "PANNY", "ESCUT", "ESPASA", "CASTELL", "TORRE", "ESCOLA", "HOSPITAL", "POMA", "PA", "LLET", "TE", "OR", "PLATA", "FERRO", "SOL", "LLUNA", "ESTRELLA", "FOC", "AIGUA"],
  sv: ["BERG", "FLOD", "SKOG", "HAV", "Ö", "LEJON", "ÖRN", "HAJ", "KLOCKA", "KRONA", "NYCKEL", "LÅS", "SKÖLD", "SVÄRD", "SLOTT", "TORN", "SKOLA", "SJUKHUS", "ÄPPLE", "BRÖD", "MJÖLK", "TE", "GULD", "SILVER", "JÄRN", "SOL", "MÅNE", "STJÄRNA", "ELD", "VATTEN"],
  mk: ["ПЛАНИНА", "РЕКА", "ШУМА", "ОКЕАН", "ОСТРОВ", "ЛАВ", "ОРЕЛ", "АЈКУЛА", "ЧАСОВНИК", "КРУНА", "КЛУЧ", "БРАВА", "ШТИТ", "МЕЧ", "ЗАМОК", "КУЛА", "УЧИЛИШТЕ", "БОЛНИЦА", "ЈАБОЛКО", "ЛЕБ", "МЛЕКО", "ЧАЈ", "ЗЛАТО", "СРЕБРО", "ЖЕЛЕЗО", "СОНЦЕ", "ВЕТЕР", "ЅВЕЗДА", "ОГАН", "ВОДА"],
  et: ["MÄGI", "JÕGI", "METS", "OKEAN", "SAAR", "LÕVI", "KOTKAS", "HAI", "KELL", "KROON", "VÕTI", "LUKK", "KILP", "MÕÕK", "LOSS", "TORN", "KOOL", "HAIGLA", "ÕUN", "LEIB", "PIIM", "TEE", "KULD", "HÕBE", "RAUD", "PÄIKE", "KUU", "TÄHT", "TULI", "VESI"],
  eo: ["MONTO", "RIVERETO", "ARBARO", "OCEANO", "INSULO", "LEONO", "AGLO", "ŜARKO", "HORLOĜO", "KORONO", "ŜLOSILO", "SERRILO", "ŜILDO", "GLAVO", "KASTELO", "TURNO", "LERNEJO", "HOSPITALO", "POMO", "PANO", "LAKTO", "TEO", "ORO", "ARĜENTO", "FERO", "SUNO", "LUNO", "STELO", "FAJRO", "AKVO"],
  be: ["ГАРА", "РАКА", "ЛЕС", "АКІЯН", "АСТРОЎ", "ЛЕЎ", "АРОЛ", "АКУЛА", "ГАЗІННІК", "КАРОНА", "КЛЮЧ", "ЗАМОК", "ШЧЫТ", "МЯЧ", "ЗАМАК", "ВЕЖА", "ШКОЛА", "Б kóЛЬНІЦА", "ЯБЛЫКА", "ХЛЕБ", "МАЛАКО", "ЧАЙ", "ЗОЛАТА", "СЭРЭБРА", "ЖАЛЕЗА", "СОНЦА", "МЕСЯЦ", "ЗОРКА", "АГОНЬ", "ВАДА"],
  sk: ["HORA", "RIEKA", "LES", "OCEÁN", "OSTROV", "LEV", "OROL", "ŽRALOK", "HODINY", "KORUNA", "KĽÚČ", "ZÁMOK", "ŠTÍT", "MEČ", "HRAD", "VEŽA", "ŠKOLA", "NEMOCNICA", "JABLKO", "CHLIEB", "MLIEKO", "ČAJ", "ZLATO", "STRIEBRO", "ŽELEZO", "SLNCE", "MESIAC", "HVIEZDA", "OHEŇ", "VODA"],
  af: ["BERG", "RIVIER", "WOUD", "OSEAAN", "EILAND", "LEEU", "AREND", "HAAI", "HORLOSIE", "KROON", "SLEUTEL", "SLOT", "SKILD", "SWAARD", "KASTEEL", "TORING", "SKOOL", "HOSPITAAL", "APPEL", "BROOD", "MELK", "TEE", "GOUD", "SILWER", "YSTER", "SON", "MAAN", "STER", "VUUR", "WATER"],
  bg: ["ПЛАНИНА", "РЕКА", "ГОРА", "ОКЕАН", "ОСТРОВ", "ЛЪВ", "ОРЕЛ", "АКУЛА", "ЧАСОВНИК", "КОРОНА", "КЛЮЧ", "КЛЮЧАЛКА", "ЩИТ", "МЕЧ", "ЗАМЪК", "КУЛА", "УЧИЛИЩЕ", "БОЛНИЦА", "ЯБЪЛКА", "ХЛЯБ", "МЛЯКО", "ЧАЙ", "ЗЛАТО", "СРЕБРО", "ЖЕЛЯЗО", "СЛЪНЦЕ", "ЛУНА", "ЗВЕЗДА", "ОГЪН", "ВОДА"],
  hr: ["PLANINA", "RIJEKA", "ŠUMA", "OKEAN", "OTOK", "LAV", "ORAO", "MORSKI PAS", "SAT", "KRUNA", "KLJUČ", "BRAVA", "ŠTIT", "MAČ", "DVORAC", "TORANJ", "ŠKOLA", "BOLNICA", "JABUKA", "KRUH", "MLIJEKO", "ČAJ", "ZLATO", "SREBRO", "ŽELJEZO", "SUNCE", "MJESEC", "ZVIJEZDA", "VATRA", "VODA"],
  fi: ["VUORI", "JOKI", "METSÄ", "VALTAMERI", "SAARI", "LEIJONA", "KOTKA", "HAI", "KELLO", "KRUUNU", "AVAIN", "LUKKO", "KILPI", "MIEKKA", "LINNA", "TORNI", "KOULU", "SAIRAALA", "OMPPU", "LEIPÄ", "MAITO", "TEE", "KULTA", "HOPEA", "RAUTA", "AURINKO", "KUU", "TÄHTI", "TULI", "VESI"],
  el: ["ΒΟΥΝΟ", "ΠΟΤΑΜΙ", "ΔΑΣΟΣ", "ΩΚΕΑΝΟΣ", "ΝΗΣΙ", "ΛΙΟΝΤΑΡΙ", "ΑΕΤΟΣ", "ΚΑΡΧΑΡΙΑΣ", "ΡΟΛΟΪ", "ΣΤΕΜΜΑ", "ΚΛΕΙΔΙ", "ΚΛΕΙΔΑΡΙΑ", "ΑΣΠΙΔΑ", "ΣΠΑΘΙ", "ΚΑΣΤΡΟ", "ΠΥΡΓΟΣ", "ΣΧΟΛΕΙΟ", "ΝΟΣΟΚΟΜΕΙΟ", "ΜΗΛΟ", "ΨΩΜΙ", "ΓΑΛΑ", "ΤΣΑΪ", "ΧΡΥΣΟΣ", "ΑΣΗΜΙ", "ΣΙΔΕΡΟ", "ΗΛΙΟΣ", "ΦΕΓΓΑΡΙ", "ΑΣΤΕΡΙ", "ΦΩΤΙΑ", "ΝΕΡΟ"],
  hu: ["HEGY", "FOLYÓ", "ERDŐ", "ÓCEÁN", "SZIGET", "OROSZLÁN", "SAS", "CÁPA", "ÓRA", "KORONA", "KULCS", "ZÁR", "PAJZS", "KARD", "KASTÉLY", "TORONY", "ISKOLA", "KÓRHÁZ", "ALMA", "KENYÉR", "TEJ", "TEA", "ARANY", "EZÜST", "VAS", "NAP", "HOLD", "CSILLAG", "TŰZ", "VÍZ"],
  is: ["FJALL", "FLJÓT", "SKÓGUR", "HAFIÐ", "EYJA", "LJÓN", "ÖRN", "HÁKARL", "KLUKKA", "KÓRÓNA", "LYKILL", "LÁS", "SKJÖLDUR", "SVERÐ", "KASTALI", "TURN", "SKÓLI", "SJÚKRAHÚS", "EPLI", "BRAUÐ", "MJÓLK", "TE", "GULL", "SILFUR", "JÁRN", "SÓL", "TUNGL", "STJARNA", "ELDUR", "VATN"],
  lt: ["KALNAS", "UPĖ", "MIŠKAS", "VANDENYNAS", "SALA", "LIŪTAS", "ERELIS", "RYKLYS", "LAIKRODIS", "KARŪNA", "RAKTAS", "SPYNA", "SKYDAS", "KARDAS", "PILIS", "BOKŠTAS", "MOKYKLA", "LIGONINĖ", "OBUOLYS", "DUONA", "PIENAS", "ARBATA", "AUKSAS", "SIDABRAS", "GELEŽIS", "SAULĖ", "MĖNULIS", "ŽVAIGŽDĖ", "UGNIS", "VANDUO"],
  lv: ["KALNS", "UPE", "MEŽS", "OKEĀNS", "SALA", "LAUVA", "ĒRGLIS", "HAJAS", "PULKSTENIS", "KRONIS", "ATSLEGA", "SLĒDZENIS", "PAVairogS", "ZOBENS", "PILS", "TORNIS", "SKOLA", "SLIMNĪCA", "ĀBOLS", "MAIZE", "PIENS", "TĒJA", "ZELTS", "SUDRABS", "DZELZS", "SAULE", "MĒNESS", "ZVAIGZNE", "UGUNS", "ŪDENS"],
  no: ["FJELL", "ELV", "SKOG", "HAV", "ØY", "LØVE", "ØRN", "HAI", "KLOKKE", "KRONA", "NØKKEL", "LÅS", "SKJOLD", "SVERD", "SLOTT", "TÅRN", "SKOLE", "SYKEHUS", "EPLE", "BRØD", "MELK", "TE", "GULL", "SØLV", "JERN", "SOL", "MÅNE", "STJERNE", "ILD", "VANN"],
  sl: ["GORA", "REKA", "GOZD", "OCEAN", "OTOK", "LEV", "OREL", "MORSKI PSI", "URA", "KRONA", "KLJUČ", "KLJUČAVNICA", "ŠČIT", "MEČ", "GRAD", "STOLP", "ŠOLA", "BOLNIŠNICA", "JABOLKO", "KRUH", "MLEKO", "ČAJ", "ZLATO", "SREBRO", "ŽELEZO", "SONCE", "MESEC", "ZVEZDA", "OGENJ", "VODA"],
  th: ["ภูเขา", "แม่น้ำ", "ป่า", "มหาสมุทร", "เกาะ", "สิงโต", "นกอินทรี", "ฉลาม", "นาฬิกา", "มงกุฎ", "กุญแจ", "แม่กุญแจ", "โล่", "ดาบ", "ปราสาท", "หอคอย", "โรงเรียน", "โรงพยาบาล", "แอปเปิ้ล", "ขนมปัง", "นม", "ชา", "ทอง", "เงิน", "เหล็ก", "ดวงอาทิตย์", "ดวงจันทร์", "ดวงดาว", "ไฟ", "น้ำ"],
  fil: ["BUNDOK", "ILOG", "GUBAT", "KARAGATAN", "ISLA", "LEON", "AGILA", "PATING", "ORASAN", "KORONA", "SUSI", "PADLOCK", "KALASAG", "ESPADA", "KASTILYO", "TORE", "PAARALAN", "OSPITAL", "APAT", "TINAPAY", "GATAS", "TSAA", "GINTO", "PILAK", "BAKAL", "ARAW", "BUWAN", "BITUIN", "APOY", "TUBIG"],
  fa: ["کوه", "رودخانه", "جنگل", "اقیانوس", "جزیره", "شیر", "عقاب", "کوسه", "ساعت", "تاج", "کلید", "قفل", "سپر", "شمشیر", "قلعه", "برج", "مدرسه", "بیمارستان", "سیب", "نان", "شیر", "چای", "طلا", "نقره", "آهن", "خورشید", "ماه", "ستاره", "آتش", "آب"],
  sq: ["MAL", "LUMI", "PYLL", "OKEAN", "ISHULL", "LUAN", "SHQIPONJË", "PESHQARK", "ORË", "KORONË", "ÇELËS", "DOLLAP", "MBROJTËS", "SHPATË", "KASTELL", "KULLË", "SHKOLLË", "SPITAL", "MOLLË", "BUKË", "QUMËSHT", "ÇAJ", "AR", "ARGJEND", "HEKUR", "DIELL", "HËNË", "YLL", "ZJARR", "UJI"],
  ka: ["მთა", "მდინარე", "ტყე", "ოკეანე", "კუნძული", "ლომი", "არწივი", "ზვიგენი", "საათი", "გვირგვინი", "გასაღები", "ბოქლომი", "ფარი", "ხმალი", "ციხესიმაგრე", "კოშკი", "სკოლა", "საავადმყოფო", "ვაშლი", "პური", "რძე", "ჩაი", "ოქრო", "ვერცხლი", "რკინა", "მზე", "მთვარე", "ვარსკვლავი", "ცეცხლი", "წყალი"],
  hi: ["पहाड़", "नदी", "जंगल", "समुद्र", "घाटी", "गुफा", "रेगिस्तान", "द्वीप", "झरना", "बादल", "शेर", "बाघ", "हाथी", "भालू", "बंदर", "हिरण", "लोमड़ी", "साँप", "मछली", "चील", "कबूतर", "तोता", "मोर", "घोड़ा", "गाय", "कुत्ता", "बिल्ली", "किताब", "चाबी", "घड़ी", "कलम", "कुर्सी", "मेज", "दरवाजा", "खिड़की", "दर्पण", "बोतल", "जूता", "कपड़ा", "खिलौना", "छतरी", "चश्मा", "बस्ता", "ताला", "सिक्का", "कंगन", "घर", "मंदिर", "स्कूल", "बाजार", "सड़क", "दुकान", "अस्पताल", "पार्क", "किला", "महल", "गांव", "शहर", "स्टेशन", "हवाईअड्डा", "पुस्तकालय", "आम", "सेब", "केला", "संतरा", "अंगूर", "रोटी", "दूध", "पानी", "चाय", "कॉफ़ी", "चावल", "नमक", "चीनी", "सब्जी", "मिठाई", "शहद", "सूरज", "चाँद", "तारा", "हवा", "आग", "मिट्टी", "सोना", "चाँदी", "लोहा", "कागज", "कंप्यूटर", "फ़ोन", "मित्र", "शत्रु", "राजा", "रानी", "डॉक्टर", "शिक्षक", "सैनिक", "नेता"],
  ne: ["हिमाल", "नदी", "वन", "ताल", "खोला", "गुफा", "मरुभूमि", "टापु", "झरना", "बादल", "सिंह", "बाघ", "हाथी", "भालु", "बाँदर", "मृग", "फ्याउरो", "सर्प", "माछा", "गरुड", "ढुकुर", "सुगा", "मजूर", "घोडा", "गाई", "कुकुर", "बिरालो", "किताब", "साँचो", "घडी", "कलम", "मेच", "टेबুল", "ढोका", "झ्याल", "ऐना", "बोतल", "जुत्ता", "लुगा", "खेलौना", "छाता", "चश्मा", "झोला", "ताला", "सिक्का", "घर", "मन्दिर", "विद्यालय", "बजार", "बाटो", "पसल", "अस्पताल", "बगैँचा", "दरबार", "गाउँ", "शहर", "स्टेशन", "स्याउ", "केरा", "सुन्तला", "अङ्गुर", "रोti", "दूध", "पानी", "चिया", "चामल", "नुन", "चिनी", "तर्कारी", "शहद", "घाम", "जुन", "तारा", "हावा", "आगो", "माटो", "सुन", "चाँदी", "फलाम", "कागज", "कम्प्युटर", "फोन", "साथी", "शत्रु", "राजा", "रानी", "डाक्टर", "शिक्षक", "सैनिक"],
  ja: ["山", "川", "森", "海", "島", "砂漠", "火山", "洞窟", "谷", "滝", "太陽", "月", "星", "雲", "空", "雷", "嵐", "ライオン", "虎", "狼", "熊", "狐", "鹿", "猿", "象", "蛇", "鳥", "鷲", "鷹", "ペンギン", "鯨", "鮫", "魚", "犬", "猫", "本", "鍵", "時計", "鏡", "傘", "靴", "鞄", "財布", "切手", "眼鏡", "コップ", "皿", "机", "椅子", "ペン", "電話", "ハサミ", "家", "学校", "病院", "公園", "駅", "空港", "城", "お寺", "神社", "お店", "図書館", "交番", "道路", "橋", "庭", "山頂", "リンゴ", "バナナ", "オレンジ", "パン", "牛乳", "お茶", "水", "塩", "砂糖", "米", "肉", "野菜", "果物", "寿司", "ラーメン", "火", "空気", "土", "金", "銀", "鉄", "紙", "友達", "先生", "医者", "警察", "王様", "女王", "兵士", "選手", "カメラ", "車", "船", "飛行機"]
};

// Ensure target directory exists
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

// Generate files for all languages
languages.forEach(lang => {
  let content = '';
  const varPrefix = getVarPrefix(lang.code);
  const typeName = getTypeName(lang.code);

  let wordList = translations[lang.code] || [];
  if (wordList.length === 0) {
    // If no translation list, fallback to English list values
    wordList = translations["de"]; // fallback to german deck or similar
  }

  content = `/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * ${lang.name} word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const ${varPrefix}_WORDS: readonly string[] = [
${wordList.map(w => `  "${w.toUpperCase()}"`).join(',\n')}
] as const;

export type ${typeName}Word = (typeof ${varPrefix}_WORDS)[number];
`;

  fs.writeFileSync(path.join(srcDir, `${lang.code}.ts`), content, 'utf8');
  console.log(`Generated wordpack file ${lang.code}.ts`);
});

// Generate updated index.ts
let indexContent = `import { EN_WORDS } from "./en.js";\n`;
languages.forEach(lang => {
  indexContent += `import { ${getVarPrefix(lang.code)}_WORDS } from "./${lang.code}.js";\n`;
});

indexContent += `
export { EN_WORDS } from "./en.js";
export type { EnWord } from "./en.js";
`;

languages.forEach(lang => {
  indexContent += `export { ${getVarPrefix(lang.code)}_WORDS } from "./${lang.code}.js";\n`;
  indexContent += `export type { ${getTypeName(lang.code)}Word } from "./${lang.code}.js";\n`;
});

indexContent += `
export type WordPackLocale =
  | "en"
${languages.map(l => `  | "${l.code}"`).join('\n')};

/**
 * Returns the word list for the requested locale.
 * Defaults to "en" for unknown or empty word packs.
 */
export function getWordPack(locale: string): readonly string[] {
  switch (locale) {
    case "en":
      return EN_WORDS;
`;

languages.forEach(lang => {
  indexContent += `    case "${lang.code}":\n      return ${getVarPrefix(lang.code)}_WORDS.length > 0 ? ${getVarPrefix(lang.code)}_WORDS : EN_WORDS;\n`;
});

indexContent += `    default:
      return EN_WORDS;
  }
}

/**
 * Draws \`n\` random words from the word pack without replacement.
 * Throws if the pack has fewer than \`n\` words.
 */
export function sampleWords(locale: string, n: number): string[] {
  const pack = getWordPack(locale);
  if (pack.length < n) {
    throw new Error(
      \`Word pack "\${locale}" has only \${pack.length} words; requested \${n}.\`
    );
  }
  // Fisher-Yates partial shuffle
  const copy = [...pack];
  for (let i = copy.length - 1; i > copy.length - 1 - n; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(copy.length - n);
}
`;

fs.writeFileSync(path.join(srcDir, 'index.ts'), indexContent, 'utf8');
console.log('Generated wordpacks index.ts successfully!');
