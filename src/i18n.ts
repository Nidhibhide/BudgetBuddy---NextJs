// This file configures next-intl for internationalization
// next-intl is a library that provides internationalization (i18n) support for Next.js apps
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Define the supported languages for the app
// These are the languages our app will support: English, Hindi, and Marathi
export const languages = ["en", "hi", "mr"] as const;

// Define the default language (fallback language when no language is specified)
export const defaultLanguage = "en";

// Type for language to ensure type safety
// export type Language = typeof languages[number];
export type Language = "en" | "hi" | "mr";

// Configuration for next-intl
// This function returns the configuration for each server request
export default getRequestConfig(async ({ locale: lang }) => {
  // Get the locale from the NEXT_LOCALE cookie if set
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;

  // Determine the locale: cookie > URL param > default
  const determinedLang = localeFromCookie || lang || defaultLanguage;

  // Specify the current locale, defaulting to defaultLanguage if not provided or not supported
  const supportedLang = languages.includes(determinedLang as Language) ? determinedLang : defaultLanguage;
  return {
    locale: supportedLang || defaultLanguage,
    timeZone: 'UTC',
    // Load the messages (translations) for the current locale
    // Messages are stored in JSON files organized by feature
    messages: (await import(`./messages/${supportedLang || defaultLanguage}.json`))
      .default,
  };
});
