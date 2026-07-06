import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// Import all locale files
import en from "@cluegrid/i18n/locales/en.json";

/**
 * RTL languages that require layout direction flipping.
 * ar = Arabic, ar-LB = Lebanese Arabic, he = Hebrew, fa = Persian/Farsi
 */
export const RTL_LOCALES = new Set(["ar", "ar-LB", "he", "fa"]);

/**
 * All supported locale codes with their native display names.
 * Sorted alphabetically by native name for the language switcher.
 */
export const SUPPORTED_LOCALES: { code: string; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "" },
  { code: "de", name: "Deutsch", flag: "" },
  { code: "ar", name: "العربية", flag: "" },
  { code: "pt-BR", name: "Português (Brasil)", flag: "" },
  { code: "fr", name: "Français", flag: "" },
  { code: "tr", name: "Türkçe", flag: "" },
  { code: "ne", name: "नेपाली", flag: "" },
  { code: "hi", name: "हिन्दी", flag: "" },
  { code: "ja", name: "日本語", flag: "" },
  { code: "cs", name: "Čeština", flag: "" },
  { code: "it", name: "Italiano", flag: "" },
  { code: "pl", name: "Polski", flag: "" },
  { code: "uk", name: "Українська", flag: "" },
  { code: "he", name: "עברית", flag: "" },
  { code: "sr", name: "Српски", flag: "" },
  { code: "ko", name: "한국어", flag: "" },
  { code: "ro", name: "Română", flag: "" },
  { code: "id", name: "Bahasa Indonesia", flag: "" },
  { code: "da", name: "Dansk", flag: "" },
  { code: "pt", name: "Português", flag: "" },
  { code: "ca", name: "Català", flag: "" },
  { code: "sv", name: "Svenska", flag: "" },
  { code: "mk", name: "Македонски", flag: "" },
  { code: "et", name: "Eesti", flag: "" },
  { code: "eo", name: "Esperanto", flag: "" },
  { code: "be", name: "Беларуская", flag: "" },
  { code: "es", name: "Español", flag: "" },
  { code: "nl", name: "Nederlands", flag: "" },
  { code: "sk", name: "Slovenčina", flag: "" },
  { code: "af", name: "Afrikaans", flag: "" },
  { code: "ar-LB", name: "العربية اللبنانية", flag: "" },
  { code: "bg", name: "Български", flag: "" },
  { code: "hr", name: "Hrvatski", flag: "" },
  { code: "fi", name: "Suomi", flag: "" },
  { code: "el", name: "Ελληνικά", flag: "" },
  { code: "hu", name: "Magyar", flag: "" },
  { code: "is", name: "Íslenska", flag: "" },
  { code: "lt", name: "Lietuvių", flag: "" },
  { code: "lv", name: "Latviešu", flag: "" },
  { code: "no", name: "Norsk", flag: "" },
  { code: "ru", name: "Русский", flag: "" },
  { code: "sl", name: "Slovenščina", flag: "" },
  { code: "th", name: "ภาษาไทย", flag: "" },
  { code: "fil", name: "Filipino", flag: "" },
  { code: "fa", name: "فارسی", flag: "" },
  { code: "zh", name: "中文", flag: "" },
  { code: "sq", name: "Shqip", flag: "" },
  { code: "ka", name: "ქართული", flag: "" },
];

/**
 * Dynamically loads a locale JSON file. Falls back to English if not found.
 */
async function loadLocale(lng: string): Promise<Record<string, unknown>> {
  try {
    // Dynamic import from @cluegrid/i18n package locales
    const mod = await import(`../../packages/i18n/locales/${lng}.json`);
    return mod.default?.ui || mod.ui || mod.default || mod;
  } catch {
    console.warn(`[i18n] Locale "${lng}" not found, falling back to English.`);
    return en.ui as unknown as Record<string, unknown>;
  }
}

/**
 * Initialize i18next with the default (English) locale.
 * Other locales are loaded on demand when the user switches language.
 */
const savedLang = localStorage.getItem("cluegrid_language") || "en";

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en.ui },
    },
    lng: savedLang,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

/**
 * Switch the active language. Loads the locale file on demand,
 * persists the choice, and applies RTL direction to the document.
 */
export async function changeLanguage(lng: string) {
  if (lng !== "en" && !i18next.hasResourceBundle(lng, "translation")) {
    const localeData = await loadLocale(lng);
    i18next.addResourceBundle(lng, "translation", localeData, true, true);
  }

  await i18next.changeLanguage(lng);
  localStorage.setItem("cluegrid_language", lng);

  // Apply RTL layout direction
  const dir = RTL_LOCALES.has(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
}

// Apply initial direction on load
if (RTL_LOCALES.has(savedLang)) {
  document.documentElement.dir = "rtl";
  document.documentElement.lang = savedLang;
}

// If the saved language is not English, load it now
if (savedLang !== "en") {
  changeLanguage(savedLang);
}

export default i18next;
