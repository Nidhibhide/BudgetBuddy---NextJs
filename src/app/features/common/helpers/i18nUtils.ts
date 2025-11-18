import { languages, defaultLanguage, Language } from "@/i18n";

export function determineLocale(cookieValue?: string, urlLocale?: string, pathnameLocale?: string): Language {
  const locale = pathnameLocale || cookieValue || urlLocale || defaultLanguage;
  return languages.includes(locale as Language) ? (locale as Language) : defaultLanguage;
}