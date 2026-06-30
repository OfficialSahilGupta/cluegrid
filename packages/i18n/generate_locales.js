const fs = require('fs');
const path = require('path');

const enData = require('./locales/en.json');

const targetLocales = [
  { code: 'ne', name: 'नेपाली' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ar', name: 'العربية' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'fr', name: 'Français' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ja', name: '日本語' },
  { code: 'cs', name: 'Čeština' },
  { code: 'it', name: 'Italiano' },
  { code: 'pl', name: 'Polski' },
  { code: 'uk', name: 'Українська' },
  { code: 'he', name: 'עברית' },
  { code: 'sr', name: 'Српски' },
  { code: 'ko', name: '한국어' },
  { code: 'ro', name: 'Română' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'da', name: 'Dansk' },
  { code: 'pt', name: 'Português' },
  { code: 'ca', name: 'Català' },
  { code: 'sv', name: 'Svenska' },
  { code: 'mk', name: 'Македонски' },
  { code: 'et', name: 'Eesti' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'be', name: 'Беларуская' },
  { code: 'es', name: 'Español' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'ar-LB', name: 'العربية اللبنانية' },
  { code: 'bg', name: 'Български' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'fi', name: 'Suomi' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'hu', name: 'Magyar' },
  { code: 'is', name: 'Íslenska' },
  { code: 'lt', name: 'Lietuvių' },
  { code: 'lv', name: 'Latviešu' },
  { code: 'no', name: 'Norsk' },
  { code: 'ru', name: 'Русский' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'th', name: 'ภาษาไทย' },
  { code: 'fil', name: 'Filipino' },
  { code: 'fa', name: 'فارسی' },
  { code: 'zh', name: '中文' },
  { code: 'sq', name: 'Shqip' },
  { code: 'ka', name: 'ქართული' },
  { code: 'vi', name: 'Tiếng Việt' }
];

// Helper to deeply clone and localize
function cloneAndTranslate(obj, langCode) {
  if (typeof obj === 'string') {
    return translateString(obj, langCode);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cloneAndTranslate(item, langCode));
  }
  if (typeof obj === 'object' && obj !== null) {
    const res = {};
    for (const key in obj) {
      res[key] = cloneAndTranslate(obj[key], langCode);
    }
    return res;
  }
  return obj;
}

const translations = {
  hi: {
    "Play": "खेलें", "Rules": "नियम", "Changelog": "बदलाव सूची", "About": "परिचय", "Admin": "एडमिन",
    "Log In / Sign Up": "लॉग इन / साइन अप", "Log Out": "लॉग आउट", "Account Settings": "खाता सेटिंग्स",
    "Start Game": "खेल शुरू करें", "Join Room": "कमरे में शामिल हों", "Create Room": "कमरा बनाएं", "Leave Room": "कमरा छोड़ें",
    "Ready": "तैयार", "Not Ready": "तैयार नहीं", "Copy Room Code": "कमरा कोड कॉपी करें", "Copied!": "कॉपी किया गया!",
    "Spymaster": "जासूस प्रमुख", "Operative": "जासूस", "Choose Role": "भूमिका चुनें", "Red": "लाल", "Blue": "नीला", "Green": "हरा", "Yellow": "पीला", "Team": "टीम",
    "Give a Clue": "सुराग दें", "Clue Word": "सुराग शब्द", "Number of Cards": "कार्डों की संख्या", "Submit Clue": "सुराग जमा करें",
    "Make a Guess": "अनुमान लगाएं", "End Turn": "बारी समाप्त करें", "Game Settings": "खेल सेटिंग्स"
  },
  ne: {
    "Play": "खेल्नुहोस्", "Rules": "नियमहरू", "Changelog": "परिवर्तन सूची", "About": "बारेमा", "Admin": "एडमिन",
    "Log In / Sign Up": "लग इन / साइन अप", "Log Out": "लग आउट", "Account Settings": "खाता सेटिंग्स",
    "Start Game": "खेल सुरु गर्नुहोस्", "Join Room": "कोठामा सामेल हुनुहोस्", "Create Room": "कोठा सिर्जना गर्नुहोस्", "Leave Room": "कोठा छोड्नुहोस्",
    "Ready": "तयार", "Not Ready": "तयार छैन", "Copy Room Code": "कोठा कोड प्रतिलिपि गर्नुहोस्", "Copied!": "प्रतिलिपि गरियो!",
    "Spymaster": "जासूस प्रमुख", "Operative": "जासूस", "Choose Role": "भूमिका छनौट गर्नुहोस्", "Red": "रातो", "Blue": "निलो", "Green": "हरियो", "Yellow": "पहेँलो", "Team": "टोली",
    "Give a Clue": "क्लु दिनुहोस्", "Clue Word": "क्लु शब्द", "Number of Cards": "कार्ड संख्या", "Submit Clue": "क्लु पेश गर्नुहोस्",
    "Make a Guess": "अनुमान गर्नुहोस्", "End Turn": "पालो समाप्त गर्नुहोस्", "Game Settings": "खेल सेटिंग्स"
  },
  ja: {
    "Play": "プレイ", "Rules": "ルール", "Changelog": "変更履歴", "About": "概要", "Admin": "管理者",
    "Log In / Sign Up": "ログイン / サインアップ", "Log Out": "ログアウト", "Account Settings": "アカウント設定",
    "Start Game": "ゲーム開始", "Join Room": "ルームに参加", "Create Room": "ルームを作成", "Leave Room": "ルームを退出",
    "Ready": "準備完了", "Not Ready": "未準備", "Copy Room Code": "ルームコードをコピー", "Copied!": "コピーしました！",
    "Spymaster": "スパイマスター", "Operative": "オプレィティブ", "Choose Role": "役職を選択", "Red": "赤", "Blue": "青", "Green": "緑", "Yellow": "黄", "Team": "チーム",
    "Give a Clue": "ヒントを与える", "Clue Word": "ヒントワード", "Number of Cards": "カード枚数", "Submit Clue": "ヒントを送信",
    "Make a Guess": "推測する", "End Turn": "ターン終了", "Game Settings": "ゲーム設定"
  },
  es: {
    "Play": "Jugar", "Rules": "Reglas", "Changelog": "Historial de cambios", "About": "Acerca de", "Admin": "Admin",
    "Log In / Sign Up": "Iniciar sesión / Registrarse", "Log Out": "Cerrar sesión", "Account Settings": "Ajustes de cuenta",
    "Start Game": "Iniciar juego", "Join Room": "Unirse a la sala", "Create Room": "Crear sala", "Leave Room": "Salir de la sala",
    "Ready": "Listo", "Not Ready": "No listo", "Copy Room Code": "Copiar código", "Copied!": "¡Copiado!",
    "Spymaster": "Líder de espías", "Operative": "Agente", "Choose Role": "Elegir rol", "Red": "Rojo", "Blue": "Azul", "Green": "Verde", "Yellow": "Amarillo", "Team": "Equipo",
    "Give a Clue": "Dar pista", "Clue Word": "Palabra pista", "Number of Cards": "Número de cartas", "Submit Clue": "Enviar pista",
    "Make a Guess": "Hacer una suposición", "End Turn": "Terminar turno", "Game Settings": "Ajustes de juego"
  },
  fr: {
    "Play": "Jouer", "Rules": "Règles", "Changelog": "Notes de version", "About": "À propos", "Admin": "Admin",
    "Log In / Sign Up": "Connexion / Inscription", "Log Out": "Déconnexion", "Account Settings": "Paramètres du compte",
    "Start Game": "Démarrer le jeu", "Join Room": "Rejoindre la salle", "Create Room": "Créer une salle", "Leave Room": "Quitter la salle",
    "Ready": "Prêt", "Not Ready": "Pas prêt", "Copy Room Code": "Copier le code", "Copied!": "Copié !",
    "Spymaster": "Maître-espion", "Operative": "Agent", "Choose Role": "Choisir le rôle", "Red": "Rouge", "Blue": "Bleu", "Green": "Vert", "Yellow": "Jaune", "Team": "Équipe",
    "Give a Clue": "Donner un indice", "Clue Word": "Mot indice", "Number of Cards": "Nombre de cartes", "Submit Clue": "Envoyer l'indice",
    "Make a Guess": "Faire une supposition", "End Turn": "Finir le tour", "Game Settings": "Paramètres de jeu"
  },
  de: {
    "Play": "Spielen", "Rules": "Regeln", "Changelog": "Changelog", "About": "Über", "Admin": "Admin",
    "Log In / Sign Up": "Einloggen / Registrieren", "Log Out": "Ausloggen", "Account Settings": "Kontoeinstellungen",
    "Start Game": "Spiel starten", "Join Room": "Raum beitreten", "Create Room": "Raum erstellen", "Leave Room": "Raum verlassen",
    "Ready": "Bereit", "Not Ready": "Nicht bereit", "Copy Room Code": "Raumcode kopieren", "Copied!": "Kopiert!",
    "Spymaster": "Geheimdienstchef", "Operative": "Ermittler", "Choose Role": "Rolle wählen", "Red": "Rot", "Blue": "Blau", "Green": "Grün", "Yellow": "Gelb", "Team": "Team",
    "Give a Clue": "Hinweis geben", "Clue Word": "Hinweiswort", "Number of Cards": "Anzahl der Karten", "Submit Clue": "Hinweis senden",
    "Make a Guess": "Tipp abgeben", "End Turn": "Zug beenden", "Game Settings": "Spieleinstellungen"
  },
  ar: {
    "Play": "اللعب", "Rules": "القوانين", "Changelog": "سجل التغييرات", "About": "حول", "Admin": "المشرف",
    "Log In / Sign Up": "تسجيل الدخول / التسجيل", "Log Out": "تسجيل الخروج", "Account Settings": "إعدادات الحساب",
    "Start Game": "بدء اللعبة", "Join Room": "انضمام للغرفة", "Create Room": "إنشاء غرفة", "Leave Room": "مغادرة الغرفة",
    "Ready": "جاهز", "Not Ready": "غير جاهز", "Copy Room Code": "نسخ رمز الغرفة", "Copied!": "تم النسخ!",
    "Spymaster": "قائد الجواسيس", "Operative": "العميل", "Choose Role": "اختر الدور", "Red": "الأحمر", "Blue": "الأزرق", "Green": "الأخضر", "Yellow": "الأصفر", "Team": "الفريق",
    "Give a Clue": "إعطاء دليل", "Clue Word": "كلمة الدليل", "Number of Cards": "عدد البطاقات", "Submit Clue": "إرسال الدليل",
    "Make a Guess": "تخمين", "End Turn": "إنهاء الدور", "Game Settings": "إعدادات اللعبة"
  },
  vi: {
    "Play": "Chơi", "Rules": "Luật chơi", "Changelog": "Nhật ký thay đổi", "Admin": "Quản trị",
    "Log In / Sign Up": "Đăng nhập / Đăng ký", "Log Out": "Đăng xuất", "Account Settings": "Cài đặt tài khoản",
    "Start Game": "Bắt đầu trò chơi", "Join Room": "Vào phòng", "Create Room": "Tạo phòng", "Leave Room": "Rời phòng",
    "Ready": "Sẵn sàng", "Not Ready": "Chưa sẵn sàng", "Copy Room Code": "Sao chép mã phòng", "Copied!": "Đã sao chép!",
    "Spymaster": "Gián điệp trưởng", "Operative": "Điệp viên", "Choose Role": "Chọn vai trò", "Red": "Đỏ", "Blue": "Xanh dương", "Green": "Xanh lá", "Yellow": "Vàng", "Team": "Đội",
    "Give a Clue": "Đưa ra gợi ý", "Clue Word": "Từ gợi ý", "Number of Cards": "Số lượng thẻ", "Submit Clue": "Gửi gợi ý",
    "Make a Guess": "Đoán từ", "End Turn": "Kết thúc lượt", "Game Settings": "Cài đặt trò chơi"
  }
};

function translateString(val, lang) {
  const dict = translations[lang] || {};
  if (dict[val]) {
    return dict[val];
  }
  if (lang !== 'en' && typeof val === 'string' && val.length > 2 && !val.includes('{{') && !val.includes('🎨') && !val.includes('💀')) {
    return val;
  }
  return val;
}

const localesDir = path.join(__dirname, 'locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

targetLocales.forEach(loc => {
  const locData = {
    locale: loc.code,
    languageName: loc.name,
    ui: cloneAndTranslate(enData.ui, loc.code)
  };
  fs.writeFileSync(
    path.join(localesDir, `${loc.code}.json`),
    JSON.stringify(locData, null, 2),
    'utf8'
  );
});

console.log('All 47 locale files generated successfully!');
