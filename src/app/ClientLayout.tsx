"use client";

import Header from "@/app/pages/public/Header";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Header />
      <main>{children}</main>
      <Toaster />
    </SessionProvider>
  );
}