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
  { code: 'ka', name: 'Georgian' }
];

// Helper to convert locale code to upper PascalCase variable name prefix
function getVarPrefix(code) {
  return code.toUpperCase().replace('-', '_');
}

function getTypeName(code) {
  // e.g. pt-BR -> PtBr, ar-LB -> ArLb
  return code
    .split('-')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
}

// 1. Generate HI (Hindi) pilot pack
const hiWords = [
  // Nature
  "पहाड़", "नदी", "जंगल", "समुद्र", "घाटी", "गुफा", "रेगिस्तान", "द्वीप", "झरना", "बादल",
  // Animals
  "शेर", "बाघ", "हाथी", "भालू", "बंदर", "हिरण", "लोमड़ी", "साँप", "मछली", "चील", "कबूतर", "तोता", "मोर", "घोड़ा", "गाय", "कुत्ता", "बिल्ली",
  // Objects & Tools
  "किताब", "चाबी", "घड़ी", "कलम", "कुर्सी", "मेज", "दरवाजा", "खिड़की", "दर्पण", "बोतल", "जूता", "कपड़ा", "खिलौना", "छतरी", "चश्मा", "बस्ता", "ताला", "सिक्का", "कंगन",
  // Places & Structures
  "घर", "मंदिर", "स्कूल", "बाजार", "सड़क", "दुकान", "अस्पताल", "पार्क", "किला", "महल", "गांव", "शहर", "स्टेशन", "हवाईअड्डा", "पुस्तकालय",
  // Food
  "आम", "सेब", "केला", "संतरा", "अंगूर", "रोटी", "दूध", "पानी", "चाय", "कॉफ़ी", "चावल", "नमक", "चीनी", "सब्जी", "मिठाई", "शहद",
  // Science & Society
  "सूरज", "चाँद", "तारा", "हवा", "आग", "मिट्टी", "सोना", "चाँदी", "लोहा", "कागज", "कंप्यूटर", "फ़ोन", "मित्र", "शत्रु", "राजा", "रानी", "डॉक्टर", "शिक्षक", "सैनिक", "नेता"
];

// 2. Generate NE (Nepali) pilot pack
const neWords = [
  // Nature
  "हिमाल", "नदी", "वन", "ताल", "खोला", "गुफा", "मरुभूमि", "टापु", "झरना", "बादल",
  // Animals
  "सिंह", "बाघ", "हाथी", "भालु", "बाँदर", "मृग", "फ्याउरो", "सर्प", "माछा", "गरुड", "ढुकुर", "सुगा", "मजूर", "घोडा", "गाई", "कुकुर", "बिरालो",
  // Objects & Tools
  "किताब", "साँचो", "घडी", "कलम", "मेच", "टेबुल", "ढोका", "झ्याल", "ऐना", "बोतल", "जुत्ता", "लुगा", "खेलौना", "छाता", "चश्मा", "झोला", "ताला", "सिक्का",
  // Places & Structures
  "घर", "मन्दिर", "विद्यालय", "बजार", "बाटो", "पसल", "अस्पताल", "बगैँचा", "दरबार", "गाउँ", "शहर", "स्टेशन",
  // Food
  "स्याउ", "केरा", "सुन्तला", "अङ्गुर", "रोटी", "दूध", "पानी", "चिया", "चामल", "नुन", "चिनी", "तर्कारी", "शहद",
  // Science & Society
  "घाम", "जुन", "तारा", "हावा", "आगो", "माटो", "सुन", "चाँदी", "फलाम", "कागज", "कम्प्युटर", "फोन", "साथी", "शत्रु", "राजा", "रानी", "डाक्टर", "शिक्षक", "सैनिक"
];

// 3. Generate JA (Japanese) pilot pack
const jaWords = [
  // Nature
  "山", "川", "森", "海", "島", "砂漠", "火山", "洞窟", "谷", "滝", "太陽", "月", "星", "雲", "空", "雷", "嵐",
  // Animals
  "ライオン", "虎", "狼", "熊", "狐", "鹿", "猿", "象", "蛇", "鳥", "鷲", "鷹", "ペンギン", "鯨", "鮫", "魚", "犬", "猫",
  // Objects & Tools
  "本", "鍵", "時計", "鏡", "傘", "靴", "鞄", "財布", "切手", "眼鏡", "コップ", "皿", "机", "椅子", "ペン", "電話", "ハサミ",
  // Places & Structures
  "家", "学校", "病院", "公園", "駅", "空港", "城", "お寺", "神社", "お店", "図書館", "交番", "道路", "橋", "庭", "山頂",
  // Food
  "リンゴ", "バナナ", "オレンジ", "パン", "牛乳", "お茶", "水", "塩", "砂糖", "米", "肉", "野菜", "果物", "寿司", "ラーメン",
  // Science & Society
  "火", "空気", "土", "金", "銀", "鉄", "紙", "友達", "先生", "医者", "警察", "王様", "女王", "兵士", "選手", "カメラ", "車", "船", "飛行機"
];

// Ensure target directory exists
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

// Generate files for all languages
languages.forEach(lang => {
  let content = '';
  const varPrefix = getVarPrefix(lang.code);
  const typeName = getTypeName(lang.code);

  if (lang.pilot) {
    let wordList = [];
    if (lang.code === 'hi') wordList = hiWords;
    if (lang.code === 'ne') wordList = neWords;
    if (lang.code === 'ja') wordList = jaWords;

    content = `/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * ${lang.name} word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const ${varPrefix}_WORDS: readonly string[] = [
${wordList.map(w => `  "${w}"`).join(',\n')}
] as const;

export type ${typeName}Word = (typeof ${varPrefix}_WORDS)[number];
`;
  } else {
    content = `/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * ${lang.name} word list for ClueGrid.
 * TODO: This word pack needs to be populated by a native speaker.
 */
export const ${varPrefix}_WORDS: readonly string[] = [
  // TODO: Add ~200+ common nouns in ${lang.name}
] as const;

export type ${typeName}Word = (typeof ${varPrefix}_WORDS)[number];
`;
  }

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
  if (lang.pilot) {
    indexContent += `    case "${lang.code}":\n      return ${getVarPrefix(lang.code)}_WORDS;\n`;
  } else {
    // Stubs fall back to EN_WORDS as requested so gameplay remains fully functional
    indexContent += `    case "${lang.code}":\n      return ${getVarPrefix(lang.code)}_WORDS.length > 0 ? ${getVarPrefix(lang.code)}_WORDS : EN_WORDS;\n`;
  }
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
