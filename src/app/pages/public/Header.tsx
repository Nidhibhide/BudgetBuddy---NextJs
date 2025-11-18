"use client";

import React from "react";
import Link from "next/link";
import { FaWallet } from "react-icons/fa";
import { HeaderProps } from "../../types/appTypes";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLocale } from 'next-intl'; // Import for internationalization
import { ThemeToggle, LanguageSelector } from '@/app/features/common';

const Header: React.FC<HeaderProps> = ({}) => {
  const pathname = usePathname();
  const showBackButton = pathname.includes("/signin") || pathname.includes("/signup");
  const locale = useLocale();

  // Get translation function for the root namespace
  // This provides access to all translations
  return (
    <div className="sticky top-0 z-10  w-full flex flex-col text-foreground">
      <div className="flex items-center gap-2 md:px-12 px-4 justify-between w-full h-20 bg-background">
        <div className="flex gap-2">
          <FaWallet size={20} className="mt-1.5" />
          <span className="font-semibold text-2xl">BudgetBuddy</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector className="border-0" />
          <ThemeToggle />
          {showBackButton && (
            <Link href={`/${locale}`}>
              <ArrowLeft className="size-6" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

