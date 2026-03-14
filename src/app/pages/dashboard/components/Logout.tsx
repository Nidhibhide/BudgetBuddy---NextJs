"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    signOut({ callbackUrl: "/signin" });
  }, []);

  return <div>Logging out...</div>;
}