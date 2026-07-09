"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import ar from "@/locales/ar";
import en from "@/locales/en";

export type Language = "ar" | "en";
export type Direction = "rtl" | "ltr";

type TranslationObject = Record<string, unknown>;

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  setLang: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (keyOrArabic: string, english?: string) => string;
}

const dictionaries: Record<Language, TranslationObject> = {
  ar,
  en,
};

function getNestedValue(obj: TranslationObject, key: string): string {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }

    return undefined;
  }, obj);

  return typeof value === "string" ? value : key;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("dah-language");

    if (saved === "ar" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    const dir: Direction = lang === "ar" ? "rtl" : "ltr";

    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    document.body.classList.toggle("rtl", lang === "ar");
    document.body.classList.toggle("ltr", lang === "en");

    localStorage.setItem("dah-language", lang);
  }, [lang]);

  const setLang = (language: Language) => {
    setLangState(language);
  };

  const toggleLanguage = () => {
    setLangState((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const value = useMemo<LanguageContextType>(() => {
    const dir: Direction = lang === "ar" ? "rtl" : "ltr";

    return {
      lang,
      dir,
      setLang,
      toggleLanguage,
      t: (keyOrArabic: string, english?: string) => {
        // دعم الكتابة المباشرة:
        // t("مرحبا", "Hello")
        if (english !== undefined) {
          return lang === "ar" ? keyOrArabic : english;
        }

        // دعم ملفات الترجمة:
        // t("home.title")
        return getNestedValue(dictionaries[lang], keyOrArabic);
      },
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}