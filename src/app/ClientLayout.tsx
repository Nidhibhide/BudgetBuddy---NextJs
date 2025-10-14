"use client";

import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={5 * 60 * 1000} // 5 minutes
    >
      <main>{children}</main>
      <Toaster />
    </SessionProvider>
  );
}