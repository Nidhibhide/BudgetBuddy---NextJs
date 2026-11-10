import type { Metadata } from "next";
import "./globals.css";

import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "./features/common";

export const metadata: Metadata = {
  title: "BudgetBuddy",
  description: "Your budget management app",
  icons: {
    icon: "/wallet.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
