"use client";

import React from "react";
import Link from "next/link";
import { FaWallet } from "react-icons/fa";
import { HeaderProps } from "../../types/appTypes";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle, Tooltip } from '@/app/features/common';

const Header: React.FC<HeaderProps> = ({}) => {
  const pathname = usePathname();
  const showBackButton =
    pathname.includes("/signin") ||
    pathname.includes("/signup") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password");

  // Get translation function for the root namespace
  // This provides access to all translations
  return (
    <div className="sticky top-0 z-10 w-full flex flex-col text-shell-foreground">
      <div className="flex items-center gap-2 md:px-12 px-4 justify-between w-full h-20 bg-shell border-b border-white/10">
        <div className="flex gap-2">
          <FaWallet size={20} className="mt-1.5 text-shell-foreground" />
          <span className="font-semibold text-2xl text-shell-foreground">
            BudgetBuddy
          </span>
        </div>
        <div className="flex items-center gap-4 text-shell-foreground">
          <ThemeToggle />
          {showBackButton && (
            <Tooltip label="Back to Home">
              <Link href="/" aria-label="Back to Home">
                <ArrowLeft className="size-6 text-shell-foreground" />
              </Link>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

