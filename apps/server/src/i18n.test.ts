import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runI18nTests() {
  console.log("==> Running i18n & Word Pack Integration Tests...");

  const localesDir = path.join(__dirname, "../../../packages/i18n/locales");
  const wordpacksDir = path.join(__dirname, "../../../packages/wordpacks/src");

  // Verify English locale file exists
  const enPath = path.join(localesDir, "en.json");
  if (!fs.existsSync(enPath)) {
    throw new Error("en.json is missing in packages/i18n/locales!");
  }
  const enKeys = JSON.parse(fs.readFileSync(enPath, "utf8"));
  console.log("✓ English locale en.json verified successfully.");

  // Pilot languages
  const pilots = ["hi", "ne", "ja"];
  pilots.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Locale file for ${lang} is missing!`);
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (data.locale !== lang) {
      throw new Error(`Expected locale attribute for ${lang} to match ${lang}`);
    }
    console.log(`✓ Pilot language ${lang} locale verified successfully.`);
  });

  // Verify RTL languages
  const rtls = ["ar", "ar-LB", "he", "fa"];
  rtls.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`RTL language file ${lang}.json is missing!`);
    }
    console.log(`✓ RTL language locale ${lang} verified successfully.`);
  });

  // Verify pilot wordpacks
  pilots.forEach(lang => {
    const filePath = path.join(wordpacksDir, `${lang}.ts`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Word pack file for pilot language ${lang} is missing!`);
    }
    const content = fs.readFileSync(filePath, "utf8");
    if (!content.includes("WARNING: These words need native-speaker review")) {
      throw new Error(`Expected word pack ${lang} to contain native speaker review warning comment!`);
    }
    console.log(`✓ Pilot word pack ${lang} verified successfully.`);
  });

  console.log("All i18n and Word Pack verification tests passed successfully! 🌍🎉");
  process.exit(0);
}

runI18nTests().catch(err => {
  console.error("i18n tests failed:", err);
  process.exit(1);
});
