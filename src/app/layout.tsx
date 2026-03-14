import type { Metadata } from "next";
import "./globals.css";

import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "./features/common";

export const metadata: Metadata = {
  title: "BudgetBuddy",
  description: "Your budget management app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-black">
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
        <ClientLayout>
          {children}
        </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
