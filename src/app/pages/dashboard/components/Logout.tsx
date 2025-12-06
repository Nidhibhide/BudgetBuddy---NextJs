"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Logout() {
  const t = useTranslations();

  useEffect(() => {
    signOut({ callbackUrl: "/signin" });
  }, []);

  return <div>{t("pages.dashboard.logout.loggingOut")}</div>;
}