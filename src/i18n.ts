import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { determineLocale } from "@/app/features/common/helpers/i18nUtils";
import { LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_OPTIONS } from "@/constants";

export const languages = LANGUAGES;
export const defaultLanguage = DEFAULT_LANGUAGE;
export type Language = "en" | "hi";

export const languageOptions = LANGUAGE_OPTIONS;

export default getRequestConfig(async ({ locale: lang }) => {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("NEXT_LOCALE")?.value;

  const supportedLang = determineLocale(localeFromCookie, lang);

  return {
    locale: supportedLang,
    timeZone: "UTC",
    // Load index translation file
    // index.json: feature/page-specific translations (auth, dashboard, forms, backend, etc.)
    messages: (await import(`./messages/${supportedLang}/index.json`)).default,
  };
});
