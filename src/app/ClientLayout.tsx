"use client";

import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from 'next-intl';
import { AbstractIntlMessages } from 'next-intl';

// ClientLayout component wraps the entire app with necessary providers
// This includes internationalization (i18n) and authentication providers
export default function ClientLayout({
  children,
  messages, // Messages passed from the server for the current locale
  locale, // Current locale passed from the server
}: {
  children: React.ReactNode;
  messages: AbstractIntlMessages; // Translation messages for the current locale
  locale: string; // Current language locale (e.g., 'en', 'hi')
}) {
  return (
    // NextIntlClientProvider provides internationalization context to the app
    // It makes translation functions available throughout the component tree
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <SessionProvider
        refetchOnWindowFocus={true}
        refetchInterval={5 * 60 * 1000} // 5 minutes
      >
        <main>{children}</main>
        <Toaster />
      </SessionProvider>
    </NextIntlClientProvider>
  );
}