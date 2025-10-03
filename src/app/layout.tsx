import type { Metadata } from "next";
import "./globals.css";

import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "BudgetBuddy",
  description: "Your budget management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-black">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}


