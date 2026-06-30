import enLocale from "../locales/en.json" assert { type: "json" };
import neLocale from "../locales/ne.json" assert { type: "json" };
import hiLocale from "../locales/hi.json" assert { type: "json" };
import deLocale from "../locales/de.json" assert { type: "json" };
import arLocale from "../locales/ar.json" assert { type: "json" };
import ptBrLocale from "../locales/pt-BR.json" assert { type: "json" };
import frLocale from "../locales/fr.json" assert { type: "json" };
import trLocale from "../locales/tr.json" assert { type: "json" };
import jaLocale from "../locales/ja.json" assert { type: "json" };
import csLocale from "../locales/cs.json" assert { type: "json" };
import itLocale from "../locales/it.json" assert { type: "json" };
import plLocale from "../locales/pl.json" assert { type: "json" };
import ukLocale from "../locales/uk.json" assert { type: "json" };
import heLocale from "../locales/he.json" assert { type: "json" };
import srLocale from "../locales/sr.json" assert { type: "json" };
import koLocale from "../locales/ko.json" assert { type: "json" };
import roLocale from "../locales/ro.json" assert { type: "json" };
import idLocale from "../locales/id.json" assert { type: "json" };
import daLocale from "../locales/da.json" assert { type: "json" };
import ptLocale from "../locales/pt.json" assert { type: "json" };
import caLocale from "../locales/ca.json" assert { type: "json" };
import svLocale from "../locales/sv.json" assert { type: "json" };
import mkLocale from "../locales/mk.json" assert { type: "json" };
import etLocale from "../locales/et.json" assert { type: "json" };
import eoLocale from "../locales/eo.json" assert { type: "json" };
import beLocale from "../locales/be.json" assert { type: "json" };
import esLocale from "../locales/es.json" assert { type: "json" };
import nlLocale from "../locales/nl.json" assert { type: "json" };
import skLocale from "../locales/sk.json" assert { type: "json" };
import afLocale from "../locales/af.json" assert { type: "json" };
import arLbLocale from "../locales/ar-LB.json" assert { type: "json" };
import bgLocale from "../locales/bg.json" assert { type: "json" };
import hrLocale from "../locales/hr.json" assert { type: "json" };
import fiLocale from "../locales/fi.json" assert { type: "json" };
import elLocale from "../locales/el.json" assert { type: "json" };
import huLocale from "../locales/hu.json" assert { type: "json" };
import isLocale from "../locales/is.json" assert { type: "json" };
import ltLocale from "../locales/lt.json" assert { type: "json" };
import lvLocale from "../locales/lv.json" assert { type: "json" };
import noLocale from "../locales/no.json" assert { type: "json" };
import ruLocale from "../locales/ru.json" assert { type: "json" };
import slLocale from "../locales/sl.json" assert { type: "json" };
import thLocale from "../locales/th.json" assert { type: "json" };
import filLocale from "../locales/fil.json" assert { type: "json" };
import faLocale from "../locales/fa.json" assert { type: "json" };
import zhLocale from "../locales/zh.json" assert { type: "json" };
import sqLocale from "../locales/sq.json" assert { type: "json" };
import kaLocale from "../locales/ka.json" assert { type: "json" };
import viLocale from "../locales/vi.json" assert { type: "json" };

export type LocaleCode =
  | "en" | "ne" | "hi" | "de" | "ar" | "pt-BR" | "fr" | "tr" | "ja" | "cs" | "it" | "pl" | "uk" | "he"
  | "sr" | "ko" | "ro" | "id" | "da" | "pt" | "ca" | "sv" | "mk" | "et" | "eo" | "be" | "es" | "nl"
  | "sk" | "af" | "ar-LB" | "bg" | "hr" | "fi" | "el" | "hu" | "is" | "lt" | "lv" | "no" | "ru"
  | "sl" | "th" | "fil" | "fa" | "zh" | "sq" | "ka" | "vi";

export type Locale = typeof enLocale;

const locales: Record<LocaleCode, Locale> = {
  en: enLocale,
  ne: neLocale,
  hi: hiLocale,
  de: deLocale,
  ar: arLocale,
  "pt-BR": ptBrLocale,
  fr: frLocale,
  tr: trLocale,
  ja: jaLocale,
  cs: csLocale,
  it: itLocale,
  pl: plLocale,
  uk: ukLocale,
  he: heLocale,
  sr: srLocale,
  ko: koLocale,
  ro: roLocale,
  id: idLocale,
  da: daLocale,
  pt: ptLocale,
  ca: caLocale,
  sv: svLocale,
  mk: mkLocale,
  et: etLocale,
  eo: eoLocale,
  be: beLocale,
  es: esLocale,
  nl: nlLocale,
  sk: skLocale,
  af: afLocale,
  "ar-LB": arLbLocale,
  bg: bgLocale,
  hr: hrLocale,
  fi: fiLocale,
  el: elLocale,
  hu: huLocale,
  is: isLocale,
  lt: ltLocale,
  lv: lvLocale,
  no: noLocale,
  ru: ruLocale,
  sl: slLocale,
  th: thLocale,
  fil: filLocale,
  fa: faLocale,
  zh: zhLocale,
  sq: sqLocale,
  ka: kaLocale,
  vi: viLocale,
};

export function getLocale(code: string): Locale {
  return locales[(code as LocaleCode) ?? "en"] ?? locales["en"];
}

export { enLocale };
