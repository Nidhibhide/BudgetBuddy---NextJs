"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ThemeToggleProps } from "@/app/types/appTypes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = "icon" }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        size={size}
        variant="ghost"
        className="cursor-pointer text-inherit hover:bg-shell-hover hover:text-inherit"
        aria-hidden
      >
        <Sun className="size-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size={size}
      variant="ghost"
      className="cursor-pointer text-inherit hover:bg-shell-hover hover:text-inherit"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export { ThemeToggle };
export default ThemeToggle;
