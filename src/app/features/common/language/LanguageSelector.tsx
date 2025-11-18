"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { SelectBox } from "@/app/features/common";
import { LANGUAGE_OPTIONS } from "@/constants";
import { LanguageSelectorProps } from "@/app/types/appTypes";

const languages = LANGUAGE_OPTIONS;

export default function LanguageSelector({ className }: LanguageSelectorProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const current =
    languages.find((l) => l.code === locale)?.display || "English";

  const handleChange = (selected: string) => {
    const lang = languages.find((l) => l.display === selected);
    if (!lang) return;

    // Set the NEXT_LOCALE cookie
    document.cookie = `NEXT_LOCALE=${lang.code}; path=/; max-age=31536000`;

    // Get the path without the current locale
    const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "");

    // Navigate to the new locale path with full reload to load new messages
    window.location.href = `/${lang.code}${pathWithoutLocale}`;
  };

  return (
    <SelectBox
      name="language"
      options={languages.map((l) => l.display)}
      onChange={handleChange}
      value={current}
      icon={<Globe className="size-5" />}
      className={className || "border-none"}
    />
  );
}
