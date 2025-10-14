"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaWallet } from "react-icons/fa";
import { HeaderProps } from "../../types/appTypes";
import { usePathname } from "next/navigation";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const Header: React.FC<HeaderProps> = ({}) => {
  const pathname = usePathname();
  const showBackButton = pathname === "/signin" || pathname === "/signup";
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // ⛔ Avoid SSR/client mismatch by not rendering until theme is loaded
    return null;
  }
  return (
    <div className="sticky top-0 z-10  w-full flex flex-col text-foreground">
      <div className="flex items-center gap-2 md:px-12 px-4 justify-between w-full h-[80px] bg-background">
        <div className="flex gap-2">
          <FaWallet size={20} className="mt-1.5" />
          <span className="font-semibold text-2xl">BudgetBuddy</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="cursor-pointer"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          {showBackButton && (
            <Link href="/">
              <ArrowLeft className="size-6" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
