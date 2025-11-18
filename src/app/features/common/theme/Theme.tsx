import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ThemeToggleProps } from "@/app/types/appTypes";
import { useTranslations } from 'next-intl';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = "icon" }) => {
  const { setTheme, theme } = useTheme();
  const t = useTranslations('common');
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
      <span className="sr-only">{t('ui.toggleTheme')}</span>
    </Button>
  );
};

export { ThemeToggle };
export default ThemeToggle;