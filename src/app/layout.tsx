import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/pages/public/Header";

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
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
