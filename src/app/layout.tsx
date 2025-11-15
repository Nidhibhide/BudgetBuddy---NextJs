import type { Metadata } from "next";
import "./globals.css";

import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "./features/common/theme-provider";
import { getMessages, getLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: "BudgetBuddy",
  description: "Your budget management app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the current locale from the request
  // This is determined by the middleware based on URL path or accept-language header
  const locale = await getLocale();

  // Get the translation messages for the current locale
  // These are loaded from the JSON files in src/messages/
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="text-black">
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
        <ClientLayout messages={messages} locale={locale}>
          {children}
        </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}


