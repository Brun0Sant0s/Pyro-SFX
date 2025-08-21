import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import pt from "./locales/pt/common.json";
import en from "./locales/en/common.json";
import es from "./locales/es/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { common: pt },
      en: { common: en },
      es: { common: es },
    },
    fallbackLng: "en",
    supportedLngs: ["pt", "en", "es"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    cleanCode: true,

    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },

    detection: {
      order: ["querystring", "navigator", "htmlTag"],
      caches: [],           
      lookupQuerystring: "lng",
    },

    debug: import.meta?.env?.DEV ?? false,
    saveMissing: false,
  });

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng?.split("-")[0] || "en";
  }
});


export default i18n;
