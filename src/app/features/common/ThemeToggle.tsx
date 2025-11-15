"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ThemeToggleProps } from "@/app/types/appTypes";

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = "icon" }) => {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      size={size}
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
  );
};

export default ThemeToggle;