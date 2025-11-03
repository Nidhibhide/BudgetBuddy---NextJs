"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdCategory,
  MdLogout,
  MdDashboard,
  MdAccountBalance,
  MdPayment,
} from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  const sidebarLinks = [
    {
      href: "/dashboard/home",
      label: "Dashboard",
      icon: MdDashboard,
    },
    {
      href: "/dashboard/category",
      label: "Category",
      icon: MdCategory,
    },
    {
      href: "/dashboard/transaction",
      label: "Transaction",
      icon: MdPayment,
    },
    {
      href: "/dashboard/setting",
      label: "Setting",
      icon: IoMdSettings,
    },
    {
      href: "/dashboard/logout",
      label: "Logout",
      icon: MdLogout,
    },
  ];

  return (
    <div className="w-80 h-full flex flex-col bg-background text-foreground">
      {/* App Header */}
      <div className="flex items-center py-6 px-4 mb-4 border-b border-foreground">
        <div className="flex-1 flex items-center justify-center gap-1">
          <MdAccountBalance size={32} style={{ fill: "var(--foreground)" }} />
          <h2 className="text-2xl font-bold">BudgetBuddy</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon-lg"
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
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer"
              onClick={onClose}
            >
              <X className="size-6" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </div>
      {/* Sidebar Navigation */}
      <div className="flex-1">
        <ul className="flex flex-col text-xl font-medium">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li
                key={link.href}
                className={`group flex items-center gap-2 cursor-pointer md:py-3 py-2 justify-center ${
                  isActive
                    ? "bg-foreground text-background"
                    : "hover:bg-sidebar-hover text-foreground"
                }`}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-2 text-base md:text-lg"
                >
                  <link.icon size={28} className={isActive ? "text-background" : "text-foreground"} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
