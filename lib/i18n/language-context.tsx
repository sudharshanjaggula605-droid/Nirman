"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LanguageOption } from "./languages";
import { translations, TranslationKey } from "./translations";
import { createClient } from "@/lib/supabase/client";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: TranslationKey, defaultText?: string) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function initLanguage() {
      // 1. Check localStorage first
      if (typeof window !== "undefined") {
        const localLang = localStorage.getItem("nirman_language");
        if (localLang && SUPPORTED_LANGUAGES.some((l) => l.code === localLang)) {
          setLanguageState(localLang);
          document.documentElement.lang = localLang;
        }
      }

      // 2. Check user profile preference in Supabase if logged in
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("preferred_language")
            .eq("id", user.id)
            .single();

          if (profile?.preferred_language && SUPPORTED_LANGUAGES.some((l) => l.code === profile.preferred_language)) {
            setLanguageState(profile.preferred_language);
            if (typeof window !== "undefined") {
              localStorage.setItem("nirman_language", profile.preferred_language);
              document.documentElement.lang = profile.preferred_language;
            }
          }
        }
      } catch (err) {
        // Fallback gracefully to localStorage
      } finally {
        setIsLoaded(true);
      }
    }

    initLanguage();
  }, []);

  const setLanguage = async (newLang: string) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLanguageState(newLang);

    if (typeof window !== "undefined") {
      localStorage.setItem("nirman_language", newLang);
      document.documentElement.lang = newLang;
    }

    // Attempt to persist to user profile if column exists and user logged in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ preferred_language: newLang })
          .eq("id", user.id);
      }
    } catch (err) {
      // Non-blocking if table doesn't have column
    }
  };

  const t = (key: TranslationKey, defaultText?: string): string => {
    const langDict = translations[language] || translations[DEFAULT_LANGUAGE] || {};
    if (langDict[key]) {
      return langDict[key];
    }
    const defaultDict = translations[DEFAULT_LANGUAGE] || {};
    return defaultDict[key] || defaultText || key;
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
        isLoaded,
      }}
    >
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
