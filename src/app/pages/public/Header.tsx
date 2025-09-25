"use client";

import React, { useEffect, useState } from "react";
import { FaWallet } from "react-icons/fa";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { HeaderProps } from '../../types';

const Header: React.FC<HeaderProps> = ({  }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const Icon = darkMode ? IoSunnyOutline : IoMoonOutline;

  return (
    <div className="sticky top-0 z-10 text-[#0f172a] dark:text-[#f8fafc] w-full flex flex-col">
      <div className="flex items-center gap-2 md:px-12 px-4 bg-[#f1f5f9] dark:bg-[#1e293b] justify-between w-full h-[80px]">
        <div className="flex gap-2">
          <FaWallet size={20} className="mt-1.5" />
          <span className="font-semibold text-2xl">BudgetBuddy</span>
        </div>
        <Icon
          size={20}
          className="cursor-pointer"
          onClick={() => setDarkMode(!darkMode)}
        />
      </div>
    </div>
  );
};

export default Header;
