"use client";

import React from "react";
import { FaWallet } from "react-icons/fa";
import { HeaderProps } from "../../types/appTypes";
import { usePathname } from "next/navigation";
import { GetStartedLink } from "@/app/components";
import { FaArrowLeft } from "react-icons/fa6";

const Header: React.FC<HeaderProps> = ({}) => {
  const pathname = usePathname();
  const showBackButton = pathname === "/signin" || pathname === "/signup";

  return (
    <div className="sticky top-0 z-10 text-primary w-full flex flex-col">
      <div className="flex items-center gap-2 md:px-12 px-4 bg-secondary justify-between w-full h-[80px]">
        <div className="flex gap-2">
          <FaWallet size={20} className="mt-1.5" />
          <span className="font-semibold text-2xl">BudgetBuddy</span>
        </div>
        {showBackButton && (
          <div className="w-auto flex items-center  gap-4">
            <GetStartedLink href="/" width="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" />
                Back to Home
              </div>
            </GetStartedLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
